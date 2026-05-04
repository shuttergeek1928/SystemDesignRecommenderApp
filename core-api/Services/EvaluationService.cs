using System.Text.Json;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Evaluation;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class EvaluationService : IEvaluationService
{
    private readonly MongoDbContext _mongoDbContext;
    private readonly IRuleEngineService _ruleEngine;
    private readonly ILLMChatService _llmService;
    private readonly ISettingsService _settingsService;
    private readonly IEnumerable<IEvaluationConstraint> _constraints;

    public EvaluationService(
        MongoDbContext mongoDbContext,
        IRuleEngineService ruleEngine,
        ILLMChatService llmService,
        ISettingsService settingsService,
        IEnumerable<IEvaluationConstraint> constraints)
    {
        _mongoDbContext = mongoDbContext;
        _ruleEngine = ruleEngine;
        _llmService = llmService;
        _settingsService = settingsService;
        _constraints = constraints;
    }

    public async Task<EvaluationResult> EvaluateArchitectureAsync(ArchitectureDesign design, DesignRequirements requirements, string problemStatement)
    {
        var result = new EvaluationResult();

        // 1. Industry Alignment Score
        var alignment = await CalculateIndustryAlignmentAsync(design, requirements);
        result.IndustryAlignmentScore = alignment.Score;
        result.MatchedBlueprintId = alignment.MatchedBlueprintId;

        // 2. Constraint Fulfillment Score
        result.ConstraintFulfillmentScore = await CalculateConstraintFulfillmentAsync(design, requirements);

        // 3. Deployment Readiness Score (Simple heuristic based on specific services vs generic terms)
        result.DeploymentReadinessScore = CalculateDeploymentReadiness(design);

        // 4. Agentic Rubric Score (Critic Agent using Gemini 3 Pro)
        var criticOutput = await GenerateCriticReportAsync(design, requirements, problemStatement);
        result.RubricScore = criticOutput.Score;
        result.CriticReport = criticOutput.Report;

        return result;
    }

    private async Task<(int Score, int? MatchedBlueprintId)> CalculateIndustryAlignmentAsync(ArchitectureDesign design, DesignRequirements requirements)
    {
        var filter = Builders<Domain.Data.Mongo.Entities.ReferenceBlueprint>.Filter.Empty;
        var blueprints = await _mongoDbContext.ReferenceBlueprints.Find(filter).ToListAsync();

        Domain.Data.Mongo.Entities.ReferenceBlueprint? bestBlueprint = null;
        int bestScore = 50;

        var aiJson = JsonSerializer.Serialize(design).ToLower();
        var aiWords = aiJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();

        foreach (var blueprint in blueprints)
        {
            int matchWeight = 0;
            if (requirements.Context != null && blueprint.Context != null)
            {
                if (requirements.Context.TrafficPattern == blueprint.Context.TrafficPattern) matchWeight += 2;
                if (requirements.Context.ConsistencyModel == blueprint.Context.ConsistencyModel) matchWeight += 2;
                if (requirements.Context.LatencyRequirementMs == blueprint.Context.LatencyRequirementMs) matchWeight += 1;
            }

            var baselineJson = JsonSerializer.Serialize(blueprint.GroundTruthArchitecture).ToLower();
            var baselineWords = baselineJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();
            
            var overlap = baselineWords.Intersect(aiWords).Count();
            int currentScore = Math.Min(100, (int)((double)overlap / Math.Max(1, baselineWords.Count) * 100)) + matchWeight * 5;
            currentScore = Math.Min(100, currentScore);

            if (currentScore > bestScore)
            {
                bestScore = currentScore;
                bestBlueprint = blueprint;
            }
        }

        if (bestBlueprint != null)
        {
            return (bestScore, bestBlueprint.ScenarioId);
        }

        return (50, null);
    }

    private async Task<int> CalculateConstraintFulfillmentAsync(ArchitectureDesign design, DesignRequirements requirements)
    {
        var allRules = await _ruleEngine.EvaluateRulesAsync(requirements);
        var matchedRules = allRules.Where(r => r.IsMatched).ToList();

        if (!matchedRules.Any()) return 100; // No rules triggered, full compliance

        int followedCount = 0;
        var designJson = JsonSerializer.Serialize(design).ToLower();

        foreach (var rule in matchedRules)
        {
            // Very simple heuristic: check if keywords from the recommendation appear in the design
            var keywords = rule.Recommendation.Split(' ')
                .Where(w => w.Length > 4) // Only significant words
                .Select(w => w.TrimEnd(',', '.', ';').ToLower());

            if (keywords.Any(k => designJson.Contains(k)))
            {
                followedCount++;
            }
        }

        return (int)((double)followedCount / matchedRules.Count * 100);
    }

    private int CalculateDeploymentReadiness(ArchitectureDesign design)
    {
        int score = 100;
        var genericTerms = new[] { "database", "cache", "server", "queue" };
        
        var json = JsonSerializer.Serialize(design).ToLower();
        foreach (var term in genericTerms)
        {
            if (json.Contains($"\"choice\": \"{term}\"") || json.Contains($"\"choice\":\"{term}\""))
            {
                score -= 10; // Penalize for generic terms instead of concrete services like "Amazon RDS"
            }
        }

        return Math.Max(0, score);
    }

    private async Task<(int Score, string Report)> GenerateCriticReportAsync(ArchitectureDesign design, DesignRequirements requirements, string problemStatement)
    {
        var prompt = "You are an expert System Design Critic.\n";
        prompt += $"Problem Statement: {problemStatement}\n\n";
        prompt += $"Proposed Design: {JsonSerializer.Serialize(design)}\n\n";
        
        prompt += "Evaluate this design based on the following constraints:\n";
        foreach (var constraint in _constraints)
        {
            prompt += $"\n--- {constraint.Name} ---\n";
            prompt += constraint.GetEvaluationPrompt();
        }

        prompt += "\n\nProvide your detailed critique. For each evaluation category, start with a simple header (e.g., '### Security Posture'). \n\nInside each section, use a 'Key Point' format. Each point MUST start with a bold title followed by a colon, and then the detailed explanation in italics. \nExample: '**Cost Efficiency**: *The serverless approach is expensive at this scale...*'\n\nAt the very end of each category section (after all points), include a section-specific score in the format: '**CATEGORY_NAME SCORE: X/10**' (e.g. '**SECURITY POSTURE SCORE: 8/10**').\n\nUse professional Markdown formatting. Be direct, technical, and critical. At the very end of your response, provide a final overall Rubric Score out of 100 on a new line in the exact format: 'FINAL_SCORE: <number>'";

        // Call the LLM (Gemini)
        var chatRequest = new ChatRequest(new List<MessageDto>
        {
            new MessageDto("user", prompt)
        });

        var appSettings = _settingsService.GetSettings();
        var provider = !string.IsNullOrEmpty(requirements.Provider) ? requirements.Provider : (appSettings.GenerationProvider ?? appSettings.PreferredProvider ?? "gemini");
        var modelName = !string.IsNullOrEmpty(requirements.Model) ? requirements.Model : (appSettings.GenerationModel ?? appSettings.GeminiModel);

        var response = await _llmService.ChatAsync(chatRequest, provider, modelName);

        int finalScore = 75; // Default
        var lines = response?.Split('\n') ?? Array.Empty<string>();
        var scoreLine = lines.LastOrDefault(l => l.StartsWith("FINAL_SCORE:"));
        
        if (scoreLine != null && int.TryParse(scoreLine.Replace("FINAL_SCORE:", "").Trim(), out int parsedScore))
        {
            finalScore = parsedScore;
        }

        return (finalScore, response ?? "No critique generated.");
    }
}
