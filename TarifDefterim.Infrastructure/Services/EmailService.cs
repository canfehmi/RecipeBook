using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;
using TarifDefterim.Infrastructure.Options;


namespace TarifDefterim.Infrastructure.Services;

public class EmailService(
    IOptions<MailSettings> mailOptions,
    EmailTemplateRenderer templateRenderer,
    ILogger<EmailService> logger) : IEmailService
{
    private readonly MailSettings _mailSettings = mailOptions.Value;

    public async Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        using var client = new SmtpClient();

        try
        {
            var secureSocketOptions = _mailSettings.UseSSL
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await client.ConnectAsync(
                _mailSettings.Host,
                _mailSettings.Port,
                secureSocketOptions,
                cancellationToken);

            logger.LogInformation("SMTP bağlantısı kuruldu: {Host}:{Port}", _mailSettings.Host, _mailSettings.Port);

            if (!string.IsNullOrWhiteSpace(_mailSettings.Username))
            {
                await client.AuthenticateAsync(
                    _mailSettings.Username,
                    _mailSettings.Password,
                    cancellationToken);

                logger.LogInformation("SMTP kimlik doğrulama başarılı");
            }

            var message = BuildMessage(to, subject, htmlBody);
            await client.SendAsync(message, cancellationToken);

            logger.LogInformation("Email gönderildi: {To}, {Subject}", to, subject);

            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("SMTP bağlantısı kapatıldı");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Recipient}", to);
            throw;
        }
    }

    public async Task SendVerificationEmailAsync(
        ApplicationUser user,
        string verificationLink,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            throw new InvalidOperationException("User email is required to send verification email.");
        }

        var htmlBody = await templateRenderer.RenderVerificationEmailAsync(
            user.DisplayName,
            verificationLink,
            cancellationToken);

        await SendAsync(
            user.Email,
            "Verify your email address",
            htmlBody,
            cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(
        ApplicationUser user,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            throw new InvalidOperationException("User email is required to send password reset email.");
        }

        var htmlBody = await templateRenderer.RenderPasswordResetEmailAsync(
            user.DisplayName,
            resetLink,
            cancellationToken);

        await SendAsync(
            user.Email,
            "Reset your password",
            htmlBody,
            cancellationToken);
    }

    private MimeMessage BuildMessage(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_mailSettings.DisplayName, _mailSettings.From));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();
        return message;
    }
}
