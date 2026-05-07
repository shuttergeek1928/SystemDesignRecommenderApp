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
    private readonly IBenchmarkService _benchmarkService;
    private readonly ILogger<SystemDesignController> _logger;
    private readonly IAgenticFeedbackService _feedbackService;

    public SystemDesignController(ISystemDesignService systemDesignService, IRuleEngineService ruleEngineService, IBenchmarkService benchmarkService, ILogger<SystemDesignController> logger, IAgenticFeedbackService feedbackService)
    {
        _systemDesignService = systemDesignService;
        _ruleEngineService = ruleEngineService;
        _benchmarkService = benchmarkService;
        _logger = logger;
        _feedbackService = feedbackService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDesign([FromBody] SystemDesignRequestDto request)
    {
        _logger.LogInformation("[GenerateDesign] Started. Problem: {Problem}, UseHybrid: {UseHybrid}", request.ProblemStatement, request.UseHybrid);
        if (string.IsNullOrWhiteSpace(request.ProblemStatement))
        {
            return BadRequest("Problem statement is required.");
        }

        // Step 1: Extract/Refine Requirements
        // If the request already contains structured requirements (e.g. from the baseline generator),
        // skip the expensive LLM extraction step to improve reliability and speed.
        Domain.Models.DesignRequirements requirements;

        if (request.Requirements != null && !string.IsNullOrEmpty(request.Requirements.Title))
        {
            _logger.LogInformation("[Pipeline] Requirements Extraction -> Success: Using provided requirements.");
            requirements = request.Requirements;
            
            // Send feedback to UI that extraction is "Complete" even if skipped
            await _feedbackService.SendPipelineStepAsync(request.ConnectionId ?? string.Empty, new Domain.Models.PipelineTraceStep {
                StepName = "Requirements Extraction",
                Status = "Success",
                Summary = $"Using provided requirements: {requirements.Title}",
                Details = "Structured input provided by user. Skipped LLM extraction loop.",
                Timestamp = DateTime.UtcNow
            });
        }
        else
        {
            Console.WriteLine("No structured requirements provided. Extracting from problem statement...");
            var extracted = await _systemDesignService.ExtractRequirementsAsync(request.ProblemStatement, request.ConnectionId);
            if (extracted == null && request.Requirements == null)
            {
                return StatusCode(500, "Failed to extract structured requirements from the LLM.");
            }
            requirements = extracted ?? new Domain.Models.DesignRequirements();

            // Merge explicit form requirements if provided as overlays
            if (request.Requirements != null)
            {
                Console.WriteLine("Merging explicit form requirements with LLM extraction...");

                if (!string.IsNullOrEmpty(request.Requirements.Title))
                    requirements.Title = request.Requirements.Title;

                if (!string.IsNullOrEmpty(request.Requirements.Description))
                    requirements.Description = request.Requirements.Description;

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

                    if (!string.IsNullOrEmpty(source.Budget)) target.Budget = source.Budget;
                    if (!string.IsNullOrEmpty(source.AvailabilitySlo)) target.AvailabilitySlo = source.AvailabilitySlo;
                    if (!string.IsNullOrEmpty(source.CloudProvider)) target.CloudProvider = source.CloudProvider;
                    if (!string.IsNullOrEmpty(source.RegionStrategy)) target.RegionStrategy = source.RegionStrategy;

                    if (source.Compliance != null && source.Compliance.Any())
                    {
                        target.Compliance = target.Compliance
                            .Union(source.Compliance)
                            .Distinct()
                            .ToList();
                    }
                }

                if (!string.IsNullOrEmpty(request.Requirements.Model)) requirements.Model = request.Requirements.Model;
                if (!string.IsNullOrEmpty(request.Requirements.Provider)) requirements.Provider = request.Requirements.Provider;
                if (!string.IsNullOrEmpty(request.Requirements.ApiKey)) requirements.ApiKey = request.Requirements.ApiKey;
            }
        }

        // Step 2: Generate Architecture Design based on requirements
        ArchitectureDesign? architecture = null;
        EvaluationResult? evaluation = null;
        GenerationResult? hybridResult = null;

        if (request.UseHybrid)
        {
            hybridResult = await _systemDesignService.GenerateHybridArchitectureAsync(request.ProblemStatement, requirements, request.UserId, request.TeamId, request.ConnectionId);
            architecture = hybridResult?.Architecture;
            evaluation = hybridResult?.Evaluation;
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
            SessionId = hybridResult?.SessionId,
            ExtractedRequirements = requirements,
            ArchitectureDesign = architecture,
            EvaluationScores = evaluation,
            TriggeredRules = request.UseHybrid ? await _ruleEngineService.EvaluateRulesAsync(requirements) : null
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] Guid? userId, [FromQuery] Guid? teamId)
    {
        _logger.LogInformation("[GetHistory] Fetching history for User: {UserId}, Team: {TeamId}", userId, teamId);
        var history = await _systemDesignService.GetSessionHistoryAsync(userId, teamId);
        return Ok(history);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionById(Guid id)
    {
        _logger.LogInformation("[GetSessionById] Fetching session {SessionId}", id);
        var session = await _systemDesignService.GetSessionByIdAsync(id);
        if (session == null) return NotFound("Session not found.");
        return Ok(session);
    }

    [HttpGet("{id}/benchmark")]
    public async Task<IActionResult> GetBenchmarkComparison(Guid id, [FromQuery] int? scenarioId = null)
    {
        _logger.LogInformation("[GetBenchmarkComparison] Benchmarking session {SessionId} with override scenario {ScenarioId}", id, scenarioId);
        var comparison = await _benchmarkService.CompareSessionWithBaselineAsync(id, scenarioId);
        if (comparison == null) return NotFound("Benchmark not found.");
        return Ok(comparison);
    }

    [HttpPost("extract-requirements")]
    public async Task<IActionResult> ExtractRequirements([FromBody] SystemDesignRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ProblemStatement))
        {
            return BadRequest("Problem statement is required.");
        }

        _logger.LogInformation("[ExtractRequirements] Received request for problem statement.");
        // Give SignalR a moment to stabilize if it was just connected
        await Task.Delay(200);
        var requirements = await _systemDesignService.ExtractRequirementsAsync(request.ProblemStatement, request.ConnectionId);

        if (requirements == null)
        {
            return StatusCode(500, "Failed to extract structured requirements from the LLM.");
        }

        return Ok(requirements);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        var result = await _systemDesignService.DeleteSessionAsync(id);
        if (!result) return NotFound("Session not found or could not be deleted.");
        return Ok(new { message = "Session deleted successfully." });
    }
}
