using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/recipes")]
[Authorize]
public class RecipesController(IRecipeService recipeService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("global")]
    [ProducesResponseType(typeof(IReadOnlyList<RecipeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGlobalRecipes(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        CancellationToken cancellationToken)
    {
        var recipes = await recipeService.GetGlobalRecipesAsync(search, categoryId, cancellationToken);
        return Ok(recipes);
    }

    [AllowAnonymous]
    [HttpGet("global/{id:guid}")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGlobalRecipeById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var recipe = await recipeService.GetGlobalRecipeByIdAsync(id, cancellationToken);
        return recipe is null ? NotFound() : Ok(recipe);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(IReadOnlyList<RecipeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMyRecipes(CancellationToken cancellationToken)
    {
        try
        {
            var recipes = await recipeService.GetMyRecipesAsync(GetUserId(), cancellationToken);
            return Ok(recipes);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRecipe(
        [FromBody] CreateRecipeDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var recipe = await recipeService.CreateRecipeAsync(GetUserId(), dto, cancellationToken);
            return CreatedAtAction(nameof(GetMyRecipes), new { id = recipe.Id }, recipe);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateRecipe(
        Guid id,
        [FromBody] UpdateRecipeDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var recipe = await recipeService.UpdateRecipeAsync(id, GetUserId(), dto, cancellationToken);
            return Ok(recipe);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteRecipe(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await recipeService.DeleteRecipeAsync(id, GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("pending-approval")]
    [ProducesResponseType(typeof(IReadOnlyList<RecipeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPendingApprovalRecipes(CancellationToken cancellationToken)
    {
        try
        {
            var recipes = await recipeService.GetPendingApprovalRecipesAsync(GetUserId(), cancellationToken);
            return Ok(recipes);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveRecipe(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await recipeService.ApproveRecipeAsync(id, GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectRecipe(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await recipeService.RejectRecipeAsync(id, GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("Kullanıcı kimliği bulunamadı.");
}
