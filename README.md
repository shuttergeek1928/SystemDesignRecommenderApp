# Context-Aware Intelligent System Design Platform

A sophisticated hybrid reasoning platform designed to assist software architects in building scalable, reliable distributed systems. The application synthesizes LLM insights with deterministic architectural rules and RAG-enhanced technical documentation.

---

## 🏗️ Solution Flow

The application follows a modular architecture where the **.NET Core API** acts as the central orchestrator:

1.  **Ingestion**: User enters detailed technical requirements and non-functional goals through an expanded intake schema.
2.  **Agentic Observability Pipeline**:
    *   **SignalR Streaming**: Real-time visualization of the internal decision-making process.
    *   **Trace Viewer**: A horizontal execution flow showing stages from "Initialization" through "Critic Evaluation."
3.  **Hybrid Reasoning**:
    *   **LLM (Gemini/Ollama)**: Extracts technical dimensions and architectural nodes.
    *   **Deterministic Rule Engine**: Validates designs against 13+ best-practice constraint sets.
4.  **Dissertation-Grade Evaluation**:
    *   **Critic Agent**: Performs a 4-way audit (Alignment, Compliance, Readiness, Rubric).
    *   **Benchmarking**: Automatic side-by-side comparison against 40+ industry expert baselines.
5.  **Active Feedback Loop**: Users rate designs; negative feedback is injected back into future generations to drive continuous improvement.
6.  **Polyglot Persistence**: Comprehensive storage in **SQL Server** (Users/Rules) and **MongoDB** (Audit Trails/Trace Logs/History/Baselines).
7.  **Visualization**: Results displayed via **Architectural Radar**, **Rule Audit Table**, and **Benchmark Comparison View**.

---

## 🌟 Key Features

- **Agentic Observability Pipeline**: Real-time, horizontal trace viewer that visualizes every step of the recommendation logic via SignalR.
- **Benchmark Comparison Engine**: Quantitative evaluation system comparing AI recommendations against 40+ expert-curated architectural baselines (Expert, RAG-naive, and Hybrid).
- **Hybrid Reasoning Engine**: Combines the creativity of LLMs (Gemini 1.5 Flash/Pro) with the deterministic reliability of a C#-based rule engine.
- **Active Feedback Loop**: Implements a continuous learning mechanism where user feedback is persisted and used as context for subsequent generations.
- **Knowledge Base Explorer**: A dedicated UI for browsing the 40+ industry scenarios and their multi-dimensional baselines.
- **Agentic "Critic" Loop**: A self-correcting loop where a critic agent audits the design and forces regeneration if the integrity score falls below a threshold.
- **Advanced UX**: Premium dashboard featuring glassmorphism, animated transitions, and real-time generation status nodes.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Ollama**: Install [Ollama](https://ollama.com/) and pull models:
  ```bash
  ollama pull phi3
  ollama pull nomic-embed-text
  ```
- **SQL Server**: Access to a SQL Server instance (LocalDB or Express).
- **Python (3.10+)** & **Node.js (v20+)** & **.NET 10 SDK**.

### 2. Setup Database
Update the connection string in `core-api/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SystemDesignDb;Trusted_Connection=True;"
}
```

### 3. Run the Services

#### A. Python RAG Service
```bash
cd rag-engine
.\.venv\Scripts\python.exe rag_service.py
```
*Port: 8001*

#### B. .NET Core API (Orchestrator)
```bash
cd core-api
dotnet run
```
*Port: 5000 | Note: Migrations apply automatically on startup.*

#### C. Web Dashboard
```bash
cd web-dashboard
npm install
npm run dev
```
*Port: 3000*

---

## 🏗️ Project Structure

```text
├── core-api/            # ASP.NET Core 10 backend (Orchestration & Rules)
├── rag-engine/          # Python FastAPI service (RAG & ChromaDB)
├── web-dashboard/       # Next.js 14 frontend (UI & State Management)
├── data/                # Scenarios and benchmark data
├── docs/                # Architecture diagrams and technical specs
└── libraries/           # Shared components and utilities
```

---

## 🧠 Technology Stack

- **Frontend**: Next.js 14, Zustand (State), TailwindCSS, Framer Motion.
- **Backend**: ASP.NET Core 10, Entity Framework Core (SQL Server), OllamaSharp.
- **AI/ML**: Python 3.10, FastAPI, LangChain, ChromaDB.
- **Intelligence**: Ollama (Local LLM), Hybrid Rule Engine.

---

## 🛡️ License
Distributed under the MIT License.
