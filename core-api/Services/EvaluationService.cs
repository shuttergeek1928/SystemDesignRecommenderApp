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
        var alignment = await CalculateIndustryAlignmentAsync(design, requirements, problemStatement);
        result.IndustryAlignmentScore = alignment.Score;
        result.MatchedBlueprintId = alignment.MatchedBlueprintId;
        result.IsNovelScenario = alignment.IsNovel;
        result.NoveltyReason = alignment.NoveltyReason;

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

    private async Task<(int Score, int? MatchedBlueprintId, bool IsNovel, string NoveltyReason)> CalculateIndustryAlignmentAsync(ArchitectureDesign design, DesignRequirements requirements, string problemStatement)
    {
        Console.WriteLine($"[Alignment] Starting matching for: {problemStatement}");
        var blueprints = await _mongoDbContext.ReferenceBlueprints.Find(Builders<Domain.Data.Mongo.Entities.ReferenceBlueprint>.Filter.Empty).ToListAsync();
        if (!blueprints.Any()) return (0, null, true, "No blueprints in Knowledge Base.");

        Domain.Data.Mongo.Entities.ReferenceBlueprint? bestBlueprint = null;
        int bestScore = -1;
        string highestReason = "";

        var aiJson = JsonSerializer.Serialize(design).ToLower();
        var aiWords = aiJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();
        
        var problemWords = problemStatement.ToLower().Split(' ').Where(w => w.Length > 2).ToHashSet();

        foreach (var blueprint in blueprints)
        {
            int currentMatchScore = 0;
            
            // 1. Title Similarity (High Weight: 40 points)
            var bpTitleWords = blueprint.Title.ToLower().Split(' ').Where(w => w.Length > 2).ToHashSet();
            var titleOverlap = problemWords.Intersect(bpTitleWords).Count();
            int titleScore = (int)((double)titleOverlap / Math.Max(1, bpTitleWords.Count) * 30);
            currentMatchScore += titleScore;

            // 2. Category Match (20 points)
            int catScore = 0;
            if (!string.IsNullOrEmpty(blueprint.Category) && problemStatement.Contains(blueprint.Category, StringComparison.OrdinalIgnoreCase))
            {
                catScore = 20;
            }
            currentMatchScore += catScore;

            // 3. Structural/Context Matching (25 points)
            int contextScore = 0;
            if (requirements.Context != null && blueprint.Context != null)
            {
                if (requirements.Context.TrafficPattern == blueprint.Context.TrafficPattern) contextScore += 8;
                if (requirements.Context.ConsistencyModel == blueprint.Context.ConsistencyModel) contextScore += 8;
                if (requirements.Context.AvailabilitySlo == blueprint.Context.AvailabilitySlo) contextScore += 5;
                var userDiff = Math.Abs((requirements.Context.Users ?? 0) - (blueprint.Context.Users ?? 0));
                if (userDiff < 100000) contextScore += 4;
            }
            currentMatchScore += contextScore;

            // 3. Architectural Overlap (Existing Weight: 30 points)
            var baselineJson = JsonSerializer.Serialize(blueprint.GroundTruthArchitecture).ToLower();
            var baselineWords = baselineJson.Split(new[] { ' ', '"', ':', '{', '}', ',', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 3).ToHashSet();
            var overlap = baselineWords.Intersect(aiWords).Count();
            int archScore = (int)((double)overlap / Math.Max(1, baselineWords.Count) * 25);
            currentMatchScore += archScore;

            await LogAlignmentAuditAsync(blueprint.Title, currentMatchScore, titleScore, catScore, contextScore, archScore);
            
            if (currentMatchScore > bestScore)
            {
                bestScore = currentMatchScore;
                bestBlueprint = blueprint;
                highestReason = $"Matched via '{blueprint.Title}' (Similarity: {bestScore}%)";
            }
        }

        bool isNovel = bestScore < 45;
        if (isNovel)
        {
            var novelMsg = $"[DECISION] NOVEL SCENARIO DETECTED. Highest similarity: {bestScore}% against '{bestBlueprint?.Title}'";
            Console.WriteLine($"[Alignment] {novelMsg}");
            await LogDecisionAuditAsync(novelMsg);
            return (bestScore, null, true, $"No close industry match found (Best similarity: {bestScore}% against {bestBlueprint?.Title})");
        }

        var matchMsg = $"[DECISION] MATCH FOUND: '{bestBlueprint?.Title}' with score {bestScore}";
        Console.WriteLine($"[Alignment] {matchMsg}");
        await LogDecisionAuditAsync(matchMsg);
        return (bestScore, bestBlueprint?.ScenarioId, false, highestReason);
    }

    private async Task LogDecisionAuditAsync(string message)
    {
        try
        {
            var logDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");
            var logFile = Path.Combine(logDir, "alignment_audit.log");
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            await File.AppendAllTextAsync(logFile, $"[{timestamp}] {message}\n---\n");
        }
        catch { }
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

        var (provider, modelName) = await _settingsService.ResolveModelAsync(PipelinePhase.Evaluation);
        
        // Request-level overrides
        if (!string.IsNullOrEmpty(requirements.Provider)) provider = requirements.Provider;
        if (!string.IsNullOrEmpty(requirements.Model)) modelName = requirements.Model;

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
    private async Task LogAlignmentAuditAsync(string blueprintTitle, int total, int t, int c, int x, int a)
    {
        try
        {
            var logDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");
            if (!Directory.Exists(logDir)) Directory.CreateDirectory(logDir);
            
            var logFile = Path.Combine(logDir, "alignment_audit.log");
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            var logEntry = $"[{timestamp}] Blueprint: {blueprintTitle} | Total: {total} | T: {t}, C: {c}, X: {x}, A: {a}\n";
            
            await File.AppendAllTextAsync(logFile, logEntry);
        }
        catch (Exception ex)
        {
            // Fail silently for logging to avoid breaking the core flow, but write to console
            Console.WriteLine($"[AuditLog Error] {ex.Message}");
        }
    }
}
