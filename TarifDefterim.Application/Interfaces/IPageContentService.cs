using TarifDefterim.Application.DTOs;

namespace TarifDefterim.Application.Interfaces;

public interface IPageContentService
{
    Task<PageContentDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PageContentDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PageContentDto> UpdateAsync(string slug, UpdatePageContentDto dto, CancellationToken cancellationToken = default);
}
