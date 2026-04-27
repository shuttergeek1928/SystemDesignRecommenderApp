namespace SystemDesignRecommenderApi.Domain.Evaluation;

public class CostConstraint : IEvaluationConstraint
{
    public string Name => "Cost Efficiency";
    public string Description => "Evaluates the total cost of ownership and cost scalability of the architecture.";
    public int Weight => 10;

    public string GetEvaluationPrompt()
    {
        return @"
Evaluate the Cost Efficiency of the architecture:
- Estimate the provisioning cost (High/Medium/Low).
- Is this design overkill for the given number of users?
- Identify any expensive bottlenecks.
- Score this constraint from 1 to 10 (10 being highly cost-optimized for the scale).";
    }
}
