using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface IBenchmarkService
{
    Task<BenchmarkComparisonDto?> CompareSessionWithBaselineAsync(Guid sessionId);
    Task<IEnumerable<object>> GetAvailableBlueprintsAsync();
}
