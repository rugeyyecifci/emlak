namespace EmlakApi.Entities;

// "Bana haber ver": ziyaretçinin kaydettiği arama
public class SavedSearch
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public string Filters { get; set; } = "{}";            // jsonb: {"tur":"kiralik","semt":"Merkez",...}
    public bool IsActive { get; set; } = true;
    public DateTime KvkkAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<SearchMatch> Matches { get; set; } = [];
}

// Kayıtlı arama ile ilan eşleşmesi (aynı ilan için iki kez haber verilmesin)
public class SearchMatch
{
    public int SavedSearchId { get; set; }
    public SavedSearch SavedSearch { get; set; } = null!;
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public DateTime? NotifiedAt { get; set; }
}
