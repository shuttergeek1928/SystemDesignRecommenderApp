using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class SettingsService : ISettingsService
{
    private AppSettings _settings;
    private readonly IConfiguration _configuration;

    public SettingsService(IConfiguration configuration)
    {
        _configuration = configuration;
        _settings = new AppSettings
        {
            OllamaModel = _configuration["Ollama:Model"] ?? "qwen2.5-coder:7b",
            GeminiModel = _configuration["Gemini:Model"] ?? "gemini-1.5-flash",
            GeminiApiKey = _configuration["Gemini:ApiKey"],
            PreferredProvider = _configuration["App:PreferredProvider"] ?? "gemini",
            
            // Task-specific models
            ExtractionProvider = _configuration["App:ExtractionProvider"] ?? "gemini",
            ExtractionModel = _configuration["App:ExtractionModel"] ?? "gemini-3.1-flash-lite-preview", // Gemini 3.1 Flash Lite
            GenerationProvider = _configuration["App:GenerationProvider"] ?? "gemini",
            GenerationModel = _configuration["App:GenerationModel"] ?? "gemini-3-flash-preview", // Gemini 3 Flash
            EvaluationProvider = _configuration["App:EvaluationProvider"] ?? "gemini",
            EvaluationModel = _configuration["App:EvaluationModel"] ?? "gemini-1.5-pro" // Use Pro for higher quality audit
        };  
    }

    public AppSettings GetSettings()
    {
        return _settings;
    }

    public void UpdateSettings(AppSettings settings)
    {
        _settings = settings;
    }
}
