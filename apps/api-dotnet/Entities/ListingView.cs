namespace EmlakApi.Entities;

// Günlük görüntülenme sayısı: her ilan için günde tek satır
public class ListingView
{
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public DateOnly Day { get; set; }
    public int Count { get; set; }
}
