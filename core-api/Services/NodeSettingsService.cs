using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;
using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services;

public class NodeSettingsService : INodeSettingsService
{
    private readonly DesignDbContext _dbContext;

    public NodeSettingsService(DesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<NodeDefinitionDto>> GetDefinitionsAsync()
    {
        return await _dbContext.NodeDefinitions
            .Select(d => new NodeDefinitionDto
            {
                Key = d.Key,
                DisplayName = d.DisplayName
            })
            .ToListAsync();
    }

    public async Task<NodeDefinitionDto> SaveDefinitionAsync(NodeDefinitionDto definition)
    {
        var entity = await _dbContext.NodeDefinitions.FindAsync(definition.Key);
        if (entity == null)
        {
            entity = new DesignNodeDefinition { Key = definition.Key };
            _dbContext.NodeDefinitions.Add(entity);
        }

        entity.DisplayName = definition.DisplayName;
        await _dbContext.SaveChangesAsync();

        return definition;
    }

    public async Task DeleteDefinitionAsync(string key)
    {
        var entity = await _dbContext.NodeDefinitions.FindAsync(key);
        if (entity != null)
        {
            _dbContext.NodeDefinitions.Remove(entity);

            // Also remove settings associated with this key
            var settings = _dbContext.NodeSettings.Where(s => s.NodeKey == key);
            _dbContext.NodeSettings.RemoveRange(settings);

            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<NodeSettingDto>> GetMergedSettingsAsync(Guid? teamId, Guid? userId)
    {
        var definitions = await _dbContext.NodeDefinitions.ToListAsync();

        var teamSettings = teamId.HasValue
            ? await _dbContext.NodeSettings.Where(s => s.TeamId == teamId.Value).ToListAsync()
            : new List<DesignNodeSetting>();

        var userSettings = userId.HasValue
            ? await _dbContext.NodeSettings.Where(s => s.UserId == userId.Value).ToListAsync()
            : new List<DesignNodeSetting>();

        var result = new List<NodeSettingDto>();

        foreach (var def in definitions)
        {
            var teamSetting = teamSettings.FirstOrDefault(s => s.NodeKey == def.Key);
            var userSetting = userSettings.FirstOrDefault(s => s.NodeKey == def.Key);

            var choice = userSetting != null && !string.IsNullOrEmpty(userSetting.Choice)
                ? userSetting.Choice
                : (teamSetting?.Choice ?? string.Empty);

            var justification = teamSetting?.Justification ?? string.Empty;

            result.Add(new NodeSettingDto
            {
                NodeKey = def.Key,
                Choice = choice,
                Justification = justification,
                IsOverride = userSetting != null && !string.IsNullOrEmpty(userSetting.Choice)
            });
        }

        return result;
    }

    public async Task SaveSettingsAsync(SaveNodeSettingsDto dto)
    {
        foreach (var settingDto in dto.Settings)
        {
            DesignNodeSetting? entity = null;

            if (dto.UserId.HasValue)
            {
                entity = await _dbContext.NodeSettings
                    .FirstOrDefaultAsync(s => s.UserId == dto.UserId.Value && s.NodeKey == settingDto.NodeKey);

                if (entity == null)
                {
                    entity = new DesignNodeSetting { UserId = dto.UserId.Value, NodeKey = settingDto.NodeKey };
                    _dbContext.NodeSettings.Add(entity);
                }
            }
            else if (dto.TeamId.HasValue)
            {
                entity = await _dbContext.NodeSettings
                    .FirstOrDefaultAsync(s => s.TeamId == dto.TeamId.Value && s.NodeKey == settingDto.NodeKey);

                if (entity == null)
                {
                    entity = new DesignNodeSetting { TeamId = dto.TeamId.Value, NodeKey = settingDto.NodeKey };
                    _dbContext.NodeSettings.Add(entity);
                }
            }

            if (entity != null)
            {
                entity.Choice = settingDto.Choice;
                // Only save justification for team settings, as user overrides only cover choice
                if (dto.TeamId.HasValue && !dto.UserId.HasValue)
                {
                    entity.Justification = settingDto.Justification;
                }
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync();
    }
}
