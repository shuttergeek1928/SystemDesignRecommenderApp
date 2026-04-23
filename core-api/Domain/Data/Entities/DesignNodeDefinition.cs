using System.ComponentModel.DataAnnotations;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class DesignNodeDefinition
{
    [Key]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
