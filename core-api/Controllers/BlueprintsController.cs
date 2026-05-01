using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlueprintsController : ControllerBase
{
    private readonly MongoDbContext _mongoDbContext;

    public BlueprintsController(MongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetBlueprints()
    {
        // Use raw BsonDocument to preserve the original snake_case structure from MongoDB
        var collection = _mongoDbContext.Database.GetCollection<BsonDocument>("ReferenceBlueprints");
        var docs = await collection.Find(new BsonDocument()).ToListAsync();
        
        var results = docs.Select(doc =>
        {
            var json = doc.ToJson(new MongoDB.Bson.IO.JsonWriterSettings { OutputMode = MongoDB.Bson.IO.JsonOutputMode.RelaxedExtendedJson });
            return System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);
        }).ToList();

        return Ok(results);
    }
}
