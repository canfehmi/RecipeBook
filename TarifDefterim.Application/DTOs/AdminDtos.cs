using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.DTOs;

public record AdminFamilyMemberDto(
    string UserId,
    string DisplayName,
    string Email,
    FamilyMemberRole Role);

public record AdminFamilyDto(
    Guid Id,
    string InviteCode,
    DateTime CreatedAt,
    IReadOnlyList<AdminFamilyMemberDto> Members);

public record AdminUserDto(
    string Id,
    string Email,
    string DisplayName,
    bool EmailConfirmed,
    DateTimeOffset? LockoutEnd,
    Guid? FamilyId,
    string? FamilyInviteCode);
