using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Domain.Evaluation;

public interface IEvaluationConstraint
{
    string Name { get; }
    string Description { get; }
    int Weight { get; }

    /// <summary>
    /// Generates the specific prompt instruction for the LLM Critic to evaluate this constraint.
    /// </summary>
    string GetEvaluationPrompt();
}
