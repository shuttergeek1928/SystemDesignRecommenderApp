using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface ISettingsService
{
    AppSettings GetSettings();
    void UpdateSettings(AppSettings settings);
}
