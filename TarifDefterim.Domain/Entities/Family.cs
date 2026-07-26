namespace TarifDefterim.Domain.Entities;

public class Family
{
    public Guid Id { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<FamilyMember> Members { get; set; } = [];
    public ICollection<FamilyJoinRequest> JoinRequests { get; set; } = [];
    public ICollection<Recipe> Recipes { get; set; } = [];
}
