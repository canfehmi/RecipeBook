using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Services;

public class PageContentService(IApplicationDbContext dbContext, IHtmlContentSanitizer htmlSanitizer) : IPageContentService
{
    public async Task<PageContentDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = NormalizeSlug(slug);
        var page = await dbContext.PageContents
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == normalizedSlug, cancellationToken);

        return page is null ? null : MapToDto(page);
    }

    public async Task<IReadOnlyList<PageContentDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var pages = await dbContext.PageContents
            .AsNoTracking()
            .OrderBy(p => p.Title)
            .ToListAsync(cancellationToken);

        return pages.Select(MapToDto).ToList();
    }

    public async Task<PageContentDto> UpdateAsync(
        string slug,
        UpdatePageContentDto dto,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = NormalizeSlug(slug);
        var page = await dbContext.PageContents
            .FirstOrDefaultAsync(p => p.Slug == normalizedSlug, cancellationToken);

        if (page is null)
        {
            throw new FamilyBusinessException("Sayfa içeriği bulunamadı.");
        }

        var title = dto.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new FamilyBusinessException("Başlık gerekli.");
        }

        page.Title = title;
        page.ContentHtml = htmlSanitizer.Sanitize(dto.ContentHtml ?? string.Empty);
        page.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(page);
    }

    private static string NormalizeSlug(string slug) => slug.Trim().ToLowerInvariant();

    private static PageContentDto MapToDto(PageContent page) =>
        new(page.Slug, page.Title, page.ContentHtml, page.UpdatedAt);
}
