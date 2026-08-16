namespace TarifDefterim.Infrastructure.Data;

internal static class RecipeSlugBackfill
{
    internal const string CreateFunctionSql = """
        CREATE OR ALTER FUNCTION dbo.FnRecipeBaseSlug(@title NVARCHAR(300))
        RETURNS NVARCHAR(300)
        AS
        BEGIN
            DECLARE @s NVARCHAR(300) = LTRIM(RTRIM(@title));

            SET @s = REPLACE(@s, N'ç', N'c');
            SET @s = REPLACE(@s, N'Ç', N'c');
            SET @s = REPLACE(@s, N'ğ', N'g');
            SET @s = REPLACE(@s, N'Ğ', N'g');
            SET @s = REPLACE(@s, N'ı', N'i');
            SET @s = REPLACE(@s, N'İ', N'i');
            SET @s = REPLACE(@s, N'ö', N'o');
            SET @s = REPLACE(@s, N'Ö', N'o');
            SET @s = REPLACE(@s, N'ş', N's');
            SET @s = REPLACE(@s, N'Ş', N's');
            SET @s = REPLACE(@s, N'ü', N'u');
            SET @s = REPLACE(@s, N'Ü', N'u');
            SET @s = LOWER(@s);
            SET @s = REPLACE(@s, N' ', N'-');

            WHILE PATINDEX(N'%[^a-z0-9-]%', @s) > 0
                SET @s = STUFF(@s, PATINDEX(N'%[^a-z0-9-]%', @s), 1, N'');

            WHILE CHARINDEX(N'--', @s) > 0
                SET @s = REPLACE(@s, N'--', N'-');

            WHILE LEFT(@s, 1) = N'-'
                SET @s = SUBSTRING(@s, 2, LEN(@s));

            WHILE RIGHT(@s, 1) = N'-'
                SET @s = LEFT(@s, LEN(@s) - 1);

            IF @s = N'' SET @s = N'tarif';

            RETURN @s;
        END;
        """;

    internal const string UpdateSlugsSql = """
        ;WITH Base AS (
            SELECT
                Id,
                CreatedAt,
                dbo.FnRecipeBaseSlug(Title) AS BaseSlug
            FROM Recipes
        ),
        Ranked AS (
            SELECT
                Id,
                BaseSlug,
                ROW_NUMBER() OVER (PARTITION BY BaseSlug ORDER BY CreatedAt, Id) AS rn
            FROM Base
        )
        UPDATE r
        SET Slug = CASE
            WHEN ranked.rn = 1 THEN ranked.BaseSlug
            ELSE ranked.BaseSlug + N'-' + CAST(ranked.rn AS NVARCHAR(10))
        END
        FROM Recipes r
        INNER JOIN Ranked ranked ON r.Id = ranked.Id;
        """;

    internal const string DropFunctionSql = """
        IF OBJECT_ID(N'dbo.FnRecipeBaseSlug', N'FN') IS NOT NULL
            DROP FUNCTION dbo.FnRecipeBaseSlug;
        """;
}
