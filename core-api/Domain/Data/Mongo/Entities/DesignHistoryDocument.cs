using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Services;

namespace SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

public class DesignHistoryDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("sql_session_id")]
    public string SqlSessionId { get; set; } = string.Empty;

    [BsonElement("user_id")]
    public string? UserId { get; set; }

    [BsonElement("team_id")]
    public string? TeamId { get; set; }

    [BsonElement("problem_statement")]
    public string ProblemStatement { get; set; } = string.Empty;

    [BsonElement("extracted_requirements")]
    public DesignRequirements? ExtractedRequirements { get; set; }

    [BsonElement("architecture_design")]
    public ArchitectureDesign? ArchitectureDesign { get; set; }

    [BsonElement("evaluation_scores")]
    public EvaluationScoreDocument? EvaluationScores { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("pipeline_logs")]
    public List<PipelineTraceStep> PipelineLogs { get; set; } = new();

    [BsonElement("triggered_rules")]
    public List<RuleTriggerRecordDTO> TriggeredRules { get; set; } = new();
}

public class EvaluationScoreDocument
{
    [BsonElement("industry_alignment_score")]
    public int IndustryAlignmentScore { get; set; }

    [BsonElement("constraint_fulfillment_score")]
    public int ConstraintFulfillmentScore { get; set; }

    [BsonElement("deployment_readiness_score")]
    public int DeploymentReadinessScore { get; set; }

    [BsonElement("rubric_score")]
    public int RubricScore { get; set; }

    [BsonElement("critic_report")]
    public string CriticReport { get; set; } = string.Empty;

    [BsonElement("matched_blueprint_id")]
    public int? MatchedBlueprintId { get; set; }
}
