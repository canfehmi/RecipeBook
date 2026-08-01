using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TarifDefterim.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEmailTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EmailVerificationExpireDate",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationTokenHash",
                table: "AspNetUsers",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastPasswordResetEmailSentAt",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastVerificationEmailSentAt",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PasswordResetExpireDate",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetTokenHash",
                table: "AspNetUsers",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerificationExpireDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenHash",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastPasswordResetEmailSentAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastVerificationEmailSentAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetExpireDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenHash",
                table: "AspNetUsers");
        }
    }
}
