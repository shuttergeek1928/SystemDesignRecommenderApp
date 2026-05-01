using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Data.Mongo.Entities;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly MongoDbContext _mongoDbContext;

    public FeedbackController(MongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitFeedback([FromBody] DesignFeedback feedback)
    {
        feedback.CreatedAt = DateTime.UtcNow;
        
        // Upsert feedback
        var filter = Builders<DesignFeedback>.Filter.Eq(f => f.SessionId, feedback.SessionId);
        await _mongoDbContext.DesignFeedback.ReplaceOneAsync(filter, feedback, new ReplaceOptions { IsUpsert = true });
        
        return Ok(new { message = "Feedback recorded" });
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetFeedback(string sessionId)
    {
        var feedback = await _mongoDbContext.DesignFeedback
            .Find(f => f.SessionId == sessionId)
            .FirstOrDefaultAsync();
            
        if (feedback == null)
        {
            return NotFound("No feedback found for this session.");
        }
        
        return Ok(feedback);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetFeedbackAnalytics()
    {
        var allFeedback = await _mongoDbContext.DesignFeedback
            .Find(_ => true)
            .ToListAsync();

        if (!allFeedback.Any())
        {
            return Ok(new { totalFeedback = 0, averageRating = 0.0, topRejectedNodes = new List<object>() });
        }

        var avgRating = allFeedback.Average(f => f.OverallRating);
        
        var rejectedNodes = allFeedback
            .SelectMany(f => f.NodeFeedback.Where(nf => !nf.IsApproved))
            .GroupBy(nf => nf.NodeKey)
            .Select(g => new {
                NodeKey = g.Key,
                RejectionCount = g.Count(),
                TopCorrections = g
                    .Where(nf => !string.IsNullOrWhiteSpace(nf.Correction))
                    .GroupBy(nf => nf.Correction)
                    .OrderByDescending(cg => cg.Count())
                    .Take(3)
                    .Select(cg => new { Correction = cg.Key, Count = cg.Count() })
            })
            .OrderByDescending(n => n.RejectionCount)
            .Take(10)
            .ToList();

        return Ok(new
        {
            totalFeedback = allFeedback.Count,
            averageRating = Math.Round(avgRating, 2),
            topRejectedNodes = rejectedNodes
        });
    }
}
