import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

// Herkese açık uçlar: vitrin site bunları kullanır.
const publicMedia = {
  where: { status: 'hazir' },
  orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }],
  select: { id: true, thumbKey: true, largeKey: true },
};

const PAGE_SIZE = 12;

type SearchQuery = {
  tur?: string; // satilik | kiralik
  min?: string; // en düşük fiyat
  max?: string; // en yüksek fiyat
  oda?: string | string[]; // "2+1,3+1" ya da oda=2+1&oda=3+1
  semt?: string;
  q?: string; // serbest kelime
  siralama?: string; // yeni | ucuz | pahali | buyuk
  sayfa?: string;
};

const toInt = (v?: string) => {
  const n = Number(String(v ?? '').replace(/\D/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const SORTS: Record<string, Prisma.ListingOrderByWithRelationInput> = {
  yeni: { createdAt: 'desc' },
  ucuz: { price: 'asc' },
  pahali: { price: 'desc' },
  buyuk: { areaM2: { sort: 'desc', nulls: 'last' } },
};

@Controller('listings')
export class ListingsController {
  // GET /listings?tur=satilik&min=1000000&oda=3+1,4+1&semt=Merkez&q=asansör&siralama=ucuz&sayfa=2
  @Get()
  async list(@Query() query: SearchQuery) {
    const where: Prisma.ListingWhereInput = { status: 'yayinda' };

    if (query.tur === 'satilik' || query.tur === 'kiralik') where.type = query.tur;

    const min = toInt(query.min);
    const max = toInt(query.max);
    if (min || max) where.price = { ...(min && { gte: min }), ...(max && { lte: max }) };

    const rooms = ([] as string[]).concat(query.oda ?? []).flatMap((r) => r.split(',')).map((r) => r.trim()).filter(Boolean);
    if (rooms.length) where.rooms = { in: rooms };

    const district = query.semt?.trim();
    if (district) where.district = { equals: district, mode: 'insensitive' };

    const q = query.q?.trim().slice(0, 60);
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, toInt(query.sayfa) ?? 1);
    const orderBy = SORTS[query.siralama ?? ''] ?? SORTS.yeni;

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [orderBy, { id: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { media: { ...publicMedia, take: 1 } }, // kart için sadece kapak
      }),
      prisma.listing.count({ where }),
    ]);

    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  }

  // Filtre kutusundaki semt listesi ve ana sayfadaki sayılar
  @Get('ozet')
  async summary() {
    const published = { status: 'yayinda' };
    const [districts, byType] = await Promise.all([
      prisma.listing.findMany({
        where: { ...published, district: { not: null } },
        distinct: ['district'],
        select: { district: true },
        orderBy: { district: 'asc' },
      }),
      prisma.listing.groupBy({ by: ['type'], where: published, _count: { _all: true } }),
    ]);
    const counts: Record<string, number> = { satilik: 0, kiralik: 0 };
    for (const r of byType) counts[r.type] = r._count._all;
    return { districts: districts.map((d) => d.district as string), counts };
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const listing = await prisma.listing.findFirst({
      where: { id, status: 'yayinda' },
      include: { media: publicMedia },
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı');
    return listing;
  }
}
