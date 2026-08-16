using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Helpers;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;
using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.Services;

public class RecipeService(IApplicationDbContext dbContext) : IRecipeService
{
    public async Task<IReadOnlyList<RecipeDto>> GetGlobalRecipesAsync(
        string? search,
        Guid? categoryId,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Recipes
            .Where(r => r.Scope == RecipeScope.Global);

        if (categoryId.HasValue)
        {
            query = query.Where(r => r.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(normalizedSearch));
        }

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(MapRecipe)
            .ToListAsync(cancellationToken);
    }

    public async Task<RecipeDto?> GetGlobalRecipeByIdAsync(
        string idOrSlug,
        CancellationToken cancellationToken = default)
    {
        if (Guid.TryParse(idOrSlug, out var id))
        {
            return await dbContext.Recipes
                .Where(r => r.Id == id && r.Scope == RecipeScope.Global)
                .Select(MapRecipe)
                .FirstOrDefaultAsync(cancellationToken);
        }

        var normalizedSlug = idOrSlug.Trim().ToLowerInvariant();
        return await dbContext.Recipes
            .Where(r => r.Slug == normalizedSlug && r.Scope == RecipeScope.Global)
            .Select(MapRecipe)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RecipeDto>> GetMyRecipesAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null)
        {
            throw new FamilyBusinessException("Aile üyeliği bulunamadı.");
        }

        return await dbContext.Recipes
            .Where(r => r.FamilyId == membership.FamilyId && r.Scope == RecipeScope.Family)
            .OrderByDescending(r => r.CreatedAt)
            .Select(MapRecipe)
            .ToListAsync(cancellationToken);
    }

    public async Task<RecipeDto> CreateRecipeAsync(
        string userId,
        CreateRecipeDto dto,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null)
        {
            throw new FamilyBusinessException("Aile üyeliği bulunamadı.");
        }

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        if (dto.SourceGlobalRecipeId.HasValue)
        {
            var alreadyInFamilyBook = await dbContext.Recipes
                .AnyAsync(r =>
                    r.SourceGlobalRecipeId == dto.SourceGlobalRecipeId &&
                    r.FamilyId == membership.FamilyId,
                    cancellationToken);

            if (alreadyInFamilyBook)
            {
                throw new FamilyBusinessException("Bu tarif zaten defterinizde.");
            }
        }

        var status = membership.Role == FamilyMemberRole.HeadOfHousehold
            ? RecipeStatus.Approved
            : RecipeStatus.PendingApproval;

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Slug = await GenerateUniqueSlugAsync(dto.Title.Trim(), cancellationToken),
            Title = dto.Title.Trim(),
            PrepTimeMinutes = dto.PrepTimeMinutes,
            CookTimeMinutes = dto.CookTimeMinutes,
            Steps = dto.Steps.Trim(),
            CoverImageUrl = dto.CoverImageUrl,
            Servings = dto.Servings,
            CategoryId = dto.CategoryId,
            Scope = RecipeScope.Family,
            FamilyId = membership.FamilyId,
            SourceGlobalRecipeId = dto.SourceGlobalRecipeId,
            CreatedByUserId = userId,
            Status = status,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Add(recipe);

        foreach (var ingredient in dto.Ingredients.OrderBy(i => i.SortOrder))
        {
            dbContext.Add(new RecipeIngredient
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                Name = ingredient.Name.Trim(),
                Amount = ingredient.Amount,
                Unit = ingredient.Unit.Trim(),
                SortOrder = ingredient.SortOrder
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.Recipes
            .Where(r => r.Id == recipe.Id)
            .Select(MapRecipe)
            .FirstAsync(cancellationToken);
    }

    public async Task<RecipeDto> UpdateRecipeAsync(
        Guid recipeId,
        string userId,
        UpdateRecipeDto dto,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Scope != RecipeScope.Family)
        {
            throw new FamilyBusinessException("Global tarifler düzenlenemez");
        }

        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == userId &&
                m.FamilyId == recipe.FamilyId,
                cancellationToken);

        if (membership is null || membership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu tarifi düzenleme yetkiniz yok.");
        }

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        recipe.Title = dto.Title.Trim();
        recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
        recipe.CookTimeMinutes = dto.CookTimeMinutes;
        recipe.Steps = dto.Steps.Trim();
        recipe.CoverImageUrl = dto.CoverImageUrl;
        recipe.Servings = dto.Servings;
        recipe.CategoryId = dto.CategoryId;

        foreach (var ingredient in recipe.Ingredients.ToList())
        {
            dbContext.Remove(ingredient);
        }

        foreach (var ingredient in dto.Ingredients.OrderBy(i => i.SortOrder))
        {
            dbContext.Add(new RecipeIngredient
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                Name = ingredient.Name.Trim(),
                Amount = ingredient.Amount,
                Unit = ingredient.Unit.Trim(),
                SortOrder = ingredient.SortOrder
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.Recipes
            .Where(r => r.Id == recipe.Id)
            .Select(MapRecipe)
            .FirstAsync(cancellationToken);
    }

    public async Task DeleteRecipeAsync(
        Guid recipeId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Scope != RecipeScope.Family)
        {
            throw new FamilyBusinessException("Global tarifler silinemez");
        }

        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == userId &&
                m.FamilyId == recipe.FamilyId,
                cancellationToken);

        if (membership is null || membership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu tarifi silme yetkiniz yok.");
        }

        dbContext.Remove(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ApproveRecipeAsync(
        Guid recipeId,
        string approverUserId,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Status != RecipeStatus.PendingApproval)
        {
            throw new FamilyBusinessException("Bu tarif onay bekliyor durumunda değil.");
        }

        var approverMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == approverUserId &&
                m.FamilyId == recipe.FamilyId,
                cancellationToken);

        if (approverMembership is null || approverMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu tarifi onaylama yetkiniz yok.");
        }

        recipe.Status = RecipeStatus.Approved;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RejectRecipeAsync(
        Guid recipeId,
        string approverUserId,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Status != RecipeStatus.PendingApproval)
        {
            throw new FamilyBusinessException("Bu tarif onay bekliyor durumunda değil.");
        }

        var approverMembership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == approverUserId &&
                m.FamilyId == recipe.FamilyId,
                cancellationToken);

        if (approverMembership is null || approverMembership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Bu tarifi reddetme yetkiniz yok.");
        }

        dbContext.Remove(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RecipeDto>> GetPendingApprovalRecipesAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var membership = await dbContext.FamilyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

        if (membership is null || membership.Role != FamilyMemberRole.HeadOfHousehold)
        {
            throw new FamilyBusinessException("Onay bekleyen tarifleri görüntüleme yetkiniz yok.");
        }

        return await dbContext.Recipes
            .Where(r =>
                r.FamilyId == membership.FamilyId &&
                r.Status == RecipeStatus.PendingApproval)
            .OrderBy(r => r.CreatedAt)
            .Select(MapRecipe)
            .ToListAsync(cancellationToken);
    }

    public async Task<RecipeDto> CreateGlobalRecipeAsync(
        string adminUserId,
        CreateRecipeDto dto,
        CancellationToken cancellationToken = default)
    {
        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Slug = await GenerateUniqueSlugAsync(dto.Title.Trim(), cancellationToken),
            Title = dto.Title.Trim(),
            PrepTimeMinutes = dto.PrepTimeMinutes,
            CookTimeMinutes = dto.CookTimeMinutes,
            Steps = dto.Steps.Trim(),
            CoverImageUrl = dto.CoverImageUrl,
            Servings = dto.Servings,
            CategoryId = dto.CategoryId,
            Scope = RecipeScope.Global,
            FamilyId = null,
            SourceGlobalRecipeId = null,
            CreatedByUserId = adminUserId,
            Status = RecipeStatus.Approved,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Add(recipe);

        foreach (var ingredient in dto.Ingredients.OrderBy(i => i.SortOrder))
        {
            dbContext.Add(new RecipeIngredient
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                Name = ingredient.Name.Trim(),
                Amount = ingredient.Amount,
                Unit = ingredient.Unit.Trim(),
                SortOrder = ingredient.SortOrder
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.Recipes
            .Where(r => r.Id == recipe.Id)
            .Select(MapRecipe)
            .FirstAsync(cancellationToken);
    }

    public async Task<RecipeDto> UpdateGlobalRecipeAsync(
        Guid recipeId,
        UpdateRecipeDto dto,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Scope != RecipeScope.Global)
        {
            throw new FamilyBusinessException("Bu tarif global değil.");
        }

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        recipe.Title = dto.Title.Trim();
        recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
        recipe.CookTimeMinutes = dto.CookTimeMinutes;
        recipe.Steps = dto.Steps.Trim();
        recipe.CoverImageUrl = dto.CoverImageUrl;
        recipe.Servings = dto.Servings;
        recipe.CategoryId = dto.CategoryId;

        foreach (var ingredient in recipe.Ingredients.ToList())
        {
            dbContext.Remove(ingredient);
        }

        foreach (var ingredient in dto.Ingredients.OrderBy(i => i.SortOrder))
        {
            dbContext.Add(new RecipeIngredient
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                Name = ingredient.Name.Trim(),
                Amount = ingredient.Amount,
                Unit = ingredient.Unit.Trim(),
                SortOrder = ingredient.SortOrder
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.Recipes
            .Where(r => r.Id == recipe.Id)
            .Select(MapRecipe)
            .FirstAsync(cancellationToken);
    }

    public async Task DeleteGlobalRecipeAsync(
        Guid recipeId,
        CancellationToken cancellationToken = default)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

        if (recipe is null)
        {
            throw new FamilyBusinessException("Tarif bulunamadı.");
        }

        if (recipe.Scope != RecipeScope.Global)
        {
            throw new FamilyBusinessException("Bu tarif global değil.");
        }

        dbContext.Remove(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<BulkImportRecipesResultDto> BulkImportGlobalRecipesAsync(
        string adminUserId,
        IReadOnlyList<BulkImportRecipeItemDto> items,
        CancellationToken cancellationToken = default)
    {
        var categories = await dbContext.Categories.ToListAsync(cancellationToken);
        var existingTitles = await dbContext.Recipes
            .Where(r => r.Scope == RecipeScope.Global)
            .Select(r => r.Title.ToLower())
            .ToListAsync(cancellationToken);
        var existingTitleSet = new HashSet<string>(existingTitles);

        var skippedCategoryNotFound = new List<BulkImportCategoryNotFoundDto>();
        var skippedDuplicateTitle = new List<string>();
        var failedValidation = new List<BulkImportValidationFailureDto>();
        var successCount = 0;

        foreach (var item in items)
        {
            var displayTitle = item.Title?.Trim() ?? string.Empty;
            var validationError = ValidateBulkImportItem(item);

            if (validationError is not null)
            {
                failedValidation.Add(new BulkImportValidationFailureDto(displayTitle, validationError));
                continue;
            }

            var category = categories.FirstOrDefault(c =>
                string.Equals(c.Name, item.Category.Trim(), StringComparison.OrdinalIgnoreCase));

            if (category is null)
            {
                skippedCategoryNotFound.Add(new BulkImportCategoryNotFoundDto(
                    displayTitle,
                    item.Category.Trim()));
                continue;
            }

            var normalizedTitle = displayTitle.ToLower();
            if (existingTitleSet.Contains(normalizedTitle))
            {
                skippedDuplicateTitle.Add(displayTitle);
                continue;
            }

            try
            {
                var createDto = MapBulkImportItemToCreateRecipeDto(item, category.Id);
                await CreateGlobalRecipeAsync(adminUserId, createDto, cancellationToken);
                existingTitleSet.Add(normalizedTitle);
                successCount++;
            }
            catch (FamilyBusinessException ex)
            {
                failedValidation.Add(new BulkImportValidationFailureDto(displayTitle, ex.Message));
            }
        }

        return new BulkImportRecipesResultDto(
            items.Count,
            successCount,
            skippedCategoryNotFound,
            skippedDuplicateTitle,
            failedValidation);
    }

    private static string? ValidateBulkImportItem(BulkImportRecipeItemDto item)
    {
        if (string.IsNullOrWhiteSpace(item.Title))
        {
            return "Tarif başlığı zorunludur.";
        }

        if (string.IsNullOrWhiteSpace(item.Category))
        {
            return "Kategori zorunludur.";
        }

        if (item.PrepMinutes < 0)
        {
            return "Hazırlık süresi 0 veya daha büyük olmalıdır.";
        }

        if (item.CookMinutes < 0)
        {
            return "Pişirme süresi 0 veya daha büyük olmalıdır.";
        }

        if (item.Servings < 1)
        {
            return "Porsiyon sayısı en az 1 olmalıdır.";
        }

        var validIngredients = (item.Ingredients ?? Array.Empty<BulkImportIngredientDto>())
            .Where(i => !string.IsNullOrWhiteSpace(i.Name))
            .ToList();

        if (validIngredients.Count == 0)
        {
            return "En az bir malzeme girilmelidir.";
        }

        var validSteps = (item.Steps ?? Array.Empty<string>())
            .Select(step => step.Trim())
            .Where(step => step.Length > 0)
            .ToList();

        if (validSteps.Count == 0)
        {
            return "En az bir hazırlık adımı girilmelidir.";
        }

        return null;
    }

    private static CreateRecipeDto MapBulkImportItemToCreateRecipeDto(
        BulkImportRecipeItemDto item,
        Guid categoryId)
    {
        var ingredients = (item.Ingredients ?? Array.Empty<BulkImportIngredientDto>())
            .Where(i => !string.IsNullOrWhiteSpace(i.Name))
            .Select((ingredient, index) => new CreateRecipeIngredientDto(
                ingredient.Name.Trim(),
                ingredient.Quantity,
                ingredient.Unit?.Trim() ?? string.Empty,
                index))
            .ToList();

        var steps = string.Join(
            '\n',
            (item.Steps ?? Array.Empty<string>())
                .Select(step => step.Trim())
                .Where(step => step.Length > 0));

        return new CreateRecipeDto(
            item.Title.Trim(),
            item.PrepMinutes,
            item.CookMinutes,
            steps,
            CoverImageUrl: null,
            item.Servings,
            categoryId,
            SourceGlobalRecipeId: null,
            ingredients);
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string title,
        CancellationToken cancellationToken)
    {
        var baseSlug = RecipeSlugHelper.GenerateBaseSlug(title);
        var slug = baseSlug;
        var counter = 2;

        while (await dbContext.Recipes.AnyAsync(r => r.Slug == slug, cancellationToken))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private static readonly System.Linq.Expressions.Expression<
        Func<Recipe, RecipeDto>> MapRecipe = r => new RecipeDto(
        r.Id,
        r.Slug,
        r.Title,
        r.PrepTimeMinutes,
        r.CookTimeMinutes,
        r.Steps,
        r.CoverImageUrl,
        r.Servings,
        r.CategoryId,
        r.Category.Name,
        r.Scope,
        r.FamilyId,
        r.SourceGlobalRecipeId,
        r.Status,
        r.CreatedAt,
        r.Ingredients
            .OrderBy(i => i.SortOrder)
            .Select(i => new RecipeIngredientDto(
                i.Id,
                i.Name,
                i.Amount,
                i.Unit,
                i.SortOrder))
            .ToList(),
        r.CreatedByUser.DisplayName);
}
