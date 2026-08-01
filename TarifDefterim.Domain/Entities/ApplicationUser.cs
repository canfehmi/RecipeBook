using Microsoft.AspNetCore.Identity;

namespace TarifDefterim.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;

    public string? EmailVerificationTokenHash { get; set; }
    public DateTimeOffset? EmailVerificationExpireDate { get; set; }
    public DateTimeOffset? LastVerificationEmailSentAt { get; set; }

    public string? PasswordResetTokenHash { get; set; }
    public DateTimeOffset? PasswordResetExpireDate { get; set; }
    public DateTimeOffset? LastPasswordResetEmailSentAt { get; set; }

    public ICollection<FamilyMember> FamilyMemberships { get; set; } = [];
    public ICollection<FamilyJoinRequest> JoinRequests { get; set; } = [];
    public ICollection<Recipe> CreatedRecipes { get; set; } = [];
}
