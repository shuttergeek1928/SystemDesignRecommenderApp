using System.Text.Json.Serialization;

namespace SystemDesignRecommenderApi.Domain.Models;

public class DesignContext
{
    [JsonPropertyName("users")]
    public int? Users { get; set; }

    [JsonPropertyName("traffic_pattern")]
    public string? TrafficPattern { get; set; }

    [JsonPropertyName("latency_requirement_ms")]
    public int? LatencyRequirementMs { get; set; }

    [JsonPropertyName("availability_slo")]
    public string? AvailabilitySlo { get; set; }

    [JsonPropertyName("consistency_model")]
    public string? ConsistencyModel { get; set; }

    [JsonPropertyName("budget")]
    public string? Budget { get; set; }

    [JsonPropertyName("compliance")]
    public List<string> Compliance { get; set; } = new();

    [JsonPropertyName("cloud_provider")]
    public string? CloudProvider { get; set; }

    [JsonPropertyName("region_strategy")]
    public string? RegionStrategy { get; set; }

    [JsonPropertyName("request_rate")]
    public double? RequestRate { get; set; }

    [JsonPropertyName("data_volume_gb")]
    public double? DataVolumeGb { get; set; }

    [JsonPropertyName("team_size")]
    public int? TeamSize { get; set; }

    [JsonPropertyName("experience_level")]
    public string? ExperienceLevel { get; set; } = "mixed";

    [JsonPropertyName("search_complexity")]
    public string? SearchComplexity { get; set; } = "simple";

    [JsonPropertyName("deployment_frequency")]
    public string? DeploymentFrequency { get; set; } = "weekly";

    [JsonPropertyName("read_write_ratio")]
    public string? ReadWriteRatio { get; set; } = "balanced";

    [JsonPropertyName("data_retention")]
    public string? DataRetention { get; set; } = "years";

    [JsonPropertyName("security_sensitivity")]
    public string? SecuritySensitivity { get; set; } = "internal";
}

public class DesignRequirements
{
    [JsonPropertyName("scenario_id")]
    public int ScenarioId { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("context")]
    public DesignContext Context { get; set; } = new();

    [JsonPropertyName("non_functional_requirements")]
    public List<string> NonFunctionalRequirements { get; set; } = new();

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("provider")]
    public string? Provider { get; set; }

    [JsonPropertyName("api_key")]
    public string? ApiKey { get; set; }
}
