using TarifDefterim.Application.DTOs;

namespace TarifDefterim.Application.Interfaces;

public interface IFamilyService
{
    Task<FamilyDto> CreateFamilyForNewUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<FamilyJoinRequestDto> RequestToJoinFamilyAsync(string userId, string inviteCode, CancellationToken cancellationToken = default);
    Task<ApproveJoinRequestResultDto> ApproveJoinRequestAsync(Guid requestId, string approverUserId, CancellationToken cancellationToken = default);
    Task RejectJoinRequestAsync(Guid requestId, string approverUserId, CancellationToken cancellationToken = default);
    Task PromoteToHeadOfHouseholdAsync(Guid familyId, string targetUserId, string actingUserId, CancellationToken cancellationToken = default);
    Task<FamilyDto?> GetMyFamilyAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FamilyMemberDto>> GetFamilyMembersAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FamilyJoinRequestDto>> GetPendingJoinRequestsAsync(string userId, CancellationToken cancellationToken = default);
}
