namespace EmlakApi.Entities;

// Panele giriş yapan emlakçı ve danışmanlar
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = Roles.Danisman;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Listing> Listings { get; set; } = [];
}

public static class Roles
{
    public const string Sahip = "sahip";
    public const string Danisman = "danisman";
}
