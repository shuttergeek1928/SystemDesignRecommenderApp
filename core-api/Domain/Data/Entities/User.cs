using System.ComponentModel.DataAnnotations;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    public ICollection<Team> OwnedTeams { get; set; } = new List<Team>();
    public ICollection<DesignSession> Sessions { get; set; } = new List<DesignSession>();
}
