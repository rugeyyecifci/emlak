using EmlakApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Veritabanı bağlantısı: appsettings.json içindeki "Default" bağlantı cümlesi
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default"),
        npgsql => npgsql.UseNetTopologySuite()));

var app = builder.Build();

// "dotnet run -- seed" ile çalıştırılırsa: veritabanını örnek veriyle doldur ve çık
if (args.Contains("seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await Seeder.RunAsync(db);
    return;
}

app.MapGet("/", () => new
{
    durum = ".NET API çalışıyor",
    not = "Örnek veri için: http://localhost:5050/listings"
});

// Deneme ucu: yayındaki ilanları özellikleriyle birlikte listeler
app.MapGet("/listings", async (AppDbContext db) =>
    await db.Listings
        .Where(l => l.Status == "yayinda")
        .OrderByDescending(l => l.CreatedAt)
        .Select(l => new
        {
            l.Id,
            l.Title,
            l.Type,
            l.PropertyType,
            l.Price,
            l.Rooms,
            l.AreaM2,
            l.District,
            Danisman = l.Agent != null ? l.Agent.Name : null,
            Ozellikler = l.ListingFeatures.Select(lf => lf.Feature.Name),
            EidsBitis = l.EidsAuthorization != null ? l.EidsAuthorization.EndsOn : (DateOnly?)null,
        })
        .ToListAsync());

app.Run("http://localhost:5050");
