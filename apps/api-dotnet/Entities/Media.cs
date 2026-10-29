namespace EmlakApi.Entities;

// İlan fotoğrafları. Dosyanın kendisi depoda (SeaweedFS), burada sadece adresi var.
public class Media
{
    public int Id { get; set; }
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public string OriginalKey { get; set; } = "";
    public string? ThumbKey { get; set; }
    public string? LargeKey { get; set; }
    public int SortOrder { get; set; }
    public string Status { get; set; } = "isleniyor";      // isleniyor | hazir | hata
}
