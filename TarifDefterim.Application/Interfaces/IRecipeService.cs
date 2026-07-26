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

    Task ApproveRecipeAsync(
        Guid recipeId,
        string approverUserId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecipeDto>> GetPendingApprovalRecipesAsync(
        string userId,
        CancellationToken cancellationToken = default);
}
