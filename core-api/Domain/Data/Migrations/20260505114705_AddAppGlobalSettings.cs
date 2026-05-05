using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemDesignRecommenderApi.Domain.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAppGlobalSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppGlobalSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    OllamaModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeminiModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeminiApiKey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtractionProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtractionModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GenerationProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GenerationModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EvaluationProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EvaluationModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGlobalSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppGlobalSettings");
        }
    }
}
