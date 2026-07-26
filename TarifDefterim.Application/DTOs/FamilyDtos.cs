using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.DTOs;

public record FamilyDto(
    Guid Id,
    string InviteCode,
    DateTime CreatedAt,
    int MemberCount);

public record FamilyMemberDto(
    Guid Id,
    string UserId,
    string DisplayName,
    FamilyMemberRole Role,
    DateTime JoinedAt);

public record FamilyJoinRequestDto(
    Guid Id,
    Guid FamilyId,
    string RequesterUserId,
    string RequesterDisplayName,
    FamilyJoinRequestStatus Status,
    DateTime CreatedAt);

public record ApproveJoinRequestResultDto(
    Guid RequestId,
    Guid FamilyId,
    string RequesterUserId,
    bool RequiresRecipeMigration);

public record JoinFamilyRequest(string InviteCode);

public record PromoteHeadRequest(string TargetUserId);
