using Microsoft.EntityFrameworkCore.Migrations;
using TarifDefterim.Infrastructure.Data;

#nullable disable

namespace TarifDefterim.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class AddRecipeSlug : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (
                SELECT 1
                FROM sys.columns
                WHERE object_id = OBJECT_ID(N'[Recipes]') AND name = N'Slug')
            BEGIN
                ALTER TABLE [Recipes] ADD [Slug] nvarchar(300) NULL;
            END
            """);

        migrationBuilder.Sql(RecipeSlugBackfill.CreateFunctionSql);
        migrationBuilder.Sql(RecipeSlugBackfill.UpdateSlugsSql);
        migrationBuilder.Sql(RecipeSlugBackfill.DropFunctionSql);

        migrationBuilder.Sql("""
            IF EXISTS (
                SELECT 1
                FROM sys.columns
                WHERE object_id = OBJECT_ID(N'[Recipes]') AND name = N'Slug' AND is_nullable = 1)
            BEGIN
                ALTER TABLE [Recipes] ALTER COLUMN [Slug] nvarchar(300) NOT NULL;
            END
            """);

        migrationBuilder.Sql("""
            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = N'IX_Recipes_Slug' AND object_id = OBJECT_ID(N'[Recipes]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_Recipes_Slug] ON [Recipes] ([Slug]);
            END
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Recipes_Slug",
            table: "Recipes");

        migrationBuilder.DropColumn(
            name: "Slug",
            table: "Recipes");
    }
}
