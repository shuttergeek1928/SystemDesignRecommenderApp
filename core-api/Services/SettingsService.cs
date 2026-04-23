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
            PreferredProvider = _configuration["App:PreferredProvider"] ?? "ollama"
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
