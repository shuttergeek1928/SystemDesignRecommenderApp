namespace SystemDesignRecommenderApi.Domain.Evaluation;

public class OperationalConstraint : IEvaluationConstraint
{
    public string Name => "Operational Complexity";
    public string Description => "Evaluates the maintenance overhead and team skill required to operate the architecture.";
    public int Weight => 10;

    public string GetEvaluationPrompt()
    {
        return @"
Evaluate the Operational Complexity of the architecture:
- Are there too many moving parts for a small team?
- Does it require specialized DevOps skills to maintain (e.g., managing self-hosted Kubernetes vs. using managed services)?
- Is there adequate observability (metrics, logs, tracing)?
- Score this constraint from 1 to 10 (10 being highly maintainable and operable).";
    }
}
