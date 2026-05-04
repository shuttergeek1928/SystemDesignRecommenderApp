using MongoDB.Bson.Serialization.Attributes;

namespace SystemDesignRecommenderApi.Domain.Models;

public class PipelineTraceStep
{
    [BsonElement("step_id")]
    public string StepId { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("step_name")]
    public string StepName { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "Pending"; // Pending, Running, Success, Error

    [BsonElement("summary")]
    public string Summary { get; set; } = string.Empty;

    [BsonElement("details")]
    public string Details { get; set; } = string.Empty;

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
