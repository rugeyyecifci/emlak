namespace EmlakApi.Entities;

// Siteden gelen talepler
public class Lead
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public string? Message { get; set; }
    public string? PreferredTime { get; set; }
    public string Kind { get; set; } = "gosterim";         // gosterim | bilgi | iletisim
    public string Source { get; set; } = "site";           // site | whatsapp | vitrin_ekrani
    public string Status { get; set; } = "yeni";           // yeni | arandi | gosterim | kapandi
    public string? Note { get; set; }

    public int? ListingId { get; set; }
    public Listing? Listing { get; set; }
    public int? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }

    public DateTime KvkkAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Showing> Showings { get; set; } = [];
}
