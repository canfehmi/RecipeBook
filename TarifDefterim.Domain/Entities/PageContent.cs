namespace TarifDefterim.Domain.Entities;

public class PageContent
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
