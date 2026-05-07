using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

[BsonIgnoreExtraElements]
public class ReferenceBlueprint
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("scenario_id")]
    public int ScenarioId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("keywords")]
    public List<string> Keywords { get; set; } = new();

    [BsonElement("context")]
    public BlueprintContext Context { get; set; } = new();

    [BsonElement("non_functional_requirements")]
    public List<string> NonFunctionalRequirements { get; set; } = new();

    [BsonElement("acceptable_alternatives")]
    public Dictionary<string, List<string>> AcceptableAlternatives { get; set; } = new();

    [BsonElement("references")]
    public List<string> References { get; set; } = new();

    [BsonExtraElements]
    [System.Text.Json.Serialization.JsonIgnore]
    public Dictionary<string, object> ExtraElements { get; set; } = new();

    [BsonIgnore]
    public Dictionary<string, BlueprintArchitecture> GroundTruthArchitecture
    {
        get
        {
            var architectures = new Dictionary<string, BlueprintArchitecture>();
            foreach (var kvp in ExtraElements)
            {
                if (kvp.Key.StartsWith("baseline_"))
                {
                    try
                    {
                        var json = System.Text.Json.JsonSerializer.Serialize(kvp.Value);
                        var arch = System.Text.Json.JsonSerializer.Deserialize<BlueprintArchitecture>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (arch != null)
                        {
                            architectures[kvp.Key] = arch;
                        }
                    }
                    catch { /* Ignore parse errors */ }
                }
            }
            return architectures;
        }
    }
}

[BsonIgnoreExtraElements]
public class BlueprintContext
{
    [BsonElement("users")]
    public int? Users { get; set; }

    [BsonElement("traffic_pattern")]
    public string? TrafficPattern { get; set; }

    [BsonElement("latency_requirement_ms")]
    public int? LatencyRequirementMs { get; set; }

    [BsonElement("availability_slo")]
    public string? AvailabilitySlo { get; set; }

    [BsonElement("consistency_model")]
    public string? ConsistencyModel { get; set; }

    [BsonElement("budget")]
    public string? Budget { get; set; }

    [BsonElement("compliance")]
    public List<string> Compliance { get; set; } = new();

    [BsonElement("cloud_provider")]
    public string? CloudProvider { get; set; }

    [BsonElement("region_strategy")]
    public string? RegionStrategy { get; set; }
}

public class BlueprintArchitecture
{
    [BsonExtraElements]
    [System.Text.Json.Serialization.JsonExtensionData]
    public Dictionary<string, object> Nodes { get; set; } = new();
}
