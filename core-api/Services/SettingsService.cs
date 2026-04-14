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
            OllamaModel = _configuration["Ollama:Model"] ?? "phi3:latest"
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
