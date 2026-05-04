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

    [BsonElement("context")]
    public BlueprintContext Context { get; set; } = new();

    [BsonElement("non_functional_requirements")]
    public List<string> NonFunctionalRequirements { get; set; } = new();

    [BsonElement("ground_truth_architecture")]
    public Dictionary<string, BlueprintArchitecture> GroundTruthArchitecture { get; set; } = new();

    [BsonElement("acceptable_alternatives")]
    public Dictionary<string, List<string>> AcceptableAlternatives { get; set; } = new();

    [BsonElement("references")]
    public List<string> References { get; set; } = new();
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
    // The dataset has structure like: "baseline_A_expert": { "database": { "choice": "...", "justification": "..." } }
    // We'll map the inner components directly or as dynamic objects depending on how we want to query.
    // For now, let's use a dictionary to hold the nodes (database, cache, etc.)
    [BsonExtraElements]
    public Dictionary<string, object> Nodes { get; set; } = new();
}
