using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

namespace SystemDesignRecommenderApi.Domain.Data.Mongo;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    public IMongoDatabase Database => _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["MongoDb:ConnectionString"]);
        _database = client.GetDatabase(configuration["MongoDb:DatabaseName"]);
    }

    public IMongoCollection<ReferenceBlueprint> ReferenceBlueprints => _database.GetCollection<ReferenceBlueprint>("ReferenceBlueprints");
    public IMongoCollection<DesignHistoryDocument> DesignHistory => _database.GetCollection<DesignHistoryDocument>("DesignHistory");
    public IMongoCollection<DesignFeedback> DesignFeedback => _database.GetCollection<DesignFeedback>("DesignFeedback");
}
