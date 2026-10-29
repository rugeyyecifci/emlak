namespace EmlakApi.Entities;

// Mülk sahipleri: bir kişinin birden çok mülkü olabilir
public class Owner
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public DateTime? KvkkAt { get; set; }
    public string? Note { get; set; }

    public List<Listing> Listings { get; set; } = [];
}
