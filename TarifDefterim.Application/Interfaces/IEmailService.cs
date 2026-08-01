using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Interfaces;

public interface IEmailService
{
    Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default);

    Task SendVerificationEmailAsync(
        ApplicationUser user,
        string verificationLink,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetEmailAsync(
        ApplicationUser user,
        string resetLink,
        CancellationToken cancellationToken = default);
}
