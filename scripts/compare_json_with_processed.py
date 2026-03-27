import os
import json
import re

def get_processed_base_names(folder_path):
    if not os.path.exists(folder_path):
        return []
    base_names = set()
    for f in os.listdir(folder_path):
        if f.endswith(('.avif', '.webp', '.jpg', '.png', '.jpeg')):
            # Remove suffix like -400w.avif, -800w.webp, etc.
            base = re.sub(r'-\d+w\.(avif|webp|jpg|png|jpeg)$', '', f)
            # Also handle cases without width suffix
            base = re.sub(r'\.(avif|webp|jpg|png|jpeg)$', '', base)
            base_names.add(base)
    return sorted(list(base_names))

def compare():
    cwd = os.getcwd()
    json_path = os.path.join(cwd, 'assets/images/projects-new/projects.json')
    projects_root = os.path.join(cwd, 'assets/images/projects-new')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    print(f"Comparing JSON (Source Names) vs projects-new/ (Processed Files)")
    print("-" * 70)
    
    mismatches = 0
    for p in projects:
        folder_path = os.path.join(projects_root, p['folder'])
        actual_files = get_processed_base_names(folder_path)
        json_files = p.get('images', [])
        
        if set(json_files) != set(actual_files):
            mismatches += 1
            print(f"Project: {p['title']} ({p['slug']})")
            print(f"  JSON says: {len(json_files)} images {json_files[:3]}...")
            print(f"  Actual files: {len(actual_files)} images {actual_files[:3]}...")
            
            # Find missing or extra
            extra_in_json = set(json_files) - set(actual_files)
            extra_on_disk = set(actual_files) - set(json_files)
            
            if extra_in_json:
                print(f"  - In JSON but NOT on disk: {list(extra_in_json)[:5]}")
            if extra_on_disk:
                print(f"  + On disk but NOT in JSON: {list(extra_on_disk)[:5]}")
            print()

    if mismatches == 0:
        print("Perfect match! The JSON entries correspond exactly to the files in projects-new/.")
    else:
        print(f"Total projects with mismatches: {mismatches}")

if __name__ == "__main__":
    compare()
