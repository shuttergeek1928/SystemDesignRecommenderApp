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
MODEL_NAME = "qwen2.5-coder:7b" # Or whatever model is available in Ollama
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
    users: Optional[int] = 0
    traffic_pattern: Optional[str] = ""
    latency_requirement_ms: Optional[int] = 0
    availability_slo: Optional[str] = ""
    consistency_model: Optional[str] = ""
    budget: Optional[str] = ""
    compliance: Optional[List[str]] = []
    cloud_provider: Optional[str] = "aws"
    region_strategy: Optional[str] = ""
    request_rate: Optional[float] = 0
    data_volume_gb: Optional[float] = 0
    team_size: Optional[int] = 0
    experience_level: Optional[str] = "mixed"
    search_complexity: Optional[str] = "simple"
    deployment_frequency: Optional[str] = "weekly"
    read_write_ratio: Optional[str] = "balanced"
    data_retention: Optional[str] = "years"
    security_sensitivity: Optional[str] = "internal"

from langchain_google_genai import ChatGoogleGenerativeAI, HarmCategory, HarmBlockThreshold

class DesignRequirements(BaseModel):
    scenario_id: int
    title: str
    description: str
    context: DesignContext
    non_functional_requirements: List[str]
    model: Optional[str] = None
    provider: Optional[str] = "ollama"
    api_key: Optional[str] = None

class RagRequest(BaseModel):
    requirements: DesignRequirements
    node_structure: Dict[str, Dict[str, str]]
    feedback_context: Optional[str] = ""

# RAG Prompt Template
prompt_template = """
You are an expert Distributed Systems Architect specializing in AWS. 
Use the following pieces of architectural knowledge to design a system for the user's requirements.

RELEVANT ARCHITECTURAL KNOWLEDGE:
{context}

{feedback_context}

USER REQUIREMENTS:
Title: {title}
Description: {description}
Scale: {users} users, {traffic_pattern} traffic
Latency: {latency}ms, Availability SLO: {slo}
Consistency: {consistency}
Cloud: AWS ({region_strategy})
Budget: {budget}, Security: {security_sensitivity}
Read/Write Ratio: {read_write_ratio}, Data Retention: {data_retention}
Team: {team_size} devs, {experience_level} experience
Compliance: {compliance}

Provide the design strictly in valid JSON format. The output JSON MUST contain ONLY the keys specified in the structure below. DO NOT add any extra nodes or change the keys. If a choice or justification is pre-filled in the structure below, treat it as a hard constraint or strong suggestion.
Structure:
{node_structure}

Output ONLY the JSON. No markdown frosting.
"""

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.post("/generate/rag")
async def generate_rag_design(rag_req: RagRequest):
    req = rag_req.requirements
    node_structure = rag_req.node_structure
    try:
        provider = req.provider or "ollama"
        model = req.model or (MODEL_NAME if provider == "ollama" else "gemini-3-flash-preview")
        
        # Safety check for Gemini
        if provider.lower() == "gemini" and (":" in model or not model.startswith("gemini")):
            logger.warning(f"Detected non-Gemini model name '{model}' for Gemini provider. Defaulting to 'gemini-3-flash-preview'.")
            model = "gemini-3-flash-preview"
        
        logger.info(f"Received RAG request for: {req.title} with provider: {provider}, model: {model}")
        
        # 1. Retrieval
        query = f"{req.title} {req.description} {req.context.traffic_pattern}"
        docs = retriever.invoke(query)
        context_text = format_docs(docs)
        
        # 2. Generation
        import json
        node_structure_json = json.dumps(node_structure, indent=4)
        prompt = ChatPromptTemplate.from_template(prompt_template.replace("{node_structure}", node_structure_json))
        
        # Initialize LLM based on provider
        if provider.lower() == "gemini":
            if not req.api_key:
                raise HTTPException(status_code=400, detail="Gemini API Key is required for Gemini provider")
            current_llm = ChatGoogleGenerativeAI(
                model=model, 
                google_api_key=req.api_key,
                temperature=0,
                convert_system_message_to_human=True,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
        else:
            current_llm = ChatOllama(model=model, temperature=0, format="json", base_url=OLLAMA_BASE_URL)
        
        chain = (
            {"context": lambda x: context_text, 
             "title": lambda x: req.title, 
             "description": lambda x: req.description,
             "users": lambda x: req.context.users,
             "traffic_pattern": lambda x: req.context.traffic_pattern,
             "latency": lambda x: req.context.latency_requirement_ms,
             "slo": lambda x: req.context.availability_slo,
             "consistency": lambda x: req.context.consistency_model,
             "region_strategy": lambda x: req.context.region_strategy,
             "budget": lambda x: req.context.budget,
             "security_sensitivity": lambda x: req.context.security_sensitivity,
             "read_write_ratio": lambda x: req.context.read_write_ratio,
             "data_retention": lambda x: req.context.data_retention,
             "team_size": lambda x: req.context.team_size,
             "experience_level": lambda x: req.context.experience_level,
             "compliance": lambda x: ", ".join(req.context.compliance) if req.context.compliance else "None",
             "feedback_context": lambda x: rag_req.feedback_context or ""
            }
            | prompt
            | current_llm
            | JsonOutputParser()
        )
        
        result = chain.invoke({})
        return result
        
    except Exception as e:
        logger.error(f"Error in RAG generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
