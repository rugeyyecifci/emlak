namespace EmlakApi.Entities;

// EİDS yetkisi: her ilanın en fazla bir yetkisi var (bire-bir ilişki)
public class EidsAuthorization
{
    public int Id { get; set; }
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public string TasinmazNo { get; set; } = "";
    public DateOnly StartsOn { get; set; }
    public DateOnly EndsOn { get; set; }
}
