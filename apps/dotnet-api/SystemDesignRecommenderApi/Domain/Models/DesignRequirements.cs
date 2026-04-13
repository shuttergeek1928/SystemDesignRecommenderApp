using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.Models;

public class DesignContext
{
    [JsonPropertyName("users")]
    public int Users { get; set; }

    [JsonPropertyName("traffic_pattern")]
    public string TrafficPattern { get; set; } = string.Empty;

    [JsonPropertyName("latency_requirement_ms")]
    public int LatencyRequirementMs { get; set; }

    [JsonPropertyName("availability_slo")]
    public string AvailabilitySlo { get; set; } = string.Empty;

    [JsonPropertyName("consistency_model")]
    public string ConsistencyModel { get; set; } = string.Empty;

    [JsonPropertyName("budget")]
    public string Budget { get; set; } = string.Empty;

    [JsonPropertyName("compliance")]
    public List<string> Compliance { get; set; } = new();

    [JsonPropertyName("cloud_provider")]
    public string CloudProvider { get; set; } = string.Empty;

    [JsonPropertyName("region_strategy")]
    public string RegionStrategy { get; set; } = string.Empty;
}

public class DesignRequirements
{
    [JsonPropertyName("scenario_id")]
    public int ScenarioId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("context")]
    public DesignContext Context { get; set; } = new();

    [JsonPropertyName("non_functional_requirements")]
    public List<string> NonFunctionalRequirements { get; set; } = new();
}
