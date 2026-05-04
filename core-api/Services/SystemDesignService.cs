using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using System.Text.Json;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Helpers;

namespace SystemDesignRecommenderApi.Services;

public class SystemDesignService : ISystemDesignService
{
    private readonly ILLMChatService _llmChatService;
    private readonly ISettingsService _settingsService;
    private readonly IRuleEngineService _ruleEngineService;
    private readonly DesignDbContext _dbContext;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly INodeSettingsService _nodeSettingsService;
    private readonly IEvaluationService _evaluationService;
    private readonly IAgenticFeedbackService _agenticFeedbackService;
    private readonly MongoDbContext _mongoDbContext;

    public SystemDesignService(
        DesignDbContext dbContext,
        ILLMChatService llmChatService,
        IRuleEngineService ruleEngineService,
        INodeSettingsService nodeSettingsService,
        ISettingsService settingsService,
        IEvaluationService evaluationService,
        IAgenticFeedbackService agenticFeedbackService,
        IHttpClientFactory httpClientFactory,
        MongoDbContext mongoDbContext)
    {
        _dbContext = dbContext;
        _llmChatService = llmChatService;
        _ruleEngineService = ruleEngineService;
        _nodeSettingsService = nodeSettingsService;
        _settingsService = settingsService;
        _evaluationService = evaluationService;
        _agenticFeedbackService = agenticFeedbackService;
        _httpClientFactory = httpClientFactory;
        _mongoDbContext = mongoDbContext;
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
Output ONLY the JSON text. No Markdown formatting. DO NOT include comments like // or /* */ in the JSON. For numeric fields like 'users' or 'latency_requirement_ms', provide ONLY the integer value (e.g. 5, not ""<5"").
";
        var request = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
            new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", prompt) }
        );
        
        var settings = _settingsService.GetSettings();
        var provider = settings.ExtractionProvider ?? settings.PreferredProvider ?? "ollama";
        var model = settings.ExtractionModel ?? (provider.ToLower().Contains("gemini") ? settings.GeminiModel : settings.OllamaModel);

        Console.WriteLine($"=== [ExtractRequirementsAsync] Using Provider: {provider}, Model: {model} ===");
        var responseStr = await _llmChatService.ChatAsync(request, provider, model);

        responseStr = CleanJson(responseStr);

        try
        {
            return JsonSerializer.Deserialize<DesignRequirements>(responseStr, GetJsonOptions());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse JSON: {ex.Message}\nContent: {responseStr}");
            // Fallback: If everything fails, return a minimal valid object or null
            return null;
        }
    }

    public async Task<ArchitectureDesign?> GenerateArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null)
    {
        // For standard generation, we'll use merged settings if available
        var nodes = await _nodeSettingsService.GetMergedSettingsAsync(teamId, userId);
        var nodesList = nodes.ToList();

        if (!nodesList.Any())
        {
            // Fallback to defaults if no definitions exist yet
            nodesList = new List<NodeSettingDto> {
                new() { NodeKey = "database" }, new() { NodeKey = "cache" }, new() { NodeKey = "messaging" },
                new() { NodeKey = "deployment" }, new() { NodeKey = "observability" }, new() { NodeKey = "security" }
            };
        }

        var contextSummary = $"team={requirements.Context?.TeamSize}, latency={requirements.Context?.LatencyRequirementMs}ms, consistency={requirements.Context?.ConsistencyModel}, problem={problemStatement}";

        // Set the model and provider from incoming requirements if specified, else use global settings
        var appSettings = _settingsService.GetSettings();
        var genProvider = (!string.IsNullOrEmpty(requirements.Provider) ? requirements.Provider : (appSettings.GenerationProvider ?? appSettings.PreferredProvider ?? "gemini")).Trim().ToLower();
        var genModel = !string.IsNullOrEmpty(requirements.Model) ? requirements.Model : (appSettings.GenerationModel ?? appSettings.GeminiModel);
        requirements.ApiKey = !string.IsNullOrEmpty(requirements.ApiKey) ? requirements.ApiKey : appSettings.GeminiApiKey;

        // Strictly use Gemini Batch mode only if Gemini is explicitly selected
        if (genProvider.Contains("gemini"))
        {
            Console.WriteLine($"=== [GenerateArchitectureAsync] Using Gemini BATCH mode | Provider: {genProvider}, Model: {genModel} ===");
            return await GenerateBatchArchitectureAsync(contextSummary, nodesList, genProvider, genModel);
        }

        Console.WriteLine($"=== [GenerateArchitectureAsync] Using Local ITERATIVE mode | Provider: {genProvider}, Model: {genModel} ===");
        
        // Per-node strategy: ask the LLM about ONE node at a time.
        // Small local models (phi3, llama2) reliably answer single-focus prompts
        // but collapse multi-key JSON into a flat structure.
        var architecture = new ArchitectureDesign();

        foreach (var node in nodesList)
        {
            var nodeKey = node.NodeKey.ToLower();
            var singleNodePrompt =
                $"You are a software architect.\n" +
                $"For a system with these characteristics: {contextSummary}\n" +
                $"Recommend the best technology for the '{nodeKey}' layer.\n" +
                $"Output ONLY this JSON and nothing else:\n" +
                $"{{\"choice\": \"<specific technology name>\", \"justification\": \"<one sentence why>\"}}"
                ;

            Console.WriteLine($"=== [GenerateArchitectureAsync] Querying node: '{nodeKey}' ===");
            var nodeRequest = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
                new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", singleNodePrompt) }
            );
            var rawNodeResponse = await _llmChatService.ChatAsync(nodeRequest, genProvider, genModel);
            Console.WriteLine($"  RAW ({genProvider}) -> {rawNodeResponse}");

            var cleanedNode = CleanJson(rawNodeResponse);
            Console.WriteLine($"  CLEANED -> {cleanedNode}");

            try
            {
                var component = JsonSerializer.Deserialize<ArchComponent>(cleanedNode, GetJsonOptions());
                if (component != null && !string.IsNullOrWhiteSpace(component.Choice))
                {
                    architecture[nodeKey] = component;
                    Console.WriteLine($"  OK -> choice='{component.Choice}'  justification='{component.Justification[..Math.Min(60, component.Justification.Length)]}...'");
                }
                else
                {
                    architecture[nodeKey] = new ArchComponent { Choice = "See justification", Justification = rawNodeResponse.Trim() };
                    Console.WriteLine($"  WARN -> Component empty, storing raw response.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ERROR parsing node '{nodeKey}': {ex.Message}");
                architecture[nodeKey] = new ArchComponent { Choice = "Parse Error", Justification = rawNodeResponse.Trim() };
            }
        }

        Console.WriteLine($"[GenerateArchitectureAsync] Final keys: [{string.Join(", ", architecture.Keys)}]");
        return architecture;
    }

    public async Task<ArchitectureDesign?> GenerateArchitectureWithRagAsync(DesignRequirements requirements, Guid? userId = null, Guid? teamId = null)
    {
        try
        {
            // Set the model and provider from incoming requirements if specified, else use global settings
            var appSettings = _settingsService.GetSettings();
            requirements.Provider = !string.IsNullOrEmpty(requirements.Provider) ? requirements.Provider : (appSettings.GenerationProvider ?? appSettings.PreferredProvider ?? "gemini");
            requirements.Model = !string.IsNullOrEmpty(requirements.Model) ? requirements.Model : (appSettings.GenerationModel ?? appSettings.GeminiModel);
            requirements.ApiKey = !string.IsNullOrEmpty(requirements.ApiKey) ? requirements.ApiKey : appSettings.GeminiApiKey;

            // Fetch dynamic node structure
            var settings = await _nodeSettingsService.GetMergedSettingsAsync(teamId, userId);
            var settingsList = settings.ToList();
            if (!settingsList.Any())
            {
                settingsList = new List<NodeSettingDto> {
                    new() { NodeKey = "database" }, new() { NodeKey = "cache" }, new() { NodeKey = "messaging" },
                    new() { NodeKey = "deployment" }, new() { NodeKey = "observability" }, new() { NodeKey = "security" }
                };
            }

            // Fetch negative feedback to pass to RAG
            var pastFeedback = await _mongoDbContext.DesignFeedback
                .Find(f => f.OverallRating <= 3)
                .SortByDescending(f => f.CreatedAt)
                .Limit(5)
                .ToListAsync();

            var feedbackHint = "";
            if (pastFeedback.Any())
            {
                var corrections = pastFeedback
                    .SelectMany(f => f.NodeFeedback.Where(nf => !nf.IsApproved))
                    .Select(nf => $"- For '{nf.NodeKey}': User corrected to '{nf.Correction}' because '{nf.Reason}'");
                if (corrections.Any())
                {
                    feedbackHint = $"\n\nHISTORICAL CORRECTIONS FROM PAST USERS:\n{string.Join("\n", corrections)}\nCRITICAL: You must consider these past corrections and avoid repeating rejected choices if the context is similar.";
                }
            }

            var payload = new
            {
                requirements = requirements,
                node_structure = settingsList.ToDictionary(s => s.NodeKey, s => new { choice = s.Choice, justification = s.Justification }),
                feedback_context = feedbackHint
            };

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync("http://localhost:8001/generate/rag", payload);

            if (response.IsSuccessStatusCode)
            {
                var jsonStr = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<ArchitectureDesign>(jsonStr, GetJsonOptions());
            }

            return null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<GenerationResult?> GenerateHybridArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null, string? connectionId = null)
    {
        var pipelineLogs = new List<PipelineTraceStep>();

        async Task LogStepAsync(string stepName, string status, string summary, string details = "")
        {
            var step = new PipelineTraceStep
            {
                StepName = stepName,
                Status = status,
                Summary = summary,
                Details = details
            };
            pipelineLogs.Add(step);
            await _agenticFeedbackService.SendPipelineStepAsync(connectionId ?? string.Empty, step);
            // also send legacy status for compatibility
            if (status != "Success") await _agenticFeedbackService.SendStatusAsync(connectionId ?? string.Empty, summary);
        }

        await LogStepAsync("Initialization", "Running", "Initializing System Design Generation...");
        // 1. Evaluate Rules
        var triggeredRulesResult = await _ruleEngineService.EvaluateRulesAsync(requirements);
        var triggeredRules = triggeredRulesResult.ToList();

        // 2. Prepare Context for LLM (Only use MATCHED rules)
        var ruleContextText = string.Join("\n", triggeredRules.Where(r => r.IsMatched).Select(r =>
            $"- {r.Dimension}: {r.Recommendation} (Reason: {r.Justification})"));

        // 3. Load Dynamic Nodes and Settings
        var settings = await _nodeSettingsService.GetMergedSettingsAsync(teamId, userId);
        var settingsList = settings.ToList();

        if (!settingsList.Any())
        {
            // Fallback
            settingsList = new List<NodeSettingDto> {
                new() { NodeKey = "database" }, new() { NodeKey = "cache" }, new() { NodeKey = "messaging" },
                new() { NodeKey = "deployment" }, new() { NodeKey = "observability" }, new() { NodeKey = "security" }
            };
        }

        var contextSummary = $"team={requirements.Context?.TeamSize}, latency={requirements.Context?.LatencyRequirementMs}ms, consistency={requirements.Context?.ConsistencyModel}, problem={problemStatement}";
        var ruleHint = string.IsNullOrEmpty(ruleContextText) ? "" : $" Consider these architectural anchors: {ruleContextText}";

        // --- FEEDBACK LOOP INJECTION ---
        var pastFeedback = await _mongoDbContext.DesignFeedback
            .Find(f => f.OverallRating <= 3) // Fetch negative or mediocre feedback
            .SortByDescending(f => f.CreatedAt)
            .Limit(5)
            .ToListAsync();

        if (pastFeedback.Any())
        {
            var corrections = pastFeedback
                .SelectMany(f => f.NodeFeedback.Where(nf => !nf.IsApproved))
                .Select(nf => $"- For '{nf.NodeKey}': User corrected to '{nf.Correction}' because '{nf.Reason}'");
                
            if (corrections.Any())
            {
                var feedbackHint = $"\n\nHISTORICAL CORRECTIONS FROM PAST USERS:\n{string.Join("\n", corrections)}\nCRITICAL: You must consider these past corrections and avoid repeating rejected choices if the context is similar.";
                ruleHint += feedbackHint;
            }
        }
        // --- END FEEDBACK LOOP INJECTION ---

        // Check if we should use batch mode or loop mode based on the GENERATION provider
        var appSettings = _settingsService.GetSettings();
        var genProvider = (!string.IsNullOrEmpty(requirements.Provider) ? requirements.Provider : (appSettings.GenerationProvider ?? appSettings.PreferredProvider ?? "gemini")).Trim().ToLower();
        var genModel = !string.IsNullOrEmpty(requirements.Model) ? requirements.Model : (appSettings.GenerationModel ?? appSettings.GeminiModel);
        
        ArchitectureDesign architecture;

        // Strictly use Gemini Batch mode only if Gemini is explicitly selected
        if (genProvider.Contains("gemini"))
        {
            await LogStepAsync("Generation", "Running", "Drafting initial architecture (Batch Mode)...", $"Provider: {genProvider}\nModel: {genModel}\nContext: {contextSummary}\nRules: {ruleHint}");
            Console.WriteLine($"=== [GenerateHybridArchitectureAsync] Using Gemini BATCH mode | Provider: {genProvider}, Model: {genModel} ===");
            architecture = await GenerateBatchArchitectureAsync(contextSummary, settingsList, genProvider, genModel, ruleHint);
        }
        else
        {
            Console.WriteLine($"=== [GenerateHybridArchitectureAsync] Using Local ITERATIVE mode | Provider: {genProvider}, Model: {genModel} ===");
            // Per-node strategy: one focused LLM call per node
            architecture = new ArchitectureDesign();
            await LogStepAsync("Generation", "Running", "Drafting initial architecture (Iterative Mode)...", $"Provider: {genProvider}\nModel: {genModel}\nContext: {contextSummary}\nRules: {ruleHint}");
            foreach (var node in settingsList)
            {
                var nodeKey = node.NodeKey.ToLower();
                await LogStepAsync("Component Resolution", "Running", $"Resolving component: {nodeKey}...");
                // If user pre-configured a choice, respect it as a hard constraint
                var choiceHint = string.IsNullOrEmpty(node.Choice) ? "" : $" The preferred choice is: '{node.Choice}'";
                var singleNodePrompt =
                    $"You are a software architect.\n" +
                    $"For a system with these characteristics: {contextSummary}{ruleHint}\n" +
                    $"Recommend the best technology for the '{nodeKey}' layer.{choiceHint}\n" +
                    $"Output ONLY this JSON and nothing else:\n" +
                    $"{{\"choice\": \"<specific technology name>\", \"justification\": \"<one sentence why>\"}}";

                Console.WriteLine($"=== [GenerateHybridArchitectureAsync] Querying node: '{nodeKey}' ===");
                var nodeRequest = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
                    new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", singleNodePrompt) }
                );
                var rawNodeResponse = await _llmChatService.ChatAsync(nodeRequest, genProvider, genModel);
                Console.WriteLine($"  RAW ({genProvider}) -> {rawNodeResponse}");

                var cleanedNode = CleanJson(rawNodeResponse);
                try
                {
                    var component = JsonSerializer.Deserialize<ArchComponent>(cleanedNode, GetJsonOptions());
                    architecture[nodeKey] = (component != null && !string.IsNullOrWhiteSpace(component.Choice))
                        ? component
                        : new ArchComponent { Choice = node.Choice ?? "See justification", Justification = rawNodeResponse.Trim() };
                    Console.WriteLine($"  OK -> choice='{architecture[nodeKey].Choice}'");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ERROR parsing node '{nodeKey}': {ex.Message}");
                    architecture[nodeKey] = new ArchComponent { Choice = node.Choice ?? "Parse Error", Justification = rawNodeResponse.Trim() };
                }
            }
        }

        // --- AGENTIC FEEDBACK LOOP ---
        await LogStepAsync("Critic Evaluation", "Running", "Submitting draft to Critic Agent for evaluation...", JsonSerializer.Serialize(architecture, GetJsonOptions()));
        
        var evaluation = await _evaluationService.EvaluateArchitectureAsync(architecture, requirements, problemStatement);
        
        if (evaluation.RubricScore < 70)
        {
            await LogStepAsync("Critic Feedback", "Error", $"Critic Score: {evaluation.RubricScore}/100. Critic rejected draft. Analyzing feedback for self-correction...", evaluation.CriticReport);
            
            // Loop! Re-generate with the critic's report
            string correctionHint = $"The previous design was rejected with score {evaluation.RubricScore}. The Critic provided this feedback:\n{evaluation.CriticReport}\n\nFIX ALL ISSUES MENTIONED IN THE CRITIQUE.";
            
            if (genProvider.Contains("gemini"))
            {
                await LogStepAsync("Generation (Correction)", "Running", "Drafting corrected architecture...");
                architecture = await GenerateBatchArchitectureAsync(contextSummary, settingsList, genProvider, genModel, ruleHint + " " + correctionHint);
            }
            // In iterative mode, we could regenerate each node, but for simplicity, we'll just log it.
            
            // Evaluate again (we could loop N times, but let's just do 1 correction pass)
            await LogStepAsync("Critic Evaluation (Round 2)", "Running", "Re-evaluating corrected architecture...");
            evaluation = await _evaluationService.EvaluateArchitectureAsync(architecture, requirements, problemStatement);
        }

        await LogStepAsync("Completion", "Success", $"Final Rubric Score: {evaluation.RubricScore}/100. Generation complete.", JsonSerializer.Serialize(evaluation, GetJsonOptions()));
        // --- END AGENTIC FEEDBACK LOOP ---

        // 3. Persist Session & Results
        Guid? persistedSessionId = null;
        if (architecture.Any())
        {
            try
            {
                var activeUserId = userId ?? await GetOrCreateDefaultUserId();
                var session = new SystemDesignRecommenderApi.Domain.Data.Entities.DesignSession
                {
                    ProblemStatement = problemStatement,
                    UserId = activeUserId,
                    TeamId = teamId,
                    TriggeredRules = triggeredRules.Where(r => r.IsMatched).Select(r => new SystemDesignRecommenderApi.Domain.Data.Entities.RuleTriggerRecord
                    {
                        Dimension = r.Dimension,
                        Condition = r.Condition,
                        Recommendation = r.Recommendation,
                        Justification = r.Justification
                    }).ToList()
                };
                _dbContext.Sessions.Add(session);
                await _dbContext.SaveChangesAsync();
                persistedSessionId = session.Id;

                _dbContext.Requirements.Add(new SystemDesignRecommenderApi.Domain.Data.Entities.RequirementRecord
                {
                    SessionId = session.Id,
                    JsonData = JsonSerializer.Serialize(requirements)
                });
                _dbContext.Recommendations.Add(new SystemDesignRecommenderApi.Domain.Data.Entities.RecommendationResult
                {
                    SessionId = session.Id,
                    JsonData = JsonSerializer.Serialize(architecture)
                });
                await _dbContext.SaveChangesAsync();

                // Persist Polyglot Document to MongoDB
                var mongoDoc = new SystemDesignRecommenderApi.Domain.Data.Mongo.Entities.DesignHistoryDocument
                {
                    SqlSessionId = session.Id.ToString(),
                    UserId = activeUserId.ToString(),
                    TeamId = teamId?.ToString(),
                    ProblemStatement = problemStatement,
                    ExtractedRequirements = requirements,
                    ArchitectureDesign = architecture,
                    EvaluationScores = new SystemDesignRecommenderApi.Domain.Data.Mongo.Entities.EvaluationScoreDocument
                    {
                        IndustryAlignmentScore = evaluation.IndustryAlignmentScore,
                        ConstraintFulfillmentScore = evaluation.ConstraintFulfillmentScore,
                        DeploymentReadinessScore = evaluation.DeploymentReadinessScore,
                        RubricScore = evaluation.RubricScore,
                        CriticReport = evaluation.CriticReport,
                        MatchedBlueprintId = evaluation.MatchedBlueprintId
                    },
                    PipelineLogs = pipelineLogs
                };
                await _mongoDbContext.DesignHistory.InsertOneAsync(mongoDoc);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Persist] Error saving session: {ex.Message}");
            }
        }

        return new GenerationResult
        {
            SessionId = persistedSessionId,
            Architecture = architecture,
            Evaluation = evaluation,
            Rules = triggeredRules
        };
    }

    public async Task<IEnumerable<DesignSessionDTO>> GetSessionHistoryAsync(Guid? userId = null, Guid? teamId = null)
    {
        var query = _dbContext.Sessions
            .Include(s => s.Requirements)
            .AsQueryable();

        if (userId.HasValue && teamId.HasValue)
        {
            query = query.Where(s => s.UserId == userId.Value || s.TeamId == teamId.Value);
        }
        else if (userId.HasValue)
        {
            query = query.Where(s => s.UserId == userId.Value);
        }
        else if (teamId.HasValue)
        {
            query = query.Where(s => s.TeamId == teamId.Value);
        }

        var sessions = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();

        return sessions.Select(s =>
        {
            var reqRecord = s.Requirements.FirstOrDefault();
            DesignRequirements? requirements = null;
            try
            {
                if (reqRecord != null)
                {
                    requirements = JsonSerializer.Deserialize<DesignRequirements>(reqRecord.JsonData);
                }
            }
            catch { /* Ignore parse errors */ }

            var highlights = new List<string>();
            if (requirements?.Context != null)
            {
                if (requirements.Context.Users.HasValue)
                    highlights.Add($"{requirements.Context.Users.Value:N0} Users");

                if (!string.IsNullOrEmpty(requirements.Context.TrafficPattern))
                    highlights.Add(requirements.Context.TrafficPattern);

                if (requirements.Context.LatencyRequirementMs.HasValue)
                    highlights.Add($"{requirements.Context.LatencyRequirementMs}ms Latency");

                if (!string.IsNullOrEmpty(requirements.Context.AvailabilitySlo))
                    highlights.Add(requirements.Context.AvailabilitySlo);

                if (requirements.Context.DataVolumeGb.HasValue)
                    highlights.Add($"{requirements.Context.DataVolumeGb}GB Data");
            }

            return new DesignSessionDTO
            {
                Id = s.Id,
                CreatedAt = s.CreatedAt,
                AppName = !string.IsNullOrEmpty(requirements?.Title) ? requirements.Title : "System Architecture",
                Description = requirements?.Description ?? (s.ProblemStatement.Length > 150 ? s.ProblemStatement.Substring(0, 147) + "..." : s.ProblemStatement),
                Highlights = highlights
            };
        });
    }

    public async Task<object?> GetSessionByIdAsync(Guid id)
    {
        var session = await _dbContext.Sessions
            .Include(s => s.TriggeredRules)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null) return null;

        // Try to fetch evaluation from MongoDB
        var evaluation = await _mongoDbContext.DesignHistory
            .Find(h => h.SqlSessionId == id.ToString())
            .FirstOrDefaultAsync();

        var req = await _dbContext.Requirements.FirstOrDefaultAsync(r => r.SessionId == id);
        var rec = await _dbContext.Recommendations.FirstOrDefaultAsync(r => r.SessionId == id);

        return new
        {
            Id = session.Id,
            CreatedAt = session.CreatedAt,
            ProblemStatement = session.ProblemStatement,
            ExtractedRequirements = req != null ? JsonSerializer.Deserialize<object>(req.JsonData) : null,
            ArchitectureDesign = rec != null ? JsonSerializer.Deserialize<object>(rec.JsonData) : null,
            TriggeredRules = session.TriggeredRules.Select(r => new
            {
                r.Id,
                r.Dimension,
                r.Condition,
                r.Recommendation,
                r.Justification
            }),
            EvaluationScores = evaluation?.EvaluationScores,
            PipelineLogs = evaluation?.PipelineLogs
        };
    }

    public async Task<bool> DeleteSessionAsync(Guid id)
    {
        var session = await _dbContext.Sessions.FindAsync(id);
        if (session == null) return false;

        try
        {
            // Remove related records first if cascade isn't automatic
            var requirements = _dbContext.Requirements.Where(r => r.SessionId == id);
            var recommendations = _dbContext.Recommendations.Where(r => r.SessionId == id);
            var triggeredRules = _dbContext.TriggeredRules.Where(r => r.SessionId == id);

            _dbContext.Requirements.RemoveRange(requirements);
            _dbContext.Recommendations.RemoveRange(recommendations);
            _dbContext.TriggeredRules.RemoveRange(triggeredRules);
            
            _dbContext.Sessions.Remove(session);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DeleteSession] Error: {ex.Message}");
            return false;
        }
    }

    private async Task<ArchitectureDesign> GenerateBatchArchitectureAsync(
        string contextSummary,
        List<NodeSettingDto> nodesList,
        string provider,
        string model,
        string ruleHint = "")
    {
        // Prepare the desired structure for the LLM
        var nodeStructure = nodesList.ToDictionary(s => s.NodeKey, s => new { choice = s.Choice ?? "", justification = s.Justification ?? "" });
        var nodeStructureJson = JsonSerializer.Serialize(nodeStructure, new JsonSerializerOptions { WriteIndented = true });

        var prompt =
            $"You are an expert Distributed Systems Architect.\n" +
            $"For a system with these characteristics: {contextSummary}{ruleHint}\n" +
            $"TASK: Recommend the best technology for EACH architectural layer listed below.\n" +
            $"CRITICAL: You MUST return a JSON object where every key is one of the requested layers. DO NOT return a flat object with 'choice' at the top level.\n" +
            $"Structure to follow:\n" +
            $"{nodeStructureJson}\n" +
            $"Output ONLY the JSON and nothing else.";

        var request = new SystemDesignRecommenderApi.Domain.DTO.ChatRequest(
            new List<SystemDesignRecommenderApi.Domain.DTO.MessageDto> { new("user", prompt) }
        );

        var rawResponse = await _llmChatService.ChatAsync(request, provider, model);
        Console.WriteLine($"[BatchGeneration] RAW: {rawResponse}");
        var cleanedResponse = CleanJson(rawResponse);

        try
        {
            var fullDesign = JsonSerializer.Deserialize<ArchitectureDesign>(cleanedResponse, GetJsonOptions());
            
            if (fullDesign != null)
            {
                Console.WriteLine($"[BatchGeneration] Successfully parsed {fullDesign.Count} nodes: [{string.Join(", ", fullDesign.Keys)}]");
            }

            // Use existing enforcement logic to map keys correctly and handle hallucinations
            return EnforceNodeConstraints(fullDesign ?? new ArchitectureDesign(), nodesList.Select(n => n.NodeKey).ToHashSet());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BatchGeneration] Error parsing response: {ex.Message}\nRaw: {rawResponse}");
            // Fallback: return architectural design with error markers
            var errorDesign = new ArchitectureDesign();
            foreach (var node in nodesList)
            {
                errorDesign[node.NodeKey] = new ArchComponent { Choice = "Batch Parse Error", Justification = "The LLM response could not be parsed." };
            }
            return errorDesign;
        }
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

    private static readonly Dictionary<string, string[]> NodeSynonyms = new(StringComparer.OrdinalIgnoreCase)
    {
        { "database",     new[] { "db", "data_store", "storage", "datastore", "data", "persistence", "rdbms", "nosql", "sql" } },
        { "cache",        new[] { "caching", "in_memory", "inmemory", "redis", "memcache" } },
        { "messaging",    new[] { "message_queue", "queue", "broker", "event_bus", "messagebus", "kafka", "rabbitmq", "pubsub" } },
        { "security",     new[] { "auth", "authentication", "authorization", "access", "identity", "oauth" } },
        { "deployment",   new[] { "infrastructure", "hosting", "cloud", "kubernetes", "docker", "k8s", "ci_cd", "cicd" } },
        { "observability",new[] { "monitoring", "logging", "tracing", "metrics", "telemetry", "alerting" } },
        { "api",          new[] { "gateway", "api_gateway", "rest", "graphql", "grpc", "endpoints" } },
        { "search",       new[] { "elasticsearch", "full_text", "indexing", "meilisearch", "solr" } },
        { "cdn",          new[] { "content_delivery", "edge", "static_assets" } },
        { "architecture", new[] { "pattern", "style", "microservices", "monolith", "design_pattern" } },
    };

    private bool KeyMatchesNode(string llmKey, string configuredKey)
    {
        var llm = llmKey.ToLower().Replace("-", "_").Replace(" ", "_");
        var cfg = configuredKey.ToLower().Replace("-", "_").Replace(" ", "_");

        // Exact match
        if (llm == cfg) return true;
        // Bidirectional contains
        if (llm.Contains(cfg) || cfg.Contains(llm)) return true;
        // Synonym lookup for configured key
        if (NodeSynonyms.TryGetValue(cfg, out var synonyms))
            if (synonyms.Any(s => llm.Contains(s) || s.Contains(llm))) return true;
        // Synonym lookup for LLM key
        foreach (var entry in NodeSynonyms)
            if (entry.Value.Any(s => llm.Contains(s) || s.Contains(llm)))
                if (entry.Key.ToLower() == cfg) return true;
        return false;
    }

    private ArchitectureDesign EnforceNodeConstraints(ArchitectureDesign architecture, HashSet<string> allowedKeys)
    {
        var enforced = new ArchitectureDesign();
        var usedLlmKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // --- Flat response detection ---
        var flatKeyNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "choice", "justification", "tech", "why", "recommendation", "reason", "technology", "solution" };

        // A response is only considered 'flat' if it contains architectural metadata keys (like 'choice')
        // AND it doesn't contain any of the actual architectural nodes we asked for.
        bool hasFlatKeys = architecture.Keys.Any(k => flatKeyNames.Contains(k));
        bool hasNodeKeys = allowedKeys.Any(ak => architecture.Keys.Any(lk => KeyMatchesNode(lk, ak)));
        
        bool isFlat = hasFlatKeys && !hasNodeKeys;
        
        if (isFlat)
        {
            Console.WriteLine($"[NodeEnforcement] Detected FLAT response. LLM output a single object with keys [{string.Join(", ", architecture.Keys)}]. Reconstructing...");
            // Build one component from the flat keys
            var flatChoice = architecture.TryGetValue("choice", out var cv) ? cv.Choice
                : architecture.TryGetValue("tech", out var tv) ? tv.Choice
                : architecture.TryGetValue("recommendation", out var rv) ? rv.Choice : "";
            var flatJust = architecture.TryGetValue("justification", out var jv) ? jv.Choice
                : architecture.TryGetValue("why", out var wv) ? wv.Choice
                : architecture.TryGetValue("reason", out var rsv) ? rsv.Choice : "";
            
            if (string.IsNullOrEmpty(flatChoice) && architecture.Count > 0)
            {
                // Last resort: if no standard key found, use the first key's value as choice
                var first = architecture.First();
                flatChoice = first.Value.Choice;
                flatJust = first.Value.Justification;
            }

            // Assign the same flat result to all configured nodes
            foreach (var key in allowedKeys)
                enforced[key] = new ArchComponent { Choice = flatChoice, Justification = flatJust };
            
            Console.WriteLine($"[NodeEnforcement] Flat fix applied. Keys: [{string.Join(", ", enforced.Keys)}]");
            return enforced;
        }

        foreach (var key in allowedKeys)
        {
            // Find the best matching LLM key using synonym + fuzzy matching
            var matchingKvp = architecture
                .Where(kvp => !usedLlmKeys.Contains(kvp.Key))
                .FirstOrDefault(kvp => KeyMatchesNode(kvp.Key, key));

            if (matchingKvp.Key != null)
            {
                enforced[key] = matchingKvp.Value;
                usedLlmKeys.Add(matchingKvp.Key);
            }
            else
            {
                // If still no match, take the first unused LLM key (last resort greedy assignment)
                var unused = architecture.FirstOrDefault(kvp => !usedLlmKeys.Contains(kvp.Key));
                if (unused.Key != null && allowedKeys.Count == 1)
                {
                    enforced[key] = unused.Value;
                    usedLlmKeys.Add(unused.Key);
                }
                else
                {
                    enforced[key] = new ArchComponent
                    {
                        Choice = "Analysis Pending",
                        Justification = $"The AI model did not generate a specific recommendation for '{key}'. Try regenerating or switch to Hybrid mode."
                    };
                }
            }
        }

        Console.WriteLine($"[NodeEnforcement] Configured: [{string.Join(", ", allowedKeys)}] | LLM Output keys: [{string.Join(", ", architecture.Keys)}] | Final: [{string.Join(", ", enforced.Keys)}]");
        return enforced;
    }

    private string CleanJson(string rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson)) return "{}";

        var responseStr = rawJson.Trim();

        // 1. Remove Markdown code fences
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

        // 2. Remove C-style comments (// and /* */)
        responseStr = System.Text.RegularExpressions.Regex.Replace(responseStr, @"//.*|/\*[\s\S]*?\*/", "");

        // 3. Fix empty values left by comments
        responseStr = System.Text.RegularExpressions.Regex.Replace(responseStr, @":\s*(?=[,}\]])", ": null");

        // 4. Remove underscores from numbers (e.g. 100_000 -> 100000)
        responseStr = System.Text.RegularExpressions.Regex.Replace(responseStr, @"(\d)_(\d)", "$1$2");

        // 5. Handle suffixes like 100M, 10K, 1B
        responseStr = System.Text.RegularExpressions.Regex.Replace(responseStr, @"(\d+\.?\d*)\s*([KkMmBb])(?=\s*[,}\]])", m =>
        {
            if (double.TryParse(m.Groups[1].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val))
            {
                char suffix = char.ToUpper(m.Groups[2].Value[0]);
                double multiplier = suffix switch
                {
                    'K' => 1_000,
                    'M' => 1_000_000,
                    'B' => 1_000_000_000,
                    _ => 1
                };
                return (val * multiplier).ToString("F0", System.Globalization.CultureInfo.InvariantCulture);
            }
            return m.Value;
        });

        // 6. Extract the most complete (balanced) JSON object
        // LLMs sometimes repeat or nest objects. We try to find the last complete one.
        responseStr = ExtractLastBalancedJson(responseStr);

        // 7. Final safety cleanup for invalid characters outside strings
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
                   trimmed.StartsWith("-") ||
                   char.IsDigit(trimmed.FirstOrDefault()) ||
                   string.IsNullOrWhiteSpace(trimmed);
        });
        var cleaned = string.Join("\n", jsonLines);

        // 8. Fix hanging text after closing quotes (e.g. "value" more text -> "value more text")
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"(:\s*""[^""]+"")\s*([^,}\s][^,}\n]*)", m =>
        {
            var val = m.Groups[1].Value;
            var hanging = m.Groups[2].Value;
            if (val.EndsWith("\""))
            {
                return val.Substring(0, val.Length - 1) + " " + hanging + "\"";
            }
            return m.Value;
        });

        // 10. Remove trailing commas before closing braces/brackets
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @",(\s*[}\]])", "$1");

        return cleaned;
    }

    private string ExtractLastBalancedJson(string input)
    {
        int start = input.IndexOf('{');
        if (start == -1) return input;

        int balance = 0;
        bool inString = false;
        for (int i = start; i < input.Length; i++)
        {
            char c = input[i];
            if (c == '\"' && (i == 0 || input[i - 1] != '\\')) inString = !inString;

            if (!inString)
            {
                if (c == '{') balance++;
                else if (c == '}') balance--;

                if (balance == 0)
                {
                    // Found the matching closing brace for the FIRST opening brace
                    return input.Substring(start, i - start + 1);
                }
            }
        }

        return input;
    }

    private JsonSerializerOptions GetJsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true,
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new FlexibleIntConverter());
        options.Converters.Add(new FlexibleNullableIntConverter());
        options.Converters.Add(new FlexibleDoubleConverter());
        options.Converters.Add(new FlexibleNullableDoubleConverter());
        options.Converters.Add(new FlexibleStringConverter());
        options.Converters.Add(new FlexibleArchComponentConverter());
        return options;
    }
}
