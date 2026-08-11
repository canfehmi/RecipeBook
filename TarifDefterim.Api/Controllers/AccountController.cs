using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    public record UpdateDisplayNameRequest(string DisplayName);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPut("display-name")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDisplayName([FromBody] UpdateDisplayNameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            return BadRequest(new { message = "Görünen ad gerekli." });
        }

        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return NotFound();
        }

        user.DisplayName = request.DisplayName.Trim();
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = result.Errors.FirstOrDefault()?.Description ?? "Görünen ad güncellenemedi."
            });
        }

        return Ok(new { displayName = user.DisplayName });
    }

    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Yeni şifre gerekli." });
        }

        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return NotFound();
        }

        IdentityResult result;

        if (!await userManager.HasPasswordAsync(user))
        {
            result = await userManager.AddPasswordAsync(user, request.NewPassword);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new { message = "Mevcut şifre gerekli." });
            }

            result = await userManager.ChangePasswordAsync(
                user,
                request.CurrentPassword,
                request.NewPassword);
        }

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = result.Errors.FirstOrDefault()?.Description ?? "Şifre güncellenemedi."
            });
        }

        return Ok(new { message = "Şifre başarıyla güncellendi." });
    }

    private async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return null;
        }

        return await userManager.FindByIdAsync(userId);
    }
}
