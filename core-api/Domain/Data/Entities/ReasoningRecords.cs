using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class RequirementRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SessionId { get; set; }
    
    [ForeignKey("SessionId")]
    public DesignSession Session { get; set; } = null!;

    [Required]
    public string JsonData { get; set; } = string.Empty;
}

public class RecommendationResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SessionId { get; set; }
    
    [ForeignKey("SessionId")]
    public DesignSession Session { get; set; } = null!;

    [Required]
    public string JsonData { get; set; } = string.Empty;
}

public class RuleTriggerRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SessionId { get; set; }
    
    [ForeignKey("SessionId")]
    public DesignSession Session { get; set; } = null!;

    [Required]
    public string Dimension { get; set; } = string.Empty;
    
    [Required]
    public string Condition { get; set; } = string.Empty;
    
    [Required]
    public string Recommendation { get; set; } = string.Empty;
    
    [Required]
    public string Justification { get; set; } = string.Empty;
}
