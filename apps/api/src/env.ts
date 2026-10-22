// .env dosyasını process.env'e yükler (Node 22'nin yerleşik özelliği).
try {
  process.loadEnvFile('.env');
} catch {
  // Docker içinde .env yok; değişkenler compose'dan gelir.
}
