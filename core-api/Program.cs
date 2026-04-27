using Microsoft.EntityFrameworkCore;
using OllamaSharp;
using SystemDesignRecommenderApi.Clients;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Evaluation;
using SystemDesignRecommenderApi.Hubs;
using SystemDesignRecommenderApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Register Database
builder.Services.AddDbContext<DesignDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddSingleton<MongoDbContext>();

// Register Ollama services
builder.Services.AddSingleton(new OllamaApiClient(new Uri(builder.Configuration["Ollama:Endpoint"] ?? "http://localhost:11434")));
builder.Services.AddSingleton<ILLMChatService, LLMChatService>();
builder.Services.AddSingleton<ISettingsService, SettingsService>();
builder.Services.AddScoped<IRuleEngineService, RuleEngineService>();
builder.Services.AddScoped<ISystemDesignService, SystemDesignService>();
builder.Services.AddScoped<INodeSettingsService, NodeSettingsService>();

// Register Evaluation Services
builder.Services.AddScoped<IEvaluationConstraint, CostConstraint>();
builder.Services.AddScoped<IEvaluationConstraint, SecurityConstraint>();
builder.Services.AddScoped<IEvaluationConstraint, OperationalConstraint>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();
builder.Services.AddScoped<IAgenticFeedbackService, AgenticFeedbackService>();

builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<McpClient>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Automatically apply migrations at startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DesignDbContext>();
    dbContext.Database.Migrate();

    // Seed MongoDB
    DatabaseSeeder.SeedAsync(app.Services).GetAwaiter().GetResult();
}

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<AgentStatusHub>("/hubs/agentStatus");

app.Run();
