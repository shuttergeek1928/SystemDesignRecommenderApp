using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class SystemDesignService : ISystemDesignService
{
    private readonly IOllamaChatService _ollamaChatService;
    private readonly ISettingsService _settingsService;
    private readonly IRuleEngineService _ruleEngineService;
    private readonly DesignDbContext _dbContext;
    private readonly IHttpClientFactory _httpClientFactory;

    public SystemDesignService(
        IOllamaChatService ollamaChatService, 
        ISettingsService settingsService, 
        IRuleEngineService ruleEngineService,
        DesignDbContext dbContext,
        IHttpClientFactory httpClientFactory)
    {
        _ollamaChatService = ollamaChatService;
        _settingsService = settingsService;
        _ruleEngineService = ruleEngineService;
        _dbContext = dbContext;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<DesignRequirements?> ExtractRequirementsAsync(string problemStatement)
    {
        var prompt = $@"
You are an expert Distributed Systems Architect. Extract requirements from the following problem statement.
Problem: {problemStatement}

Provide the output strictly in valid JSON format with this structure. Ensure that 'compliance' and 'non_functional_requirements' are simple arrays of strings (e.g. [""Requirement 1"", ""Requirement 2""]):
{{
  ""scenario_id"": 0,
  ""title"": """",
  ""description"": """",
  ""context"": {{
      ""users"": 0,
      ""traffic_pattern"": """",
      ""latency_requirement_ms"": 0,
      ""availability_slo"": """",
      ""consistency_model"": """",
      ""budget"": """",
      ""compliance"": [""string""],
      ""cloud_provider"": """",
      ""region_strategy"": """",
      ""request_rate"": 0,
      ""data_volume_gb"": 0,
      ""team_size"": 0,
      ""experience_level"": ""mixed"",
      ""search_complexity"": ""simple"",
      ""deployment_frequency"": ""weekly""
  }},
  ""non_functional_requirements"": [""string""]
}}
Output ONLY the JSON text. No Markdown formatting.
";
        var request = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
            new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", prompt) }
        );
        var responseStr = await _ollamaChatService.ChatAsync(request);
        
        responseStr = CleanJson(responseStr);

        try
        {
            var options = new JsonSerializerOptions
            {
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true,
                PropertyNameCaseInsensitive = true
            };
            return JsonSerializer.Deserialize<DesignRequirements>(responseStr, options);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse JSON: {ex.Message}\nContent: {responseStr}");
            return null;
        }
    }

    public async Task<ArchitectureDesign?> GenerateArchitectureAsync(string problemStatement, DesignRequirements requirements)
    {
        var reqJson = JsonSerializer.Serialize(requirements);
        var prompt = $@"
You are an expert Distributed Systems Architect. Given the requirements, generate a scalable architecture.
Problem: {problemStatement}
Requirements: {reqJson}

Provide the output strictly in valid JSON format with this structure:
{{
    ""database"": {{ ""choice"": """", ""justification"": """" }},
    ""cache"": {{ ""choice"": """", ""justification"": """" }},
    ""messaging"": {{ ""choice"": """", ""justification"": """" }},
    ""deployment"": {{ ""choice"": """", ""justification"": """" }},
    ""observability"": {{ ""choice"": """", ""justification"": """" }},
    ""security"": {{ ""choice"": """", ""justification"": """" }}
}}
Output ONLY the JSON. No Markdown formatting like ```json ... ```. Just the JSON text.
";
        var request = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
            new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", prompt) }
        );
        var responseStr = await _ollamaChatService.ChatAsync(request);
        
        responseStr = CleanJson(responseStr);

        try
        {
            var options = new JsonSerializerOptions
            {
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true,
                PropertyNameCaseInsensitive = true
            };
            return JsonSerializer.Deserialize<ArchitectureDesign>(responseStr, options);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse JSON: {ex.Message}\nContent: {responseStr}");
            return null;
        }
    }

    public async Task<ArchitectureDesign?> GenerateArchitectureWithRagAsync(DesignRequirements requirements)
    {
        try
        {
            // Set the model from settings
            requirements.Model = _settingsService.GetSettings().OllamaModel;

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync("http://localhost:8001/generate/rag", requirements);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<ArchitectureDesign>();
            }
            
            return null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<ArchitectureDesign?> GenerateHybridArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null)
    {
        // 1. Evaluate Rules
        var triggeredRules = _ruleEngineService.EvaluateRules(requirements).ToList();

        // 2. Prepare Context for LLM
        var ruleContextText = string.Join("\n", triggeredRules.Select(r => 
            $"- {r.Dimension}: {r.Recommendation} (Reason: {r.Justification})"));

        var prompt = $@"
You are an expert Distributed Systems Architect. Given the requirements and a set of deterministic architectural rules, generate a scalable architecture.
The rules act as foundational constraints or strong suggestions. Your task is to synthesize them into a cohesive design with additional professional insights.

Rule-Based Anchors:
{ruleContextText}

Problem: {problemStatement}
Requirements: {JsonSerializer.Serialize(requirements)}

Provide the output strictly in valid JSON format with this structure:
{{
    ""database"": {{ ""choice"": """", ""justification"": """" }},
    ""cache"": {{ ""choice"": """", ""justification"": """" }},
    ""messaging"": {{ ""choice"": """", ""justification"": """" }},
    ""deployment"": {{ ""choice"": """", ""justification"": """" }},
    ""observability"": {{ ""choice"": """", ""justification"": """" }},
    ""security"": {{ ""choice"": """", ""justification"": """" }}
}}
Output ONLY the JSON. No Markdown formatting.
";
        var request = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
            new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", prompt) }
        );
        
        var responseStr = await _ollamaChatService.ChatAsync(request);
        responseStr = CleanJson(responseStr);

        try
        {
            var options = new JsonSerializerOptions
            {
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true,
                PropertyNameCaseInsensitive = true
            };
            var architecture = JsonSerializer.Deserialize<ArchitectureDesign>(responseStr, options);

            // 3. Persist Session & Results
            if (architecture != null)
            {
                // Ensure we have a user (Mocked if null for demonstration)
                var activeUserId = userId ?? await GetOrCreateDefaultUserId();

                var session = new SystemDesignRecommenderApi.Domain.Data.Entities.DesignSession
                {
                    ProblemStatement = problemStatement,
                    UserId = activeUserId,
                    TeamId = teamId,
                    TriggeredRules = triggeredRules.Select(r => new SystemDesignRecommenderApi.Domain.Data.Entities.RuleTriggerRecord
                    {
                        Dimension = r.Dimension,
                        Condition = r.Condition,
                        Recommendation = r.Recommendation,
                        Justification = r.Justification
                    }).ToList()
                };

                _dbContext.Sessions.Add(session);
                await _dbContext.SaveChangesAsync();

                _dbContext.Requirements.Add(new SystemDesignRecommenderApi.Domain.Data.Entities.RequirementRecord
                {
                    SessionId = session.Id,
                    JsonData = JsonSerializer.Serialize(requirements)
                });

                _dbContext.Recommendations.Add(new SystemDesignRecommenderApi.Domain.Data.Entities.RecommendationResult
                {
                    SessionId = session.Id,
                    JsonData = responseStr
                });

                await _dbContext.SaveChangesAsync();
            }

            return architecture;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse JSON: {ex.Message}\nContent: {responseStr}");
            return null;
        }
    }

    public async Task<IEnumerable<DesignSessionDTO>> GetSessionHistoryAsync(Guid? userId = null, Guid? teamId = null)
    {
        var query = _dbContext.Sessions.AsQueryable();
        
        if (userId.HasValue) query = query.Where(s => s.UserId == userId.Value);
        if (teamId.HasValue) query = query.Where(s => s.TeamId == teamId.Value);

        return await query.OrderByDescending(s => s.CreatedAt)
            .Select(s => new DesignSessionDTO
            {
                Id = s.Id,
                CreatedAt = s.CreatedAt,
                Title = s.ProblemStatement.Length > 50 ? s.ProblemStatement.Substring(0, 47) + "..." : s.ProblemStatement
            }).ToListAsync();
    }

    private async Task<Guid> GetOrCreateDefaultUserId()
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync();
        if (user == null)
        {
            user = new SystemDesignRecommenderApi.Domain.Data.Entities.User
            {
                Username = "default_architect",
                Email = "architect@example.com"
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
        }
        return user.Id;
    }

    private string CleanJson(string rawJson)
    {
        // Remove Markdown code fences if present
        var responseStr = rawJson.Trim();
        if (responseStr.Contains("```json"))
        {
            int start = responseStr.IndexOf("```json") + 7;
            int end = responseStr.LastIndexOf("```");
            if (end > start) responseStr = responseStr.Substring(start, end - start).Trim();
        }
        else if (responseStr.Contains("```"))
        {
            int start = responseStr.IndexOf("```") + 3;
            int end = responseStr.LastIndexOf("```");
            if (end > start) responseStr = responseStr.Substring(start, end - start).Trim();
        }

        // Extract the first valid JSON object
        int firstBrace = responseStr.IndexOf('{');
        int lastBrace = responseStr.LastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace)
        {
            responseStr = responseStr.Substring(firstBrace, (lastBrace - firstBrace) + 1).Trim();
        }

        // Remove any line that does not start with a valid JSON character
        var lines = responseStr.Split('\n');
        var jsonLines = lines.Where(line =>
        {
            var trimmed = line.TrimStart();
            return trimmed.StartsWith("\"") ||
                   trimmed.StartsWith("{") ||
                   trimmed.StartsWith("}") ||
                   trimmed.StartsWith("[") ||
                   trimmed.StartsWith("]") ||
                   trimmed.StartsWith(",") ||
                   trimmed.StartsWith(":") ||
                   string.IsNullOrWhiteSpace(trimmed);
        });
        var cleaned = string.Join("\n", jsonLines);

        // Remove any trailing commas before closing braces/brackets (invalid in strict JSON)
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @",(\s*[}\]])", "$1");

        return cleaned;
    }
}
