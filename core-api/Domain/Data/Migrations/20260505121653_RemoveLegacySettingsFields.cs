using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemDesignRecommenderApi.Domain.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacySettingsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GeminiModel",
                table: "AppGlobalSettings");

            migrationBuilder.DropColumn(
                name: "OllamaModel",
                table: "AppGlobalSettings");

            migrationBuilder.DropColumn(
                name: "PreferredProvider",
                table: "AppGlobalSettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GeminiModel",
                table: "AppGlobalSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OllamaModel",
                table: "AppGlobalSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredProvider",
                table: "AppGlobalSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
