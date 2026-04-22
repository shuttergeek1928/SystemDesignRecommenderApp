using OllamaSharp;
using OllamaSharp.Models.Chat;
using SystemDesignRecommenderApi.Domain.DTO;
using ChatRequest = SystemDesignRecommenderApi.Domain.DTO.ChatRequest;

namespace SystemDesignRecommenderApi.Services
{
    /// <summary>
    /// Service wrapper for Ollama chat client.
    /// Provides a simplified interface to interact with locally running Ollama models.
    /// </summary>
    public class OllamaChatService : IOllamaChatService
    {
        private readonly OllamaApiClient _ollamaApiClient;
        private readonly ISettingsService _settingsService;
        private readonly ILogger<OllamaChatService> _logger;

        public OllamaChatService(OllamaApiClient ollamaApiClient, ISettingsService settingsService, ILogger<OllamaChatService> logger)
        {
            _ollamaApiClient = ollamaApiClient ?? throw new ArgumentNullException(nameof(ollamaApiClient));
            _settingsService = settingsService ?? throw new ArgumentNullException(nameof(settingsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                // Validate input
                if (request?.Messages == null || request.Messages.Count == 0)
                {
                    throw new ArgumentException("Chat request must contain at least one message.", nameof(request));
                }

                // Convert DTOs to OllamaSharp models
                var messages = request.Messages
                    .Select(m => new Message
                    {
                        Role = m.Role,
                        Content = m.Content
                    })
                    .ToList();

                // Get model from settings
                var model = _settingsService.GetSettings().OllamaModel;

                _logger.LogInformation("Sending chat request to Ollama model: {Model}", model);

                // Set the model for the API client
                _ollamaApiClient.SelectedModel = model;

                // Create the chat request for OllamaSharp
                var ollamaRequest = new OllamaSharp.Models.Chat.ChatRequest { Messages = messages };

                // Send request to Ollama and get response (ChatAsync returns IAsyncEnumerable<ChatResponseStream>)
                var fullResponse = new System.Text.StringBuilder();
                await foreach (var streamResponse in _ollamaApiClient.ChatAsync(ollamaRequest, cancellationToken))
                {
                    if (streamResponse?.Message?.Content != null)
                    {
                        fullResponse.Append(streamResponse.Message.Content);
                    }
                }

                var answer = fullResponse.ToString();

                _logger.LogInformation("Received response from Ollama model: {Model}", model);

                return answer;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Chat request was cancelled.");
                throw;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to Ollama service. Ensure Ollama is running on the configured address.");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the chat request.");
                throw;
            }
        }

        /// <summary>
        /// Gets the list of available models from Ollama.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the async operation.</param>
        /// <returns>A list of available model names.</returns>
        public async Task<IEnumerable<string>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching available models from Ollama.");

                var models = await _ollamaApiClient.ListLocalModelsAsync(cancellationToken);

                var modelNames = models?.Select(m => m.Name).ToList() ?? new List<string>();

                _logger.LogInformation("Found {Count} available models.", modelNames.Count);

                return modelNames;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to Ollama service while listing models.");
                return new List<string>(); // Return empty list instead of throwing
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching available models.");
                return new List<string>(); // Return empty list instead of throwing
            }
        }
    }
}
