using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.Models;

public class ArchComponent
{
    [JsonPropertyName("choice")]
    public string Choice { get; set; } = string.Empty;

    [JsonPropertyName("justification")]
    public string Justification { get; set; } = string.Empty;
}

public class ArchitectureDesign : Dictionary<string, ArchComponent>
{
}
