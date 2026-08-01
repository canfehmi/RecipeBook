using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(
    IRecipeService recipeService,
    ICategoryService categoryService,
    IAdminService adminService,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    public record UpdateCategoryRequest(string Name);

    [HttpPost("recipes")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateGlobalRecipe(
        [FromBody] CreateRecipeDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var recipe = await recipeService.CreateGlobalRecipeAsync(
                GetUserId(),
                dto,
                cancellationToken);
            return CreatedAtAction(nameof(CreateGlobalRecipe), new { id = recipe.Id }, recipe);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("recipes/{id:guid}")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateGlobalRecipe(
        Guid id,
        [FromBody] UpdateRecipeDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var recipe = await recipeService.UpdateGlobalRecipeAsync(id, dto, cancellationToken);
            return Ok(recipe);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("recipes/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteGlobalRecipe(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await recipeService.DeleteGlobalRecipeAsync(id, cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("categories/{id:guid}")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateCategory(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var category = await categoryService.UpdateCategoryAsync(id, request.Name, cancellationToken);
            return Ok(category);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("categories/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteCategory(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await categoryService.DeleteCategoryAsync(id, cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("families")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminFamilyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllFamilies(CancellationToken cancellationToken)
    {
        var families = await adminService.GetAllFamiliesAsync(cancellationToken);
        return Ok(families);
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await adminService.GetAllUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpPost("users/{userId}/lock")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LockUser(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        await userManager.SetLockoutEnabledAsync(user, true);
        await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        return NoContent();
    }

    [HttpPost("users/{userId}/unlock")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnlockUser(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        await userManager.SetLockoutEndDateAsync(user, null);
        return NoContent();
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("Kullanıcı kimliği bulunamadı.");
}
