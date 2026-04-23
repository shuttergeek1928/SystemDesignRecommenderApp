using Microsoft.AspNetCore.Mvc;
using SystemDesignRecommenderApi.Clients;

namespace SystemDesignRecommenderApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AwsDocsController : ControllerBase
    {
        private readonly McpClient _mcp;

        public AwsDocsController(McpClient mcp)
        {
            _mcp = mcp;
        }

        [HttpGet("tools")]
        public async Task<IActionResult> Tools()
        {
            try
            {
                var result = await _mcp.ListTools();
                return Ok(result);
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { error = "MCP server timeout", message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            try
            {
                var result = await _mcp.SearchAwsDocs(query);
                return Ok(result);
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { error = "MCP server timeout", message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
    }
}
