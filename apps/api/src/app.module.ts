import { Module } from '@nestjs/common';
import { AdminListingsController, AdminMediaController } from './admin/admin-listings.controller';
import { AuthController } from './auth/auth.controller';
import { HealthController } from './health.controller';
import { ListingsController } from './listings.controller';
import { AdminLeadsController, LeadsController } from './leads.controller';

@Module({
  controllers: [
    HealthController,
    ListingsController,
    LeadsController,
    AuthController,
    AdminListingsController,
    AdminMediaController,
    AdminLeadsController,
  ],
})
export class AppModule {}
