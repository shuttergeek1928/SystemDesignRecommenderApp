# Context-Aware Intelligent System Design Platform

A sophisticated hybrid reasoning platform designed to assist software architects in building scalable, reliable distributed systems. The application synthesizes LLM insights with deterministic architectural rules and RAG-enhanced technical documentation.

---

## 🏗️ Solution Flow

The application follows a modular architecture where the **.NET Core API** acts as the central orchestrator:

1.  **Ingestion**: User enters a natural language problem statement and non-functional goals.
2.  **Hybrid Extraction**:
    *   **LLM** extracts technical dimensions.
    *   **Deterministic Rule Engine** evaluates these against best practices.
3.  **Agentic Evaluation**:
    *   The **Critic Agent (Gemini)** performs a 4-way audit (Alignment, Compliance, Readiness, Rubric).
    *   The system performs a **self-correction loop** if the initial design score is too low.
4.  **Polyglot Persistence**: The session, requirements, rules, and AI audit report are stored across **SQL Server** and **MongoDB**.
5.  **Visualization**: Results are displayed with an **Architectural Radar** and a detailed **Rule Engine Audit** showing matched vs. idle constraints.

---

## 🌟 Key Features

- **Hybrid Reasoning Engine**: Combines LLM creativity with deterministic rule-based anchors.
- **Agentic "Critic" Loop**: A Gemini-powered critic that audits designs and forces regenerations for sub-par results.
- **Architectural Audit Dashboard**: Real-time visualization of system integrity using Radar Charts and Rule Audits.
- **Polyglot Persistence**: Strategic use of SQL Server (Rules/Users) and MongoDB (History/Blueprints).
- **RAG-Enhanced Analysis**: Technical context retrieved from local expert documentation.
- **Advanced UX**: Premium dashboard with real-time SignalR status updates during generation.

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
