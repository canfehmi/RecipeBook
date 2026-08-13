using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Application.Options;

namespace TarifDefterim.Api.Controllers;

[Route("auth/google")]
public class GoogleAuthController(
    IGoogleAuthService googleAuthService,
    IAuthExchangeStore exchangeStore,
    IOptions<FrontendSettings> frontendOptions,
    ILogger<GoogleAuthController> logger) : Controller
{
    [HttpPost("callback")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> Callback(
        [FromForm] string? credential,
        [FromForm(Name = "g_csrf_token")] string? gCsrfToken,
        CancellationToken cancellationToken)
    {
        if (!ValidateGoogleCsrf(gCsrfToken))
        {
            logger.LogWarning("Google callback CSRF doğrulaması başarısız.");
            return RedirectToFrontend(error: "csrf");
        }

        if (string.IsNullOrWhiteSpace(credential))
        {
            return RedirectToFrontend(error: "missing_credential");
        }

        var authResult = await googleAuthService.AuthenticateAsync(credential, cancellationToken);
        if (!authResult.Succeeded || authResult.User is null)
        {
            logger.LogWarning("Google callback token doğrulaması başarısız: {Message}", authResult.ErrorMessage);
            return RedirectToFrontend(error: "invalid_token");
        }

        var exchangeCode = exchangeStore.CreateCode(authResult.User.Id);
        return RedirectToFrontend(code: exchangeCode);
    }

    private bool ValidateGoogleCsrf(string? gCsrfToken)
    {
        var cookieToken = Request.Cookies["g_csrf_token"];

        if (!string.IsNullOrEmpty(cookieToken))
        {
            return !string.IsNullOrEmpty(gCsrfToken) && cookieToken == gCsrfToken;
        }

        // login_uri farklı bir origin'de (ör. api.atatarifi.com) olduğunda g_csrf_token
        // cookie'si frontend origin'inde kalır; JWT doğrulaması birincil güvenlik katmanıdır.
        return true;
    }

    private IActionResult RedirectToFrontend(string? code = null, string? error = null)
    {
        var frontendBaseUrl = frontendOptions.Value.BaseUrl.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is not configured.");
        }

        var query = code is not null
            ? $"code={Uri.EscapeDataString(code)}"
            : $"error={Uri.EscapeDataString(error ?? "unknown")}";

        return Redirect($"{frontendBaseUrl}/auth/callback?{query}");
    }
}
