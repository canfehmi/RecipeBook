using TarifDefterim.Domain.Enums;

namespace TarifDefterim.Domain.Entities;

public class Recipe
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int PrepTimeMinutes { get; set; }
    public int CookTimeMinutes { get; set; }
    public string Steps { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int Servings { get; set; }
    public Guid CategoryId { get; set; }
    public RecipeScope Scope { get; set; }
    public Guid? FamilyId { get; set; }
    public Guid? SourceGlobalRecipeId { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public RecipeStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public Category Category { get; set; } = null!;
    public Family? Family { get; set; }
    public Recipe? SourceGlobalRecipe { get; set; }
    public ICollection<Recipe> DerivedRecipes { get; set; } = [];
    public ApplicationUser CreatedByUser { get; set; } = null!;
    public ICollection<RecipeIngredient> Ingredients { get; set; } = [];
}
