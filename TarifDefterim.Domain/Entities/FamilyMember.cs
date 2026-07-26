using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Domain.Entities;

public class FamilyMember
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public FamilyMemberRole Role { get; set; }
    public DateTime JoinedAt { get; set; }

    public Family Family { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
