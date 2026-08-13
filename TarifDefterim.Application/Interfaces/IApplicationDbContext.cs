using TarifDefterim.Domain.Entities;
using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Application.Interfaces;

public interface IApplicationDbContext
{
    IQueryable<ApplicationUser> Users { get; }
    IQueryable<Family> Families { get; }
    IQueryable<FamilyMember> FamilyMembers { get; }
    IQueryable<FamilyJoinRequest> FamilyJoinRequests { get; }
    IQueryable<Category> Categories { get; }
    IQueryable<Recipe> Recipes { get; }
    IQueryable<RecipeIngredient> RecipeIngredients { get; }
    IQueryable<PageContent> PageContents { get; }

    void Add<TEntity>(TEntity entity) where TEntity : class;
    void Remove<TEntity>(TEntity entity) where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
