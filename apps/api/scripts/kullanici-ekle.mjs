// Panele giriş yapacak kullanıcı ekler.
// Kullanım: pnpm kullanici-ekle eposta@ornek.com Sifre123 "Ad Soyad"
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const [rawEmail, password, ...nameParts] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();
if (!email || !password) {
  console.log('Kullanım: pnpm kullanici-ekle eposta@ornek.com Sifre123 "Ad Soyad"');
  process.exit(1);
}
if (password.length < 8) {
  console.log('Şifre en az 8 karakter olmalı.');
  process.exit(1);
}

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash(password, 10);
const user = await prisma.user.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash, name: nameParts.join(' ') || email, role: 'sahip' },
});
console.log(`Kullanıcı hazır: ${user.email} (${user.name})`);
await prisma.$disconnect();
