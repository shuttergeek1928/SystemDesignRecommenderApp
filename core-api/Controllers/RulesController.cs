using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RulesController : ControllerBase
{
    private readonly DesignDbContext _dbContext;

    public RulesController(DesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetRules()
    {
        var rules = await _dbContext.DesignRules.ToListAsync();
        return Ok(rules);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRule(Guid id)
    {
        var rule = await _dbContext.DesignRules.FindAsync(id);
        if (rule == null) return NotFound();
        return Ok(rule);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] DesignRule rule)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        rule.Id = Guid.NewGuid();
        _dbContext.DesignRules.Add(rule);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRule), new { id = rule.Id }, rule);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] DesignRule updatedRule)
    {
        if (id != updatedRule.Id) return BadRequest();

        var existingRule = await _dbContext.DesignRules.FindAsync(id);
        if (existingRule == null) return NotFound();

        existingRule.Name = updatedRule.Name;
        existingRule.Dimension = updatedRule.Dimension;
        existingRule.Field = updatedRule.Field;
        existingRule.Operator = updatedRule.Operator;
        existingRule.Value = updatedRule.Value;
        existingRule.Recommendation = updatedRule.Recommendation;
        existingRule.Justification = updatedRule.Justification;
        existingRule.IsActive = updatedRule.IsActive;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRule(Guid id)
    {
        var rule = await _dbContext.DesignRules.FindAsync(id);
        if (rule == null) return NotFound();

        _dbContext.DesignRules.Remove(rule);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}
