using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

public class DesignFeedback
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("session_id")]
    public string SessionId { get; set; } = string.Empty;

    [BsonElement("user_id")]
    public string? UserId { get; set; }

    [BsonElement("overall_rating")]
    public int OverallRating { get; set; }

    [BsonElement("node_feedback")]
    public List<NodeFeedbackItem> NodeFeedback { get; set; } = new();

    [BsonElement("general_comment")]
    public string GeneralComment { get; set; } = string.Empty;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NodeFeedbackItem
{
    [BsonElement("node_key")]
    public string NodeKey { get; set; } = string.Empty;
    
    [BsonElement("is_approved")]
    public bool IsApproved { get; set; }
    
    [BsonElement("correction")]
    public string? Correction { get; set; }
    
    [BsonElement("reason")]
    public string? Reason { get; set; }
}
