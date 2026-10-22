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

  await ensureBucket();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API çalışıyor: http://localhost:${port}`);
}
bootstrap();
