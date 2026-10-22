#!/bin/bash
# Tüm bağımlılıkları kurar ve veritabanı tablolarını oluşturur.
set -e
cd "$(dirname "$0")"

echo "==> 1/4 Docker altyapısı başlatılıyor..."
docker compose up -d --build --remove-orphans

echo "==> 2/4 API kütüphaneleri kuruluyor..."
(cd apps/api && pnpm install)

echo "==> 3/4 Veritabanı tabloları oluşturuluyor..."
echo "    veritabanının hazır olması bekleniyor..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' $(docker compose ps -q db))" = "healthy" ]; do sleep 2; done
(cd apps/api && pnpm prisma migrate dev --name init)

echo "==> 4/4 Site ve worker kütüphaneleri kuruluyor..."
(cd apps/web && pnpm install)
(cd workers/notify && pnpm install)

echo ""
echo "Kurulum tamam! Şimdi iki ayrı terminal sekmesinde şunları çalıştır:"
echo "  cd apps/api && pnpm dev     -> http://localhost:4000/listings"
echo "  cd apps/web && pnpm dev     -> http://localhost:3000"
