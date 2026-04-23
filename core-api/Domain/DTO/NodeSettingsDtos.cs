namespace SystemDesignRecommenderApi.Domain.DTO;

public class NodeDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class NodeSettingDto
{
    public string NodeKey { get; set; } = string.Empty;
    public string Choice { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public bool IsOverride { get; set; }
}

public class SaveNodeSettingsDto
{
    public Guid? TeamId { get; set; }
    public Guid? UserId { get; set; }
    public List<NodeSettingDto> Settings { get; set; } = new();
}
