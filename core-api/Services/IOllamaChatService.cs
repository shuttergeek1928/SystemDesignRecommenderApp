using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services
{
    /// <summary>
    /// Interface for interacting with Ollama chat models.
    /// </summary>
    public interface IOllamaChatService
    {
        /// <summary>
        /// Sends a chat request to the Ollama model and returns the response.
        /// </summary>
        /// <param name="request">The chat request containing messages and optional model/temperature settings.</param>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>The model's response text.</returns>
        Task<string> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the list of available models from Ollama.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>A list of available model names.</returns>
        Task<IEnumerable<string>> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
    }
}
