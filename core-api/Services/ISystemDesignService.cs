using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface ISystemDesignService
{
    Task<DesignRequirements?> ExtractRequirementsAsync(string problemStatement);
    Task<ArchitectureDesign?> GenerateArchitectureAsync(string problemStatement, DesignRequirements requirements);
    Task<ArchitectureDesign?> GenerateArchitectureWithRagAsync(DesignRequirements requirements);
}
