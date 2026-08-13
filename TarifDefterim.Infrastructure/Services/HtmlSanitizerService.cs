using Ganss.Xss;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Infrastructure.Services;

public class HtmlSanitizerService : IHtmlContentSanitizer
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();
        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.UnionWith(
        [
            "p", "h2", "h3", "ul", "ol", "li", "a", "strong", "em", "b", "i", "br", "div", "span",
        ]);
        _sanitizer.AllowedAttributes.Clear();
        _sanitizer.AllowedAttributes.UnionWith(["href", "target", "rel", "class"]);
        _sanitizer.AllowedSchemes.Clear();
        _sanitizer.AllowedSchemes.UnionWith(["http", "https", "mailto"]);
        _sanitizer.AllowedCssProperties.Clear();
    }

    public string Sanitize(string html) => _sanitizer.Sanitize(html ?? string.Empty);
}
