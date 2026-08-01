using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TarifDefterim.Application.Constants;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Application.Options;
using TarifDefterim.Application.Security;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Services;

public class AccountEmailService(
    IApplicationDbContext dbContext,
    IEmailService emailService,
    UserManager<ApplicationUser> userManager,
    IOptions<FrontendSettings> frontendOptions) : IAccountEmailService
{
    private readonly FrontendSettings _frontendSettings = frontendOptions.Value;

    public async Task SendVerificationEmailAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await FindUserByIdAsync(userId, cancellationToken);
        if (user is null || user.EmailConfirmed)
        {
            return;
        }

        if (IsRateLimited(user.LastVerificationEmailSentAt))
        {
            return;
        }

        var token = SecureTokenGenerator.GenerateBase64UrlToken();
        user.EmailVerificationTokenHash = TokenHasher.Hash(token);
        user.EmailVerificationExpireDate = DateTimeOffset.UtcNow.Add(EmailTokenConstants.VerificationTokenLifetime);
        user.LastVerificationEmailSentAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var verificationLink = BuildVerificationLink(user.Id, token);
        await emailService.SendVerificationEmailAsync(user, verificationLink, cancellationToken);
    }

    public async Task<bool> VerifyEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserByIdAsync(userId, cancellationToken);
        if (user is null || user.EmailConfirmed)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(user.EmailVerificationTokenHash)
            || user.EmailVerificationExpireDate is null
            || user.EmailVerificationExpireDate <= DateTimeOffset.UtcNow)
        {
            return false;
        }

        if (!TokenHasher.Verify(token, user.EmailVerificationTokenHash))
        {
            return false;
        }

        user.EmailConfirmed = true;
        ClearVerificationToken(user);

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null)
        {
            return;
        }

        if (IsRateLimited(user.LastPasswordResetEmailSentAt))
        {
            return;
        }

        var token = SecureTokenGenerator.GenerateBase64UrlToken();
        user.PasswordResetTokenHash = TokenHasher.Hash(token);
        user.PasswordResetExpireDate = DateTimeOffset.UtcNow.Add(EmailTokenConstants.PasswordResetTokenLifetime);
        user.LastPasswordResetEmailSentAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var resetLink = BuildPasswordResetLink(user.Id, token);
        await emailService.SendPasswordResetEmailAsync(user, resetLink, cancellationToken);
    }

    public async Task<(bool Success, string? ErrorMessage)> ResetPasswordAsync(
        string userId,
        string token,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return (false, "Invalid reset request.");
        }

        if (string.IsNullOrWhiteSpace(user.PasswordResetTokenHash)
            || user.PasswordResetExpireDate is null
            || user.PasswordResetExpireDate <= DateTimeOffset.UtcNow)
        {
            return (false, "Reset token has expired.");
        }

        if (!TokenHasher.Verify(token, user.PasswordResetTokenHash))
        {
            return (false, "Invalid reset request.");
        }

        foreach (var validator in userManager.PasswordValidators)
        {
            var validationResult = await validator.ValidateAsync(userManager, user, newPassword);
            if (!validationResult.Succeeded)
            {
                var errorMessage = validationResult.Errors.FirstOrDefault()?.Description ?? "Invalid password.";
                return (false, errorMessage);
            }
        }

        user.PasswordHash = userManager.PasswordHasher.HashPassword(user, newPassword);
        ClearPasswordResetToken(user);

        await dbContext.SaveChangesAsync(cancellationToken);
        return (true, null);
    }

    private async Task<ApplicationUser?> FindUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    private static bool IsRateLimited(DateTimeOffset? lastSentAt)
    {
        return lastSentAt.HasValue
            && DateTimeOffset.UtcNow - lastSentAt.Value < EmailTokenConstants.EmailRateLimitWindow;
    }

    private static void ClearVerificationToken(ApplicationUser user)
    {
        user.EmailVerificationTokenHash = null;
        user.EmailVerificationExpireDate = null;
    }

    private static void ClearPasswordResetToken(ApplicationUser user)
    {
        user.PasswordResetTokenHash = null;
        user.PasswordResetExpireDate = null;
    }

    private string BuildVerificationLink(string userId, string token)
    {
        var baseUrl = _frontendSettings.BaseUrl.TrimEnd('/');
        return $"{baseUrl}/confirm-email?userId={Uri.EscapeDataString(userId)}&token={Uri.EscapeDataString(token)}";
    }

    private string BuildPasswordResetLink(string userId, string token)
    {
        var baseUrl = _frontendSettings.BaseUrl.TrimEnd('/');
        return $"{baseUrl}/reset-password?userId={Uri.EscapeDataString(userId)}&token={Uri.EscapeDataString(token)}";
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }
}
