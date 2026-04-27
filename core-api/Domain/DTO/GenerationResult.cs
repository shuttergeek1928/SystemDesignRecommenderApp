using SystemDesignRecommenderApi.Services;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Domain.DTO;

public class GenerationResult
{
    public ArchitectureDesign Architecture { get; set; } = new();
    public EvaluationResult Evaluation { get; set; } = new();
}
