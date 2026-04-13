using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.Models;

public class ArchComponent
{
    [JsonPropertyName("choice")]
    public string Choice { get; set; } = string.Empty;

    [JsonPropertyName("justification")]
    public string Justification { get; set; } = string.Empty;
}

public class ArchitectureDesign
{
    [JsonPropertyName("database")]
    public ArchComponent Database { get; set; } = new();

    [JsonPropertyName("cache")]
    public ArchComponent Cache { get; set; } = new();

    [JsonPropertyName("messaging")]
    public ArchComponent Messaging { get; set; } = new();

    [JsonPropertyName("deployment")]
    public ArchComponent Deployment { get; set; } = new();

    [JsonPropertyName("observability")]
    public ArchComponent Observability { get; set; } = new();

    [JsonPropertyName("security")]
    public ArchComponent Security { get; set; } = new();
}
