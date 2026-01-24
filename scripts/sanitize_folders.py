import os
import re
import sys
import unicodedata

def sanitize_name(name):
    # Remove leading year and optional order prefix (e.g., 2022_10_, 2022_, 2024_09 )
    name = re.sub(r'^\d{4}[_\s](?:\d+[_\s]+)?', '', name)

    
    # Remove diacritics
    name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('ASCII')
    
    # Lowercase
    name = name.lower()
    
    # Remove special characters (anything not alphanumeric, space, underscore, or hyphen)
    name = re.sub(r'[^a-z0-9\s_-]', '', name)
    
    # Replace spaces and underscores with hyphens
    name = re.sub(r'[\s_]+', '-', name)
    
    # Strip leading/trailing hyphens
    name = name.strip('-')
    
    return name

def rename_folders(target_dir, dry_run=True):
    if not os.path.exists(target_dir):
        print(f"Error: Directory {target_dir} does not exist.")
        return

    items = os.listdir(target_dir)
    folders = [item for item in items if os.path.isdir(os.path.join(target_dir, item))]
    
    renames = []
    seen_new_names = set()
    
    for folder in folders:
        new_name = sanitize_name(folder)
        
        # Ensure name is not empty
        if not new_name:
            print(f"Warning: Sanitized name for '{folder}' is empty. Skipping.")
            continue
            
        # Handle collisions (very basic)
        original_new_name = new_name
        counter = 1
        while new_name in seen_new_names:
            new_name = f"{original_new_name}-{counter}"
            counter += 1
        
        seen_new_names.add(new_name)
        
        if folder != new_name:
            renames.append((folder, new_name))

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
    target = "/home/tomas/my-projects/static-web-template/assets/images/projects/original/"
    is_dry_run = "--execute" not in sys.argv
    rename_folders(target, dry_run=is_dry_run)
