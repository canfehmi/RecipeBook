using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;
using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.Services;

public class FamilyService(IApplicationDbContext dbContext) : IFamilyService
{
    private const int MaxHeadsOfHousehold = 2;
    private const int InviteCodeLength = 8;
    private const string InviteCodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public async Task<FamilyDto> CreateFamilyForNewUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var existingMembership = await dbContext.FamilyMembers
            .AnyAsync(m => m.UserId == userId, cancellationToken);

        if (existingMembership)
        {
            throw new FamilyBusinessException("Kullanıcının zaten bir ailesi var.");
        }

        var family = await CreateSoloFamilyAsync(userId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapFamily(family, 1);
    }

    public async Task<FamilyJoinRequestDto> RequestToJoinFamilyAsync(
        string userId,
        string inviteCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = inviteCode.Trim().ToUpperInvariant();

        var currentMembership = await dbContext.FamilyMembers
            .Include(m => m.Family)
            .ThenInclude(f => f.Members)
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (currentMembership is null)
        {
            throw new FamilyBusinessException("Kullanıcının bir ailesi bulunamadı.");
        }

        if (currentMembership.Family.Members.Count > 1)
        {
            throw new FamilyBusinessException("Kullanıcı zaten paylaşımlı bir aileye üye.");
        }

        var pendingRequest = await dbContext.FamilyJoinRequests
            .AnyAsync(r =>
                r.RequesterUserId == userId &&
                r.Status == FamilyJoinRequestStatus.Pending,
                cancellationToken);

        if (pendingRequest)
        {
            throw new FamilyBusinessException("Zaten onay bekleyen bir katılım isteğiniz var.");
        }

        var targetFamily = await dbContext.Families
            .FirstOrDefaultAsync(f => f.InviteCode == normalizedCode, cancellationToken);

        if (targetFamily is null)
        {
            throw new FamilyBusinessException("Geçersiz davet kodu.");
        }

        if (targetFamily.Id == currentMembership.FamilyId)
        {
            throw new FamilyBusinessException("Kendi ailenize katılamazsınız.");
        }

        var request = new FamilyJoinRequest
        {
            Id = Guid.NewGuid(),
            FamilyId = targetFamily.Id,
            RequesterUserId = userId,
            Status = FamilyJoinRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);

        var requesterDisplayName = await dbContext.FamilyJoinRequests
            .Where(r => r.Id == request.Id)
            .Select(r => r.Requester.DisplayName)
            .FirstAsync(cancellationToken);

        return new FamilyJoinRequestDto(
            request.Id,
            request.FamilyId,
            request.RequesterUserId,
            requesterDisplayName,
            request.Status,
            request.CreatedAt);
    }

    public async Task<ApproveJoinRequestResultDto> ApproveJoinRequestAsync(
        Guid requestId,
        string approverUserId,
        CancellationToken cancellationToken = default)
    {
        var request = await dbContext.FamilyJoinRequests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken);

        if (request is null)
        {
            throw new FamilyBusinessException("Katılım isteği bulunamadı.");
        }

        if (request.Status != FamilyJoinRequestStatus.Pending)
        {
            throw new FamilyBusinessException("Bu istek zaten işlenmiş.");
        }

        var approverMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == approverUserId &&
                m.FamilyId == request.FamilyId,
                cancellationToken);

        if (approverMembership is null || approverMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu isteği onaylama yetkiniz yok.");
        }

        var requesterOldMembership = await dbContext.FamilyMembers
            .Include(m => m.Family)
            .ThenInclude(f => f.Members)
            .FirstOrDefaultAsync(m => m.UserId == request.RequesterUserId, cancellationToken);

        if (requesterOldMembership is null)
        {
            throw new FamilyBusinessException("İstek sahibinin aile üyeliği bulunamadı.");
        }

        request.Status = FamilyJoinRequestStatus.Approved;

        var newMembership = new FamilyMember
        {
            Id = Guid.NewGuid(),
            FamilyId = request.FamilyId,
            UserId = request.RequesterUserId,
            Role = FamilyMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        dbContext.Add(newMembership);

        var oldFamily = requesterOldMembership.Family;
        dbContext.Remove(requesterOldMembership);

        if (oldFamily.Members.Count == 0)
{
    dbContext.Remove(oldFamily);
}

        await dbContext.SaveChangesAsync(cancellationToken);

        // Tarif taşıma modalı için ayrı bir adım — recipe migration servisi burada çağrılacak.
        return new ApproveJoinRequestResultDto(
            request.Id,
            request.FamilyId,
            request.RequesterUserId,
            RequiresRecipeMigration: true);
    }

    public async Task RejectJoinRequestAsync(
        Guid requestId,
        string approverUserId,
        CancellationToken cancellationToken = default)
    {
        var request = await dbContext.FamilyJoinRequests
            .FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken);

        if (request is null)
        {
            throw new FamilyBusinessException("Katılım isteği bulunamadı.");
        }

        if (request.Status != FamilyJoinRequestStatus.Pending)
        {
            throw new FamilyBusinessException("Bu istek zaten işlenmiş.");
        }

        var approverMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == approverUserId &&
                m.FamilyId == request.FamilyId,
                cancellationToken);

        if (approverMembership is null || approverMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu isteği reddetme yetkiniz yok.");
        }

        request.Status = FamilyJoinRequestStatus.Rejected;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task PromoteToHeadOfHouseholdAsync(
        Guid familyId,
        string targetUserId,
        string actingUserId,
        CancellationToken cancellationToken = default)
    {
        var actingMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == actingUserId,
                cancellationToken);

        if (actingMembership is null || actingMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu işlemi yapmaya yetkiniz yok.");
        }

        var targetMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == targetUserId,
                cancellationToken);

        if (targetMembership is null)
        {
            throw new FamilyBusinessException("Hedef kullanıcı bu ailede bulunamadı.");
        }

        if (targetMembership.Role == FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Kullanıcı zaten aile büyüğü.");
        }

        var headCount = await dbContext.FamilyMembers
            .CountAsync(m =>
                m.FamilyId == familyId &&
                m.Role == FamilyMemberRole.HeadOfHousehold,
                cancellationToken);

        if (headCount >= MaxHeadsOfHousehold)
        {
            throw new FamilyBusinessException("Bu ailede en fazla iki aile büyüğü olabilir.");
        }

        targetMembership.Role = FamilyMemberRole.HeadOfHousehold;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DemoteToMemberAsync(
        Guid familyId,
        string targetUserId,
        string actingUserId,
        CancellationToken cancellationToken = default)
    {
        var actingMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == actingUserId,
                cancellationToken);

        if (actingMembership is null || actingMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu işlemi yapmaya yetkiniz yok.");
        }

        if (actingUserId == targetUserId)
        {
            throw new FamilyBusinessException("Kendi rolünüzü değiştiremezsiniz");
        }

        var targetMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == targetUserId,
                cancellationToken);

        if (targetMembership is null)
        {
            throw new FamilyBusinessException("Hedef kullanıcı bu ailede bulunamadı.");
        }

        if (targetMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Kullanıcı aile büyüğü değil.");
        }

        targetMembership.Role = FamilyMemberRole.Member;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveMemberAsync(
        Guid familyId,
        string targetUserId,
        string actingUserId,
        CancellationToken cancellationToken = default)
    {
        var actingMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == actingUserId,
                cancellationToken);

        if (actingMembership is null || actingMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu işlemi yapmaya yetkiniz yok.");
        }

        if (actingUserId == targetUserId)
        {
            throw new FamilyBusinessException("Kendinizi bu şekilde çıkaramazsınız");
        }

        var targetMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.FamilyId == familyId &&
                m.UserId == targetUserId,
                cancellationToken);

        if (targetMembership is null)
        {
            throw new FamilyBusinessException("Hedef kullanıcı bu ailede bulunamadı.");
        }

        dbContext.Remove(targetMembership);
        await CreateSoloFamilyAsync(targetUserId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task LeaveFamilyAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .Include(m => m.Family)
            .ThenInclude(f => f.Members)
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null)
        {
            throw new FamilyBusinessException("Aile üyeliği bulunamadı.");
        }

        if (membership.Role != FamilyMemberRole.Member)
        {
            throw new FamilyBusinessException("Aile büyüğü bu şekilde ayrılamaz");
        }

        if (membership.Family.Members.Count == 1)
        {
            throw new FamilyBusinessException("Zaten kendi tek kişilik ailenizdesiniz");
        }

        dbContext.Remove(membership);
        await CreateSoloFamilyAsync(userId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<FamilyDto?> GetMyFamilyAsync(string userId, CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .Include(m => m.Family)
            .ThenInclude(f => f.Members)
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null)
        {
            return null;
        }

        return MapFamily(membership.Family, membership.Family.Members.Count);
    }

    public async Task<IReadOnlyList<FamilyMemberDto>> GetFamilyMembersAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null)
        {
            throw new FamilyBusinessException("Aile üyeliği bulunamadı.");
        }

        return await dbContext.FamilyMembers
            .Where(m => m.FamilyId == membership.FamilyId)
            .OrderBy(m => m.JoinedAt)
            .Select(m => new FamilyMemberDto(
                m.Id,
                m.UserId,
                m.User.DisplayName,
                m.Role,
                m.JoinedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FamilyJoinRequestDto>> GetPendingJoinRequestsAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null || membership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Katılım isteklerini görüntüleme yetkiniz yok.");
        }

        return await dbContext.FamilyJoinRequests
            .Where(r =>
                r.FamilyId == membership.FamilyId &&
                r.Status == FamilyJoinRequestStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new FamilyJoinRequestDto(
                r.Id,
                r.FamilyId,
                r.RequesterUserId,
                r.Requester.DisplayName,
                r.Status,
                r.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    private async Task<Family> CreateSoloFamilyAsync(string userId, CancellationToken cancellationToken)
    {
        var family = new Family
        {
            Id = Guid.NewGuid(),
            InviteCode = await GenerateUniqueInviteCodeAsync(cancellationToken),
            CreatedAt = DateTime.UtcNow
        };

        var member = new FamilyMember
        {
            Id = Guid.NewGuid(),
            FamilyId = family.Id,
            UserId = userId,
            Role = FamilyMemberRole.HeadOfHousehold,
            JoinedAt = DateTime.UtcNow
        };

        dbContext.Add(family);
        dbContext.Add(member);

        return family;
    }

    private async Task<string> GenerateUniqueInviteCodeAsync(CancellationToken cancellationToken)
    {
        while (true)
        {
            var code = GenerateInviteCode();
            var exists = await dbContext.Families
                .AnyAsync(f => f.InviteCode == code, cancellationToken);

            if (!exists)
            {
                return code;
            }
        }
    }

    private static string GenerateInviteCode()
    {
        Span<char> code = stackalloc char[InviteCodeLength];
        Span<byte> bytes = stackalloc byte[InviteCodeLength];

        RandomNumberGenerator.Fill(bytes);

        for (var i = 0; i < InviteCodeLength; i++)
        {
            code[i] = InviteCodeChars[bytes[i] % InviteCodeChars.Length];
        }

        return new string(code);
    }

    private static FamilyDto MapFamily(Family family, int memberCount) =>
        new(family.Id, family.InviteCode, family.CreatedAt, memberCount);
}
