using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemDesignRecommenderApi.Domain.Models;
using OllamaSharp;
using OllamaSharp.Models.Chat;
using SystemDesignRecommenderApi.Domain.DTO;
using Google.GenAI;
using Google.GenAI.Types;
using ChatRequest = SystemDesignRecommenderApi.Domain.DTO.ChatRequest;

namespace SystemDesignRecommenderApi.Services
{
    public class LLMChatService : ILLMChatService
    {
        private readonly OllamaApiClient _ollamaApiClient;
        private readonly ISettingsService _settingsService;
        private readonly ILogger<LLMChatService> _logger;
        private readonly HttpClient _httpClient;

        public LLMChatService(
            OllamaApiClient ollamaApiClient, 
            ISettingsService settingsService, 
            ILogger<LLMChatService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _ollamaApiClient = ollamaApiClient ?? throw new ArgumentNullException(nameof(ollamaApiClient));
            _settingsService = settingsService ?? throw new ArgumentNullException(nameof(settingsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<string> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default)
        {
            var settings = _settingsService.GetSettings();
            
            if (settings.PreferredProvider?.ToLower() == "gemini")
            {
                return await ChatWithGeminiAsync(request, settings, cancellationToken);
            }
            
            return await ChatWithOllamaAsync(request, settings, cancellationToken);
        }

        private async Task<string> ChatWithOllamaAsync(ChatRequest request, AppSettings settings, CancellationToken cancellationToken)
        {
            try
            {
                var messages = request.Messages.Select(m => new Message { Role = m.Role, Content = m.Content }).ToList();
                var model = settings.OllamaModel;

                _logger.LogInformation("Sending chat request to Ollama model: {Model}", model);
                _ollamaApiClient.SelectedModel = model;

                var ollamaRequest = new OllamaSharp.Models.Chat.ChatRequest { Messages = messages };
                var fullResponse = new StringBuilder();
                
                await foreach (var streamResponse in _ollamaApiClient.ChatAsync(ollamaRequest, cancellationToken))
                {
                    if (streamResponse?.Message?.Content != null)
                    {
                        fullResponse.Append(streamResponse.Message.Content);
                    }
                }

                return fullResponse.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ollama chat failed.");
                throw;
            }
        }

        private async Task<string> ChatWithGeminiAsync(ChatRequest request, AppSettings settings, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrEmpty(settings.GeminiApiKey))
                {
                    throw new InvalidOperationException("Gemini API Key is missing in settings.");
                }

                var modelName = string.IsNullOrWhiteSpace(settings.GeminiModel) ? "gemini-3.1-flash-lite-preview" : settings.GeminiModel.Trim();
                
                // Initialize the Gemini client using the SDK
                var client = new Client(apiKey: settings.GeminiApiKey);
                
                // Prepare messages for the SDK
                var contents = request.Messages.Select(m => new Content
                {
                    Role = m.Role == "assistant" ? "model" : "user",
                    Parts = new List<Part> { new Part { Text = m.Content } }
                }).ToList();

                _logger.LogInformation("Sending chat request to Gemini model: {Model} using SDK", modelName);
                
                var response = await client.Models.GenerateContentAsync(modelName, contents, cancellationToken: cancellationToken);
                
                if (response?.Candidates == null || !response.Candidates.Any())
                {
                    _logger.LogWarning("Gemini SDK returned no candidates.");
                    return "Model returned no output. Please check your API key and model selection.";
                }

                var text = response.Candidates[0].Content?.Parts?[0]?.Text;
                return text ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini SDK chat failed.");
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var models = await _ollamaApiClient.ListLocalModelsAsync(cancellationToken);
                return models?.Select(m => m.Name).ToList() ?? new List<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to list Ollama models.");
                return new List<string>();
            }
        }
    }
}
