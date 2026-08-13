using Microsoft.EntityFrameworkCore.Migrations;
using TarifDefterim.Infrastructure.Data;

#nullable disable

namespace TarifDefterim.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class AddPageContent : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PageContents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                ContentHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PageContents", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PageContents_Slug",
            table: "PageContents",
            column: "Slug",
            unique: true);

        var seedTime = new DateTime(2026, 8, 13, 0, 0, 0, DateTimeKind.Utc);

        foreach (var page in PageContentSeed.Pages)
        {
            migrationBuilder.InsertData(
                table: "PageContents",
                columns: ["Id", "Slug", "Title", "ContentHtml", "UpdatedAt"],
                columnTypes: ["uniqueidentifier", "nvarchar(100)", "nvarchar(300)", "nvarchar(max)", "datetime2"],
                values: [page.Id, page.Slug, page.Title, page.ContentHtml, seedTime]);
        }
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "PageContents");
    }
}
