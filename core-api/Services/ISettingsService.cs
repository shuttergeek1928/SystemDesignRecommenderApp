using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public enum PipelinePhase
{
    Extraction,
    Generation,
    Evaluation
}

public interface ISettingsService
{
    Task<AppSettings> GetSettingsAsync();
    Task UpdateSettingsAsync(AppSettings settings);
    Task<(string Provider, string Model)> ResolveModelAsync(PipelinePhase phase);
}
