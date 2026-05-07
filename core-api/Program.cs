using Microsoft.EntityFrameworkCore;
using OllamaSharp;
using SystemDesignRecommenderApi.Clients;
using SystemDesignRecommenderApi.Domain.Data;
using SystemDesignRecommenderApi.Domain.Data.Mongo;
using SystemDesignRecommenderApi.Domain.Evaluation;
using SystemDesignRecommenderApi.Hubs;
using SystemDesignRecommenderApi.Services;
using Serilog;
using Serilog.Events;
using Serilog.Filters;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProcessId()
    .Enrich.WithThreadId()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Logger(lc => lc
        .Filter.ByExcluding(le => le.Properties.ContainsKey("LogSource") && le.Properties["LogSource"].ToString().Contains("UI"))
        .WriteTo.File("logs/server-.log", 
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}"))
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(le => le.Properties.ContainsKey("LogSource") && le.Properties["LogSource"].ToString().Contains("UI"))
        .WriteTo.File("logs/ui-.log", 
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [UI] {Message:lj}{NewLine}{Exception}"))
    .CreateLogger();

builder.Host.UseSerilog();

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
builder.Services.AddScoped<IBenchmarkService, BenchmarkService>();

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
            policy.WithOrigins("http://localhost:3000") // Dashboard default
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true); // Broadly allow for dev
        });
});

var app = builder.Build();

// Automatically apply migrations at startup
try
{
    Console.WriteLine("Starting startup tasks (Migrations & Seeding)...");
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<DesignDbContext>();
        Console.WriteLine("Applying SQL Migrations...");
        dbContext.Database.Migrate();
        Console.WriteLine("SQL Migrations completed.");

        // Seed MongoDB
        Console.WriteLine("Starting Database Seeding...");
        DatabaseSeeder.SeedAsync(app.Services).GetAwaiter().GetResult();
        Console.WriteLine("Database Seeding completed.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL ERROR during startup: {ex.Message}");
    Log.Fatal(ex, "An error occurred during migration or seeding.");
}

app.UseCors("AllowAll");
app.UseWebSockets();

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
