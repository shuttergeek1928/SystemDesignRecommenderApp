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
        result.IndustryAlignmentScore = await CalculateIndustryAlignmentAsync(design, requirements);

        // 2. Constraint Fulfillment Score
        result.ConstraintFulfillmentScore = await CalculateConstraintFulfillmentAsync(requirements);

        // 3. Deployment Readiness Score (Simple heuristic based on specific services vs generic terms)
        result.DeploymentReadinessScore = CalculateDeploymentReadiness(design);

        // 4. Agentic Rubric Score (Critic Agent using Gemini 3 Pro)
        var criticOutput = await GenerateCriticReportAsync(design, requirements, problemStatement);
        result.RubricScore = criticOutput.Score;
        result.CriticReport = criticOutput.Report;

        return result;
    }

    private async Task<int> CalculateIndustryAlignmentAsync(ArchitectureDesign design, DesignRequirements requirements)
    {
        // Simple heuristic: Try to match context. Users, traffic pattern, etc.
        // In a real system, use embeddings for vector similarity.
        var builder = Builders<Domain.Data.Mongo.Entities.ReferenceBlueprint>.Filter;
        var filter = builder.Empty;

        // Try to find a matching scenario based on some context or just return a default
        var blueprint = await _mongoDbContext.ReferenceBlueprints.Find(filter).FirstOrDefaultAsync();

        if (blueprint != null)
        {
            // Calculate overlap (dummy calculation for prototype)
            return 85;
        }

        return 50; // Default score if no match
    }

    private async Task<int> CalculateConstraintFulfillmentAsync(DesignRequirements requirements)
    {
        var triggeredRules = await _ruleEngine.EvaluateRulesAsync(requirements);
        
        // In a real scenario, we check if the design ACTUALLY implemented the recommendation.
        // For now, if there are many triggered rules, we assume it's a complex scenario and 
        // the generator handled them well enough, or we dock points if it didn't.
        return 90; // Placeholder
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
        var modelName = appSettings.GenerationModel ?? appSettings.GeminiModel ?? "gemini-1.5-flash";

        var response = await _llmService.ChatAsync(chatRequest, "gemini", modelName);

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
