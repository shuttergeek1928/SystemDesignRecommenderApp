using Microsoft.EntityFrameworkCore;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Entities;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Services;

public class SettingsService : ISettingsService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SettingsService> _logger;
    private AppSettings? _cache;
    private DateTime _cacheExpiration = DateTime.MinValue;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    // Hardcoded defaults
    private const string DefaultOllamaModel = "qwen2.5-coder:7b";
    private const string DefaultGeminiModel = "gemini-1.5-flash";

    public SettingsService(
        IServiceScopeFactory scopeFactory, 
        IConfiguration configuration,
        ILogger<SettingsService> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AppSettings> GetSettingsAsync()
    {
        if (_cache != null && DateTime.UtcNow < _cacheExpiration)
        {
            return _cache;
        }

        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DesignDbContext>();
        var entity = await context.AppGlobalSettings.FirstOrDefaultAsync(s => s.Id == 1);

        if (entity == null)
        {
            _logger.LogInformation("No global settings found in database. Seeding from configuration...");
            entity = await SeedSettingsAsync(context);
        }

        _cache = MapToModel(entity);
        _cacheExpiration = DateTime.UtcNow.Add(CacheDuration);
        return _cache;
    }

    public async Task UpdateSettingsAsync(AppSettings settings)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DesignDbContext>();
        var entity = await context.AppGlobalSettings.FirstOrDefaultAsync(s => s.Id == 1);

        if (entity == null)
        {
            entity = new AppGlobalSetting { Id = 1 };
            context.AppGlobalSettings.Add(entity);
        }

        UpdateEntity(entity, settings);
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        
        // Invalidate cache
        _cache = settings;
        _cacheExpiration = DateTime.UtcNow.Add(CacheDuration);
    }

    public async Task<(string Provider, string Model)> ResolveModelAsync(PipelinePhase phase)
    {
        var settings = await GetSettingsAsync();
        string provider;
        string model;

        switch (phase)
        {
            case PipelinePhase.Extraction:
                provider = settings.ExtractionProvider ?? "ollama";
                model = settings.ExtractionModel ?? (provider == "ollama" ? DefaultOllamaModel : DefaultGeminiModel);
                break;
            case PipelinePhase.Generation:
                provider = settings.GenerationProvider ?? "gemini";
                model = settings.GenerationModel ?? (provider == "ollama" ? DefaultOllamaModel : DefaultGeminiModel);
                break;
            case PipelinePhase.Evaluation:
                provider = settings.EvaluationProvider ?? "gemini";
                model = settings.EvaluationModel ?? (provider == "ollama" ? DefaultOllamaModel : DefaultGeminiModel);
                break;
            default:
                provider = "ollama";
                model = provider == "ollama" ? DefaultOllamaModel : DefaultGeminiModel;
                break;
        }

        // IRONCLAD FIX: Prevent cross-provider model leakage
        if (provider == "ollama" && model.ToLower().Contains("gemini"))
        {
            _logger.LogWarning("[ResolveModel] Provider is Ollama but Gemini model '{Model}' was detected. Forcing to default Ollama model.", model);
            model = DefaultOllamaModel;
        }
        else if (provider.Contains("gemini") && !model.ToLower().Contains("gemini"))
        {
            _logger.LogWarning("[ResolveModel] Provider is Gemini but local model '{Model}' was detected. Forcing to default Gemini model.", model);
            model = DefaultGeminiModel;
        }

        return (provider, model);
    }

    private async Task<AppGlobalSetting> SeedSettingsAsync(DesignDbContext context)
    {
        var entity = new AppGlobalSetting
        {
            Id = 1,
            GeminiApiKey = _configuration["Gemini:ApiKey"],
            
            ExtractionProvider = _configuration["App:ExtractionProvider"] ?? "ollama",
            ExtractionModel = _configuration["App:ExtractionModel"] ?? _configuration["Ollama:Model"] ?? DefaultOllamaModel,
            
            GenerationProvider = _configuration["App:GenerationProvider"] ?? "gemini",
            GenerationModel = _configuration["App:GenerationModel"] ?? _configuration["Gemini:Model"] ?? "gemini-3-flash-preview",
            
            EvaluationProvider = _configuration["App:EvaluationProvider"] ?? "gemini",
            EvaluationModel = _configuration["App:EvaluationModel"] ?? "gemini-1.5-pro"
        };

        context.AppGlobalSettings.Add(entity);
        await context.SaveChangesAsync();
        return entity;
    }

    private AppSettings MapToModel(AppGlobalSetting entity)
    {
        return new AppSettings
        {
            GeminiApiKey = entity.GeminiApiKey,
            ExtractionProvider = entity.ExtractionProvider,
            ExtractionModel = entity.ExtractionModel,
            GenerationProvider = entity.GenerationProvider,
            GenerationModel = entity.GenerationModel,
            EvaluationProvider = entity.EvaluationProvider,
            EvaluationModel = entity.EvaluationModel
        };
    }

    private void UpdateEntity(AppGlobalSetting entity, AppSettings model)
    {
        entity.GeminiApiKey = model.GeminiApiKey;
        
        // Sanitize Extraction
        entity.ExtractionProvider = model.ExtractionProvider;
        entity.ExtractionModel = model.ExtractionModel;
        if (entity.ExtractionProvider == "ollama" && entity.ExtractionModel?.ToLower().Contains("gemini") == true)
            entity.ExtractionModel = DefaultOllamaModel;
        else if (entity.ExtractionProvider == "gemini" && entity.ExtractionModel?.ToLower().Contains("gemini") == false)
            entity.ExtractionModel = DefaultGeminiModel;

        // Sanitize Generation
        entity.GenerationProvider = model.GenerationProvider;
        entity.GenerationModel = model.GenerationModel;
        if (entity.GenerationProvider == "ollama" && entity.GenerationModel?.ToLower().Contains("gemini") == true)
            entity.GenerationModel = DefaultOllamaModel;
        else if (entity.GenerationProvider == "gemini" && entity.GenerationModel?.ToLower().Contains("gemini") == false)
            entity.GenerationModel = DefaultGeminiModel;

        // Sanitize Evaluation
        entity.EvaluationProvider = model.EvaluationProvider;
        entity.EvaluationModel = model.EvaluationModel;
        if (entity.EvaluationProvider == "ollama" && entity.EvaluationModel?.ToLower().Contains("gemini") == true)
            entity.EvaluationModel = DefaultOllamaModel;
        else if (entity.EvaluationProvider == "gemini" && entity.EvaluationModel?.ToLower().Contains("gemini") == false)
            entity.EvaluationModel = DefaultGeminiModel;
    }
}
