using Microsoft.AspNetCore.Mvc;
using Serilog.Context;

namespace SystemDesignRecommenderApi.Controllers;

public class UiLogEntry
{
    public string Message { get; set; } = string.Empty;
    public string Level { get; set; } = "Information";
}

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly ILogger<LogsController> _logger;

    public LogsController(ILogger<LogsController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public IActionResult Post([FromBody] UiLogEntry entry)
    {
        _logger.LogInformation("[Post] Received UI Log. Level: {Level}", entry.Level);
        using (LogContext.PushProperty("LogSource", "UI"))
        {
            switch (entry.Level.ToLower())
            {
                case "error":
                    _logger.LogError(entry.Message);
                    break;
                case "warning":
                    _logger.LogWarning(entry.Message);
                    break;
                case "debug":
                    _logger.LogDebug(entry.Message);
                    break;
                default:
                    _logger.LogInformation(entry.Message);
                    break;
            }
        }
        return Ok();
    }
}
