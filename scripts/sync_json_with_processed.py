import os
import json
import re

def get_processed_base_names(folder_path):
    if not os.path.exists(folder_path):
        return []
    base_names = set()
    for f in os.listdir(folder_path):
        if f.lower().endswith(('.avif', '.webp', '.jpg', '.png', '.jpeg')):
            # Remove resolution suffix like -400w, -800w, -1200w
            base = re.sub(r'-\d+w\.(avif|webp|jpg|png|jpeg)$', '', f, flags=re.IGNORECASE)
            # Remove extension if no resolution suffix was present
            base = re.sub(r'\.(avif|webp|jpg|png|jpeg)$', '', base, flags=re.IGNORECASE)
            base_names.add(base)
    return sorted(list(base_names))

def sync():
    cwd = os.getcwd()
    json_path = os.path.join(cwd, 'assets/images/projects-new/projects.json')
    projects_root = os.path.join(cwd, 'assets/images/projects-new')
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    changes = []
    for p in projects:
        folder_path = os.path.join(projects_root, p['folder'])
        actual_bases = get_processed_base_names(folder_path)
        
        old_images = p.get('images', [])
        old_count = p.get('count', 0)
        new_count = len(actual_bases)
        
        if set(old_images) != set(actual_bases) or old_count != new_count:
            changes.append(f"Synced {p['title']}: {old_count} -> {new_count} images")
            p['images'] = actual_bases
            p['count'] = new_count

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

    if changes:
        print("\n".join(changes))
        print(f"\nSuccessfully synchronized {len(changes)} projects in projects.json.")
    else:
        print("JSON is already synchronized with processed files.")

if __name__ == "__main__":
    sync()
