# Agentic System Design Evaluation Framework

This framework provides a multi-dimensional, agentic approach to evaluating software architecture recommendations. It combines deterministic rule checking, LLM-based critique, and quantitative benchmarking against industry standards.

## 🏗️ Core Architecture

The evaluation pipeline is orchestrated by the `.NET Core API` and leverages a hybrid approach:
1.  **Extraction**: Requirements are parsed into technical dimensions.
2.  **Observability**: Every internal decision is streamed via SignalR to the **Pipeline Trace Viewer**.
3.  **Deterministic Rules**: A C#-based engine validates the design against best practices.
4.  **Agentic Critic**: A Gemini-powered "Critic Agent" audits the design across Cost, Security, and Operational Readiness.
5.  **Benchmark Comparison**: The final recommendation is scored against expert-curated baselines.

## 🌟 Key Features

### 1. Agentic Observability Pipeline
- **Live Trace Viewer**: A horizontal execution flow that visualizes every step of the recommendation process in real-time.
- **Granular Logs**: Internal state transitions (e.g., "Initializing Rule Engine", "Critic Audit in Progress") are streamed to the UI for full transparency.

### 2. Multi-Baseline Benchmarking
- **Industry Alignment**: Designs are compared against 40+ reference scenarios stored in MongoDB.
- **Baseline A (Expert)**: Gold-standard architectures curated by senior architects.
- **Baseline B (Naive RAG)**: Basic retrieval-augmented generation without advanced reasoning.
- **Baseline C (Hybrid)**: The current system's output, used for continuous benchmarking.
- **Accuracy Scoring**: Quantitative metrics based on node-level matching and semantic similarity.

### 3. Active Feedback Learning Loop
- **User Corrections**: Architects can rate recommendations and provide specific corrections for each node (e.g., "Change Database from MySQL to PostgreSQL").
- **Continuous Learning**: Negative feedback is persisted and injected into the LLM context for future generations to prevent recurring errors.

### 4. Rule Engine Audit
- **Transparency**: Shows exactly which architectural rules were triggered by the user requirements.
- **Fulfillment Status**: Validates if the generated design actually satisfies the active rules.

## 🧪 How to Test

1.  **Launch Services**: Ensure the `.NET API`, `RAG Engine`, and `Web Dashboard` are running.
2.  **Submit Requirements**: Use the expanded intake form to provide high-context requirements.
3.  **Monitor Generation**: Watch the **Pipeline Trace Viewer** nodes animate as the system processes the request.
4.  **Review Recommendation**:
    -   Check the **Architectural Radar** for high-level scores.
    -   Inspect the **Rule Audit** for compliance.
    -   Switch to the **Benchmark Tab** to see the comparison against the expert baseline.
5.  **Provide Feedback**: Rate the output and provide corrections to test the learning loop.

## 📊 Technical Components

- **Storage**: MS SQL (Relational Rules), MongoDB (History, Blueprints, Traces, Feedback).
- **Intelligence**: Gemini 1.5 Flash (Primary/Critic), Ollama (Local Fallback).
- **Communication**: SignalR (Real-time updates).

---

> [!IMPORTANT]
> This framework is designed to satisfy the rigorous audit requirements of an M.Tech dissertation, providing both qualitative critique and quantitative metrics.
