import { Module } from '@nestjs/common';
import { AdminListingsController, AdminMediaController } from './admin/admin-listings.controller';
import { AuthController } from './auth/auth.controller';
import { ListingsController } from './listings.controller';

@Module({
  controllers: [ListingsController, AuthController, AdminListingsController, AdminMediaController],
})
export class AppModule {}
