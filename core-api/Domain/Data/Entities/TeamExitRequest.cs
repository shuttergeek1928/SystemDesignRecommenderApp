using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class TeamExitRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public Guid TeamId { get; set; }

    [ForeignKey("TeamId")]
    public Team Team { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
}
