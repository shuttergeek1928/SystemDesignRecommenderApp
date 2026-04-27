using Microsoft.AspNetCore.SignalR;

namespace SystemDesignRecommenderApi.Hubs;

public class AgentStatusHub : Hub
{
    // Clients will connect to this hub to receive real-time status updates.
    // The server will push messages to specific clients or groups.

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected to AgentStatusHub: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected from AgentStatusHub: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }
}
