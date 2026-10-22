import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { listingChangedQueue } from './queues';

const prisma = new PrismaClient();

type CreateListingDto = {
  title: string;
  type: 'satilik' | 'kiralik';
  price: number;
  rooms?: string;
  areaM2?: number;
  district?: string;
};

@Controller('listings')
export class ListingsController {
  // GET /listings  -> tüm yayındaki ilanlar
  @Get()
  list() {
    return prisma.listing.findMany({
      where: { status: 'yayinda' },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET /listings/5  -> tek ilan
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('İlan bulunamadı');
    return listing;
  }

  // POST /listings  -> yeni ilan
  @Post()
  async create(@Body() body: CreateListingDto) {
    const listing = await prisma.listing.create({ data: body });

    // Ağır işi kendimiz yapmıyoruz: kuyruğa bırakıp hemen cevap dönüyoruz.
    await listingChangedQueue.add('created', { id: listing.id });

    return listing;
  }
}
