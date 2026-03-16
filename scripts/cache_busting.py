import os
import re
import hashlib
from pathlib import Path

def get_file_hash(filepath):
    """Calculate MD5 hash of a file."""
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:8]

def update_html_cache_busting(root_dir):
    """
    Find all HTML files and update JS/CSS references with a cache-busting version query.
    Only targets .js and .css files in assets/ directory.
    """
    root_path = Path(root_dir)
    print(f"Searching for HTML files in {root_path}...")
    
    # Exclude node_modules, .git, and other irrelevant dirs
    html_files = [p for p in root_path.rglob("*.html") if "node_modules" not in str(p) and ".git" not in str(p)]
    print(f"Found {len(html_files)} HTML files.")
    
    # Regex to find <script src="..."> and <link href="...">
    asset_regex = re.compile(r'(src|href)="([^"]+\.(js|css))(?:\?v=[a-f0-9]+)?"', re.IGNORECASE)

    for html_file in html_files:
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()

        def replace_asset(match):
            attr = match.group(1)
            original_path = match.group(2)
            
            if original_path.startswith(("http", "//")):
                return match.group(0)
            
            if original_path.startswith("/"):
                physical_path = root_path / original_path.lstrip("/")
            else:
                physical_path = html_file.parent / original_path
            
            if physical_path.exists() and physical_path.is_file():
                file_hash = get_file_hash(physical_path)
                if file_hash:
                    return f'{attr}="{original_path}?v={file_hash}"'
            
            return match.group(0)

        new_content = asset_regex.sub(replace_asset, content)
        
        if new_content != content:
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"  Updated {html_file.name}")

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    update_html_cache_busting(project_root)
