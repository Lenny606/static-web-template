#!/bin/bash

# Configuration
SOURCE_BASE="assets/images/projects/original"
TARGET_BASE="assets/images/projects/avif"
QUALITY=60
TARGET_SIZE=200000 # Default target size in bytes (cca 200kb)
DRY_RUN=true

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --execute) DRY_RUN=false ;;
        --quality) QUALITY="$2"; shift ;;
        --target-size) TARGET_SIZE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ "$DRY_RUN" = true ]; then
    echo "--- DRY RUN MODE (no files will be converted) ---"
    echo "To actually convert files, run with --execute"
fi

# Ensure target base directory exists
mkdir -p "$TARGET_BASE"

# Iterate through each project folder
for project_dir in "$SOURCE_BASE"/*; do
    if [ ! -d "$project_dir" ]; then
        continue
    fi

    project_name=$(basename "$project_dir")
    target_project_dir="$TARGET_BASE/$project_name"

    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$target_project_dir"
    fi

    echo "Processing project: $project_name"

    # Find all images recursively within the project folder
    # Supported extensions: jpg, jpeg, png (case-insensitive)
    find "$project_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img_path; do
        filename=$(basename "$img_path")
        filename_no_ext="${filename%.*}"
        
        # Flattening logic: target is always directly in the project folder
        target_path="$target_project_dir/$filename_no_ext.avif"

        # Handle collisions if same name exists in different subfolders
        counter=1
        while [ -f "$target_path" ]; do
            target_path="$target_project_dir/${filename_no_ext}_$counter.avif"
            ((counter++))
        done

        if [ "$DRY_RUN" = true ]; then
            echo "  Would convert: $img_path -> $target_path"
        else
            echo "  Converting: $img_path -> $target_path"
            
            # Map usage quality (0-100, higher=better) to avifenc quantizer (0-63, lower=better)
            # Default quality 80 -> quantizer ~12
            # Formula: (100 - QUALITY) * 63 / 100
            Q_VAL=$(( (100 - QUALITY) * 63 / 100 ))
            
            # Clamp value between 0 and 63
            if [ "$Q_VAL" -lt 0 ]; then Q_VAL=0; fi
            if [ "$Q_VAL" -gt 63 ]; then Q_VAL=63; fi
            
            # Using avifenc with speed 6 (good balance)
            # If target-size is used, quality flags might be overridden or used as starting point
            # -j 4 for parallel processing
            # Redirecting stdout to /dev/null to simulate -quiet
            avifenc --target-size "$TARGET_SIZE" --min 0 --max 63 --speed 6 --jobs 4 "$img_path" "$target_path" > /dev/null
        fi
    done
done

echo "Done."
