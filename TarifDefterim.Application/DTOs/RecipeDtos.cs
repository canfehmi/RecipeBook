using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.DTOs;

public record RecipeIngredientDto(
    Guid Id,
    string Name,
    decimal? Amount,
    string Unit,
    int SortOrder);

public record CreateRecipeIngredientDto(
    string Name,
    decimal? Amount,
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
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    string CreatedByDisplayName);

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

public record UpdateRecipeDto(
    string Title,
    int PrepTimeMinutes,
    int CookTimeMinutes,
    string Steps,
    string? CoverImageUrl,
    int Servings,
    Guid CategoryId,
    IReadOnlyList<CreateRecipeIngredientDto> Ingredients);

public record BulkImportIngredientDto(
    string Name,
    decimal? Quantity,
    string? Unit);

public record BulkImportRecipeItemDto(
    string Title,
    string Category,
    int PrepMinutes,
    int CookMinutes,
    int Servings,
    IReadOnlyList<BulkImportIngredientDto> Ingredients,
    IReadOnlyList<string> Steps);

public record BulkImportCategoryNotFoundDto(string Title, string Category);

public record BulkImportValidationFailureDto(string Title, string Reason);

public record BulkImportRecipesResultDto(
    int TotalCount,
    int SuccessCount,
    IReadOnlyList<BulkImportCategoryNotFoundDto> SkippedCategoryNotFound,
    IReadOnlyList<string> SkippedDuplicateTitle,
    IReadOnlyList<BulkImportValidationFailureDto> FailedValidation);
