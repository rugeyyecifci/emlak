import './env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ensureBucket } from './storage';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  try {
    await ensureBucket();
  } catch {
    console.error(
      "\n⚠️  Dosya deposuna (localhost:8333) ulaşılamadı. Docker çalışıyor mu?\n" +
        "   OrbStack'i açıp proje klasöründe 'docker compose up -d' çalıştır, sonra api'yi yeniden başlat.\n",
    );
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API çalışıyor: http://localhost:${port}`);
}
bootstrap();
