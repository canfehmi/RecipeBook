namespace TarifDefterim.Domain.Entities;

public class RecipeIngredient
{
    public Guid Id { get; set; }
    public Guid RecipeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public Recipe Recipe { get; set; } = null!;
}
