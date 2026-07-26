using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    IFamilyService familyService) : ControllerBase
{
    public record RegisterRequest(string Email, string Password, string DisplayName);
    public record RegisterResponse(string UserId, string Email, string DisplayName);

    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName
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

        return CreatedAtAction(
            nameof(Register),
            new RegisterResponse(user.Id, user.Email!, user.DisplayName));
    }
}
