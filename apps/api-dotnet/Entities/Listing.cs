using NetTopologySuite.Geometries;

namespace EmlakApi.Entities;

// İlanlar: sistemin merkezindeki tablo
public class Listing
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Type { get; set; } = "satilik";          // satilik | kiralik
    public string PropertyType { get; set; } = "daire";    // daire | mustakil | arsa | isyeri
    public int Price { get; set; }
    public string? Rooms { get; set; }
    public int? AreaM2 { get; set; }
    public int? Floor { get; set; }
    public int? BuildingAge { get; set; }
    public string? Heating { get; set; }
    public string? District { get; set; }
    public string? Address { get; set; }
    public Point? Location { get; set; }                   // PostGIS: harita için
    public string Status { get; set; } = "taslak";         // taslak | yayinda | kapandi

    public int? AgentId { get; set; }
    public User? Agent { get; set; }
    public int? OwnerId { get; set; }
    public Owner? Owner { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }

    public List<Media> Media { get; set; } = [];
    public List<ListingFeature> ListingFeatures { get; set; } = [];
    public EidsAuthorization? EidsAuthorization { get; set; }
    public List<PriceHistory> PriceHistory { get; set; } = [];
    public List<ListingView> Views { get; set; } = [];
    public List<Lead> Leads { get; set; } = [];
}
