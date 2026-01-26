
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

def get_folder_base(folder_name):
    # e.g. "2024-15-bohunov" -> "bohunov"
    return re.sub(r'^\d{4}[_\s-]*(\d+[_\s-]*)?', '', folder_name).lower()

def build_folder_map(root_dir):
    # builds map: base_name -> full_sanitized_name
    avif_dir = os.path.join(root_dir, 'assets/images/projects/avif')
    mapping = {}
    if os.path.exists(avif_dir):
        for d in os.listdir(avif_dir):
            if os.path.isdir(os.path.join(avif_dir, d)):
                base = get_folder_base(d)
                mapping[base] = d
                # Also map the full name to itself
                mapping[d.lower()] = d
    return mapping

def process_html_file(file_path, project_root, folder_map):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find ANY <img> that points to projects/webp or projects/avif
    img_pattern = re.compile(r'<img\s+[^>]*src=["\']([^"\']+/assets/images/projects/(?:webp|avif)/([^/]+)/([^/]+)\.([^"\']+))["\'][^>]*>', re.IGNORECASE)
    
    replacements = []
    seen_matches = set()

    for match in img_pattern.finditer(content):
        img_tag = match.group(0)
        if img_tag in seen_matches: continue
        
        full_path_in_html = match.group(1)
        prefix = match.group(1).split('/assets/images/projects/')[0] + "/assets/images/projects"
        folder_in_html = match.group(2).lower()
        filename_in_html = match.group(3)
        ext_in_html = match.group(4).lower()
        
        # Skip if already inside a <picture> tag
        start_idx = match.start()
        context_back = content[max(0, start_idx-200):start_idx]
        if context_back.rfind('<picture') > context_back.rfind('</picture'):
             continue

        # Use folder map to find target folder
        target_folder = folder_map.get(get_folder_base(folder_in_html))
        if not target_folder:
            print(f"Warning: Could not map folder '{folder_in_html}' in {file_path}")
            continue
            
        file_san_base = os.path.splitext(sanitize_name(filename_in_html + ".ext"))[0]
        
        avif_path = f"{prefix}/avif/{target_folder}/{file_san_base}.avif"
        webp_path = f"{prefix}/webp/{target_folder}/{file_san_base}.webp"
        
        # Verify both exist on disk
        avif_disk = os.path.join(project_root, 'assets/images/projects/avif', target_folder, file_san_base + ".avif")
        webp_disk = os.path.join(project_root, 'assets/images/projects/webp', target_folder, file_san_base + ".webp")
        
        if os.path.exists(avif_disk) and os.path.exists(webp_disk):
            # Indentation
            line_start = content.rfind('\n', 0, start_idx) + 1
            indent = content[line_start:start_idx] if line_start > 0 else ""
            if not indent.strip() == "": indent = "    "
            
            # Update <img> src to webp
            new_img_tag = re.sub(r'src=["\'][^"\']+["\']', f'src="{webp_path}"', img_tag)
            
            new_picture = f"<picture>\n{indent}    <source srcset=\"{avif_path}\" type=\"image/avif\">\n{indent}    <source srcset=\"{webp_path}\" type=\"image/webp\">\n{indent}    {new_img_tag}\n{indent}</picture>"
            replacements.append((img_tag, new_picture))
            seen_matches.add(img_tag)
        else:
            # print(f"Missing files for {target_folder}/{file_san_base} referenced in {file_path}")
            pass

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
    folder_map = build_folder_map(project_root)
    
    files_updated = 0
    for root, _, files in os.walk(project_root):
        if any(x in root for x in ["node_modules", ".git", ".antigravity"]): continue
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                if process_html_file(path, project_root, folder_map):
                    print(f"Updated: {path}")
                    files_updated += 1
    print(f"Total files updated: {files_updated}")

if __name__ == "__main__":
    main()
