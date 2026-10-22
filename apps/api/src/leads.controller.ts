import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from './auth/auth.guard';
import { prisma } from './prisma';
import { leadQueue } from './queues';

type LeadInput = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  preferredTime?: string;
  listingId?: number | string | null;
  kind?: string;
  kvkk?: boolean;
  website?: string; // bot tuzağı: gerçek kullanıcı bu alanı görmez, boş bırakır
};

const KINDS = ['gosterim', 'bilgi', 'iletisim'];
const STATUSES = ['yeni', 'arandi', 'gosterim', 'kapandi'];

// Aynı adresten 10 dakikada en fazla 5 talep (spam'e karşı basit koruma)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimit(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    throw new HttpException('Çok fazla talep gönderdiniz, biraz sonra tekrar deneyin', HttpStatus.TOO_MANY_REQUESTS);
  }
  recent.push(now);
  hits.set(ip, recent);
}

// "0532 123 45 67", "+90 532..." gibi yazımları 5321234567 biçimine çevirir
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('90') && d.length === 12) d = d.slice(2);
  if (d.startsWith('0') && d.length === 11) d = d.slice(1);
  return d;
}

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

// Herkese açık: sitedeki formlar buraya gönderir
@Controller('leads')
export class LeadsController {
  @Post()
  @HttpCode(201)
  async create(@Body() body: LeadInput, @Req() req: Request) {
    // Bot doldurduysa sessizce başarılı gibi davran, kaydetme
    if (body.website) return { ok: true };

    const ip = String(req.headers['x-forwarded-for'] ?? req.ip ?? '').split(',')[0].trim();
    rateLimit(ip || 'bilinmiyor');

    const name = str(body.name, 80);
    if (!name || name.length < 2) throw new BadRequestException('Adınızı yazın');

    const phone = normalizePhone(String(body.phone ?? ''));
    if (phone.length !== 10) throw new BadRequestException('Telefon numarasını 05xx xxx xx xx biçiminde yazın');

    const email = str(body.email, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('E-posta adresi geçersiz');

    if (body.kvkk !== true) throw new BadRequestException('Devam etmek için aydınlatma metnini onaylayın');

    const kind = KINDS.includes(String(body.kind)) ? String(body.kind) : 'gosterim';

    let listingId: number | null = null;
    if (body.listingId) {
      const listing = await prisma.listing.findFirst({ where: { id: Number(body.listingId), status: 'yayinda' } });
      listingId = listing?.id ?? null;
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        message: str(body.message, 1000),
        preferredTime: str(body.preferredTime, 60),
        kind,
        listingId,
        kvkkAt: new Date(),
      },
      include: { listing: { select: { title: true } } },
    });

    // Bildirimi notify-worker'a bırak, ziyaretçiyi bekletme
    await leadQueue.add('created', {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      kind: lead.kind,
      listingTitle: lead.listing?.title ?? null,
    });

    return { ok: true };
  }
}

// Panel: talepler kutusu
@Controller('admin/leads')
@UseGuards(AuthGuard)
export class AdminLeadsController {
  @Get()
  list(@Query('durum') status?: string) {
    return prisma.lead.findMany({
      where: STATUSES.includes(String(status)) ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { listing: { select: { id: true, title: true } } },
    });
  }

  // Panel başlığındaki rozet için: her durumda kaç talep var
  @Get('sayilar')
  async counts() {
    const rows = await prisma.lead.groupBy({ by: ['status'], _count: { _all: true } });
    const out: Record<string, number> = { yeni: 0, arandi: 0, gosterim: 0, kapandi: 0 };
    for (const r of rows) out[r.status] = r._count._all;
    return out;
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: { status?: string; note?: string | null }) {
    const exists = await prisma.lead.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Talep bulunamadı');
    const data: { status?: string; note?: string | null } = {};
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) throw new BadRequestException('Geçersiz durum');
      data.status = body.status;
    }
    if (body.note !== undefined) data.note = str(body.note, 2000);
    return prisma.lead.update({ where: { id }, data, include: { listing: { select: { id: true, title: true } } } });
  }

  // KVKK: kişi verisinin silinmesini isterse
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await prisma.lead.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Talep bulunamadı');
    });
    return { ok: true };
  }
}
