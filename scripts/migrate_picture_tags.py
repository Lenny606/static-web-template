
import os
import re
import unicodedata

def sanitize_name(name):
    # Split name and extension
    base, ext = os.path.splitext(name)
    # Remove leading year and optional order prefix
    base = re.sub(r'^\d{4}[_\s](?:\d+[_\s]+)?', '', base)
    # Remove diacritics
    base = unicodedata.normalize('NFKD', base).encode('ASCII', 'ignore').decode('ASCII')
    base = base.lower()
    base = re.sub(r'[^a-z0-9\s_-]', '', base)
    base = re.sub(r'[\s_]+', '-', base)
    base = base.strip('-')
    return base + ext.lower()

def get_sanitized_avif_path(webp_path):
    # webp_path like ".../assets/images/projects/webp/FOLDER/FILE.webp"
    parts = webp_path.split('/')
    try:
        webp_idx = parts.index('webp')
        folder = parts[webp_idx + 1].lower() # folder to lower
        filename_webp = parts[webp_idx + 2]
        filename_base = os.path.splitext(filename_webp)[0]
        filename_avif = sanitize_name(filename_base + ".avif")
        
        # Reconstruct
        prefix = '/'.join(parts[:webp_idx])
        return f"{prefix}/avif/{folder}/{filename_avif}"
    except (ValueError, IndexError):
        return None

def process_html_file(file_path, project_root):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <img> tags that point to project webp images
    # Avoid finding things already wrapped in <picture> if possible, 
    # but the logic below can handle it if we are careful.
    
    # This regex is a bit greedy but should work for our structured HTML
    img_pattern = re.compile(r'<img\s+[^>]*src=["\']([^"\']+/assets/images/projects/webp/[^"\']+)["\'][^>]*>', re.IGNORECASE)
    
    replacements = []
    
    for match in img_pattern.finditer(content):
        img_tag = match.group(0)
        webp_path_in_html = match.group(1)
        
        # Skip if already inside a <picture> tag (simple check)
        # We look back 50 chars for <picture
        start_idx = match.start()
        if content[max(0, start_idx-100):start_idx].rfind('<picture') > content[max(0, start_idx-100):start_idx].rfind('</picture'):
             continue

        avif_path_in_html = get_sanitized_avif_path(webp_path_in_html)
        if not avif_path_in_html:
            continue
            
        # Verify AVIF exists on disk
        # Normalize paths for check
        rel_from_root = webp_path_in_html.split('assets/images/projects/webp/')[-1]
        folder_raw = rel_from_root.split('/')[0]
        file_raw = rel_from_root.split('/')[1]
        
        folder_san = folder_raw.lower()
        file_san = sanitize_name(file_raw.replace('.webp', '.avif'))
        
        avif_disk_path = os.path.join(project_root, 'assets', 'images', 'projects', 'avif', folder_san, file_san)
        
        if os.path.exists(avif_disk_path):
            # Construct <picture> tag
            # Indentation: try to match original
            indent = ""
            line_start = content.rfind('\n', 0, start_idx) + 1
            if line_start > 0:
                indent = content[line_start:start_idx]
                if not indent.strip() == "": # if there's text on same line, don't use it as indent
                    indent = "    " # default
            
            # Extract attributes from img for the main tag (class, alt, width, height, loading, fetchpriority)
            new_picture_tag = f"<picture>\n{indent}    <source srcset=\"{avif_path_in_html}\" type=\"image/avif\">\n{indent}    <source srcset=\"{webp_path_in_html}\" type=\"image/webp\">\n{indent}    {img_tag}\n{indent}</picture>"
            replacements.append((img_tag, new_picture_tag))
        else:
            print(f"Warning: AVIF not found for {webp_path_in_html} at {avif_disk_path}")

    # Apply replacements (reverse order to not mess up indices if we used them, 
    # but we are doing literal string replacement here)
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    project_root = "/home/tomas/my-projects/static-web-template"
    dirs_to_process = [
        os.path.join(project_root, "pages"),
        os.path.join(project_root, "projects"),
        os.path.join(project_root, "en")
    ]
    
    files_updated = 0
    for d in dirs_to_process:
        if not os.path.exists(d): continue
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith(".html"):
                    path = os.path.join(root, file)
                    if process_html_file(path, project_root):
                        print(f"Updated: {path}")
                        files_updated += 1
                        
    print(f"Total files updated: {files_updated}")

if __name__ == "__main__":
    main()
