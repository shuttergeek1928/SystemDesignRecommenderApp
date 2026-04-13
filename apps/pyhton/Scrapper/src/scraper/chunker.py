from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken
import logging

logger = logging.getLogger(__name__)

class ContentChunker:
    """
    Module 2: Content Chunker
    Prepares scraped content for LLM processing.
    Combines heading + paragraph, splits into chunks of 300-500 tokens, preserving heading context.
    """
    
    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # We use tiktoken for accurate token counting with OpenAI models
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        def tiktoken_len(text: str) -> int:
            return len(self.tokenizer.encode(text, disallowed_special=()))
            
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=tiktoken_len,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def process_sections(self, sections: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Takes a list of dicts with 'title' and 'content' keys.
        Chunks the content, prepending the title context to each chunk.
        """
        chunked_results = []
        
        for section in sections:
            title = section.get('title', 'Unknown')
            content = section.get('content', '')
            
            if not content:
                continue
                
            # If the content itself is small enough, it might just be one chunk
            chunks = self.text_splitter.split_text(content)
            
            for chunk in chunks:
                chunked_results.append({
                    "heading": title,
                    "text": chunk
                })
                
        return chunked_results

if __name__ == "__main__":
    # Simple test
    chunker = ContentChunker(chunk_size=10, chunk_overlap=2) # artificially small
    dummy_sections = [
        {"title": "Overview", "content": "This is a very long sentence that should exceed the chunk size."},
        {"title": "Limitations", "content": "Memory bound."}
    ]
    
    res = chunker.process_sections(dummy_sections)
    for r in res:
        print(f"[{r['heading']}] -> {r['text']}")
