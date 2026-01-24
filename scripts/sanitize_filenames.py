import os
import re
import sys
import unicodedata

def sanitize_name(name):
    # Split name and extension
    base, ext = os.path.splitext(name)
    
    # Remove leading year and optional order prefix (e.g., 2022_10_, 2022_, 2024_09 )
    base = re.sub(r'^\d{4}[_\s](?:\d+[_\s]+)?', '', base)
    
    # Remove diacritics
    base = unicodedata.normalize('NFKD', base).encode('ASCII', 'ignore').decode('ASCII')
    
    # Lowercase
    base = base.lower()
    
    # Remove special characters (anything not alphanumeric, space, underscore, or hyphen)
    base = re.sub(r'[^a-z0-9\s_-]', '', base)
    
    # Replace spaces and underscores with hyphens
    base = re.sub(r'[\s_]+', '-', base)
    
    # Strip leading/trailing hyphens
    base = base.strip('-')
    
    return base + ext.lower()

def rename_files_recursively(root_dir, dry_run=True):
    if not os.path.exists(root_dir):
        print(f"Error: Directory {root_dir} does not exist.")
        return

    renames = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        seen_new_names = set()
        for filename in filenames:
            if filename.startswith('.'): # Skip hidden files
                continue
                
            new_name = sanitize_name(filename)
            
            # Ensure name is not empty (excluding extension)
            if not os.path.splitext(new_name)[0]:
                print(f"Warning: Sanitized name for '{filename}' in '{dirpath}' is empty. Skipping.")
                continue
                
            # Handle collisions in the same directory
            original_new_name = new_name
            base, ext = os.path.splitext(new_name)
            counter = 1
            while new_name in seen_new_names:
                new_name = f"{base}-{counter}{ext}"
                counter += 1
            
            seen_new_names.add(new_name)
            
            if filename != new_name:
                renames.append((dirpath, filename, new_name))

    if not renames:
        print("No files need renaming.")
        return

    print(f"{'DRY RUN: ' if dry_run else ''}Proposed file renames in {root_dir}:")
    for dirpath, old, new in renames:
        rel_dir = os.path.relpath(dirpath, root_dir)
        print(f"  [{rel_dir}] '{old}' -> '{new}'")

    if not dry_run:
        # In non-interactive mode (or if not a TTY), we might just proceed if --execute is passed
        confirm = input("\nProceed with these renames? (y/n): ") if sys.stdin.isatty() else "y"
        if confirm.lower() == 'y':
            for dirpath, old, new in renames:
                os.rename(os.path.join(dirpath, old), os.path.join(dirpath, new))
            print("Renaming completed.")
        else:
            print("Renaming aborted.")

if __name__ == "__main__":
    target = "/home/tomas/my-projects/static-web-template/assets/images/projects/webp/"
    is_dry_run = "--execute" not in sys.argv
    rename_files_recursively(target, dry_run=is_dry_run)
