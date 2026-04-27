using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.DTO;

public class SystemDesignRequestDto
{
    [JsonPropertyName("problem_statement")]
    public string ProblemStatement { get; set; } = string.Empty;

    [JsonPropertyName("use_rag")]
    public bool UseRag { get; set; } = false;

    [JsonPropertyName("use_hybrid")]
    public bool UseHybrid { get; set; } = true;

    [JsonPropertyName("user_id")]
    public Guid? UserId { get; set; }

    [JsonPropertyName("team_id")]
    public Guid? TeamId { get; set; }

    [JsonPropertyName("connection_id")]
    public string? ConnectionId { get; set; }

    [JsonPropertyName("requirements")]
    public Models.DesignRequirements? Requirements { get; set; }
}
