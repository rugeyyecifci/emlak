import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuthGuard } from '../auth/auth.guard';
import { prisma } from '../prisma';
import { listingChangedQueue, mediaQueue } from '../queues';
import { deleteObjects, putObject } from '../storage';

type ListingInput = {
  title?: string;
  description?: string | null;
  type?: string;
  price?: number | string;
  rooms?: string | null;
  areaM2?: number | string | null;
  district?: string | null;
  status?: string;
};

const TYPES = ['satilik', 'kiralik'];
const STATUSES = ['taslak', 'yayinda', 'kapandi'];
const MAX_PHOTO_MB = 15;

// Formdan gelen veriyi temizler ve kontrol eder.
function clean(body: ListingInput, partial: boolean) {
  const data: Record<string, unknown> = {};
  const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

  if (!partial || body.title !== undefined) {
    if (!str(body.title)) throw new BadRequestException('Başlık zorunlu');
    data.title = str(body.title);
  }
  if (!partial || body.type !== undefined) {
    if (!TYPES.includes(String(body.type))) throw new BadRequestException('Tip satılık ya da kiralık olmalı');
    data.type = body.type;
  }
  if (!partial || body.price !== undefined) {
    const p = num(body.price);
    if (!p || p <= 0 || !Number.isFinite(p)) throw new BadRequestException('Geçerli bir fiyat girin');
    data.price = Math.round(p);
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw new BadRequestException('Geçersiz durum');
    data.status = body.status;
  }
  if (body.description !== undefined) data.description = str(body.description);
  if (body.rooms !== undefined) data.rooms = str(body.rooms);
  if (body.district !== undefined) data.district = str(body.district);
  if (body.areaM2 !== undefined) {
    const a = num(body.areaM2);
    data.areaM2 = a && Number.isFinite(a) ? Math.round(a) : null;
  }
  return data;
}

// Panel uçları: hepsi giriş gerektirir.
@Controller('admin/listings')
@UseGuards(AuthGuard)
export class AdminListingsController {
  @Get()
  list() {
    return prisma.listing.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { media: true } }, media: { where: { status: 'hazir' }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], take: 1 } },
    });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { media: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı');
    return listing;
  }

  @Post()
  async create(@Body() body: ListingInput) {
    const data = clean(body, false) as Prisma.ListingCreateInput;
    const listing = await prisma.listing.create({ data: { status: 'taslak', ...data } });
    await listingChangedQueue.add('created', { id: listing.id });
    return listing;
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: ListingInput) {
    await this.get(id);
    const listing = await prisma.listing.update({ where: { id }, data: clean(body, true) as Prisma.ListingUpdateInput });
    await listingChangedQueue.add('updated', { id: listing.id });
    return listing;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const listing = await this.get(id);
    await prisma.listing.delete({ where: { id } });
    await deleteObjects(listing.media.flatMap((m) => [m.originalKey, m.thumbKey, m.largeKey])).catch(() => {});
    return { ok: true };
  }

  // Fotoğraf yükleme: dosyayı depoya koy, işlemeyi image-worker'a bırak.
  @Post(':id/media')
  @UseInterceptors(FilesInterceptor('photos', 30, { limits: { fileSize: MAX_PHOTO_MB * 1024 * 1024 } }))
  async upload(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    await this.get(id);
    if (!files?.length) throw new BadRequestException('Fotoğraf seçilmedi');
    const bad = files.find((f) => !f.mimetype.startsWith('image/'));
    if (bad) throw new BadRequestException(`${bad.originalname} bir fotoğraf değil`);

    const last = await prisma.media.aggregate({ where: { listingId: id }, _max: { sortOrder: true } });
    let order = (last._max.sortOrder ?? -1) + 1;

    const created = [];
    for (const f of files) {
      const key = `ilan/${id}/orijinal/${randomUUID()}`;
      await putObject(key, f.buffer, f.mimetype);
      const media = await prisma.media.create({ data: { listingId: id, originalKey: key, sortOrder: order++ } });
      await mediaQueue.add('process', { mediaId: media.id, listingId: id, key });
      created.push(media);
    }
    return created;
  }
}

@Controller('admin/media')
@UseGuards(AuthGuard)
export class AdminMediaController {
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Fotoğraf bulunamadı');
    await prisma.media.delete({ where: { id } });
    await deleteObjects([media.originalKey, media.thumbKey, media.largeKey]).catch(() => {});
    return { ok: true };
  }

  // Kapak yap: seçilen fotoğrafı en başa al.
  @Post(':id/kapak')
  async makeCover(@Param('id', ParseIntPipe) id: number) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Fotoğraf bulunamadı');
    const first = await prisma.media.aggregate({ where: { listingId: media.listingId }, _min: { sortOrder: true } });
    await prisma.media.update({ where: { id }, data: { sortOrder: (first._min.sortOrder ?? 0) - 1 } });
    return { ok: true };
  }
}
