using SystemDesignRecommenderApi.Domain.DTO;

namespace SystemDesignRecommenderApi.Services
{
    /// <summary>
    /// Interface for interacting with LLM chat models (Ollama or Gemini).
    /// </summary>
    public interface ILLMChatService
    {
        Task<string> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sends a chat request to a specific LLM provider and model.
        /// </summary>
        /// <param name="request">The chat request.</param>
        /// <param name="provider">The provider name (gemini/ollama).</param>
        /// <param name="model">The specific model name.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<string> ChatAsync(ChatRequest request, string provider, string model, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the list of available local models (Ollama only).
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>A list of available model names.</returns>
        Task<IEnumerable<string>> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
    }
}
