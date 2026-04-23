using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemDesignRecommenderApi.Domain.Data.Migrations
{
    /// <inheritdoc />
    public partial class MoveUserMetricsToProfileTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalSkills",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Goal",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LearningPace",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Morale",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Performance",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PrimarySkills",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Productivity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Satisfaction",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SecondarySkills",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrimarySkills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SecondarySkills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdditionalSkills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Productivity = table.Column<int>(type: "int", nullable: false),
                    Morale = table.Column<int>(type: "int", nullable: false),
                    Satisfaction = table.Column<int>(type: "int", nullable: false),
                    Performance = table.Column<int>(type: "int", nullable: false),
                    LearningPace = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalSkills",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Goal",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LearningPace",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Morale",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Performance",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PrimarySkills",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Productivity",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Satisfaction",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SecondarySkills",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
