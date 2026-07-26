using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Domain.Entities;

public class FamilyJoinRequest
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string RequesterUserId { get; set; } = string.Empty;
    public FamilyJoinRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public Family Family { get; set; } = null!;
    public ApplicationUser Requester { get; set; } = null!;
}
