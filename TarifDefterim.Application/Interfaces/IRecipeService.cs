using TarifDefterim.Application.DTOs;

namespace TarifDefterim.Application.Interfaces;

public interface IRecipeService
{
    Task<IReadOnlyList<RecipeDto>> GetGlobalRecipesAsync(
        string? search,
        Guid? categoryId,
        CancellationToken cancellationToken = default);

    Task<RecipeDto?> GetGlobalRecipeByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecipeDto>> GetMyRecipesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<RecipeDto> CreateRecipeAsync(
        string userId,
        CreateRecipeDto dto,
        CancellationToken cancellationToken = default);

    Task<RecipeDto> UpdateRecipeAsync(
        Guid recipeId,
        string userId,
        UpdateRecipeDto dto,
        CancellationToken cancellationToken = default);

    Task DeleteRecipeAsync(
        Guid recipeId,
        string userId,
        CancellationToken cancellationToken = default);

    Task ApproveRecipeAsync(
        Guid recipeId,
        string approverUserId,
        CancellationToken cancellationToken = default);

    Task RejectRecipeAsync(
        Guid recipeId,
        string approverUserId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecipeDto>> GetPendingApprovalRecipesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<RecipeDto> CreateGlobalRecipeAsync(
        string adminUserId,
        CreateRecipeDto dto,
        CancellationToken cancellationToken = default);

    Task<RecipeDto> UpdateGlobalRecipeAsync(
        Guid recipeId,
        UpdateRecipeDto dto,
        CancellationToken cancellationToken = default);

    Task DeleteGlobalRecipeAsync(
        Guid recipeId,
        CancellationToken cancellationToken = default);
}
