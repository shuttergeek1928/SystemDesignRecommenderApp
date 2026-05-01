using Google.GenAI;
using Google.GenAI.Types;
using OllamaSharp;
using OllamaSharp.Models.Chat;
using System.Text;
using SystemDesignRecommenderApi.Domain.Models;
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
            var provider = settings.PreferredProvider ?? "ollama";
            var model = provider.ToLower() == "gemini" ? settings.GeminiModel : settings.OllamaModel;

            return await ChatAsync(request, provider, model, cancellationToken);
        }

        public async Task<string> ChatAsync(ChatRequest request, string provider, string model, CancellationToken cancellationToken = default)
        {
            var settings = _settingsService.GetSettings();

            if (provider?.ToLower() == "gemini")
            {
                return await ChatWithGeminiAsync(request, model, settings, cancellationToken);
            }

            return await ChatWithOllamaAsync(request, model, settings, cancellationToken);
        }

        private async Task<string> ChatWithOllamaAsync(ChatRequest request, string model, AppSettings settings, CancellationToken cancellationToken)
        {
            try
            {
                var messages = request.Messages.Select(m => new Message { Role = m.Role, Content = m.Content }).ToList();
                var modelName = string.IsNullOrWhiteSpace(model) ? settings.OllamaModel : model;

                _logger.LogInformation("Sending chat request to Ollama model: {Model}", modelName);
                _ollamaApiClient.SelectedModel = modelName;

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

        private async Task<string> ChatWithGeminiAsync(ChatRequest request, string model, AppSettings settings, CancellationToken cancellationToken)
        {
            int maxRetries = 3;
            int delayMs = 1000;

            for (int i = 0; i <= maxRetries; i++)
            {
                try
                {
                    if (string.IsNullOrEmpty(settings.GeminiApiKey))
                    {
                        throw new InvalidOperationException("Gemini API Key is missing in settings.");
                    }

                    var modelName = string.IsNullOrWhiteSpace(model) ? (string.IsNullOrWhiteSpace(settings.GeminiModel) ? "gemini-1.5-flash" : settings.GeminiModel.Trim()) : model.Trim();

                    // Initialize the Gemini client using the SDK
                    var client = new Client(apiKey: settings.GeminiApiKey);

                    // Prepare messages for the SDK
                    var contents = request.Messages.Select(m => new Content
                    {
                        Role = m.Role == "assistant" ? "model" : "user",
                        Parts = new List<Part> { new Part { Text = m.Content } }
                    }).ToList();

                    _logger.LogInformation("Sending chat request to Gemini model: {Model} using SDK (Attempt {Attempt})", modelName, i + 1);

                    var response = await client.Models.GenerateContentAsync(modelName, contents, cancellationToken: cancellationToken);

                    if (response?.Candidates == null || !response.Candidates.Any())
                    {
                        _logger.LogWarning("Gemini SDK returned no candidates.");
                        return "Model returned no output. Please check your API key and model selection.";
                    }

                    var text = response.Candidates[0].Content?.Parts?[0]?.Text;
                    return text ?? string.Empty;
                }
                catch (Exception ex) when (ex.Message.Contains("high demand") || ex.Message.Contains("503") || ex.Message.Contains("429"))
                {
                    if (i == maxRetries)
                    {
                        _logger.LogError(ex, "Gemini SDK chat failed after {Retries} retries due to high demand.", maxRetries);
                        throw;
                    }

                    _logger.LogWarning("Gemini high demand detected. Retrying in {Delay}ms...", delayMs);
                    await Task.Delay(delayMs, cancellationToken);
                    delayMs *= 2; // Exponential backoff
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Gemini SDK chat failed with a non-retryable error.");
                    throw;
                }
            }
            return string.Empty;
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

        public async Task<IEnumerable<string>> GetGeminiModelsAsync(string apiKey, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(apiKey)) return new List<string>();

                var url = $"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}";
                var response = await _httpClient.GetAsync(url, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini API returned {StatusCode} when listing models.", response.StatusCode);
                    return new List<string>();
                }

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                
                if (!doc.RootElement.TryGetProperty("models", out var modelsElement))
                    return new List<string>();

                var modelNames = new List<string>();
                foreach (var m in modelsElement.EnumerateArray())
                {
                    if (m.TryGetProperty("name", out var nameElement) && 
                        m.TryGetProperty("supportedGenerationMethods", out var methodsElement))
                    {
                        var methods = methodsElement.EnumerateArray().Select(x => x.GetString());
                        if (methods.Contains("generateContent"))
                        {
                            var name = nameElement.GetString()?.Replace("models/", "");
                            if (!string.IsNullOrEmpty(name)) modelNames.Add(name);
                        }
                    }
                }

                return modelNames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to list Gemini models via REST API.");
                return new List<string>();
            }
        }
    }
}
 