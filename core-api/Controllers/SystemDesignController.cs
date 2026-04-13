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

    public SystemDesignController(ISystemDesignService systemDesignService)
    {
        _systemDesignService = systemDesignService;
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
        
        if (request.UseRag)
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
            ArchitectureDesign = architecture
        });
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
