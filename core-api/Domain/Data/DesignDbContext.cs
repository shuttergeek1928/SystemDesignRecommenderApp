using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data.Entities;

namespace SystemDesignRecommenderApi.Domain.Data;

public class DesignDbContext : DbContext
{
    public DesignDbContext(DbContextOptions<DesignDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Team> Teams { get; set; } = null!;
    public DbSet<DesignSession> Sessions { get; set; } = null!;
    public DbSet<RequirementRecord> Requirements { get; set; } = null!;
    public DbSet<RecommendationResult> Recommendations { get; set; } = null!;
    public DbSet<RuleTriggerRecord> TriggeredRules { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and cascading deletes if necessary
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Owner)
            .WithMany(u => u.OwnedTeams)
            .HasForeignKey(t => t.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DesignSession>()
            .HasOne(s => s.User)
            .WithMany(u => u.Sessions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
