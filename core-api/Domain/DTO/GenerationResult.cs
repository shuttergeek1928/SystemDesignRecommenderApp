using SystemDesignRecommenderApi.Services;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Domain.DTO;

public class GenerationResult
{
    public Guid? SessionId { get; set; }
    public ArchitectureDesign Architecture { get; set; } = new();
    public EvaluationResult Evaluation { get; set; } = new();
    public IEnumerable<RuleTriggerRecordDTO> Rules { get; set; } = new List<RuleTriggerRecordDTO>();
}
