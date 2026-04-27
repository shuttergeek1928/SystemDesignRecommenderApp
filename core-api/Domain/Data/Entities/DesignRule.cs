using System.ComponentModel.DataAnnotations;

namespace SystemDesignRecommenderApi.Domain.Data.Entities;

public class DesignRule
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Dimension { get; set; } = string.Empty; // e.g. "Scalability", "Database"

    [Required]
    public string Field { get; set; } = string.Empty; // e.g. "Users", "TrafficPattern"

    [Required]
    public string Operator { get; set; } = string.Empty; // e.g. ">", "==", "Contains"

    [Required]
    public string Value { get; set; } = string.Empty; // e.g. "100000", "burst"

    [Required]
    public string Recommendation { get; set; } = string.Empty; // e.g. "Use NoSQL"

    [Required]
    public string Justification { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
