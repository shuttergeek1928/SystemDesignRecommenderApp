using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class RuleEngineService : IRuleEngineService
{
    public IEnumerable<RuleTriggerRecordDTO> EvaluateRules(DesignRequirements context)
    {
        var triggers = new List<RuleTriggerRecordDTO>();

        // 1. Scalability & Performance
        if ((context.Context.Users ?? 0) > 100000)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Scale",
                Condition = "Users > 100k",
                Recommendation = "Horizontal Scaling",
                Justification = "Single node capacity limits are reached at this scale."
            });
        }

        if (context.Context.TrafficPattern?.Contains("burst", StringComparison.OrdinalIgnoreCase) == true)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Scale Type",
                Condition = "Burst Traffic",
                Recommendation = "Serverless (Lambda/Azure Functions)",
                Justification = "Scales to zero to save costs during idle periods and scales instantly for spikes."
            });
        }

        if ((context.Context.LatencyRequirementMs ?? 1000) < 100)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Latency",
                Condition = "< 100ms",
                Recommendation = "Redis/Memcached",
                Justification = "Reduces database I/O bottlenecks for frequent read operations."
            });
        }

        // 2. Consistency & Data Integrity
        if (string.Equals(context.Context.ConsistencyModel, "strong", StringComparison.OrdinalIgnoreCase))
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Consistency",
                Condition = "Strong",
                Recommendation = "RDBMS with 2PC",
                Justification = "Ensures ACID compliance for critical transactions where data loss is unacceptable."
            });
        }
        else if (string.Equals(context.Context.ConsistencyModel, "eventual", StringComparison.OrdinalIgnoreCase))
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Consistency",
                Condition = "Eventual",
                Recommendation = "Event Sourcing",
                Justification = "Prioritizes availability and performance over instant synchronization across all nodes."
            });
        }

        if ((context.Context.DataVolumeGb ?? 0) > 1000)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Data Volume",
                Condition = "> 1TB / Month",
                Recommendation = "NoSQL (Mongo/Cassandra)",
                Justification = "Horizontal write scaling is significantly easier than sharding a massive RDBMS."
            });
        }

        if (string.Equals(context.Context.SearchComplexity, "complex", StringComparison.OrdinalIgnoreCase))
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Search",
                Condition = "Complex Text Search",
                Recommendation = "Elasticsearch/Meilisearch",
                Justification = "RDBMS LIKE queries do not scale for full-text indexing at volume."
            });
        }

        if ((context.Context.RequestRate ?? 0) > 5000)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Request Rate",
                Condition = "> 5k Requests/sec",
                Recommendation = "Message Queue (RabbitMQ/Kafka)",
                Justification = "Decouples services to prevent cascading failures under heavy load."
            });
        }

        // 3. Team & Organizational Agility
        if ((context.Context.TeamSize ?? 10) < 8)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Team Size",
                Condition = "< 8 Developers",
                Recommendation = "Modular Monolith",
                Justification = "Microservices introduce a 'Distributed Systems Tax' that is too high for small teams."
            });
        }

        if (string.Equals(context.Context.ExperienceLevel, "junior", StringComparison.OrdinalIgnoreCase))
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "DevOps Skill",
                Condition = "Low / Beginner",
                Recommendation = "Managed Services (PaaS)",
                Justification = "Reduces the operational burden of managing Kubernetes clusters or hardware."
            });
        }

        if (string.Equals(context.Context.DeploymentFrequency, "high", StringComparison.OrdinalIgnoreCase) || string.Equals(context.Context.DeploymentFrequency, "daily", StringComparison.OrdinalIgnoreCase))
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Deployment",
                Condition = "High Freq (10x/day)",
                Recommendation = "Blue-Green Deployment",
                Justification = "Allows for zero-downtime releases and instant rollbacks if issues occur."
            });
        }

        // 4. Security & Compliance
        if (context.Context.Compliance?.Any(c => c.Contains("GDPR", StringComparison.OrdinalIgnoreCase) || c.Contains("PII", StringComparison.OrdinalIgnoreCase)) == true)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Compliance",
                Condition = "GDPR / PII Data",
                Recommendation = "Data Masking & Encryption",
                Justification = "Legal requirement to protect sensitive user information at rest and in transit."
            });
        }

        if (context.Context.Compliance?.Any(c => c.Contains("external", StringComparison.OrdinalIgnoreCase) || c.Contains("OAuth", StringComparison.OrdinalIgnoreCase)) == true)
        {
            triggers.Add(new RuleTriggerRecordDTO
            {
                Dimension = "Auth Complexity",
                Condition = "External Users",
                Recommendation = "OAuth 2.0 / OpenID Connect",
                Justification = "Industry standard for secure, delegated authorization for third-party access."
            });
        }

        return triggers;
    }
}
