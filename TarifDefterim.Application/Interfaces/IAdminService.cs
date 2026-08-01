using TarifDefterim.Application.DTOs;

namespace TarifDefterim.Application.Interfaces;

public interface IAdminService
{
    Task<IReadOnlyList<AdminFamilyDto>> GetAllFamiliesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminUserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
}
