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

        // Step 1: Extract/Refine Requirements
        // We always extract from the problem statement to capture natural language context,
        // then overlay the explicit form-based requirements if provided.
        var extracted = await _systemDesignService.ExtractRequirementsAsync(request.ProblemStatement);
        
        if (extracted == null && request.Requirements == null)
        {
            return StatusCode(500, "Failed to extract structured requirements from the LLM.");
        }

        var requirements = extracted ?? new Domain.Models.DesignRequirements();

        if (request.Requirements != null)
        {
            Console.WriteLine("Merging explicit form requirements with LLM extraction...");
            
            // Concatenate titles and descriptions to preserve all context
            if (!string.IsNullOrEmpty(request.Requirements.Title)) 
                requirements.Title = string.IsNullOrEmpty(requirements.Title) ? request.Requirements.Title : $"{requirements.Title} ({request.Requirements.Title})";
            
            if (!string.IsNullOrEmpty(request.Requirements.Description)) 
                requirements.Description = string.IsNullOrEmpty(requirements.Description) ? request.Requirements.Description : $"{requirements.Description}\n\nAdditional User Context: {request.Requirements.Description}";
            
            // Merge Non-Functional Requirements
            if (request.Requirements.NonFunctionalRequirements != null && request.Requirements.NonFunctionalRequirements.Any())
            {
                requirements.NonFunctionalRequirements = requirements.NonFunctionalRequirements
                    .Union(request.Requirements.NonFunctionalRequirements)
                    .Distinct()
                    .ToList();
            }

            if (request.Requirements.Context != null)
            {
                var target = requirements.Context;
                var source = request.Requirements.Context;

                // Technical Overrides
                if (source.TeamSize.HasValue) target.TeamSize = source.TeamSize;
                if (source.RequestRate.HasValue) target.RequestRate = source.RequestRate;
                if (source.DataVolumeGb.HasValue) target.DataVolumeGb = source.DataVolumeGb;
                if (source.LatencyRequirementMs.HasValue) target.LatencyRequirementMs = source.LatencyRequirementMs;
                if (source.Users.HasValue) target.Users = source.Users;
                
                if (!string.IsNullOrEmpty(source.ConsistencyModel)) target.ConsistencyModel = source.ConsistencyModel;
                if (!string.IsNullOrEmpty(source.ExperienceLevel)) target.ExperienceLevel = source.ExperienceLevel;
                if (!string.IsNullOrEmpty(source.SearchComplexity)) target.SearchComplexity = source.SearchComplexity;
                if (!string.IsNullOrEmpty(source.DeploymentFrequency)) target.DeploymentFrequency = source.DeploymentFrequency;
                if (!string.IsNullOrEmpty(source.TrafficPattern)) target.TrafficPattern = source.TrafficPattern;
                
                // New Fields from "Additional Context" extraction
                if (!string.IsNullOrEmpty(source.Budget)) target.Budget = source.Budget;
                if (!string.IsNullOrEmpty(source.AvailabilitySlo)) target.AvailabilitySlo = source.AvailabilitySlo;
                if (!string.IsNullOrEmpty(source.CloudProvider)) target.CloudProvider = source.CloudProvider;
                if (!string.IsNullOrEmpty(source.RegionStrategy)) target.RegionStrategy = source.RegionStrategy;

                // Deep Merge Compliance lists
                if (source.Compliance != null && source.Compliance.Any())
                {
                    target.Compliance = target.Compliance
                        .Union(source.Compliance)
                        .Distinct()
                        .ToList();
                }
            }
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
