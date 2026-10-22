# Emlak Ofisi Sitesi

Vitrin site + yönetim paneli. Docker + worker container mimarisi.

## Klasörler

| Klasör | Ne |
|---|---|
| `docker-compose.yml` | Docker'da çalışanlar: veritabanı, Redis, SeaweedFS (dosya deposu), Meilisearch, notify-worker |
| `apps/api` | NestJS api (port 4000). Tablolar: `prisma/schema.prisma` |
| `apps/web` | Next.js site (port 3000) |
| `workers/notify` | İlan değişince çalışan worker (eşleştirme/bildirim) |
| `workers/image` | Fotoğrafları küçültüp WebP yapan worker |

## İlk kurulum (bir kere)

1. OrbStack açık olsun (menü çubuğunda simgesi görünmeli).
2. Terminal'de:

```bash
cd ~/Projeler/emlak
./kur.sh
```

## Her gün çalıştırma

```bash
docker compose up -d                # altyapı + worker (zaten açıksa bir şey yapmaz)
cd apps/api && pnpm dev             # 1. terminal sekmesi
cd apps/web && pnpm dev             # 2. terminal sekmesi (Cmd+T ile yeni sekme)
```

- Site: http://localhost:3000
- Panel: http://localhost:3000/panel
- API: http://localhost:4000/listings
- Dosya deposu (SeaweedFS): http://localhost:8888

## Deneme ilanı ekle

```bash
curl -X POST http://localhost:4000/listings \
  -H "Content-Type: application/json" \
  -d '{"title":"Merkezde 3+1 daire","type":"satilik","price":4500000,"rooms":"3+1","areaM2":135,"district":"Merkez"}'
```

Worker'ın işi aldığını görmek için:

```bash
docker compose logs -f notify-worker
```

## Faydalı komutlar

```bash
docker compose ps                         # ne çalışıyor
docker compose down                       # hepsini durdur (veriler kalır)
docker compose up -d --build notify-worker   # worker kodunu değiştirdikten sonra
docker compose up -d --scale notify-worker=3 # 3 kopya worker
cd apps/api && pnpm prisma studio         # veritabanını tarayıcıda gör/düzenle
```

## Panel kullanıcısı ekle

```bash
cd apps/api
pnpm kullanici-ekle eposta@ornek.com GucluSifre123 "Ad Soyad"
```

Aynı e-postayla tekrar çalıştırırsan şifreyi değiştirir.
