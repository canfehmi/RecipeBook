namespace TarifDefterim.Infrastructure.Options;

public class MailSettings
{
    public const string SectionName = "MailSettings";

    public string DisplayName { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string? ReplyTo { get; set; }
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSSL { get; set; }
}
