using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class RuleEngineService : IRuleEngineService
{
    private readonly DesignDbContext _dbContext;

    public RuleEngineService(DesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<RuleTriggerRecordDTO>> EvaluateRulesAsync(DesignRequirements context)
    {
        var triggers = new List<RuleTriggerRecordDTO>();
        var rules = await _dbContext.DesignRules.Where(r => r.IsActive).ToListAsync();

        foreach (var rule in rules)
        {
            if (EvaluateRule(rule, context))
            {
                triggers.Add(new RuleTriggerRecordDTO
                {
                    Dimension = rule.Dimension,
                    Condition = $"{rule.Field} {rule.Operator} {rule.Value}",
                    Recommendation = rule.Recommendation,
                    Justification = rule.Justification
                });
            }
        }

        return triggers;
    }

    private bool EvaluateRule(Domain.Data.Entities.DesignRule rule, DesignRequirements context)
    {
        try
        {
            // Simple dynamic evaluation based on string matching
            // Extract the property value from context using reflection or a switch statement
            object? actualValue = GetFieldValue(rule.Field, context);

            if (actualValue == null) return false;

            return rule.Operator switch
            {
                ">" => Convert.ToDouble(actualValue) > Convert.ToDouble(rule.Value),
                "<" => Convert.ToDouble(actualValue) < Convert.ToDouble(rule.Value),
                "==" => string.Equals(actualValue.ToString(), rule.Value, StringComparison.OrdinalIgnoreCase),
                "Contains" => actualValue is IEnumerable<string> list ? list.Any(x => x.Contains(rule.Value, StringComparison.OrdinalIgnoreCase)) : actualValue.ToString()?.Contains(rule.Value, StringComparison.OrdinalIgnoreCase) == true,
                _ => false
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error evaluating rule {rule.Dimension}: {ex.Message}");
            return false;
        }
    }

    private object? GetFieldValue(string field, DesignRequirements context)
    {
        // Simple mapping for common fields
        return field.ToLower() switch
        {
            "users" => context.Context.Users,
            "trafficpattern" => context.Context.TrafficPattern,
            "latencyrequirementms" => context.Context.LatencyRequirementMs,
            "consistencymodel" => context.Context.ConsistencyModel,
            "datavolumegb" => context.Context.DataVolumeGb,
            "searchcomplexity" => context.Context.SearchComplexity,
            "requestrate" => context.Context.RequestRate,
            "teamsize" => context.Context.TeamSize,
            "experiencelevel" => context.Context.ExperienceLevel,
            "deploymentfrequency" => context.Context.DeploymentFrequency,
            "compliance" => context.Context.Compliance,
            "availabilityslo" => context.Context.AvailabilitySlo,
            "regionstrategy" => context.Context.RegionStrategy,
            "budget" => context.Context.Budget,
            "readwriteratio" => context.Context.ReadWriteRatio,
            "dataretention" => context.Context.DataRetention,
            "securitysensitivity" => context.Context.SecuritySensitivity,
            _ => null
        };
    }
}
