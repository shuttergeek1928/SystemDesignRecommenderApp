using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

namespace SystemDesignRecommenderApi.Services;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        
        // Seed MongoDB Reference Blueprints
        var blueprintsCollection = mongoContext.ReferenceBlueprints;
        var count = await blueprintsCollection.CountDocumentsAsync(Builders<ReferenceBlueprint>.Filter.Empty);
        
        if (count == 0)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "architecture_dataset_40.json");
            if (File.Exists(filePath))
            {
                var json = await File.ReadAllTextAsync(filePath);
                var blueprints = JsonSerializer.Deserialize<List<ReferenceBlueprint>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (blueprints != null && blueprints.Any())
                {
                    await blueprintsCollection.InsertManyAsync(blueprints);
                    Console.WriteLine($"Seeded {blueprints.Count} reference blueprints into MongoDB.");
                }
            }
            else
            {
                Console.WriteLine($"Data file not found at {filePath}");
            }
        }

        // Seed SQL Rules
        var sqlContext = scope.ServiceProvider.GetRequiredService<DesignDbContext>();
        if (!await sqlContext.DesignRules.AnyAsync())
        {
            var initialRules = new List<DesignRule>
            {
                new DesignRule { Dimension = "Scale", Field = "Users", Operator = ">", Value = "100000", Recommendation = "Horizontal Scaling", Justification = "Single node capacity limits are reached at this scale." },
                new DesignRule { Dimension = "Scale Type", Field = "TrafficPattern", Operator = "Contains", Value = "burst", Recommendation = "Serverless (Lambda/Azure Functions)", Justification = "Scales to zero to save costs during idle periods and scales instantly for spikes." },
                new DesignRule { Dimension = "Latency", Field = "LatencyRequirementMs", Operator = "<", Value = "100", Recommendation = "Redis/Memcached", Justification = "Reduces database I/O bottlenecks for frequent read operations." },
                new DesignRule { Dimension = "Consistency", Field = "ConsistencyModel", Operator = "==", Value = "strong", Recommendation = "RDBMS with 2PC", Justification = "Ensures ACID compliance for critical transactions where data loss is unacceptable." },
                new DesignRule { Dimension = "Consistency", Field = "ConsistencyModel", Operator = "==", Value = "eventual", Recommendation = "Event Sourcing", Justification = "Prioritizes availability and performance over instant synchronization across all nodes." },
                new DesignRule { Dimension = "Data Volume", Field = "DataVolumeGb", Operator = ">", Value = "1000", Recommendation = "NoSQL (Mongo/Cassandra)", Justification = "Horizontal write scaling is significantly easier than sharding a massive RDBMS." },
                new DesignRule { Dimension = "Search", Field = "SearchComplexity", Operator = "==", Value = "complex", Recommendation = "Elasticsearch/Meilisearch", Justification = "RDBMS LIKE queries do not scale for full-text indexing at volume." },
                new DesignRule { Dimension = "Request Rate", Field = "RequestRate", Operator = ">", Value = "5000", Recommendation = "Message Queue (RabbitMQ/Kafka)", Justification = "Decouples services to prevent cascading failures under heavy load." },
                new DesignRule { Dimension = "Team Size", Field = "TeamSize", Operator = "<", Value = "8", Recommendation = "Modular Monolith", Justification = "Microservices introduce a 'Distributed Systems Tax' that is too high for small teams." },
                new DesignRule { Dimension = "DevOps Skill", Field = "ExperienceLevel", Operator = "==", Value = "junior", Recommendation = "Managed Services (PaaS)", Justification = "Reduces the operational burden of managing Kubernetes clusters or hardware." },
                new DesignRule { Dimension = "Deployment", Field = "DeploymentFrequency", Operator = "==", Value = "high", Recommendation = "Blue-Green Deployment", Justification = "Allows for zero-downtime releases and instant rollbacks if issues occur." },
                new DesignRule { Dimension = "Compliance", Field = "Compliance", Operator = "Contains", Value = "PII", Recommendation = "Data Masking & Encryption", Justification = "Legal requirement to protect sensitive user information at rest and in transit." },
                new DesignRule { Dimension = "Availability", Field = "AvailabilitySlo", Operator = "Contains", Value = "99.99", Recommendation = "Multi-AZ with AWS Aurora Global + Route 53 Failover", Justification = "Four 9s requires active-active across availability zones with automated failover." }
            };

            sqlContext.DesignRules.AddRange(initialRules);
            await sqlContext.SaveChangesAsync();
            Console.WriteLine($"Seeded {initialRules.Count} rules into SQL Database.");
        }
    }
}
