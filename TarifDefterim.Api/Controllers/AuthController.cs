using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IFamilyService familyService,
    IAccountEmailService accountEmailService,
    IServiceScopeFactory serviceScopeFactory,
    IConfiguration configuration) : ControllerBase
{
    public record RegisterRequest(string Email, string Password, string DisplayName);
    public record RegisterResponse(string UserId, string Email, string DisplayName);
    public record LoginRequest(string Email, string Password);
    public record ExternalLoginRequest(string IdToken);
    public record ResendVerificationRequest(string Email);
    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string UserId, string Token, string NewPassword);

    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.Password)
            || string.IsNullOrWhiteSpace(request.DisplayName))
        {
            return BadRequest(new { message = "All fields are required." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim()
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(e => e.Description)
            });
        }

        await familyService.CreateFamilyForNewUserAsync(user.Id, cancellationToken);

        var userId = user.Id;
        _ = Task.Run(async () =>
        {
            using var scope = serviceScopeFactory.CreateScope();
            var scopedEmailService = scope.ServiceProvider.GetRequiredService<IAccountEmailService>();
            try
            {
                await scopedEmailService.SendVerificationEmailAsync(userId, CancellationToken.None);
            }
            catch (Exception ex)
            {
                var scopedLogger = scope.ServiceProvider.GetRequiredService<ILogger<AuthController>>();
                scopedLogger.LogError(ex, "Verification email could not be sent for user {UserId}", userId);
            }
        });

        return CreatedAtAction(
            nameof(Register),
            new RegisterResponse(user.Id, user.Email!, user.DisplayName));
    }

    [HttpGet("verify-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail(
        [FromQuery] string userId,
        [FromQuery] string token,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { message = "Invalid verification request." });
        }

        var verified = await accountEmailService.VerifyEmailAsync(userId, token, cancellationToken);
        if (!verified)
        {
            return BadRequest(new { message = "Invalid or expired verification token." });
        }

        return Ok(new { message = "Email verified successfully." });
    }

    [HttpPost("resend-verification")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ResendVerification(
        [FromBody] ResendVerificationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Ok();
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || user.EmailConfirmed)
        {
            return Ok();
        }

        var userId = user.Id;
        _ = Task.Run(async () =>
        {
            using var scope = serviceScopeFactory.CreateScope();
            var scopedEmailService = scope.ServiceProvider.GetRequiredService<IAccountEmailService>();
            try
            {
                await scopedEmailService.SendVerificationEmailAsync(userId, CancellationToken.None);
            }
            catch (Exception ex)
            {
                var scopedLogger = scope.ServiceProvider.GetRequiredService<ILogger<AuthController>>();
                scopedLogger.LogError(ex, "Verification email could not be resent for user {UserId}", userId);
            }
        });

        return Ok();
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }

        var email = request.Email.Trim();
        _ = Task.Run(async () =>
        {
            using var scope = serviceScopeFactory.CreateScope();
            var scopedEmailService = scope.ServiceProvider.GetRequiredService<IAccountEmailService>();
            try
            {
                await scopedEmailService.SendPasswordResetEmailAsync(email, CancellationToken.None);
            }
            catch (Exception ex)
            {
                var scopedLogger = scope.ServiceProvider.GetRequiredService<ILogger<AuthController>>();
                scopedLogger.LogError(ex, "Password reset email could not be sent.");
            }
        });

        return Ok(new { message = "If the email exists, a password reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserId)
            || string.IsNullOrWhiteSpace(request.Token)
            || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Invalid reset request." });
        }

        var (success, errorMessage) = await accountEmailService.ResetPasswordAsync(
            request.UserId,
            request.Token,
            request.NewPassword,
            cancellationToken);

        if (!success)
        {
            return BadRequest(new { message = errorMessage });
        }

        return Ok(new { message = "Password reset successfully." });
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status423Locked)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            return BadRequest(new { code = "InvalidCredentials", message = "Email veya şifre hatalı." });
        }

        if (await userManager.IsLockedOutAsync(user))
        {
            return StatusCode(423, new { code = "LockedOut", message = "Hesabınız kilitli." });
        }

        if (!user.EmailConfirmed)
        {
            return StatusCode(403, new
            {
                code = "EmailNotConfirmed",
                email = user.Email,
                message = "Hesabınız henüz onaylanmadı."
            });
        }

        var checkResult = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);

        if (!checkResult.Succeeded)
        {
            return BadRequest(new { code = "InvalidCredentials", message = "Email veya şifre hatalı." });
        }

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        return SignIn(principal, IdentityConstants.BearerScheme);
    }

    [HttpPost("external/google")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleLogin(
        [FromBody] ExternalLoginRequest request,
        CancellationToken cancellationToken)
    {
        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { configuration["Authentication:Google:ClientId"]! }
                });
        }
        catch (InvalidJwtException)
        {
            return BadRequest(new { message = "Geçersiz Google token." });
        }

        var user = await userManager.FindByEmailAsync(payload.Email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = payload.Email,
                EmailConfirmed = true,
                DisplayName = payload.Name ?? payload.Email
            };

            var result = await userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            await userManager.AddLoginAsync(user, new UserLoginInfo("Google", payload.Subject, "Google"));
            await familyService.CreateFamilyForNewUserAsync(user.Id, cancellationToken);
        }

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        return SignIn(principal, IdentityConstants.BearerScheme);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userManager.FindByIdAsync(userId!);
        if (user is null)
        {
            return NotFound();
        }

        var roles = await userManager.GetRolesAsync(user);
        var hasPassword = await userManager.HasPasswordAsync(user);

        return Ok(new
        {
            userId,
            roles,
            displayName = user.DisplayName,
            hasPassword
        });
    }
}
