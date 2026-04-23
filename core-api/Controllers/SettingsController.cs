using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Domain.Models;
using SystemDesignRecommenderApi.Services;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly ILLMChatService _llmChatService;

    public SettingsController(ISettingsService settingsService, ILLMChatService llmChatService)
    {
        _settingsService = settingsService;
        _llmChatService = llmChatService;
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
        var models = await _llmChatService.GetAvailableModelsAsync();
        return Ok(models);
    }
}
