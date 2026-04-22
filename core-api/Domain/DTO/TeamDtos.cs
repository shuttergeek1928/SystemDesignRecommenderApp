namespace SystemDesignRecommenderApi.Domain.DTO;

public class CreateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
}

public class AddMemberDto
{
    public string Email { get; set; } = string.Empty;
}

public class ExitRequestDto
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
}
