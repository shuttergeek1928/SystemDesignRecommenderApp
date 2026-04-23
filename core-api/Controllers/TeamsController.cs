using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;
using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly DesignDbContext _context;

    public TeamsController(DesignDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var teams = await _context.Teams
            .Include(t => t.Members)
            .Select(t => new
            {
                t.Id,
                t.Name,
                ManagerId = t.OwnerId,
                Members = t.Members.Select(m => new { m.Id, m.Username, m.Email })
            })
            .ToListAsync();
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeamDetails(Guid id)
    {
        var team = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.Owner)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null) return NotFound();

        return Ok(new
        {
            team.Id,
            team.Name,
            Owner = new { team.Owner.Id, team.Owner.Username, team.Owner.Email },
            Members = team.Members.Select(m => new { m.Id, m.Username, m.Email })
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto request)
    {
        var owner = await _context.Users.FindAsync(request.OwnerId);
        if (owner == null) return NotFound("Owner not found.");

        if (owner.TeamId != null) return BadRequest("User is already in a team.");

        var team = new Team
        {
            Name = request.Name,
            OwnerId = request.OwnerId
        };

        _context.Teams.Add(team);

        // Add owner to team members too
        owner.TeamId = team.Id;

        await _context.SaveChangesAsync();

        return Ok(new { team.Id, team.Name });
    }

    [HttpPost("{teamId}/add-member")]
    public async Task<IActionResult> AddMember(Guid teamId, [FromBody] AddMemberDto request)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team == null) return NotFound("Team not found.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound("User not found.");

        if (user.TeamId != null) return BadRequest("User is already in a team.");

        user.TeamId = teamId;
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Username, user.Email });
    }

    [HttpPost("{teamId}/remove-member/{userId}")]
    public async Task<IActionResult> RemoveMember(Guid teamId, Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TeamId == teamId);
        if (user == null) return NotFound("User not found in team.");

        user.TeamId = null;

        // Remove any pending exit requests
        var pendingRequests = await _context.TeamExitRequests
            .Where(r => r.UserId == userId && r.TeamId == teamId && r.Status == "Pending")
            .ToListAsync();

        foreach (var req in pendingRequests)
        {
            req.Status = "Approved"; // Automatically approve since they are being removed
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("exit-request")]
    public async Task<IActionResult> RequestExit([FromBody] ExitRequestDto request)
    {
        var existingRequest = await _context.TeamExitRequests
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.TeamId == request.TeamId && r.Status == "Pending");

        if (existingRequest != null) return BadRequest("Exit request already pending.");

        var exitRequest = new TeamExitRequest
        {
            UserId = request.UserId,
            TeamId = request.TeamId,
            Status = "Pending"
        };

        _context.TeamExitRequests.Add(exitRequest);
        await _context.SaveChangesAsync();

        return Ok(new { exitRequest.Id, exitRequest.Status });
    }

    [HttpGet("{teamId}/exit-requests")]
    public async Task<IActionResult> GetExitRequests(Guid teamId)
    {
        var requests = await _context.TeamExitRequests
            .Include(r => r.User)
            .Where(r => r.TeamId == teamId && r.Status == "Pending")
            .Select(r => new
            {
                r.Id,
                r.RequestDate,
                User = new { r.User.Id, r.User.Username, r.User.Email }
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpPost("exit-request/{requestId}/approve")]
    public async Task<IActionResult> ApproveExitRequest(Guid requestId)
    {
        var exitRequest = await _context.TeamExitRequests.FindAsync(requestId);
        if (exitRequest == null) return NotFound();

        exitRequest.Status = "Approved";

        var user = await _context.Users.FindAsync(exitRequest.UserId);
        if (user != null && user.TeamId == exitRequest.TeamId)
        {
            user.TeamId = null;
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("exit-request/{requestId}/reject")]
    public async Task<IActionResult> RejectExitRequest(Guid requestId)
    {
        var exitRequest = await _context.TeamExitRequests.FindAsync(requestId);
        if (exitRequest == null) return NotFound();

        exitRequest.Status = "Rejected";

        await _context.SaveChangesAsync();

        return Ok();
    }
}
