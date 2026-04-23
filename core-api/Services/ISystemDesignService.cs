using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public interface ISystemDesignService
{
    Task<DesignRequirements?> ExtractRequirementsAsync(string problemStatement);
    Task<ArchitectureDesign?> GenerateArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null);
    Task<ArchitectureDesign?> GenerateArchitectureWithRagAsync(DesignRequirements requirements, Guid? userId = null, Guid? teamId = null);
    Task<ArchitectureDesign?> GenerateHybridArchitectureAsync(string problemStatement, DesignRequirements requirements, Guid? userId = null, Guid? teamId = null);
    Task<IEnumerable<DesignSessionDTO>> GetSessionHistoryAsync(Guid? userId = null, Guid? teamId = null);
    Task<object?> GetSessionByIdAsync(Guid id);
}

public class DesignSessionDTO
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string AppName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Highlights { get; set; } = new();
}
