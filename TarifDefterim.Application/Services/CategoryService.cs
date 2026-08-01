using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Services;

public class CategoryService(IApplicationDbContext dbContext) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryDto> CreateCategoryAsync(string name, CancellationToken cancellationToken = default)
    {
        var trimmedName = name.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new FamilyBusinessException("Kategori adı gerekli.");
        }

        var normalizedName = trimmedName.ToLowerInvariant();

        var exists = await dbContext.Categories
            .AnyAsync(c => c.Name.ToLower() == normalizedName, cancellationToken);

        if (exists)
        {
            throw new FamilyBusinessException("Bu isimde bir kategori zaten var.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = trimmedName
        };

        dbContext.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CategoryDto(category.Id, category.Name);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(
        Guid id,
        string name,
        CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        var trimmedName = name.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            throw new FamilyBusinessException("Kategori adı gerekli.");
        }

        var normalizedName = trimmedName.ToLowerInvariant();

        var duplicateExists = await dbContext.Categories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == normalizedName, cancellationToken);

        if (duplicateExists)
        {
            throw new FamilyBusinessException("Bu isimde bir kategori zaten var.");
        }

        category.Name = trimmedName;
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CategoryDto(category.Id, category.Name);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
        {
            throw new FamilyBusinessException("Kategori bulunamadı.");
        }

        var hasRecipes = await dbContext.Recipes
            .AnyAsync(r => r.CategoryId == id, cancellationToken);

        if (hasRecipes)
        {
            throw new FamilyBusinessException("Bu kategoriye ait tarifler var, önce onları taşıyın/silin");
        }

        dbContext.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
