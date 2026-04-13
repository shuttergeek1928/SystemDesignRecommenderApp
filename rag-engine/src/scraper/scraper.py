import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WebScraper:
    """
    Module 1: Web Scraper
    Extracts headings and relevant content from architecture documentation pages.
    """
    
    def __init__(self, headers: Optional[Dict[str, str]] = None):
        self.headers = headers or {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_page(self, url: str) -> Optional[str]:
        """Fetches the HTML of the given URL."""
        try:
            logger.info(f"Fetching {url}")
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def extract_sections(self, html: str) -> List[Dict[str, str]]:
        """
        Parses HTML and extracts sections based on H1, H2, H3 headings.
        Associates following paragraphs with the most recent heading.
        Ignores navigation, ads, and footers by targeting main content areas if possible,
        or just filtering out common non-content tags.
        """
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try to find the main content container without fuzzy matching classes
        main_content = soup.find('main') or soup.find('article')
        
        if not main_content:
            # Fallback to whole body if no clear semantic main container
            main_content = soup.body if soup.body else soup
            
        # Optional: remove known bad elements (nav, footer, script, style, aside)
        for junk in main_content.find_all(['nav', 'footer', 'script', 'style', 'aside', 'header']):
            junk.decompose()

        sections = []
        current_heading = "General"
        current_content = []
        
        # Iterate over all elements in document order
        for element in main_content.stripped_strings:
            # We need to find the actual tags to know if they are headers.
            pass # stripped_strings loses tag context. 

        # Let's do a child-based iteration instead
        sections = []
        current_heading = "Overview"
        current_content = []
        
        # Find all relevant tags in order
        for tag in main_content.find_all(['h1', 'h2', 'h3', 'p', 'ul', 'ol']):
            if tag.name in ['h1', 'h2', 'h3']:
                # Save previous section if it has content
                if current_content:
                    sections.append({
                        "title": current_heading.strip(),
                        "content": "\n".join(current_content).strip()
                    })
                current_heading = tag.get_text()
                current_content = []
            elif tag.name == 'p':
                text = tag.get_text().strip()
                if text:
                    current_content.append(text)
            elif tag.name in ['ul', 'ol']:
                # Extract list items
                for li in tag.find_all('li'):
                    li_text = li.get_text().strip()
                    if li_text:
                        current_content.append(f"- {li_text}")
        
        # Add the last section
        if current_content:
            sections.append({
                "title": current_heading.strip(),
                "content": "\n".join(current_content).strip()
            })
            
        return [s for s in sections if s['content']] # filter empty content

if __name__ == "__main__":
    # Simple test
    scraper = WebScraper()
    test_html = "<html><body><header>Nav</header><main><h1>Use Cases</h1><p>Redis is used for caching, session storage...</p><h2>Limitations</h2><p>Memory only</p><ul><li>Expresive</li></ul></main></body></html>"
    print(scraper.extract_sections(test_html))
