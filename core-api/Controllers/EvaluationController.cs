using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EvaluationController : ControllerBase
{
    private readonly MongoDbContext _mongoDbContext;

    public EvaluationController(MongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetEvaluation(string sessionId)
    {
        var filter = Builders<DesignHistoryDocument>.Filter.Eq(doc => doc.SqlSessionId, sessionId);
        var document = await _mongoDbContext.DesignHistory.Find(filter).FirstOrDefaultAsync();

        if (document == null || document.EvaluationScores == null)
        {
            return NotFound("Evaluation not found for this session.");
        }

        return Ok(document.EvaluationScores);
    }
}
