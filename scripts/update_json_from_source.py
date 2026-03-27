import os
import json
import re
import unicodedata

def normalize_name(name):
    # Normalize to NFD and filter out non-spacing marks (accents)
    name = ''.join(c for c in unicodedata.normalize('NFD', name)
                  if unicodedata.category(c) != 'Mn')
    # Convert to lowercase and remove non-alphanumeric
    name = name.lower()
    name = re.sub(r'[^a-z0-9]', '', name)
    return name

def get_unique_base_names(folder_path):
    if not os.path.exists(folder_path):
        return []
    base_names = set()
    for root, dirs, files in os.walk(folder_path):
        for f in files:
            # We exclude common non-image files if any, but here we want to reflect the folder
            # Let's include image-like extensions
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif', '.psd', '.tif', '.tiff')):
                # For source folder, we might want to keep the filename or just the base
                # User asked to "update json according to folder", usually implies base names for consistency
                # but I will extract the base name (no extension)
                base = os.path.splitext(f)[0]
                base_names.add(base)
    return sorted(list(base_names))

def update():
    cwd = os.getcwd()
    json_path = os.path.join(cwd, 'assets/images/projects-new/projects.json')
    source_dir = os.path.join(cwd, 'assets/images/DBDA-projects-26-3-2026')
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist.")
        return
    if not os.path.exists(source_dir):
        print(f"Error: {source_dir} does not exist.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    source_folders = [f for f in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, f))]
    
    # Create a mapping from normalized source folder name to actual source folder name
    source_mapping = {normalize_name(f): f for f in source_folders}
    
    changes = []
    
    for p in projects:
        # Match by title or slug
        title_norm = normalize_name(p['title'])
        slug_norm = normalize_name(p['slug'])
        
        match_folder = None
        if title_norm in source_mapping:
            match_folder = source_mapping[title_norm]
        elif slug_norm in source_mapping:
            match_folder = source_mapping[slug_norm]
            
        if match_folder:
            full_source_path = os.path.join(source_dir, match_folder)
            source_images = get_unique_base_names(full_source_path)
            
            old_count = p.get('count', 0)
            new_count = len(source_images)
            
            if p['images'] != source_images or old_count != new_count:
                changes.append(f"Updated {p['title']}: {old_count} -> {new_count} images")
                p['images'] = source_images
                p['count'] = new_count
        else:
            print(f"Warning: No matching source folder for project '{p['title']}'")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

    if changes:
        print("\n".join(changes))
        print(f"\nSuccessfully updated {len(changes)} projects in projects.json.")
    else:
        print("No changes were necessary.")

if __name__ == "__main__":
    update()
