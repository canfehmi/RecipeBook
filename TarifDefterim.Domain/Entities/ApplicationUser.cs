using Microsoft.AspNetCore.Identity;

namespace TarifDefterim.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;

    public ICollection<FamilyMember> FamilyMemberships { get; set; } = [];
    public ICollection<FamilyJoinRequest> JoinRequests { get; set; } = [];
    public ICollection<Recipe> CreatedRecipes { get; set; } = [];
}
