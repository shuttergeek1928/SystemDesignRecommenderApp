# AI-Powered System Design Assistant

A sophisticated multi-agent system designed to assist software architects and engineers in designing scalable, reliable, and cost-effective distributed systems. The application combines the power of LLMs with Retrieval-Augmented Generation (RAG) using expert architecture documentation.

---

## 🌟 Features

- **Requirement Extraction**: Automatically converts natural language problem statements into structured design requirements (Scale, SLO, Constraints).
- **Architecture Synthesis**: Generates high-level architectural designs including Database, Caching, Messaging, Deployment, and Observability choices.
- **Baseline Comparison**: 
  - **Baseline A**: expert decisions (Ground Truth).
  - **Baseline B**: Generic LLM reasoning (LLM Only).
  - **Baseline C**: RAG-enhanced reasoning (LLM + Expert Documentation).
- **Modern Dashboard**: A premium Next.js 14 dashboard with glassmorphism design and real-time design insights.

---

## 🏗️ Project Structure

```text
├── apps/
│   ├── dotnet-api/          # ASP.NET Core 10 backend (Orchestrator)
│   ├── next-web/            # Next.js 14 frontend (Next UI)
│   ├── pyhton/              # Python RAG & Scraper Module
│   │   ├── Scrapper/        # Web Scraper & Knowledge Indexer
│   │   └── rag_service.py   # FastAPI RAG Service (Port 8001)
│   └── baselines/           # Datasets (Expert vs LLM vs RAG)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Ollama**: Install [Ollama](https://ollama.com/) and pull the models:
  ```powershell
  ollama pull phi3
  ollama pull nomic-embed-text
  ```
- **.NET 10 SDK**
- **Node.js (v20+)**
- **Python (3.10+)**

### 2. Run the Python RAG Service
The RAG service provides searchable access to technical documentation (AWS, GCP, etc.).
```powershell
cd apps/pyhton
# Ensure you have your venv setup in Scrapper/
.\Scrapper\.venv\Scripts\python.exe rag_service.py
```
*Port: 8001*

### 3. Run the .NET API
The central orchestrator that manages logic and LLM calls.
```powershell
cd apps/dotnet-api/SystemDesignRecommenderApi
dotnet run
```
*Port: 5000 / 5220*

### 4. Run the Web Application
The user interface.
```powershell
cd apps/next-web/system-design-webapp
npm install
npm run dev
```
*Port: 3000*

---

## 🧠 Benchmarking & Evaluation

The system is tested against `architecture_dataset_40.json` (40 real-world system design scenarios). 

To compare architectural decisions:
1. Use the **Wizard** in the Web App.
2. Toggle **"Enhanced RAG Mode"** for deep analysis using Baseline C.
3. Compare justifications against the expert baselines located in the `apps/baselines` folder.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Lucide Icons.
- **Backend**: ASP.NET Core 10 Web API, OllamaSharp.
- **AI/ML**: Python, LangChain, ChromaDB, Ollama (Phi-3).
- **Vector DB**: ChromaDB for documenting architectural patterns.

---

## 🛡️ License
Distributed under the MIT License.
