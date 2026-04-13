import os
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
import logging

logger = logging.getLogger(__name__)

class VectorIndexer:
    """
    Module 5: Vector Indexer
    Reads extracted knowledge (Markdown) and builds a search index in ChromaDB.
    """
    
    def __init__(self, kb_dir: str = "knowledge_base", db_dir: str = "chroma_db"):
        self.kb_dir = Path(kb_dir)
        self.db_dir = Path(db_dir)
        
        # Use Ollama for embeddings (Stable and local)
        self.embeddings = OllamaEmbeddings(
            model="nomic-embed-text", # You might need to 'ollama pull nomic-embed-text'
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        )
        
    def index_all(self):
        """
        Loads all markdown files from the knowledge base and indexes them.
        """
        if not self.kb_dir.exists():
            logger.error(f"Knowledge base directory {self.kb_dir} does not exist.")
            return
            
        logger.info(f"Loading documents from {self.kb_dir}...")
        
        # Load all .md files recursively
        loader = DirectoryLoader(
            str(self.kb_dir), 
            glob="**/*.md", 
            loader_cls=TextLoader,
            loader_kwargs={'encoding': 'utf-8'}
        )
        docs = loader.load()
        logger.info(f"Loaded {len(docs)} documents.")
        
        if not docs:
            logger.warning("No documents found to index.")
            return

        # Split docs into manageable chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=100
        )
        splits = text_splitter.split_documents(docs)
        logger.info(f"Created {len(splits)} splits.")
        
        # Create/Update ChromaDB
        logger.info(f"Indexing into ChromaDB at {self.db_dir}...")
        vectorstore = Chroma.from_documents(
            documents=splits, 
            embedding=self.embeddings,
            persist_directory=str(self.db_dir)
        )
        
        logger.info("Indexing completed successfully.")
        return vectorstore
