using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Services;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly IOllamaChatService _ollamaChatService;

    public SettingsController(ISettingsService settingsService, IOllamaChatService ollamaChatService)
    {
        _settingsService = settingsService;
        _ollamaChatService = ollamaChatService;
    }

    [HttpGet]
    public ActionResult<AppSettings> GetSettings()
    {
        return Ok(_settingsService.GetSettings());
    }

    [HttpPost]
    public ActionResult UpdateSettings([FromBody] AppSettings settings)
    {
        _settingsService.UpdateSettings(settings);
        return Ok();
    }

    [HttpGet("models")]
    public async Task<ActionResult<IEnumerable<string>>> GetAvailableModels()
    {
        var models = await _ollamaChatService.GetAvailableModelsAsync();
        return Ok(models);
    }
}
