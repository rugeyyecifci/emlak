#!/bin/bash
# Yeni .NET veritabanını kurar: tabloları oluşturur ve örnek verileri ekler.
# Kullanım: ./veritabani-kur.sh
set -e
cd "$(dirname "$0")"
export PATH="$PATH:$HOME/.dotnet/tools"

echo ""
echo "==> 1/5 Docker kontrol ediliyor..."
if ! docker info >/dev/null 2>&1; then
  echo "HATA: Docker çalışmıyor. OrbStack uygulamasını açıp bu komutu tekrar çalıştır."
  exit 1
fi
docker compose up -d db >/dev/null
until [ "$(docker inspect -f '{{.State.Health.Status}}' $(docker compose ps -q db))" = "healthy" ]; do sleep 2; done
echo "    Veritabanı hazır."

echo ""
echo "==> 2/5 EF aracı kontrol ediliyor..."
if ! command -v dotnet-ef >/dev/null 2>&1; then
  dotnet tool install --global dotnet-ef
fi
echo "    Tamam."

cd apps/api-dotnet

echo ""
echo "==> 3/5 Proje derleniyor (ilk seferde paketler iner, biraz sürebilir)..."
dotnet build -nologo -v q

echo ""
echo "==> 4/5 Tablolar oluşturuluyor..."
if [ ! -d Migrations ]; then
  dotnet ef migrations add IlkTasarim
fi
dotnet ef database update

echo ""
echo "==> 5/5 Örnek veriler ekleniyor..."
dotnet run --no-build -- seed

echo ""
echo "BİTTİ! Veritabanındaki tablolar:"
cd ../..
docker compose exec -T db psql -U emlak -d emlak_net -c '\dt'
