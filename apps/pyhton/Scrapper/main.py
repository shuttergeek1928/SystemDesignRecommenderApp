import argparse
import logging
from src.scraper.scraper import WebScraper
from src.scraper.chunker import ContentChunker
from src.extractor.llm_extractor import LLMExtractor
from src.extractor.kb_builder import KBBuilder
from src.indexer.indexer import VectorIndexer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('main')

def scrape_and_build(url: str, tech: str, category: str):
    """
    Module 4: Run Knowledge Pipeline
    End-to-end pipeline: Scrape -> Chunk -> Extract -> Save
    """
    logger.info(f"Starting pipeline for {tech} ({category}) from {url}")
    
    # 1. Scrape
    scraper = WebScraper()
    html = scraper.fetch_page(url)
    if not html:
        logger.error("Failed to fetch HTML.")
        return
        
    sections = scraper.extract_sections(html)
    logger.info(f"Extracted {len(sections)} sections from {url}")
    
    # 2. Chunk
    chunker = ContentChunker()
    chunks = chunker.process_sections(sections)
    logger.info(f"Created {len(chunks)} chunks.")
    
    # 3. Extract knowledge
    extractor = LLMExtractor()
    extracted_data = []
    
    for i, chunk in enumerate(chunks):
        logger.info(f"Extracting knowledge from chunk {i+1}/{len(chunks)}...")
        res = extractor.extract_knowledge(tech, chunk['heading'], chunk['text'])
        extracted_data.append(res)
        
    final_knowledge = extractor.aggregate_knowledge(extracted_data)
    
    # 4. Save
    builder = KBBuilder()
    path = builder.save_document(tech, category, final_knowledge)
    logger.info(f"Successfully documented {tech} architecture rules to {path}")
    
    # 5. Output to user
    print("\n" + "="*60)
    print("EXTRACTED STRUCTURED DOCUMENT")
    print("="*60)
    with open(path, "r", encoding="utf-8") as f:
        print(f.read())
    print("="*60 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Architecture Decision Extractor")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Ingest command
    ingest_parser = subparsers.add_parser("extract", help="Scrape a URL and convert it into a structured architecture document")
    ingest_parser.add_argument("--url", required=True, help="Documentation URL")
    ingest_parser.add_argument("--tech", required=True, help="Technology name (e.g., Redis)")
    ingest_parser.add_argument("--category", required=True, help="Category (e.g., caching, databases)")
    
    # Index command
    index_parser = subparsers.add_parser("index", help="Build the vector database from the knowledge base")
    
    args = parser.parse_args()
    
    if args.command == "extract":
        scrape_and_build(args.url, args.tech, args.category)
    elif args.command == "index":
        indexer = VectorIndexer()
        indexer.index_all()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
