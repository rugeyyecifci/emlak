export const metadata = { title: 'Aydınlatma Metni | Emlak Ofisi' };

// TASLAK: Yayına almadan önce ofis bilgileriyle doldurulmalı ve bir hukukçuya kontrol ettirilmelidir.
export default function KvkkPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6 leading-relaxed text-gray-700">
      <h1 className="text-3xl font-bold text-gray-900">Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Bu metin bir taslaktır. Yayına almadan önce ofis bilgileriyle doldurulmalı ve hukuki açıdan kontrol edilmelidir.
      </p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Veri sorumlusu</h2>
      <p>[Ofis unvanı], [adres], [telefon], [e-posta]. Taşınmaz ticareti yetki belgesi no: [no].</p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Hangi verileri işliyoruz?</h2>
      <p>Formda paylaştığınız ad-soyad, telefon numarası, e-posta adresi, mesajınız ve tercih ettiğiniz görüşme zamanı.</p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Hangi amaçla?</h2>
      <p>Talebinize dönüş yapmak, gösterim randevusu ayarlamak ve ilgilendiğiniz taşınmazla ilgili bilgi vermek.</p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Hukuki sebep ve saklama süresi</h2>
      <p>
        Verileriniz 6698 sayılı KVKK md. 5 kapsamında açık rızanız ve talebinizin yerine getirilmesi amacıyla işlenir;
        talebiniz sonuçlandıktan sonra [süre] boyunca saklanır ve ardından silinir.
      </p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Aktarım</h2>
      <p>Verileriniz üçüncü kişilerle paylaşılmaz; yalnızca ofis çalışanları talebinizle ilgilenmek için erişir.</p>

      <h2 className="pt-2 text-xl font-semibold text-gray-900">Haklarınız</h2>
      <p>
        KVKK md. 11 kapsamında verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme haklarına
        sahipsiniz. Talepleriniz için: [e-posta].
      </p>
    </main>
  );
}
