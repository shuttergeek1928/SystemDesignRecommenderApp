using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class AppGlobalSetting
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; } = 1; // Only one row for global settings

    public string? GeminiApiKey { get; set; }

    // Extraction phase configuration
    public string ExtractionProvider { get; set; } = "ollama";
    public string ExtractionModel { get; set; } = "qwen2.5-coder:7b";

    // Generation phase configuration
    public string GenerationProvider { get; set; } = "gemini";
    public string GenerationModel { get; set; } = "gemini-3-flash-preview";

    // Evaluation phase configuration
    public string EvaluationProvider { get; set; } = "gemini";
    public string EvaluationModel { get; set; } = "gemini-1.5-pro";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
