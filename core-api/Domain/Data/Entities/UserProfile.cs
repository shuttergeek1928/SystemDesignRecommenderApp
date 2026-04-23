using System.ComponentModel.DataAnnotations;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class UserProfile
{
    [Key]
    public Guid UserId { get; set; }

    [Required]
    public User User { get; set; } = null!;

    public string Role { get; set; } = "Member";
    public string PrimarySkills { get; set; } = "[]";
    public string SecondarySkills { get; set; } = "[]";
    public string AdditionalSkills { get; set; } = "[]";
    public int Productivity { get; set; } = 90;
    public int Morale { get; set; } = 85;
    public int Satisfaction { get; set; } = 88;
    public int Performance { get; set; } = 92;
    public string LearningPace { get; set; } = "Moderate";
    public string Goal { get; set; } = string.Empty;
}
