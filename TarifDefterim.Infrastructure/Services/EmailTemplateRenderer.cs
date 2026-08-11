using TarifDefterim.Infrastructure.Email;

namespace TarifDefterim.Infrastructure.Services;

public class EmailTemplateRenderer
{
    private readonly string _templateDirectory;

    public EmailTemplateRenderer()
    {
        _templateDirectory = Path.Combine(AppContext.BaseDirectory, "EmailTemplates");
    }

    public async Task<string> RenderVerificationEmailAsync(
        string fullName,
        string verificationUrl,
        CancellationToken cancellationToken = default)
    {
        var template = await ReadTemplateAsync(EmailTemplateNames.Verification, cancellationToken);
        return ApplyCommonPlaceholders(template, fullName, verificationUrl);
    }

    public string RenderVerificationPlainText(string fullName, string verificationUrl)
    {
        return $"""
            Merhaba {fullName},

            Tarifet hesabınızı kullanmaya başlamak için email adresinizi doğrulamanız gerekiyor.

            Doğrulama bağlantısı (24 saat geçerlidir):
            {verificationUrl}

            Bu hesabı siz oluşturmadıysanız bu emaili yok sayabilirsiniz.

            Tarifet
            tarif@studiowebia.com
            """;
    }

    public async Task<string> RenderPasswordResetEmailAsync(
        string fullName,
        string resetUrl,
        CancellationToken cancellationToken = default)
    {
        var template = await ReadTemplateAsync(EmailTemplateNames.PasswordReset, cancellationToken);
        return template
            .Replace(EmailTemplatePlaceholders.FullName, fullName)
            .Replace(EmailTemplatePlaceholders.ResetUrl, resetUrl)
            .Replace(EmailTemplatePlaceholders.Year, DateTime.UtcNow.Year.ToString());
    }

    public string RenderPasswordResetPlainText(string fullName, string resetUrl)
    {
        return $"""
            Merhaba {fullName},

            Tarifet hesabınız için şifre sıfırlama talebi aldık.

            Sıfırlama bağlantısı (1 saat geçerlidir):
            {resetUrl}

            Bu talebi siz yapmadıysanız bu emaili yok sayabilirsiniz.

            Tarifet
            tarif@studiowebia.com
            """;
    }

    private static string ApplyCommonPlaceholders(string template, string fullName, string url)
    {
        return template
            .Replace(EmailTemplatePlaceholders.FullName, fullName)
            .Replace(EmailTemplatePlaceholders.VerificationUrl, url)
            .Replace(EmailTemplatePlaceholders.Year, DateTime.UtcNow.Year.ToString());
    }

    private async Task<string> ReadTemplateAsync(string templateName, CancellationToken cancellationToken)
    {
        var templatePath = Path.Combine(_templateDirectory, templateName);

        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Email template not found: {templateName}", templatePath);
        }

        return await File.ReadAllTextAsync(templatePath, cancellationToken);
    }
}
