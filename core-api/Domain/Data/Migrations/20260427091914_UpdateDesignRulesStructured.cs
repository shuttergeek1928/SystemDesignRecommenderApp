using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemDesignRecommenderApi.Domain.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDesignRulesStructured : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Condition",
                table: "DesignRules",
                newName: "Value");

            migrationBuilder.AddColumn<string>(
                name: "Field",
                table: "DesignRules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Operator",
                table: "DesignRules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field",
                table: "DesignRules");

            migrationBuilder.DropColumn(
                name: "Operator",
                table: "DesignRules");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "DesignRules",
                newName: "Condition");
        }
    }
}
