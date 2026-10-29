namespace EmlakApi.Entities;

// Özellik listesi (balkon, otopark, eşyalı...)
public class Feature
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    public List<ListingFeature> ListingFeatures { get; set; } = [];
}

// İlan ↔ özellik bağlantı tablosu (çoka-çok ilişki)
public class ListingFeature
{
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public int FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
}
