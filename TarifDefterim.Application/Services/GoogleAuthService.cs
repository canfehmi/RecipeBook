using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Services;

public class GoogleAuthService(
    UserManager<ApplicationUser> userManager,
    IFamilyService familyService,
    IConfiguration configuration) : IGoogleAuthService
{
    public async Task<GoogleAuthResult> AuthenticateAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            return GoogleAuthResult.Failed("Geçersiz Google token.");
        }

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { configuration["Authentication:Google:ClientId"]! }
                });
        }
        catch (InvalidJwtException)
        {
            return GoogleAuthResult.Failed("Geçersiz Google token.");
        }

        var existingGoogleUser = await userManager.FindByLoginAsync("Google", payload.Subject);
        if (existingGoogleUser is not null)
        {
            return GoogleAuthResult.Success(existingGoogleUser);
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
                return GoogleAuthResult.Failed(
                    string.Join(' ', result.Errors.Select(error => error.Description)));
            }

            await userManager.AddLoginAsync(user, new UserLoginInfo("Google", payload.Subject, "Google"));
            await familyService.CreateFamilyForNewUserAsync(user.Id, cancellationToken);
            return GoogleAuthResult.Success(user);
        }

        var linkedLogins = await userManager.GetLoginsAsync(user);
        var googleLogin = linkedLogins.FirstOrDefault(login => login.LoginProvider == "Google");
        if (googleLogin is not null && googleLogin.ProviderKey != payload.Subject)
        {
            return GoogleAuthResult.Failed("Bu email adresi farklı bir Google hesabına bağlı.");
        }

        if (googleLogin is null)
        {
            var linkResult = await userManager.AddLoginAsync(
                user,
                new UserLoginInfo("Google", payload.Subject, "Google"));
            if (!linkResult.Succeeded)
            {
                return GoogleAuthResult.Failed(
                    string.Join(' ', linkResult.Errors.Select(error => error.Description)));
            }
        }

        return GoogleAuthResult.Success(user);
    }
}
