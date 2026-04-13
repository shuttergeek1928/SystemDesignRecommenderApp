namespace SystemDesignRecommenderApi.Domain.DTO
{
    public record ChatRequest(
            IList<MessageDto> Messages,
            string? Model = null,
            double? Temperature = null
        );

    public record MessageDto(string Role, string Content);
}
