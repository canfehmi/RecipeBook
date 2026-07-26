using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
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
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Recipes
            .Where(r => r.Id == id && r.Scope == RecipeScope.Global)
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

        var status = membership.Role == FamilyMemberRole.HeadOfHousehold
            ? RecipeStatus.Approved
            : RecipeStatus.PendingApproval;

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
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

    private static readonly System.Linq.Expressions.Expression<
        Func<Recipe, RecipeDto>> MapRecipe = r => new RecipeDto(
        r.Id,
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
            .ToList());
}
