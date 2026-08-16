using System.Text.RegularExpressions;

namespace TarifDefterim.Application.Helpers;

public static partial class RecipeSlugHelper
{
    public static string GenerateBaseSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return "tarif";
        }

        var normalized = title.Trim();
        normalized = normalized
            .Replace('ç', 'c').Replace('Ç', 'c')
            .Replace('ğ', 'g').Replace('Ğ', 'g')
            .Replace('ı', 'i')
            .Replace('İ', 'i')
            .Replace('ö', 'o').Replace('Ö', 'o')
            .Replace('ş', 's').Replace('Ş', 's')
            .Replace('ü', 'u').Replace('Ü', 'u');

        normalized = normalized.ToLowerInvariant();
        normalized = WhitespaceRegex().Replace(normalized, "-");
        normalized = InvalidCharsRegex().Replace(normalized, string.Empty);
        normalized = MultiDashRegex().Replace(normalized, "-").Trim('-');

        return string.IsNullOrEmpty(normalized) ? "tarif" : normalized;
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"[^a-z0-9-]")]
    private static partial Regex InvalidCharsRegex();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultiDashRegex();
}
