namespace SystemDesignRecommenderApi.Domain.Models;

public class AppSettings
{
    public string OllamaModel { get; set; } = "qwen2.5-coder:7b";
    public string GeminiModel { get; set; } = "gemini-1.5-flash";
    public string? GeminiApiKey { get; set; }
    public string PreferredProvider { get; set; } = "ollama"; // "ollama" or "gemini"
}
