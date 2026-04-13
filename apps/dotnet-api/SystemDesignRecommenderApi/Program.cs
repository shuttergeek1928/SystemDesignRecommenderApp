using OllamaSharp;
using SystemDesignRecommenderApi.Clients;
using SystemDesignRecommenderApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register Ollama services
builder.Services.AddSingleton(new OllamaApiClient(new Uri("http://localhost:11434")));
builder.Services.AddSingleton<IOllamaChatService, OllamaChatService>();
builder.Services.AddScoped<ISystemDesignService, SystemDesignService>();
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

var client = app.Services.GetRequiredService<McpClient>();
await client.StartAsync();

app.MapControllers();


app.Run();
