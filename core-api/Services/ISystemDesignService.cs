using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface ISystemDesignService
{
    Task<DesignRequirements?> ExtractRequirementsAsync(string problemStatement);
    Task<ArchitectureDesign?> GenerateArchitectureAsync(string problemStatement, DesignRequirements requirements);
    Task<ArchitectureDesign?> GenerateArchitectureWithRagAsync(DesignRequirements requirements);
    Task<ArchitectureDesign?> GenerateHybridArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null);
    Task<IEnumerable<DesignSessionDTO>> GetSessionHistoryAsync(Guid? userId = null, Guid? teamId = null);
    Task<object?> GetSessionByIdAsync(Guid id);
}

public class DesignSessionDTO
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Title { get; set; } = string.Empty;
}
