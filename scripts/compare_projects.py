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

def compare():
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
        
    source_folders = sorted([f for f in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, f))])
    
    # Matching dictionaries
    project_titles_norm = {normalize_name(p['title']): p for p in projects}
    project_slugs_norm = {normalize_name(p['slug']): p for p in projects}
    
    matches = []
    missing_in_json = []
    
    for folder in source_folders:
        folder_norm = normalize_name(folder)
        if folder_norm in project_titles_norm:
            matches.append((folder, project_titles_norm[folder_norm]['title'], "Match (Title)"))
        elif folder_norm in project_slugs_norm:
            matches.append((folder, project_slugs_norm[folder_norm]['title'], "Match (Slug)"))
        else:
            missing_in_json.append(folder)
            
    # Check for projects in JSON not in source folders
    source_folders_norm = set([normalize_name(f) for f in source_folders])
    missing_in_source = []
    for p in projects:
        title_norm = normalize_name(p['title'])
        slug_norm = normalize_name(p['slug'])
        if title_norm not in source_folders_norm and slug_norm not in source_folders_norm:
            missing_in_source.append(p['title'])

    print(f"Comparison: projects.json vs source directory")
    print("-" * 60)
    print(f"Total projects in JSON: {len(projects)}")
    print(f"Total folders in Source: {len(source_folders)}")
    print(f"Matches found: {len(matches)}")
    
    if len(matches) > 0:
        print("\nSignificant Name Differences (Source Folder -> JSON Title):")
        for source, target, type_ in matches:
            if normalize_name(source) != normalize_name(target):
                print(f"  ~ {source} -> {target}")
            
    if missing_in_json:
        print(f"\nMissing in JSON (Folders in Source not matched):")
        for m in missing_in_json:
            print(f"  - {m}")
        
    if missing_in_source:
        print(f"\nMissing in Source Folder (Projects in JSON not matched):")
        for m in missing_in_source:
            print(f"  + {m}")

if __name__ == "__main__":
    compare()
