using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.DTOs;

public record RecipeIngredientDto(
    Guid Id,
    string Name,
    decimal Amount,
    string Unit,
    int SortOrder);

public record CreateRecipeIngredientDto(
    string Name,
    decimal Amount,
    string Unit,
    int SortOrder);

public record RecipeDto(
    Guid Id,
    string Title,
    int PrepTimeMinutes,
    int CookTimeMinutes,
    string Steps,
    string? CoverImageUrl,
    int Servings,
    Guid CategoryId,
    string CategoryName,
    RecipeScope Scope,
    Guid? FamilyId,
    Guid? SourceGlobalRecipeId,
    RecipeStatus Status,
    DateTime CreatedAt,
    IReadOnlyList<RecipeIngredientDto> Ingredients);

public record CreateRecipeDto(
    string Title,
    int PrepTimeMinutes,
    int CookTimeMinutes,
    string Steps,
    string? CoverImageUrl,
    int Servings,
    Guid CategoryId,
    Guid? SourceGlobalRecipeId,
    IReadOnlyList<CreateRecipeIngredientDto> Ingredients);
