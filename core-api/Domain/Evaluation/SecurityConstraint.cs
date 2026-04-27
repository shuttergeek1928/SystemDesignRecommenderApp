namespace SystemDesignRecommenderApi.Domain.Evaluation;

public class SecurityConstraint : IEvaluationConstraint
{
    public string Name => "Security Posture";
    public string Description => "Evaluates the design's security features including encryption, IAM, and network isolation.";
    public int Weight => 10;

    public string GetEvaluationPrompt()
    {
        return @"
Evaluate the Security Posture of the architecture:
- Does it include adequate encryption (at rest and in transit)?
- Does it have robust Identity and Access Management (e.g., OAuth2, OIDC)?
- Is there network isolation (e.g., VPC, Private Subnets, WAF)?
- Score this constraint from 1 to 10 (10 being highly secure and compliant).";
    }
}
