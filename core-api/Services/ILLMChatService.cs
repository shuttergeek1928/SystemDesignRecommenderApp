using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services
{
    /// <summary>
    /// Interface for interacting with LLM chat models (Ollama or Gemini).
    /// </summary>
    public interface ILLMChatService
    {
        /// <summary>
        /// Sends a chat request to the selected LLM and returns the response.
        /// </summary>
        /// <param name="request">The chat request containing messages.</param>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>The model's response text.</returns>
        Task<string> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the list of available local models (Ollama only).
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>A list of available model names.</returns>
        Task<IEnumerable<string>> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
    }
}
