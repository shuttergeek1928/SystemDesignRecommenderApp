# Core API Orchestrator

The central .NET Core 10 service responsible for orchestrating the hybrid system design recommendation pipeline, managing users, and enforcing architectural rules.

## 🚀 Key Responsibilities

- **Pipeline Orchestration**: Coordinates requests between the user, the RAG engine, and the Critic agent.
- **Rule Engine**: A deterministic engine that validates architectures against curated best-practice constraint sets.
- **Observability Hub**: Leverages SignalR to stream real-time execution traces to the dashboard.
- **Benchmarking Service**: Matches design sessions against industry baselines and computes accuracy metrics.
- **Persistence Management**: Manages polyglot storage across SQL Server and MongoDB.

## 🛠 Tech Stack

- **Framework**: ASP.NET Core 10
- **Database (Relational)**: MS SQL Server (EF Core)
- **Database (Document)**: MongoDB
- **Real-time**: SignalR
- **AI Integration**: OllamaSharp & Gemini API

## 🏗 Key Services

- `SystemDesignService`: Main entry point for generation logic.
- `EvaluationService`: Manages the agentic critic loop and integrity scoring.
- `BenchmarkService`: Handles industry alignment and baseline matching.
- `RuleEngineService`: Executes C#-based architectural constraints.

## 🚦 Getting Started

1. Ensure SQL Server and MongoDB are running.
2. Update `appsettings.json` with your connection strings.
3. Run the application:
   ```bash
   dotnet run
   ```
   *The API defaults to port 5000 (HTTP) and 5001 (HTTPS).*

---
> [!IMPORTANT]
> The Core API serves as the "brain" of the system, ensuring that LLM creativity is grounded in deterministic architectural principles.
