using System.Text.Json;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class BenchmarkService : IBenchmarkService
{
    private readonly MongoDbContext _mongoDbContext;
    private readonly IEvaluationService _evaluationService;
    private readonly ILLMChatService _llmService;
    private readonly ILogger<BenchmarkService> _logger;

    public BenchmarkService(
        MongoDbContext mongoDbContext, 
        IEvaluationService evaluationService,
        ILLMChatService llmService,
        ILogger<BenchmarkService> logger)
    {
        _mongoDbContext = mongoDbContext;
        _evaluationService = evaluationService;
        _llmService = llmService;
        _logger = logger;
    }

    public async Task<BenchmarkComparisonDto?> CompareSessionWithBaselineAsync(Guid sessionId, int? overrideScenarioId = null)
    {
        var historyDoc = await _mongoDbContext.DesignHistory
            .Find(h => h.SqlSessionId == sessionId.ToString())
            .FirstOrDefaultAsync();

        if (historyDoc == null || historyDoc.ArchitectureDesign == null)
            return null;

        int? blueprintId = overrideScenarioId ?? historyDoc.EvaluationScores?.MatchedBlueprintId;

        // Fallback: If no blueprint was matched during generation, find the best fit now
        if (blueprintId == null && historyDoc.ExtractedRequirements != null)
        {
            var alignment = await _evaluationService.EvaluateArchitectureAsync(historyDoc.ArchitectureDesign, historyDoc.ExtractedRequirements, historyDoc.ProblemStatement);
            blueprintId = alignment.MatchedBlueprintId;
        }

        if (blueprintId == null) return null;

        var blueprint = await _mongoDbContext.ReferenceBlueprints
            .Find(b => b.ScenarioId == blueprintId)
            .FirstOrDefaultAsync();

        if (blueprint == null) return null;

        int alignmentScore = historyDoc.EvaluationScores?.IndustryAlignmentScore ?? 0;
        if (overrideScenarioId != null)
        {
            var requirements = historyDoc.ExtractedRequirements ?? new DesignRequirements();
            int matchWeight = 0;
            if (requirements.Context != null && blueprint.Context != null)
            {
                if (requirements.Context.TrafficPattern == blueprint.Context.TrafficPattern) matchWeight += 15;
                if (requirements.Context.ConsistencyModel == blueprint.Context.ConsistencyModel) matchWeight += 15;
                if (requirements.Context.AvailabilitySlo == blueprint.Context.AvailabilitySlo) matchWeight += 10;
                var userDiff = Math.Abs((requirements.Context.Users ?? 0) - (blueprint.Context.Users ?? 0));
                if (userDiff < 100000) matchWeight += 10;
            }
            var aiJson = JsonSerializer.Serialize(historyDoc.ArchitectureDesign).ToLower();
            var aiWords = aiJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();
            var baselineJson = JsonSerializer.Serialize(blueprint.GroundTruthArchitecture).ToLower();
            var baselineWords = baselineJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();
            var overlap = baselineWords.Intersect(aiWords).Count();
            alignmentScore = (int)((double)overlap / Math.Max(1, baselineWords.Count) * 60) + matchWeight;
            alignmentScore = Math.Min(100, Math.Max(0, alignmentScore));
        }

        var dto = new BenchmarkComparisonDto
        {
            SessionId = sessionId.ToString(),
            MatchedBlueprintScenarioId = blueprint.ScenarioId,
            MatchedBlueprintTitle = blueprint.Title,
            IsNovelScenario = historyDoc.EvaluationScores?.IsNovelScenario ?? false,
            NoveltyReason = historyDoc.EvaluationScores?.NoveltyReason ?? "",
            AiScores = new Dictionary<string, int>
            {
                { "Alignment", alignmentScore },
                { "Compliance", historyDoc.EvaluationScores?.ConstraintFulfillmentScore ?? 0 },
                { "Readiness", historyDoc.EvaluationScores?.DeploymentReadinessScore ?? 0 },
                { "Rubric", historyDoc.EvaluationScores?.RubricScore ?? 0 }
            },
            BaselineScores = new Dictionary<string, int>
            {
                { "Alignment", 100 },
                { "Compliance", 100 },
                { "Readiness", 100 },
                { "Rubric", 100 }
            }
        };

        var baselineArchitecture = blueprint.GroundTruthArchitecture?.TryGetValue("baseline_A_expert", out var baselineA) == true 
            ? baselineA 
            : blueprint.GroundTruthArchitecture?.Values.FirstOrDefault();

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

            Console.WriteLine($"[Benchmark] Checking AI nodeKey '{nodeKey}' against baseline. Baseline has keys: {string.Join(", ", baselineArchitecture.Nodes.Keys)}");

            var baselineNodeObj = baselineArchitecture.Nodes?
                .FirstOrDefault(n => n.Key.Equals(nodeKey, StringComparison.OrdinalIgnoreCase)).Value;

            if (baselineNodeObj != null)
            {
                // Try to extract 'choice' from the baseline node
                var baselineNodeJson = JsonSerializer.Serialize(baselineNodeObj);
                Console.WriteLine($"[Benchmark] Serialized baseline node for '{nodeKey}': {baselineNodeJson}");
                try
                {
                    var baselineComp = JsonSerializer.Deserialize<ArchComponent>(baselineNodeJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    baselineChoice = baselineComp?.Choice ?? "";
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Benchmark] Deserialization error for '{nodeKey}': {ex.Message}");
                }

                if (string.IsNullOrEmpty(baselineChoice))
                {
                    // Fallback to string representation if parsing fails
                    baselineChoice = baselineNodeObj?.ToString() ?? "";
                    Console.WriteLine($"[Benchmark] Fallback baselineChoice for '{nodeKey}': {baselineChoice}");
                }
            }
            else
            {
                Console.WriteLine($"[Benchmark] No baseline node found for '{nodeKey}'");
            }

            if (!string.IsNullOrEmpty(baselineChoice))
            {
                if (aiChoice.Equals(baselineChoice, StringComparison.OrdinalIgnoreCase))
                {
                    isExactMatch = true;
                    exactMatches++;
                }
                else if (blueprint.AcceptableAlternatives != null && blueprint.AcceptableAlternatives.TryGetValue(nodeKey, out var alternatives) && 
                         alternatives.Any(a => aiChoice.Contains(a, StringComparison.OrdinalIgnoreCase) || a.Contains(aiChoice, StringComparison.OrdinalIgnoreCase)))
                {
                    isAcceptable = true;
                    acceptableAlternatives++;
                }
                // Technology Equivalence Check
                else if (await CheckTechnologyEquivalenceAsync(aiChoice, baselineChoice, nodeKey))
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

    private async Task<bool> CheckTechnologyEquivalenceAsync(string aiChoice, string baselineChoice, string nodeType)
    {
        if (string.IsNullOrWhiteSpace(aiChoice) || string.IsNullOrWhiteSpace(baselineChoice)) return false;

        // 1. Static Fast Lookup
        var equivalenceGroups = new List<HashSet<string>>
        {
            new() { "aws aurora", "mysql", "postgresql", "rds", "cloud sql", "azure sql" },
            new() { "kafka", "rabbitmq", "aws sqs", "aws sns", "pubsub", "event hubs" },
            new() { "redis", "memcached", "elasticache" },
            new() { "mongodb", "cosmosdb", "dynamodb", "firestore", "couchbase" },
            new() { "s3", "gcs", "azure blob storage", "minio" },
            new() { "kubernetes", "eks", "gke", "aks", "fargate", "ecs", "docker swarm" },
            new() { "prometheus", "cloudwatch", "stackdriver", "datadog", "new relic" }
        };

        foreach (var group in equivalenceGroups)
        {
            if (group.Any(g => aiChoice.Contains(g, StringComparison.OrdinalIgnoreCase)) &&
                group.Any(g => baselineChoice.Contains(g, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.LogInformation($"[Equivalence] FAST MATCH: '{aiChoice}' recognized as equivalent to '{baselineChoice}' for node '{nodeType}'");
                return true;
            }
        }

        // 2. LLM Semantic Check (Fallback)
        _logger.LogInformation($"[Equivalence] Fallback to LLM for: '{aiChoice}' vs '{baselineChoice}'");
        
        var prompt = $"As a software architect, are the technologies '{aiChoice}' and '{baselineChoice}' semantically equivalent or compatible substitutes for a '{nodeType}' component? " +
                     $"Consider if one is a cloud-native evolution of the other. Answer ONLY 'YES' or 'NO'.";

        try
        {
            var response = await _llmService.ChatAsync(new ChatRequest(new List<MessageDto> { new("user", prompt) }), "gemini", "gemini-1.5-flash");
            bool isEquivalent = response.Trim().Equals("YES", StringComparison.OrdinalIgnoreCase);
            
            _logger.LogInformation($"[Equivalence] LLM Result for '{aiChoice}' vs '{baselineChoice}': {isEquivalent}");
            return isEquivalent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"[Equivalence] LLM Error: {ex.Message}");
            return false;
        }
    }
}
