using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface IEvaluationService
{
    Task<EvaluationResult> EvaluateArchitectureAsync(ArchitectureDesign design, DesignRequirements requirements, string problemStatement);
}

public class EvaluationResult
{
    public int IndustryAlignmentScore { get; set; }
    public int ConstraintFulfillmentScore { get; set; }
    public int DeploymentReadinessScore { get; set; }
    public int RubricScore { get; set; }
    public string CriticReport { get; set; } = string.Empty;
    public int? MatchedBlueprintId { get; set; }
}
