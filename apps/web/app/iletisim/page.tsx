import LeadForm from '@/components/LeadForm';

export const metadata = { title: 'İletişim | Emlak Ofisi' };

export default function ContactPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 p-6 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">İletişim</h1>
        <p className="mt-3 text-gray-600">
          Aradığınız evi bize anlatın ya da mülkünüzü satmak/kiralamak için yazın. Sizi en kısa sürede arayalım.
        </p>
        {/* Ofis bilgilerini kendi bilgilerinle değiştir */}
        <dl className="mt-6 space-y-3 text-sm">
          <div><dt className="text-gray-500">Adres</dt><dd className="font-medium">Ofis adresi buraya</dd></div>
          <div><dt className="text-gray-500">Telefon</dt><dd className="font-medium">0 (xxx) xxx xx xx</dd></div>
          <div><dt className="text-gray-500">Çalışma saatleri</dt><dd className="font-medium">Hafta içi 09:00–19:00, Cumartesi 10:00–17:00</dd></div>
        </dl>
      </div>
      <LeadForm kind="iletisim" title="Bize yazın" />
    </main>
  );
}
