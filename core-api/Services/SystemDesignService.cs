using System.Text.Json;
using System.Net.Http.Json;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class SystemDesignService : ISystemDesignService
{
    private readonly IOllamaChatService _ollamaChatService;
    private readonly IHttpClientFactory _httpClientFactory;

    public SystemDesignService(IOllamaChatService ollamaChatService, IHttpClientFactory httpClientFactory)
    {
        _ollamaChatService = ollamaChatService;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<DesignRequirements?> ExtractRequirementsAsync(string problemStatement)
    {
        var prompt = $@"
You are an expert Distributed Systems Architect. Extract requirements from the following problem statement.
Problem: {problemStatement}

Provide the output strictly in valid JSON format with this structure:
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
      ""compliance"": [],
      ""cloud_provider"": """",
      ""region_strategy"": """"
  }},
  ""non_functional_requirements"": []
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
            return JsonSerializer.Deserialize<DesignRequirements>(responseStr);
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
            return JsonSerializer.Deserialize<ArchitectureDesign>(responseStr);
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

    private string CleanJson(string rawJson)
    {
        var responseStr = rawJson.Trim();
        if (responseStr.StartsWith("```json")) responseStr = responseStr.Substring(7);
        else if (responseStr.StartsWith("```")) responseStr = responseStr.Substring(3);
        
        if (responseStr.EndsWith("```")) responseStr = responseStr.Substring(0, responseStr.Length - 3);
        return responseStr.Trim();
    }
}
