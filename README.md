# Context-Aware Intelligent System Design Platform

A sophisticated hybrid reasoning platform designed to assist software architects in building scalable, reliable distributed systems. The application synthesizes LLM insights with deterministic architectural rules and RAG-enhanced technical documentation.

---

## 🏗️ Solution Flow

The application follows a modular architecture where the **.NET Core API** acts as the central orchestrator:

1.  **Ingestion**: User enters a natural language problem statement (e.g., "Build a ride-sharing app") and non-functional goals via the **Next.js Dashboard**.
2.  **Hybrid Extraction**:
    *   **LLM** extracts technical dimensions (Request Rate, Latency, Team Size).
    *   **Deterministic Rule Engine** evaluates these dimensions against 20+ architectural best practices (e.g., "If Team < 8, recommend Modular Monolith").
3.  **Reasoning synthesis**:
    *   The orchestrator injects these "Rule-Based Anchors" into a specialized LLM prompt.
    *   If **RAG Mode** is active, technical context is retrieved from **ChromaDB** based on the prompt.
4.  **Persistence**: The final architecture, requirements, and triggered rules are saved to **SQL Server** for history and multi-tenancy.
5.  **Visualization**: Results are displayed in the dashboard as "Proposed Architecture" with "Reasoning Anchors" showing clear justifications.

---

## 🌟 Key Features

- **Hybrid Reasoning Engine**: Combines the creativity of LLMs (Phi-3) with the reliability of deterministic rule-based anchors.
- **RAG-Enhanced Analysis**: Leverages expert documentation (AWS Well-Architected, GCP Cloud Architecture Center) from a local vector store.
- **Persistent Sessions**: Entire design history is stored in SQL Server with automatic startup migrations.
- **Multi-Tenancy Support**: Database schema ready for User and Team level segregation.
- **Advanced UX**: Premium Next.js 14 dashboard with glassmorphism, Framer Motion animations, and real-time validation.

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
