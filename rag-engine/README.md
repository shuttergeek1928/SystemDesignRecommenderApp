# RAG Engine Service

A Python-based FastAPI service that provides Retrieval-Augmented Generation (RAG) capabilities to the System Design Recommender platform.

## 🚀 Key Features

- **Contextual Retrieval**: Uses ChromaDB to store and retrieve technical documentation and expert architectural patterns.
- **Hybrid Generation**: Supports multiple generation modes, including Naive RAG and Feedback-Aware RAG.
- **Feedback Integration**: Optionally accepts historical user corrections to refine architectural recommendations.
- **Ollama Integration**: Seamlessly works with local models like `phi3` or `llama3` for embedded text generation.

## 🛠 Tech Stack

- **Framework**: FastAPI
- **Vector Database**: ChromaDB
- **LLM Orchestration**: LangChain
- **Embeddings**: Sentence Transformers (Local)

## 🏗 API Endpoints

- `POST /generate/rag`: Generate an architecture based on requirements and retrieved documents.
- `POST /ingest`: Add new technical documents to the vector store.
- `GET /health`: Check service status.

## 🚦 Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the service:
   ```bash
   python rag_service.py
   ```
   *The service defaults to port 8001.*

---
> [!NOTE]
> This service acts as the technical "memory" of the platform, providing the LLM with relevant context before the deterministic rule engine applies its constraints.
