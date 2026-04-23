using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class DesignNodeSetting
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string NodeKey { get; set; } = string.Empty;

    public Guid? TeamId { get; set; }
    
    [ForeignKey("TeamId")]
    public Team? Team { get; set; }

    public Guid? UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public string Choice { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
