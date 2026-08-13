using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Utils;
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
        await SendAsync(to, subject, htmlBody, plainTextBody: null, cancellationToken);
    }

    private async Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        string? plainTextBody,
        CancellationToken cancellationToken)
    {
        using var client = new SmtpClient();

        try
        {
            var secureSocketOptions = ResolveSecureSocketOptions(_mailSettings);

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

            var message = BuildMessage(to, subject, htmlBody, plainTextBody);
            await client.SendAsync(message, cancellationToken);

            logger.LogInformation(
                "Email gönderildi: {To}, {Subject}, MessageId: {MessageId}, From: {From}",
                to,
                subject,
                message.MessageId,
                _mailSettings.From);

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

        var plainTextBody = templateRenderer.RenderVerificationPlainText(
            user.DisplayName,
            verificationLink);

        await SendAsync(
            user.Email,
            "Ata Tarifi - Email Adresinizi Doğrulayın",
            htmlBody,
            plainTextBody,
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

        var plainTextBody = templateRenderer.RenderPasswordResetPlainText(
            user.DisplayName,
            resetLink);

        await SendAsync(
            user.Email,
            "Ata Tarifi - Şifre Sıfırlama",
            htmlBody,
            plainTextBody,
            cancellationToken);
    }

    private static SecureSocketOptions ResolveSecureSocketOptions(MailSettings settings)
    {
        return settings.Port switch
        {
            465 => SecureSocketOptions.SslOnConnect,
            587 => settings.UseSSL
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.StartTlsWhenAvailable,
            _ => settings.UseSSL
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTlsWhenAvailable
        };
    }

    private MimeMessage BuildMessage(string to, string subject, string htmlBody, string? plainTextBody)
    {
        var message = new MimeMessage();
        message.MessageId = MimeUtils.GenerateMessageId(_mailSettings.From.Split('@').LastOrDefault() ?? "studiowebia.com");
        message.From.Add(new MailboxAddress(_mailSettings.DisplayName, _mailSettings.From));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var replyTo = string.IsNullOrWhiteSpace(_mailSettings.ReplyTo)
            ? _mailSettings.From
            : _mailSettings.ReplyTo;
        message.ReplyTo.Add(MailboxAddress.Parse(replyTo));

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody,
            TextBody = plainTextBody ?? StripHtml(htmlBody)
        };

        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }

    private static string StripHtml(string html)
    {
        return System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Trim();
    }
}
