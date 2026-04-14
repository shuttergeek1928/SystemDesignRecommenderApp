using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface IRuleEngineService
{
    IEnumerable<RuleTriggerRecordDTO> EvaluateRules(DesignRequirements context);
}

public class RuleTriggerRecordDTO
{
    public string Dimension { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
}
