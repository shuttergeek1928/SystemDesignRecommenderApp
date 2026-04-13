from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uvicorn
import logging
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import JsonOutputParser

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_service")

app = FastAPI(title="System Design RAG Service")

@app.get("/")
async def root():
    return {"status": "online", "message": "System Design RAG Service is healthy"}

# Configuration
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
MODEL_NAME = "phi3" # Or whatever model is available in Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Initialize models
embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url=OLLAMA_BASE_URL
)
vectorstore = Chroma(
    persist_directory=DB_DIR,
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

llm = ChatOllama(model=MODEL_NAME, temperature=0, format="json", base_url=OLLAMA_BASE_URL)

class DesignContext(BaseModel):
    users: int
    traffic_pattern: str
    latency_requirement_ms: int
    availability_slo: str
    consistency_model: str
    budget: str
    compliance: List[str]
    cloud_provider: str
    region_strategy: str

class DesignRequirements(BaseModel):
    scenario_id: int
    title: str
    description: str
    context: DesignContext
    non_functional_requirements: List[str]

# RAG Prompt Template
prompt_template = """
You are an expert Distributed Systems Architect. 
Use the following pieces of architectural knowledge to design a system for the user's requirements.

RELEVANT ARCHITECTURAL KNOWLEDGE:
{context}

USER REQUIREMENTS:
Title: {title}
Description: {description}
Scale: {users} users, {traffic_pattern} traffic
Latency: {latency}ms
SLO: {slo}
Consistency: {consistency}
Cloud: {cloud_provider} ({region_strategy})

Provide the design strictly in valid JSON format:
{{
    "database": {{ "choice": "...", "justification": "..." }},
    "cache": {{ "choice": "...", "justification": "..." }},
    "messaging": {{ "choice": "...", "justification": "..." }},
    "deployment": {{ "choice": "...", "justification": "..." }},
    "observability": {{ "choice": "...", "justification": "..." }},
    "security": {{ "choice": "...", "justification": "..." }}
}}
Output ONLY the JSON. No markdown frosting.
"""

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.post("/generate/rag")
async def generate_rag_design(req: DesignRequirements):
    try:
        logger.info(f"Received RAG request for: {req.title}")
        
        # 1. Retrieval
        query = f"{req.title} {req.description} {req.context.traffic_pattern}"
        docs = retriever.invoke(query)
        context_text = format_docs(docs)
        
        # 2. Generation
        prompt = ChatPromptTemplate.from_template(prompt_template)
        
        chain = (
            {"context": lambda x: context_text, 
             "title": lambda x: req.title, 
             "description": lambda x: req.description,
             "users": lambda x: req.context.users,
             "traffic_pattern": lambda x: req.context.traffic_pattern,
             "latency": lambda x: req.context.latency_requirement_ms,
             "slo": lambda x: req.context.availability_slo,
             "consistency": lambda x: req.context.consistency_model,
             "cloud_provider": lambda x: req.context.cloud_provider,
             "region_strategy": lambda x: req.context.region_strategy
            }
            | prompt
            | llm
            | JsonOutputParser()
        )
        
        result = chain.invoke({})
        return result
        
    except Exception as e:
        logger.error(f"Error in RAG generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
