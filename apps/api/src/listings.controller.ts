import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { prisma } from './prisma';

// Herkese açık uçlar: vitrin site bunları kullanır.
const publicMedia = {
  where: { status: 'hazir' },
  orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }],
  select: { id: true, thumbKey: true, largeKey: true },
};

@Controller('listings')
export class ListingsController {
  @Get()
  list() {
    return prisma.listing.findMany({
      where: { status: 'yayinda' },
      orderBy: { createdAt: 'desc' },
      include: { media: { ...publicMedia, take: 1 } }, // kart için sadece kapak
    });
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
