using System.Security.Cryptography;
using System.Text;
using EmlakApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmlakApi.Data;

// Veritabanını gerçekçi örnek verilerle doldurur.
// Çalıştırma: dotnet run -- seed   (veritabanı doluysa hiçbir şey yapmaz)
public static class Seeder
{
    public static async Task RunAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            Console.WriteLine("Veritabanında zaten veri var, örnek veri eklenmedi.");
            return;
        }

        var rnd = new Random(42); // her seferinde aynı örnek veri çıksın
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        // ---------- kullanıcılar ----------
        var sahip = new User
        {
            Email = "admin@emlak.com",
            Name = "Ofis Sahibi",
            Phone = "5320000001",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Emlak2026!"),
            Role = Roles.Sahip,
        };
        var danisman = new User
        {
            Email = "danisman@emlak.com",
            Name = "Örnek Danışman",
            Phone = "5320000002",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Danisman2026!"),
            Role = Roles.Danisman,
        };
        db.Users.AddRange(sahip, danisman);

        // ---------- mülk sahipleri ----------
        var owners = new List<Owner>
        {
            new() { Name = "Ayşe Yılmaz", Phone = "5321112233", KvkkAt = now },
            new() { Name = "Mehmet Demir", Phone = "5332223344", KvkkAt = now },
            new() { Name = "Fatma Kaya", Phone = "5443334455", Email = "fatma@ornek.com", KvkkAt = now },
            new() { Name = "Ali Çelik", Phone = "5054445566", KvkkAt = now, Note = "Akşam 18'den sonra aranmalı" },
        };
        db.Owners.AddRange(owners);

        // ---------- özellikler ----------
        var features = new[] { "Balkon", "Otopark", "Asansör", "Eşyalı", "Site içinde", "Doğalgaz", "Bahçe", "Güvenlik" }
            .Select(n => new Feature { Name = n }).ToList();
        db.Features.AddRange(features);

        // ---------- ilanlar ----------
        // (başlık, tür, mülk tipi, fiyat, oda, m², kat, bina yaşı, ısınma, semt, durum)
        var data = new (string Title, string Type, string Prop, int Price, string? Rooms, int M2, int? Floor, int? Age, string? Heat, string District, string Status)[]
        {
            ("Merkezde asansörlü 3+1 daire", "satilik", "daire", 4_500_000, "3+1", 135, 3, 8, "Doğalgaz kombi", "Merkez", "yayinda"),
            ("Okula yakın 2+1 kiralık", "kiralik", "daire", 18_000, "2+1", 95, 2, 15, "Doğalgaz kombi", "Merkez", "yayinda"),
            ("Site içinde havuzlu 4+1", "satilik", "daire", 7_250_000, "4+1", 180, 5, 3, "Merkezi sistem", "Yeni Mahalle", "yayinda"),
            ("Öğrenciye uygun eşyalı 1+1", "kiralik", "daire", 12_500, "1+1", 55, 1, 20, "Doğalgaz kombi", "Üniversite", "yayinda"),
            ("Bahçeli müstakil ev", "satilik", "mustakil", 6_900_000, "4+1", 210, null, 12, "Doğalgaz kombi", "Bağlar", "yayinda"),
            ("Ana cadde üzeri dükkan", "kiralik", "isyeri", 35_000, null, 120, 0, 25, null, "Çarşı", "yayinda"),
            ("Yatırımlık imarlı arsa", "satilik", "arsa", 2_100_000, null, 650, null, null, null, "Sanayi", "yayinda"),
            ("Yeni binada 3+1 kiralık", "kiralik", "daire", 24_000, "3+1", 125, 4, 1, "Yerden ısıtma", "Yeni Mahalle", "yayinda"),
            ("Ara katta geniş 3+1", "satilik", "daire", 3_850_000, "3+1", 140, 2, 18, "Doğalgaz kombi", "İstasyon", "yayinda"),
            ("Çatı katı dubleks 5+2", "satilik", "daire", 8_400_000, "5+2", 260, 6, 6, "Doğalgaz kombi", "Merkez", "yayinda"),
            ("Metroya yakın 2+1", "satilik", "daire", 3_200_000, "2+1", 100, 3, 10, "Doğalgaz kombi", "İstasyon", "yayinda"),
            ("Eşyalı 2+1 kiralık", "kiralik", "daire", 20_000, "2+1", 90, 1, 9, "Doğalgaz kombi", "Üniversite", "yayinda"),
            ("Ofise uygun 150 m² işyeri", "satilik", "isyeri", 5_600_000, null, 150, 1, 14, "Merkezi sistem", "Çarşı", "yayinda"),
            ("Bahçe katı 3+1", "kiralik", "daire", 22_000, "3+1", 130, 0, 7, "Doğalgaz kombi", "Bağlar", "yayinda"),
            ("Deniz manzaralı yazlık", "satilik", "mustakil", 5_200_000, "3+1", 160, null, 11, "Klima", "Sahil", "yayinda"),
            ("Site içinde 2+1 kiralık", "kiralik", "daire", 21_500, "2+1", 105, 3, 4, "Doğalgaz kombi", "Yeni Mahalle", "yayinda"),
            ("Tarla vasfında arazi", "satilik", "arsa", 950_000, null, 4_800, null, null, null, "Köy yolu", "yayinda"),
            ("Yenilenmiş 1+1", "satilik", "daire", 1_950_000, "1+1", 65, 2, 30, "Doğalgaz kombi", "Merkez", "taslak"),
            ("Kiralandı: 3+1 daire", "kiralik", "daire", 19_000, "3+1", 120, 3, 12, "Doğalgaz kombi", "İstasyon", "kapandi"),
            ("Satıldı: 4+1 müstakil", "satilik", "mustakil", 6_100_000, "4+1", 190, null, 9, "Doğalgaz kombi", "Bağlar", "kapandi"),
        };

        var listings = new List<Listing>();
        for (var i = 0; i < data.Length; i++)
        {
            var d = data[i];
            var created = now.AddDays(-rnd.Next(1, 60));
            var listing = new Listing
            {
                Title = d.Title,
                Description = $"{d.Title}. {d.District} bölgesinde, ulaşıma ve günlük ihtiyaçlara yakın. Detaylı bilgi ve gösterim için bizi arayın.",
                Type = d.Type,
                PropertyType = d.Prop,
                Price = d.Price,
                Rooms = d.Rooms,
                AreaM2 = d.M2,
                Floor = d.Floor,
                BuildingAge = d.Age,
                Heating = d.Heat,
                District = d.District,
                Status = d.Status,
                Agent = i % 3 == 0 ? sahip : danisman,
                Owner = owners[i % owners.Count],
                CreatedAt = created,
                PublishedAt = d.Status == "taslak" ? null : created.AddHours(2),
            };

            // 2-4 rastgele özellik
            foreach (var f in features.OrderBy(_ => rnd.Next()).Take(rnd.Next(2, 5)))
                listing.ListingFeatures.Add(new ListingFeature { Feature = f });

            // Yayındaki ilanların EİDS yetkisi (bazılarının bitişi yakın: uyarı denemesi için)
            if (d.Status == "yayinda")
            {
                var start = DateOnly.FromDateTime(created).AddDays(-3);
                listing.EidsAuthorization = new EidsAuthorization
                {
                    TasinmazNo = $"{rnd.Next(10000000, 99999999)}",
                    StartsOn = start,
                    EndsOn = i % 5 == 0 ? today.AddDays(rnd.Next(3, 10)) : start.AddMonths(6),
                };

                // Son 14 günün görüntülenme sayıları
                for (var g = 0; g < 14; g++)
                    listing.Views.Add(new ListingView { Day = today.AddDays(-g), Count = rnd.Next(0, 40) });
            }

            listings.Add(listing);
        }
        db.Listings.AddRange(listings);

        // ---------- fiyat geçmişi ----------
        db.PriceHistory.AddRange(
            new PriceHistory { Listing = listings[0], OldPrice = 4_750_000, NewPrice = 4_500_000, ChangedBy = sahip, ChangedAt = now.AddDays(-5) },
            new PriceHistory { Listing = listings[2], OldPrice = 7_500_000, NewPrice = 7_250_000, ChangedBy = danisman, ChangedAt = now.AddDays(-2) },
            new PriceHistory { Listing = listings[1], OldPrice = 17_000, NewPrice = 18_000, ChangedBy = danisman, ChangedAt = now.AddDays(-10) });

        // ---------- talepler ----------
        var leads = new List<Lead>
        {
            new() { Name = "Zeynep Arslan", Phone = "5551112233", Kind = "gosterim", Listing = listings[0], Message = "Hafta sonu görebilir miyim?", PreferredTime = "Hafta sonu", KvkkAt = now, CreatedAt = now.AddHours(-3) },
            new() { Name = "Burak Öztürk", Phone = "5422223344", Kind = "bilgi", Listing = listings[3], Message = "Depozito ne kadar?", Status = "arandi", AssignedTo = danisman, KvkkAt = now, CreatedAt = now.AddDays(-1) },
            new() { Name = "Elif Şahin", Phone = "5363334455", Email = "elif@ornek.com", Kind = "gosterim", Listing = listings[2], Status = "gosterim", AssignedTo = sahip, Note = "Cumartesi gösterildi, eşiyle tekrar gelecek", KvkkAt = now, CreatedAt = now.AddDays(-4) },
            new() { Name = "Can Aydın", Phone = "5074445566", Kind = "iletisim", Message = "Evimi satmak istiyorum, değerleme yapar mısınız?", KvkkAt = now, CreatedAt = now.AddDays(-2) },
            new() { Name = "Selin Koç", Phone = "5315556677", Kind = "gosterim", Source = "vitrin_ekrani", Listing = listings[7], KvkkAt = now, CreatedAt = now.AddHours(-20) },
        };
        db.Leads.AddRange(leads);

        // ---------- gösterimler ----------
        db.Showings.AddRange(
            new Showing { Lead = leads[2], Listing = listings[2], Agent = sahip, StartsAt = now.AddDays(-2), ResultNote = "Beğendi, fiyatta pazarlık istiyor" },
            new Showing { Lead = leads[0], Listing = listings[0], Agent = danisman, StartsAt = now.AddDays(2) });

        // ---------- kayıtlı aramalar ----------
        db.SavedSearches.AddRange(
            new SavedSearch { Name = "Deniz Yurt", Phone = "5446667788", Filters = """{"tur":"kiralik","semt":"Üniversite","oda":["1+1","2+1"],"max":20000}""", KvkkAt = now },
            new SavedSearch { Name = "Hakan Er", Phone = "5357778899", Filters = """{"tur":"satilik","oda":["3+1"],"max":4000000}""", KvkkAt = now });

        // ---------- ofis ekranı ----------
        var device = new Device
        {
            Name = "Vitrin ekranı",
            TokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes("ornek-ekran-anahtari"))),
            OpensAt = new TimeOnly(9, 0),
            ClosesAt = new TimeOnly(20, 0),
        };
        for (var i = 0; i < 6; i++) device.Listings.Add(new DeviceListing { Listing = listings[i], SortOrder = i });
        db.Devices.Add(device);

        await db.SaveChangesAsync();

        Console.WriteLine($"Örnek veri eklendi: {listings.Count} ilan, {leads.Count} talep, 2 kullanıcı.");
        Console.WriteLine("Giriş: admin@emlak.com / Emlak2026!");
    }
}
