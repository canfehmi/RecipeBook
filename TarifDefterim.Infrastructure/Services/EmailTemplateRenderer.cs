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
        return template
            .Replace(EmailTemplatePlaceholders.FullName, fullName)
            .Replace(EmailTemplatePlaceholders.VerificationUrl, verificationUrl)
            .Replace(EmailTemplatePlaceholders.Year, DateTime.UtcNow.Year.ToString());
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
