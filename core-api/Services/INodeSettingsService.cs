using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services;

public interface INodeSettingsService
{
    Task<IEnumerable<NodeDefinitionDto>> GetDefinitionsAsync();
    Task<NodeDefinitionDto> SaveDefinitionAsync(NodeDefinitionDto definition);
    Task DeleteDefinitionAsync(string key);

    Task<IEnumerable<NodeSettingDto>> GetMergedSettingsAsync(Guid? teamId, Guid? userId);
    Task SaveSettingsAsync(SaveNodeSettingsDto dto);
}
