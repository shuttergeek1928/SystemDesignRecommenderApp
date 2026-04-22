using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;
using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DesignDbContext _context;

    public AuthController(DesignDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest("Email already exists.");
        }

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest("Username already exists.");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            TeamId = request.TeamId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Return user without password
        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.TeamId
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var hash = HashPassword(request.Password);
        
        var user = await _context.Users
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == hash);

        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.TeamId,
            TeamName = user.Team?.Name
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Profile)
            .Select(u => new 
            { 
                u.Id, 
                u.Username, 
                u.Email, 
                u.TeamId,
                Role = u.Profile != null ? u.Profile.Role : "Member",
                PrimarySkills = u.Profile != null ? u.Profile.PrimarySkills : "[]",
                SecondarySkills = u.Profile != null ? u.Profile.SecondarySkills : "[]",
                AdditionalSkills = u.Profile != null ? u.Profile.AdditionalSkills : "[]",
                Productivity = u.Profile != null ? u.Profile.Productivity : 90,
                Morale = u.Profile != null ? u.Profile.Morale : 85,
                Satisfaction = u.Profile != null ? u.Profile.Satisfaction : 88,
                Performance = u.Profile != null ? u.Profile.Performance : 92,
                LearningPace = u.Profile != null ? u.Profile.LearningPace : "Moderate",
                Goal = u.Profile != null ? u.Profile.Goal : ""
            })
            .ToListAsync();
            
        return Ok(users);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto request)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == id);
            
        if (user == null) return NotFound("User not found.");

        if (user.Profile == null)
        {
            user.Profile = new UserProfile { UserId = id };
            _context.UserProfiles.Add(user.Profile);
        }

        user.Profile.Role = request.Role;
        user.Profile.PrimarySkills = System.Text.Json.JsonSerializer.Serialize(request.PrimarySkills);
        user.Profile.SecondarySkills = System.Text.Json.JsonSerializer.Serialize(request.SecondarySkills);
        user.Profile.AdditionalSkills = System.Text.Json.JsonSerializer.Serialize(request.AdditionalSkills);
        user.Profile.Productivity = request.Productivity;
        user.Profile.Morale = request.Morale;
        user.Profile.Satisfaction = request.Satisfaction;
        user.Profile.Performance = request.Performance;
        user.Profile.LearningPace = request.LearningPace;
        user.Profile.Goal = request.Goal;

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
