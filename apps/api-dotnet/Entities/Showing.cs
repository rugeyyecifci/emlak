namespace EmlakApi.Entities;

// Gösterim randevuları
public class Showing
{
    public int Id { get; set; }
    public int? LeadId { get; set; }
    public Lead? Lead { get; set; }
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public int? AgentId { get; set; }
    public User? Agent { get; set; }
    public DateTime StartsAt { get; set; }
    public string? ResultNote { get; set; }
}
