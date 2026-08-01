using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Application.Services;

public class AdminService(IApplicationDbContext dbContext) : IAdminService
{
    public async Task<IReadOnlyList<AdminFamilyDto>> GetAllFamiliesAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Families
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new AdminFamilyDto(
                f.Id,
                f.InviteCode,
                f.CreatedAt,
                f.Members
                    .OrderBy(m => m.JoinedAt)
                    .Select(m => new AdminFamilyMemberDto(
                        m.UserId,
                        m.User.DisplayName,
                        m.User.Email!,
                        m.Role))
                    .ToList()))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AdminUserDto>> GetAllUsersAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .OrderBy(u => u.Email)
            .Select(u => new AdminUserDto(
                u.Id,
                u.Email!,
                u.DisplayName,
                u.EmailConfirmed,
                u.LockoutEnd,
                u.FamilyMemberships.Select(m => m.FamilyId).FirstOrDefault(),
                u.FamilyMemberships.Select(m => m.Family.InviteCode).FirstOrDefault()))
            .ToListAsync(cancellationToken);
    }
}
