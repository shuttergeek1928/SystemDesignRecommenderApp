using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Services;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NodeSettingsController : ControllerBase
{
    private readonly INodeSettingsService _nodeSettingsService;

    public NodeSettingsController(INodeSettingsService nodeSettingsService)
    {
        _nodeSettingsService = nodeSettingsService;
    }

    [HttpGet("definitions")]
    public async Task<IActionResult> GetDefinitions()
    {
        return Ok(await _nodeSettingsService.GetDefinitionsAsync());
    }

    [HttpPost("definitions")]
    public async Task<IActionResult> SaveDefinition([FromBody] NodeDefinitionDto definition)
    {
        return Ok(await _nodeSettingsService.SaveDefinitionAsync(definition));
    }

    [HttpDelete("definitions/{key}")]
    public async Task<IActionResult> DeleteDefinition(string key)
    {
        await _nodeSettingsService.DeleteDefinitionAsync(key);
        return NoContent();
    }

    [HttpGet("merged")]
    public async Task<IActionResult> GetMergedSettings([FromQuery] Guid? teamId, [FromQuery] Guid? userId)
    {
        return Ok(await _nodeSettingsService.GetMergedSettingsAsync(teamId, userId));
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveSettings([FromBody] SaveNodeSettingsDto dto)
    {
        await _nodeSettingsService.SaveSettingsAsync(dto);
        return Ok();
    }
}
