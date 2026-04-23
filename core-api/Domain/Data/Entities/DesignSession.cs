using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class DesignSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public string ProblemStatement { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public Guid? TeamId { get; set; }

    [ForeignKey("TeamId")]
    public Team? Team { get; set; }

    public ICollection<RequirementRecord> Requirements { get; set; } = new List<RequirementRecord>();
    public ICollection<RecommendationResult> Recommendations { get; set; } = new List<RecommendationResult>();
    public ICollection<RuleTriggerRecord> TriggeredRules { get; set; } = new List<RuleTriggerRecord>();
}
