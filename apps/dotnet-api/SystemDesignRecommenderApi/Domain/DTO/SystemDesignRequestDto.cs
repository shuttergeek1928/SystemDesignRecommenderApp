using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.DTO;

public class SystemDesignRequestDto
{
    [JsonPropertyName("problem_statement")]
    public string ProblemStatement { get; set; } = string.Empty;

    [JsonPropertyName("use_rag")]
    public bool UseRag { get; set; } = false;
}
