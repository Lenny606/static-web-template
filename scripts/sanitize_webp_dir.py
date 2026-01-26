
import os
import re
import sys
import unicodedata

def sanitize_file_name(name):
    base, ext = os.path.splitext(name)
    base = re.sub(r'^\d{4}[_\s](?:\d+[_\s]+)?', '', base)
    base = unicodedata.normalize('NFKD', base).encode('ASCII', 'ignore').decode('ASCII')
    base = base.lower()
    base = re.sub(r'[^a-z0-9\s_-]', '', base)
    base = re.sub(r'[\s_]+', '-', base)
    base = base.strip('-')
    return base + ext.lower()

def parse_and_sanitize_folder(name):
    year_match = re.search(r'^(\d{4})', name)
    year = year_match.group(1) if year_match else "2026"
    base_name = re.sub(r'^\d{4}[_\s-]*(?:\d+[_\s-]*)?', '', name)
    prefix_part = name[:len(name) - len(base_name)]
    number_match = re.search(r'^\d{4}[_\s-]*(\d+)', prefix_part)
    number = int(number_match.group(1)) if number_match else None
    
    base_name = unicodedata.normalize('NFKD', base_name).encode('ASCII', 'ignore').decode('ASCII')
    base_name = base_name.lower()
    base_name = re.sub(r'[^a-z0-9\s_-]', '', base_name)
    base_name = re.sub(r'[\s_]+', '-', base_name)
    base_name = base_name.strip('-')
    return year, number, base_name

def sanitize_directory(target_dir, execute=False):
    if not os.path.exists(target_dir):
        print(f"Error: {target_dir} not found")
        return

    # 1. Rename files first
    for root, _, files in os.walk(target_dir):
        seen = set()
        for f in files:
            if f.startswith('.'): continue
            new_f = sanitize_file_name(f)
            # handle collisions
            base, ext = os.path.splitext(new_f)
            counter = 1
            while new_f in seen:
                new_f = f"{base}-{counter}{ext}"
                counter += 1
            seen.add(new_f)
            
            if f != new_f:
                old_path = os.path.join(root, f)
                new_path = os.path.join(root, new_f)
                print(f"File: {f} -> {new_f}")
                if execute: os.rename(old_path, new_path)

    # 2. Rename folders
    # We do it level by level or just assume one level deep for projects
    items = [item for item in os.listdir(target_dir) if os.path.isdir(os.path.join(target_dir, item))]
    used_numbers = {}
    
    parsed = []
    for d in items:
        y, n, b = parse_and_sanitize_folder(d)
        parsed.append({'old': d, 'y': y, 'n': n, 'b': b})
        if y not in used_numbers: used_numbers[y] = set()
        if n is not None: used_numbers[y].add(n)
        
    seen_folders = set()
    for entry in sorted(parsed, key=lambda x: x['old']):
        y, n, b = entry['y'], entry['n'], entry['b']
        if n is None:
            n = 1
            while n in used_numbers[y]: n += 1
            used_numbers[y].add(n)
        
        new_d = f"{y}-{n:02d}-{b}"
        counter = 1
        base_new_d = new_d
        while new_d in seen_folders:
            new_d = f"{base_new_d}-{counter}"
            counter += 1
        seen_folders.add(new_d)
        
        if entry['old'] != new_d:
            print(f"Folder: {entry['old']} -> {new_d}")
            if execute:
                os.rename(os.path.join(target_dir, entry['old']), os.path.join(target_dir, new_d))

if __name__ == "__main__":
    target = "/home/tomas/my-projects/static-web-template/assets/images/projects/webp"
    is_execute = "--execute" in sys.argv
    sanitize_directory(target, execute=is_execute)
