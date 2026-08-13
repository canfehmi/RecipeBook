namespace TarifDefterim.Application.DTOs;

public record PageContentDto(
    string Slug,
    string Title,
    string ContentHtml,
    DateTime UpdatedAt);

public record UpdatePageContentDto(string Title, string ContentHtml);
