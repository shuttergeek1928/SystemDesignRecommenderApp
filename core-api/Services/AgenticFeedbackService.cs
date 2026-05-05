using Microsoft.AspNetCore.SignalR;
using SystemDesignRecommenderApi.Hubs;

namespace SystemDesignRecommenderApi.Services;

public interface IAgenticFeedbackService
{
    Task SendStatusAsync(string connectionId, string message);
    Task BroadcastStatusAsync(string message);
    Task SendPipelineStepAsync(string connectionId, SystemDesignRecommenderApi.Domain.Models.PipelineTraceStep step);
}

public class AgenticFeedbackService : IAgenticFeedbackService
{
    private readonly IHubContext<AgentStatusHub> _hubContext;
    private readonly ILogger<AgenticFeedbackService> _logger;

    public AgenticFeedbackService(IHubContext<AgentStatusHub> hubContext, ILogger<AgenticFeedbackService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendStatusAsync(string connectionId, string message)
    {
        if (!string.IsNullOrEmpty(connectionId))
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveAgentStatus", message);
        }
        else
        {
            await BroadcastStatusAsync(message);
        }
    }

    public async Task BroadcastStatusAsync(string message)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveAgentStatus", message);
    }

    public async Task SendPipelineStepAsync(string connectionId, SystemDesignRecommenderApi.Domain.Models.PipelineTraceStep step)
    {
        _logger.LogInformation("[SignalR] Sending update: {StepName} ({Status}) to ConnectionId: {ConnectionId}", step.StepName, step.Status, connectionId ?? "ALL");
        
        if (!string.IsNullOrEmpty(connectionId))
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceivePipelineUpdate", step);
        }
        
        // Always broadcast as a safety fallback during development to prevent "stale connection" issues
        await _hubContext.Clients.All.SendAsync("ReceivePipelineUpdate", step);
    }
}
