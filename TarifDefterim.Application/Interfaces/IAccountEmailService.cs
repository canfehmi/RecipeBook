namespace TarifDefterim.Application.Interfaces;

public interface IAccountEmailService
{
    Task SendVerificationEmailAsync(string userId, CancellationToken cancellationToken = default);

    Task<bool> VerifyEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<(bool Success, string? ErrorMessage)> ResetPasswordAsync(
        string userId,
        string token,
        string newPassword,
        CancellationToken cancellationToken = default);
}
