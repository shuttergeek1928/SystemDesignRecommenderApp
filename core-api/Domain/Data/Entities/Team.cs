using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class Team
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public Guid OwnerId { get; set; }

    [ForeignKey("OwnerId")]
    public User Owner { get; set; } = null!;

    public ICollection<DesignSession> Sessions { get; set; } = new List<DesignSession>();

    [InverseProperty("Team")]
    public ICollection<User> Members { get; set; } = new List<User>();
}
