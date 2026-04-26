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
            PreferredProvider = _configuration["App:PreferredProvider"] ?? "ollama",
            
            // Map new extraction/generation settings from config if present, otherwise use defaults
            ExtractionProvider = _configuration["App:ExtractionProvider"] ?? _configuration["App:PreferredProvider"] ?? "ollama",
            ExtractionModel = _configuration["App:ExtractionModel"] ?? _configuration["Ollama:Model"] ?? "qwen2.5-coder:7b",
            GenerationProvider = _configuration["App:GenerationProvider"] ?? _configuration["App:PreferredProvider"] ?? "gemini",
            GenerationModel = _configuration["App:GenerationModel"] ?? _configuration["Gemini:Model"] ?? "gemini-1.5-flash"
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
