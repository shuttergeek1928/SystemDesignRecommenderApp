import os
import json
from typing import Dict, Any
from pathlib import Path

class KBBuilder:
    """
    Module 4: Knowledge Base Builder
    Stores structured decision knowledge for RAG retrieval in Markdown format.
    """
    
    def __init__(self, output_dir: str = "knowledge_base"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def _format_list(self, items: list) -> str:
        """Formats a list into a markdown bulleted list."""
        if not items:
            return "None specified."
        return "\n".join([f"* {item}" for item in items])
        
    def save_document(self, technology: str, category: str, extracted_data: Dict[str, Any]) -> str:
        """
        Creates a markdown file for the given technology under its category folder.
        """
        cat_dir = self.output_dir / category.lower()
        cat_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = cat_dir / f"{technology.lower()}.md"
        
        template = f"""Technology: {technology}
Category: {category}

When to use:
{self._format_list(extracted_data.get('when_to_use', []))}

When not to use:
{self._format_list(extracted_data.get('when_not_to_use', []))}

Tradeoffs:

Advantages:
{self._format_list(extracted_data.get('advantages', []))}

Limitations:
{self._format_list(extracted_data.get('limitations', []))}
"""
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(template)
            
        return str(file_path)

if __name__ == "__main__":
    builder = KBBuilder()
    dummy_data = {
        "when_to_use": ["low latency caching", "session storage"],
        "when_not_to_use": ["primary database"],
        "advantages": ["extremely fast"],
        "limitations": ["memory intensive"]
    }
    path = builder.save_document("Redis", "caching", dummy_data)
    print(f"Saved to {path}")
