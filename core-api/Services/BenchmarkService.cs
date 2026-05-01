using System.Text.Json;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class BenchmarkService : IBenchmarkService
{
    private readonly MongoDbContext _mongoDbContext;

    public BenchmarkService(MongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
    }

    public async Task<BenchmarkComparisonDto?> CompareSessionWithBaselineAsync(Guid sessionId)
    {
        var historyDoc = await _mongoDbContext.DesignHistory
            .Find(h => h.SqlSessionId == sessionId.ToString())
            .FirstOrDefaultAsync();

        if (historyDoc == null || historyDoc.ArchitectureDesign == null || historyDoc.EvaluationScores?.MatchedBlueprintId == null)
            return null;

        var blueprintId = historyDoc.EvaluationScores.MatchedBlueprintId.Value;
        var blueprint = await _mongoDbContext.ReferenceBlueprints
            .Find(b => b.ScenarioId == blueprintId)
            .FirstOrDefaultAsync();

        if (blueprint == null) return null;

        var dto = new BenchmarkComparisonDto
        {
            SessionId = sessionId.ToString(),
            MatchedBlueprintScenarioId = blueprint.ScenarioId,
            MatchedBlueprintTitle = blueprint.Title,
            AiScores = new Dictionary<string, int>
            {
                { "Alignment", historyDoc.EvaluationScores.IndustryAlignmentScore },
                { "Compliance", historyDoc.EvaluationScores.ConstraintFulfillmentScore },
                { "Readiness", historyDoc.EvaluationScores.DeploymentReadinessScore },
                { "Rubric", historyDoc.EvaluationScores.RubricScore }
            },
            BaselineScores = new Dictionary<string, int>
            {
                { "Alignment", 100 },
                { "Compliance", 100 },
                { "Readiness", 100 },
                { "Rubric", 100 }
            }
        };

        var baselineArchitecture = blueprint.GroundTruthArchitecture.TryGetValue("baseline_A_expert", out var baselineA) 
            ? baselineA 
            : blueprint.GroundTruthArchitecture.Values.FirstOrDefault();

        if (baselineArchitecture == null) return dto;

        int exactMatches = 0;
        int acceptableAlternatives = 0;
        int totalNodes = historyDoc.ArchitectureDesign.Count;

        foreach (var kvp in historyDoc.ArchitectureDesign)
        {
            var nodeKey = kvp.Key;
            var aiChoice = kvp.Value.Choice;
            var baselineChoice = "";
            bool isExactMatch = false;
            bool isAcceptable = false;

            if (baselineArchitecture.Nodes.TryGetValue(nodeKey, out var baselineNodeObj))
            {
                // Try to extract 'choice' from the baseline node
                var baselineNodeJson = JsonSerializer.Serialize(baselineNodeObj);
                try
                {
                    var baselineComp = JsonSerializer.Deserialize<ArchComponent>(baselineNodeJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    baselineChoice = baselineComp?.Choice ?? "";
                }
                catch { }

                if (string.IsNullOrEmpty(baselineChoice))
                {
                    // Fallback to string representation if parsing fails
                    baselineChoice = baselineNodeObj?.ToString() ?? "";
                }

                if (aiChoice.Equals(baselineChoice, StringComparison.OrdinalIgnoreCase))
                {
                    isExactMatch = true;
                    exactMatches++;
                }
                else if (blueprint.AcceptableAlternatives.TryGetValue(nodeKey, out var alternatives) && 
                         alternatives.Any(a => aiChoice.Contains(a, StringComparison.OrdinalIgnoreCase) || a.Contains(aiChoice, StringComparison.OrdinalIgnoreCase)))
                {
                    isAcceptable = true;
                    acceptableAlternatives++;
                }
                // Fuzzy match check
                else if (baselineChoice.Contains(aiChoice, StringComparison.OrdinalIgnoreCase) || aiChoice.Contains(baselineChoice, StringComparison.OrdinalIgnoreCase))
                {
                    isExactMatch = true;
                    exactMatches++;
                }
            }

            dto.NodeComparisons.Add(new NodeComparisonItem
            {
                NodeKey = nodeKey,
                AiChoice = aiChoice,
                BaselineChoice = baselineChoice,
                IsExactMatch = isExactMatch,
                IsAcceptableAlternative = isAcceptable,
                Verdict = isExactMatch ? "Match" : (isAcceptable ? "Alternative" : "Divergent")
            });
        }

        if (totalNodes > 0)
        {
            dto.PrecisionScore = (double)exactMatches / totalNodes * 100;
            dto.AccuracyScore = (exactMatches + 0.5 * acceptableAlternatives) / totalNodes * 100;
            
            // Simple semantic similarity proxy
            dto.SemanticSimilarity = dto.AccuracyScore * 0.9 + 10; 
        }

        return dto;
    }

    public async Task<IEnumerable<object>> GetAvailableBlueprintsAsync()
    {
        var blueprints = await _mongoDbContext.ReferenceBlueprints.Find(Builders<Domain.Data.Mongo.Entities.ReferenceBlueprint>.Filter.Empty).ToListAsync();
        return blueprints.Select(b => new { b.ScenarioId, b.Title });
    }
}
