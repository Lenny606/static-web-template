import os
import re
import sys
import unicodedata

def parse_and_sanitize(name):
    """
    Extracts year and number from folder name, and sanitizes the rest.
    Returns (year, number, sanitized_base_name).
    """
    # 1. Extract year (4 digits)
    year_match = re.search(r'^(\d{4})', name)
    year = year_match.group(1) if year_match else "2026"
    
    # 2. Extract base name (part after year and optional number)
    # This regex matches YYYY, then optional separators, then optional digits (number), then optional separators.
    # The rest is the base name.
    base_name = re.sub(r'^\d{4}[_\s-]*(?:\d+[_\s-]*)?', '', name)
    
    # 3. Extract number from the original prefix (if it existed)
    # We look at the part between the year and the base name.
    prefix_part = name[:len(name) - len(base_name)]
    number_match = re.search(r'^\d{4}[_\s-]*(\d+)', prefix_part)
    number = int(number_match.group(1)) if number_match else None

    # 4. Sanitize the base name
    # Remove diacritics
    base_name = unicodedata.normalize('NFKD', base_name).encode('ASCII', 'ignore').decode('ASCII')
    # Lowercase
    base_name = base_name.lower()
    # Remove special characters
    base_name = re.sub(r'[^a-z0-9\s_-]', '', base_name)
    # Replace spaces and underscores with hyphens
    base_name = re.sub(r'[\s_]+', '-', base_name)
    # Strip leading/trailing hyphens
    base_name = base_name.strip('-')
    
    return year, number, base_name

def rename_folders(target_dir, dry_run=True):
    if not os.path.exists(target_dir):
        print(f"Error: Directory {target_dir} does not exist.")
        return

    items = os.listdir(target_dir)
    folders = [item for item in items if os.path.isdir(os.path.join(target_dir, item))]
    
    # First pass: parse all and track used numbers per year
    parsed_entries = []
    used_numbers = {} # year -> set of numbers
    
    for folder in folders:
        year, number, base_name = parse_and_sanitize(folder)
        
        if not base_name:
            print(f"Warning: Sanitized base name for '{folder}' is empty. Skipping.")
            continue
            
        parsed_entries.append({
            'original': folder,
            'year': year,
            'number': number,
            'base_name': base_name
        })
        
        if year not in used_numbers:
            used_numbers[year] = set()
        if number is not None:
            used_numbers[year].add(number)
            
    # Second pass: assign missing numbers and construct new names
    renames = []
    seen_new_names = set()
    
    # Sort entries to keep some order when assigning new numbers (e.g. by original name)
    parsed_entries.sort(key=lambda x: x['original'])
    
    for entry in parsed_entries:
        year = entry['year']
        number = entry['number']
        base_name = entry['base_name']
        
        if number is None:
            # Assign next free number
            n = 1
            while n in used_numbers[year]:
                n += 1
            number = n
            used_numbers[year].add(number)
            
        new_name = f"{year}-{number:02d}-{base_name}"
        
        # Handle base name collisions (rare but possible after sanitization)
        original_new_name = new_name
        counter = 1
        while new_name in seen_new_names:
            new_name = f"{original_new_name}-{counter}"
            counter += 1
        
        seen_new_names.add(new_name)
        
        if entry['original'] != new_name:
            renames.append((entry['original'], new_name))

    if not renames:
        print("No folders need renaming.")
        return

    print(f"{'DRY RUN: ' if dry_run else ''}Proposed renames in {target_dir}:")
    for old, new in renames:
        print(f"  '{old}' -> '{new}'")

    if not dry_run:
        confirm = input("\nProceed with these renames? (y/n): ") if sys.stdin.isatty() else "y"
        if confirm.lower() == 'y':
            for old, new in renames:
                os.rename(os.path.join(target_dir, old), os.path.join(target_dir, new))
            print("Renaming completed.")
        else:
            print("Renaming aborted.")

if __name__ == "__main__":
    target = "/home/tomas/my-projects/static-web-template/assets/images/projects/webp/"
    is_dry_run = "--execute" not in sys.argv
    rename_folders(target, dry_run=is_dry_run)
