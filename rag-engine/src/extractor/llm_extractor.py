import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import Dict, Any
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class LLMExtractor:
    """
    Module 3: Decision Knowledge Extractor (LLM)
    Converts documentation text into architecture decision rules.
    """
    
    def __init__(self, model_name: str = "phi3", temperature: float = 0.0, base_url: str = None):
        if not base_url:
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            
        self.llm = ChatOllama(model=model_name, temperature=temperature, format="json", base_url=base_url)
        
        # We will use structured JSON to make it easier to format into Markdown later
        self.output_parser = JsonOutputParser()
        
        template = """
        You are a software architect.
        Extract architecture decision knowledge from this documentation.
        
        Technology Context: {technology}
        Section: {heading}
        
        Return ONLY a JSON object representing the extracted knowledge with the following keys. 
        If the information is not present in the text, leave the arrays empty.
        
        {{
            "when_to_use": ["reason 1", "reason 2"],
            "when_not_to_use": ["reason 1"],
            "advantages": ["advantage 1"],
            "limitations": ["limitation 1"]
        }}
        
        Documentation:
        {content}
        """
        
        self.prompt = PromptTemplate(
            template=template,
            input_variables=["technology", "heading", "content"]
        )
        
        self.chain = self.prompt | self.llm | self.output_parser
        
    def extract_knowledge(self, technology: str, heading: str, text: str) -> Dict[str, Any]:
        """
        Calls the LLM to extract decision knowledge from a specific chunk.
        """
        try:
            result = self.chain.invoke({
                "technology": technology,
                "heading": heading,
                "content": text
            })
            return result
        except Exception as e:
            logger.error(f"Error extracting knowledge for {technology} - {heading}: {e}")
            return {
                "when_to_use": [],
                "when_not_to_use": [],
                "advantages": [],
                "limitations": []
            }
            
    def aggregate_knowledge(self, chunks_data: list) -> Dict[str, Any]:
        """
        Aggregates multiple chunk extractions into a single comprehensive dictionary for a technology.
        chunks_data should be a list of dicts from `extract_knowledge`.
        """
        aggregated = {
            "when_to_use": set(),
            "when_not_to_use": set(),
            "advantages": set(),
            "limitations": set()
        }
        
        for data in chunks_data:
            if not isinstance(data, dict):
                continue
            for key in aggregated.keys():
                items = data.get(key, [])
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, str) and item.strip():
                            aggregated[key].add(item.strip())
                            
        # Convert sets back to lists
        return {k: list(v) for k, v in aggregated.items()}

if __name__ == "__main__":
    # Ensure OPENAI_API_KEY is in .env
    pass
