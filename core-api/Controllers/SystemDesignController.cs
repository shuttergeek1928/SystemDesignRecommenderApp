using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Services;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemDesignController : ControllerBase
{
    private readonly ISystemDesignService _systemDesignService;
    private readonly IRuleEngineService _ruleEngineService;

    public SystemDesignController(ISystemDesignService systemDesignService, IRuleEngineService ruleEngineService)
    {
        _systemDesignService = systemDesignService;
        _ruleEngineService = ruleEngineService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDesign([FromBody] SystemDesignRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ProblemStatement))
        {
            return BadRequest("Problem statement is required.");
        }

        // Step 1: Extract Requirements
        var requirements = await _systemDesignService.ExtractRequirementsAsync(request.ProblemStatement);
        
        if (requirements == null)
        {
            return StatusCode(500, "Failed to extract structured requirements from the LLM.");
        }

        // Step 2: Generate Architecture Design based on requirements
        ArchitectureDesign? architecture;
        
        if (request.UseHybrid)
        {
            architecture = await _systemDesignService.GenerateHybridArchitectureAsync(request.ProblemStatement, requirements, request.UserId, request.TeamId);
        }
        else if (request.UseRag)
        {
            architecture = await _systemDesignService.GenerateArchitectureWithRagAsync(requirements);
        }
        else
        {
            architecture = await _systemDesignService.GenerateArchitectureAsync(request.ProblemStatement, requirements);
        }

        if (architecture == null)
        {
            return StatusCode(500, "Failed to generate architecture design.");
        }

        return Ok(new
        {
            ExtractedRequirements = requirements,
            ArchitectureDesign = architecture,
            TriggeredRules = request.UseHybrid ? _ruleEngineService.EvaluateRules(requirements) : null
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] Guid? userId, [FromQuery] Guid? teamId)
    {
        var history = await _systemDesignService.GetSessionHistoryAsync(userId, teamId);
        return Ok(history);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionById(Guid id)
    {
        var session = await _systemDesignService.GetSessionByIdAsync(id);
        if (session == null) return NotFound("Session not found.");
        return Ok(session);
    }

    [HttpPost("extract-requirements")]
    public async Task<IActionResult> ExtractRequirements([FromBody] SystemDesignRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ProblemStatement))
        {
            return BadRequest("Problem statement is required.");
        }

        var requirements = await _systemDesignService.ExtractRequirementsAsync(request.ProblemStatement);
        
        if (requirements == null)
        {
            return StatusCode(500, "Failed to extract structured requirements from the LLM.");
        }

        return Ok(requirements);
    }
}
