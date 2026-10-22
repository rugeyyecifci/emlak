import { Module } from '@nestjs/common';
import { AdminListingsController, AdminMediaController } from './admin/admin-listings.controller';
import { AuthController } from './auth/auth.controller';
import { ListingsController } from './listings.controller';
import { AdminLeadsController, LeadsController } from './leads.controller';

@Module({
  controllers: [
    ListingsController,
    LeadsController,
    AuthController,
    AdminListingsController,
    AdminMediaController,
    AdminLeadsController,
  ],
})
export class AppModule {}
