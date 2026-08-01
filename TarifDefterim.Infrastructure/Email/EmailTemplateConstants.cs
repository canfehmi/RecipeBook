namespace TarifDefterim.Infrastructure.Email;

public static class EmailTemplateNames
{
    public const string Verification = "Verification.html";
    public const string PasswordReset = "PasswordReset.html";
}

public static class EmailTemplatePlaceholders
{
    public const string FullName = "{{FullName}}";
    public const string VerificationUrl = "{{VerificationUrl}}";
    public const string ResetUrl = "{{ResetUrl}}";
    public const string Year = "{{Year}}";
}
