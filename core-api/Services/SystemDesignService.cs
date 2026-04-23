using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Helpers;
using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services;

public class SystemDesignService : ISystemDesignService
{
    private readonly ILLMChatService _llmChatService;
    private readonly ISettingsService _settingsService;
    private readonly IRuleEngineService _ruleEngineService;
    private readonly DesignDbContext _dbContext;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly INodeSettingsService _nodeSettingsService;

    public SystemDesignService(
        ILLMChatService llmChatService, 
        ISettingsService settingsService, 
        IRuleEngineService ruleEngineService,
        DesignDbContext dbContext,
        IHttpClientFactory httpClientFactory,
        INodeSettingsService nodeSettingsService)
    {
        _llmChatService = llmChatService;
        _settingsService = settingsService;
        _ruleEngineService = ruleEngineService;
        _dbContext = dbContext;
        _httpClientFactory = httpClientFactory;
        _nodeSettingsService = nodeSettingsService;
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
        var responseStr = await _llmChatService.ChatAsync(request);
        
        responseStr = CleanJson(responseStr);

        try
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
            
            return JsonSerializer.Deserialize<DesignRequirements>(responseStr, options);
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

        // Per-node strategy: ask the LLM about ONE node at a time.
        // Small local models (phi3, llama2) reliably answer single-focus prompts
        // but collapse multi-key JSON into a flat structure.
        var architecture = new ArchitectureDesign();
        var contextSummary = $"team={requirements.Context?.TeamSize}, latency={requirements.Context?.LatencyRequirementMs}ms, consistency={requirements.Context?.ConsistencyModel}, problem={problemStatement}";

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
            var rawNodeResponse = await _llmChatService.ChatAsync(nodeRequest);
            Console.WriteLine($"  RAW -> {rawNodeResponse}");

            var cleanedNode = CleanJson(rawNodeResponse);
            Console.WriteLine($"  CLEANED -> {cleanedNode}");

            try
            {
                var nodeOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true };
                nodeOptions.Converters.Add(new FlexibleStringConverter());
                var component = JsonSerializer.Deserialize<ArchComponent>(cleanedNode, nodeOptions);
                if (component != null && !string.IsNullOrWhiteSpace(component.Choice))
                {
                    architecture[nodeKey] = component;
                    Console.WriteLine($"  OK -> choice='{component.Choice}'  justification='{component.Justification[..Math.Min(60, component.Justification.Length)]}...'" );
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
            // Set the model and provider from settings
            var appSettings = _settingsService.GetSettings();
            requirements.Provider = appSettings.PreferredProvider;
            requirements.Model = appSettings.PreferredProvider == "gemini" ? appSettings.GeminiModel : appSettings.OllamaModel;
            requirements.ApiKey = appSettings.GeminiApiKey;

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

            var payload = new
            {
                requirements = requirements,
                node_structure = settingsList.ToDictionary(s => s.NodeKey, s => new { choice = s.Choice, justification = s.Justification })
            };

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync("http://localhost:8001/generate/rag", payload);

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

        // Per-node strategy: one focused LLM call per node
        var architecture = new ArchitectureDesign();
        var contextSummary = $"team={requirements.Context?.TeamSize}, latency={requirements.Context?.LatencyRequirementMs}ms, consistency={requirements.Context?.ConsistencyModel}, problem={problemStatement}";
        var ruleHint = string.IsNullOrEmpty(ruleContextText) ? "" : $" Consider these architectural anchors: {ruleContextText}";

        foreach (var node in settingsList)
        {
            var nodeKey = node.NodeKey.ToLower();
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
            var rawNodeResponse = await _llmChatService.ChatAsync(nodeRequest);
            Console.WriteLine($"  RAW -> {rawNodeResponse}");

            var cleanedNode = CleanJson(rawNodeResponse);
            try
            {
                var nodeOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true };
                nodeOptions.Converters.Add(new FlexibleStringConverter());
                var component = JsonSerializer.Deserialize<ArchComponent>(cleanedNode, nodeOptions);
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

        // 3. Persist Session & Results
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
                    JsonData = JsonSerializer.Serialize(architecture)
                });
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Persist] Error saving session: {ex.Message}");
            }
        }

        return architecture;
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

        return sessions.Select(s => {
            var reqRecord = s.Requirements.FirstOrDefault();
            DesignRequirements? requirements = null;
            try {
                if (reqRecord != null) {
                    requirements = JsonSerializer.Deserialize<DesignRequirements>(reqRecord.JsonData);
                }
            } catch { /* Ignore parse errors */ }

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

        var req = await _dbContext.Requirements.FirstOrDefaultAsync(r => r.SessionId == id);
        var rec = await _dbContext.Recommendations.FirstOrDefaultAsync(r => r.SessionId == id);

        return new
        {
            Id = session.Id,
            CreatedAt = session.CreatedAt,
            ProblemStatement = session.ProblemStatement,
            ExtractedRequirements = req != null ? JsonSerializer.Deserialize<object>(req.JsonData) : null,
            ArchitectureDesign = rec != null ? JsonSerializer.Deserialize<object>(rec.JsonData) : null,
            TriggeredRules = session.TriggeredRules.Select(r => new {
                r.Id,
                r.Dimension,
                r.Condition,
                r.Recommendation,
                r.Justification
            })
        };
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
        // If the LLM returned a flat object like {"choice":"X", "justification":"Y"}
        // instead of {"database":{...}, "security":{...}}, handle it gracefully.
        var flatKeyNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "choice", "justification", "tech", "why", "recommendation", "reason", "technology", "solution" };
        bool isFlat = architecture.Any() && architecture.Keys.All(k => flatKeyNames.Contains(k));
        if (isFlat)
        {
            Console.WriteLine("[NodeEnforcement] Detected FLAT response. LLM output a single object instead of a keyed dictionary. Reconstructing...");
            // Build one component from the flat keys
            var flatChoice = architecture.TryGetValue("choice", out var cv) ? cv.Choice
                : architecture.TryGetValue("tech", out var tv) ? tv.Choice
                : architecture.TryGetValue("recommendation", out var rv) ? rv.Choice : "";
            var flatJust = architecture.TryGetValue("justification", out var jv) ? jv.Choice
                : architecture.TryGetValue("why", out var wv) ? wv.Choice
                : architecture.TryGetValue("reason", out var rsv) ? rsv.Choice : "";
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
        responseStr = System.Text.RegularExpressions.Regex.Replace(responseStr, @"(\d+\.?\d*)\s*([KkMmBb])(?=\s*[,}\]])", m => {
            if (double.TryParse(m.Groups[1].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val)) {
                char suffix = char.ToUpper(m.Groups[2].Value[0]);
                double multiplier = suffix switch {
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

        // 8. Fix orphan keys followed by commas (e.g. "strategy", -> "strategy": null,)
        // Only match if the key is at the start of the line and has no colon
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"(^\s*""[^""]+"")\s*,", "$1: null,", System.Text.RegularExpressions.RegexOptions.Multiline);

        // 9. Fix hanging text after closing quotes (e.g. "value" more text -> "value more text")
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"(:\s*""[^""]+"")\s*([^,}\s][^,}\n]*)", m => {
            var val = m.Groups[1].Value;
            var hanging = m.Groups[2].Value;
            if (val.EndsWith("\"")) {
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
        // Find all '{' positions
        var starts = new List<int>();
        for (int i = 0; i < input.Length; i++)
        {
            if (input[i] == '{') starts.Add(i);
        }

        // Try from the last '{' backwards to see if we can find a balanced match
        for (int i = starts.Count - 1; i >= 0; i--)
        {
            int start = starts[i];
            int balance = 0;
            bool inString = false;

            for (int j = start; j < input.Length; j++)
            {
                char c = input[j];
                if (c == '\"' && (j == 0 || input[j - 1] != '\\')) inString = !inString;

                if (!inString)
                {
                    if (c == '{') balance++;
                    else if (c == '}') balance--;

                    if (balance == 0)
                    {
                        // Found a balanced block!
                        return input.Substring(start, j - start + 1);
                    }
                }
            }
        }

        // Fallback to original logic if no balanced block found
        int first = input.IndexOf('{');
        int last = input.LastIndexOf('}');
        if (first != -1 && last > first) return input.Substring(first, last - first + 1);

        return input;
    }
}
