using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Domain.DTO;
using SystemDesignRecommenderApi.Services;
using ChatRequest = SystemDesignRecommenderApi.Domain.DTO.ChatRequest;

namespace SystemDesignRecommenderApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OllamaChatController : ControllerBase
    {
        private readonly IOllamaChatService _ollamaChatService;

        public OllamaChatController(IOllamaChatService ollamaChatService)
        {
            _ollamaChatService = ollamaChatService ?? throw new ArgumentNullException(nameof(ollamaChatService));
        }

        [HttpGet(Name = "Health Check")]
        public IActionResult Get()
        {
            return Ok(new { Message = "Ollama Chat API is running!" });
        }

        [HttpGet("models", Name = "GetAvailableModels")]
        public async Task<IActionResult> GetModels(CancellationToken ct = default)
        {
            try
            {
                var models = await _ollamaChatService.GetAvailableModelsAsync(ct);
                return Ok(new { models = models.ToList() });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, 
                    new { error = "Ollama service is not available. Please ensure Ollama is running." });
            }
            catch (OperationCanceledException)
            {
                return StatusCode(StatusCodes.Status408RequestTimeout, 
                    new { error = "Request timeout. The Ollama service took too long to respond." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { error = "An unexpected error occurred while fetching available models." });
            }
        }

        [HttpPost(Name = "ChatWithOllama")]
        public async Task<IActionResult> Post([FromBody] ChatRequest request,
                                          CancellationToken ct = default)
        {
            try
            {
                var answer = await _ollamaChatService.ChatAsync(request, ct);
                return Ok(new { answer });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, 
                    new { error = "Ollama service is not available. Please ensure Ollama is running." });
            }
            catch (OperationCanceledException)
            {
                return StatusCode(StatusCodes.Status408RequestTimeout, 
                    new { error = "Request timeout. The Ollama service took too long to respond." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { error = "An unexpected error occurred while processing the chat request." });
            }
        }
    }
}
