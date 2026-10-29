using EmlakApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmlakApi.Data;

// Veritabanının C# tarafındaki karşılığı: her DbSet bir tablo
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<ListingFeature> ListingFeatures => Set<ListingFeature>();
    public DbSet<Media> Media => Set<Media>();
    public DbSet<EidsAuthorization> EidsAuthorizations => Set<EidsAuthorization>();
    public DbSet<PriceHistory> PriceHistory => Set<PriceHistory>();
    public DbSet<ListingView> ListingViews => Set<ListingView>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Showing> Showings => Set<Showing>();
    public DbSet<SavedSearch> SavedSearches => Set<SavedSearch>();
    public DbSet<SearchMatch> SearchMatches => Set<SearchMatch>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DeviceListing> DeviceListings => Set<DeviceListing>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Harita/konum sorguları için PostGIS eklentisi
        b.HasPostgresExtension("postgis");

        // ---------- users ----------
        b.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(200);
            e.Property(u => u.Role).HasMaxLength(20);
        });

        // ---------- listings ----------
        b.Entity<Listing>(e =>
        {
            e.Property(l => l.Title).HasMaxLength(200);
            e.Property(l => l.Type).HasMaxLength(20);
            e.Property(l => l.PropertyType).HasMaxLength(20);
            e.Property(l => l.Status).HasMaxLength(20);
            e.Property(l => l.Location).HasColumnType("geography (point)");

            // Danışman ya da mülk sahibi silinirse ilan kalsın, bağlantı boşalsın
            e.HasOne(l => l.Agent).WithMany(u => u.Listings).HasForeignKey(l => l.AgentId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(l => l.Owner).WithMany(o => o.Listings).HasForeignKey(l => l.OwnerId).OnDelete(DeleteBehavior.SetNull);

            // Sitede en sık yapılan arama: yayındaki, şu türdeki, şu semtteki ilanlar
            e.HasIndex(l => new { l.Status, l.Type, l.District });
        });

        // ---------- features (çoka-çok) ----------
        b.Entity<Feature>().HasIndex(f => f.Name).IsUnique();
        b.Entity<ListingFeature>(e =>
        {
            e.HasKey(lf => new { lf.ListingId, lf.FeatureId });
            e.HasOne(lf => lf.Listing).WithMany(l => l.ListingFeatures).HasForeignKey(lf => lf.ListingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(lf => lf.Feature).WithMany(f => f.ListingFeatures).HasForeignKey(lf => lf.FeatureId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- media ----------
        b.Entity<Media>(e =>
        {
            // İlan silinirse fotoğraf kayıtları da silinsin
            e.HasOne(m => m.Listing).WithMany(l => l.Media).HasForeignKey(m => m.ListingId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(m => new { m.ListingId, m.SortOrder });
        });

        // ---------- EİDS (bire-bir) ----------
        b.Entity<EidsAuthorization>(e =>
        {
            e.HasOne(x => x.Listing).WithOne(l => l.EidsAuthorization).HasForeignKey<EidsAuthorization>(x => x.ListingId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.ListingId).IsUnique();
            e.HasIndex(x => x.EndsOn); // "yetkisi bitmek üzere olanlar" sorgusu için
        });

        // ---------- price_history ----------
        b.Entity<PriceHistory>(e =>
        {
            e.HasOne(p => p.Listing).WithMany(l => l.PriceHistory).HasForeignKey(p => p.ListingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.ChangedBy).WithMany().HasForeignKey(p => p.ChangedById).OnDelete(DeleteBehavior.SetNull);
        });

        // ---------- listing_views (günlük toplam) ----------
        b.Entity<ListingView>(e =>
        {
            e.HasKey(v => new { v.ListingId, v.Day });
            e.HasOne(v => v.Listing).WithMany(l => l.Views).HasForeignKey(v => v.ListingId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- leads ----------
        b.Entity<Lead>(e =>
        {
            e.Property(l => l.Kind).HasMaxLength(20);
            e.Property(l => l.Source).HasMaxLength(20);
            e.Property(l => l.Status).HasMaxLength(20);
            // İlan silinse de talep (müşteri) kaybolmasın
            e.HasOne(l => l.Listing).WithMany(x => x.Leads).HasForeignKey(l => l.ListingId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(l => l.AssignedTo).WithMany().HasForeignKey(l => l.AssignedToId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(l => new { l.Status, l.CreatedAt });
        });

        // ---------- showings ----------
        b.Entity<Showing>(e =>
        {
            e.HasOne(s => s.Lead).WithMany(l => l.Showings).HasForeignKey(s => s.LeadId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(s => s.Listing).WithMany().HasForeignKey(s => s.ListingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Agent).WithMany().HasForeignKey(s => s.AgentId).OnDelete(DeleteBehavior.SetNull);
        });

        // ---------- saved_searches ----------
        b.Entity<SavedSearch>().Property(s => s.Filters).HasColumnType("jsonb");
        b.Entity<SearchMatch>(e =>
        {
            e.HasKey(m => new { m.SavedSearchId, m.ListingId });
            e.HasOne(m => m.SavedSearch).WithMany(s => s.Matches).HasForeignKey(m => m.SavedSearchId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Listing).WithMany().HasForeignKey(m => m.ListingId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- devices (ofis ekranı) ----------
        b.Entity<DeviceListing>(e =>
        {
            e.HasKey(d => new { d.DeviceId, d.ListingId });
            e.HasOne(d => d.Device).WithMany(x => x.Listings).HasForeignKey(d => d.DeviceId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(d => d.Listing).WithMany().HasForeignKey(d => d.ListingId).OnDelete(DeleteBehavior.Cascade);
        });

        // Bütün tablo ve sütun adlarını PostgreSQL'e uygun snake_case yap:
        // AreaM2 -> area_m2, ListingFeatures -> listing_features
        foreach (var entity in b.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));
            foreach (var p in entity.GetProperties()) p.SetColumnName(ToSnakeCase(p.GetColumnName()));
            foreach (var k in entity.GetKeys()) k.SetName(ToSnakeCase(k.GetName()!));
            foreach (var fk in entity.GetForeignKeys()) fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));
            foreach (var ix in entity.GetIndexes()) ix.SetDatabaseName(ToSnakeCase(ix.GetDatabaseName()!));
        }
    }

    private static string ToSnakeCase(string name) =>
        string.Concat(name.Select((c, i) =>
            i > 0 && char.IsUpper(c) && (char.IsLower(name[i - 1]) || char.IsDigit(name[i - 1]) || (i + 1 < name.Length && char.IsLower(name[i + 1])))
            && name[i - 1] != '_'
                ? "_" + char.ToLowerInvariant(c)
                : char.ToLowerInvariant(c).ToString()));
}
