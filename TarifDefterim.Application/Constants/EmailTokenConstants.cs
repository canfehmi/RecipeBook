namespace TarifDefterim.Application.Constants;

public static class EmailTokenConstants
{
    public const int TokenByteLength = 64;
    public const int TokenHashHexLength = 64;

    public static readonly TimeSpan VerificationTokenLifetime = TimeSpan.FromHours(24);
    public static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromHours(1);
    public static readonly TimeSpan EmailRateLimitWindow = TimeSpan.FromMinutes(5);
}
