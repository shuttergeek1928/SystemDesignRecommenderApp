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
    public DbSet<TeamExitRequest> TeamExitRequests { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;
    public DbSet<DesignNodeDefinition> NodeDefinitions { get; set; } = null!;
    public DbSet<DesignNodeSetting> NodeSettings { get; set; } = null!;

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

        modelBuilder.Entity<User>()
            .HasOne(u => u.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(u => u.TeamId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<TeamExitRequest>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<TeamExitRequest>()
            .HasOne(r => r.Team)
            .WithMany()
            .HasForeignKey(r => r.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
