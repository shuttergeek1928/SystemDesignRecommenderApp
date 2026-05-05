namespace SystemDesignRecommenderApi.Domain.Models;

public class AppSettings
{
    public string? GeminiApiKey { get; set; }
    
    public string ExtractionProvider { get; set; } = "ollama";
    public string ExtractionModel { get; set; } = "qwen2.5-coder:7b";
    
    public string GenerationProvider { get; set; } = "gemini";
    public string GenerationModel { get; set; } = "gemini-3-flash-preview";
    
    public string EvaluationProvider { get; set; } = "gemini";
    public string EvaluationModel { get; set; } = "gemini-1.5-pro";
}
