using System;
using System.Collections.Generic;

namespace SystemDesignRecommenderApi.Domain.DTO;

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? TeamId { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string Role { get; set; } = string.Empty;
    public List<string> PrimarySkills { get; set; } = new();
    public List<string> SecondarySkills { get; set; } = new();
    public List<string> AdditionalSkills { get; set; } = new();
    public int Productivity { get; set; }
    public int Morale { get; set; }
    public int Satisfaction { get; set; }
    public int Performance { get; set; }
    public string LearningPace { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
}
