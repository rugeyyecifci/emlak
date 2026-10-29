namespace EmlakApi.Entities;

// Ofis ekranları (Raspberry Pi)
public class Device
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string TokenHash { get; set; } = "";
    public TimeOnly? OpensAt { get; set; }
    public TimeOnly? ClosesAt { get; set; }
    public DateTime? LastSeenAt { get; set; }

    public List<DeviceListing> Listings { get; set; } = [];
}

// Ekranda dönen ilanlar ve sırası
public class DeviceListing
{
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
    public int SortOrder { get; set; }
}
