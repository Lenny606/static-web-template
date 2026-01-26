
import os
import re
import sys
import unicodedata

def sanitize_name(name):
    base, ext = os.path.splitext(name)
    base = re.sub(r'^\d{4}[_\s](?:\d+[_\s]+)?', '', base)
    base = unicodedata.normalize('NFKD', base).encode('ASCII', 'ignore').decode('ASCII')
    base = base.lower()
    base = re.sub(r'[^a-z0-9\s_-]', '', base)
    base = re.sub(r'[\s_]+', '-', base)
    base = base.strip('-')
    return base + ext.lower()

def get_base_project_info(path):
    # Extracts (rel_prefix, folder_sanitized, file_sanitized_base)
    # e.g. "../../assets/images/projects/webp/2026-01-BOHDALEC/VISOID_03.webp"
    # -> ("../../assets/images/projects", "2026-01-bohdalec", "visoid-03")
    match = re.search(r'(.*assets/images/projects)/(?:webp|avif)/([^/]+)/([^/]+)\.(?:webp|avif)', path, re.IGNORECASE)
    if not match: return None
    
    prefix = match.group(1)
    folder = match.group(2)
    filename = match.group(3)
    
    # We need to sanitize folder and filename to be sure
    # For folder, we use the same logic as sanitize_folders.py (simplified as we assume it might be sanitized or original)
    # Since we already ran the sanitization on disk, we just need to know what it *becomes*.
    
    # Simplified folder sanitization for matching
    base_folder = re.sub(r'^\d{4}[_\s-]*(?:\d+[_\s-]*)?', '', folder)
    year_match = re.search(r'^(\d{4})', folder)
    year = year_match.group(1) if year_match else "2026"
    
    # We don't easily know the "number" if it's not already in the path, 
    # but most of our paths already have the YYYY-NN- prefix.
    # If it's already YYYY-NN-something, we just leave it.
    if re.match(r'^\d{4}-\d{2}-', folder):
        folder_san = folder.lower() 
    else:
        # This part is risky without the full sanitize_folders.py logic, 
        # but let's assume we are mostly dealing with already prefixed folders or we can just lowercase it.
        folder_san = folder.lower()
    
    file_san = sanitize_name(filename + ".ext") # ext doesn't matter for base
    file_san_base = os.path.splitext(file_san)[0]
    
    return prefix, folder_san, file_san_base

def process_html_file(file_path, project_root):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find ANY <img> that points to projects/webp or projects/avif
    img_pattern = re.compile(r'<img\s+[^>]*src=["\']([^"\']+/assets/images/projects/(?:webp|avif)/[^"\']+)["\'][^>]*>', re.IGNORECASE)
    
    replacements = []
    
    # To avoid double processing if multiple sources match same string
    seen_matches = set()

    for match in img_pattern.finditer(content):
        img_tag = match.group(0)
        if img_tag in seen_matches: continue
        
        path_in_html = match.group(1)
        
        # Skip if already inside a <picture> tag
        start_idx = match.start()
        # Look back 200 chars for <picture (increased context)
        context_back = content[max(0, start_idx-200):start_idx]
        if context_back.rfind('<picture') > context_back.rfind('</picture'):
             continue

        info = get_base_project_info(path_in_html)
        if not info: continue
        prefix, folder_san, file_san_base = info
        
        avif_path = f"{prefix}/avif/{folder_san}/{file_san_base}.avif"
        webp_path = f"{prefix}/webp/{folder_san}/{file_san_base}.webp"
        
        # Verify both exist on disk to be safe
        # We need to map relative prefix to absolute project root
        # Actually the prefix in HTML might be relative or absolute.
        # Let's assume absolute for verification if possible.
        avif_disk = os.path.join(project_root, 'assets/images/projects/avif', folder_san, file_san_base + ".avif")
        webp_disk = os.path.join(project_root, 'assets/images/projects/webp', folder_san, file_san_base + ".webp")
        
        if os.path.exists(avif_disk) and os.path.exists(webp_disk):
            # Indentation
            line_start = content.rfind('\n', 0, start_idx) + 1
            indent = content[line_start:start_idx] if line_start > 0 else ""
            if indent.strip() != "": indent = "    "
            
            # Update the original img tag's src to be the compatible webp one
            # and ensure it's the sanitized one
            new_img_tag = re.sub(r'src=["\'][^"\']+["\']', f'src="{webp_path}"', img_tag)
            
            new_picture = f"<picture>\n{indent}    <source srcset=\"{avif_path}\" type=\"image/avif\">\n{indent}    <source srcset=\"{webp_path}\" type=\"image/webp\">\n{indent}    {new_img_tag}\n{indent}</picture>"
            replacements.append((img_tag, new_picture))
            seen_matches.add(img_tag)
        else:
            if not os.path.exists(avif_disk): print(f"Missing AVIF: {avif_disk}")
            if not os.path.exists(webp_disk): print(f"Missing WebP: {webp_disk}")

    # Reverse replacements to maintain string integrity if we used indices, 
    # but here we use string.replace. Literal replace is safer with unique tags.
    # Actually multiple identical tags might exist, but replacements list 
    # should have them. 
    new_content = content
    for old, new in replacements:
        # Only replace if not already replaced
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    project_root = "/home/tomas/my-projects/static-web-template"
    # Process all html files in project
    files_updated = 0
    for root, _, files in os.walk(project_root):
        if "node_modules" in root: continue
        if ".git" in root: continue
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                if process_html_file(path, project_root):
                    # print(f"Updated: {path}")
                    files_updated += 1
    print(f"Total files updated: {files_updated}")

if __name__ == "__main__":
    main()
