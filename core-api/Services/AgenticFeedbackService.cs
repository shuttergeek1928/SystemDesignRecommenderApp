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

    public AgenticFeedbackService(IHubContext<AgentStatusHub> hubContext)
    {
        _hubContext = hubContext;
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
        if (!string.IsNullOrEmpty(connectionId))
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceivePipelineUpdate", step);
        }
        else
        {
            await _hubContext.Clients.All.SendAsync("ReceivePipelineUpdate", step);
        }
    }
}
