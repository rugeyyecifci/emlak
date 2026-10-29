namespace EmlakApi.Entities;

// Fiyat değişiklikleri
public class PriceHistory
{
    public int Id { get; set; }
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public int OldPrice { get; set; }
    public int NewPrice { get; set; }
    public int? ChangedById { get; set; }
    public User? ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
