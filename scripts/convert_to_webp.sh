#!/bin/bash

# Configuration
SOURCE_BASE="assets/images/philosophy/original"
TARGET_BASE="assets/images/philosophy/webp"
QUALITY=80
TARGET_SIZE=200000 # Default target size in bytes (cca 200kb)
DRY_RUN=true

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --execute) DRY_RUN=false ;;
        --quality) QUALITY="$2"; shift ;;
        --target-size) TARGET_SIZE="$2"; shift ;;
        *) 
            if [ -z "$SOURCE_BASE_ARG" ]; then
                SOURCE_BASE_ARG="$1"
            else
                echo "Unknown parameter passed: $1"; exit 1
            fi
            ;;
    esac
    shift
done

if [ -n "$SOURCE_BASE_ARG" ]; then
    SOURCE_BASE="$SOURCE_BASE_ARG"
    # Try to automatically determine TARGET_BASE by replacing 'original' with 'webp'
    if [[ "$SOURCE_BASE" == *"original"* ]]; then
        TARGET_BASE="${SOURCE_BASE/original/webp}"
    else
        # Fallback: put it in a 'webp' sibling or subdirectory if 'original' is not in path
        TARGET_BASE="$(dirname "$SOURCE_BASE")/webp"
    fi
fi

if [ "$DRY_RUN" = true ]; then
    echo "--- DRY RUN MODE (no files will be converted) ---"
    echo "Source: $SOURCE_BASE"
    echo "Target: $TARGET_BASE"
    echo "To actually convert files, run with --execute"
fi

# Ensure target base directory exists
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_BASE"
fi

# Find all images recursively within the source folder
find "$SOURCE_BASE" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img_path; do
    # Get relative path from SOURCE_BASE
    rel_path="${img_path#$SOURCE_BASE/}"
    rel_dir=$(dirname "$rel_path")
    filename=$(basename "$img_path")
    filename_no_ext="${filename%.*}"
    
    # Target directory preserves the relative structure
    target_dir="$TARGET_BASE/$rel_dir"
    target_path="$target_dir/$filename_no_ext.webp"

    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$target_dir"
    fi

    if [ "$DRY_RUN" = true ]; then
        echo "  Would convert: $img_path -> $target_path"
    else
        echo "  Converting: $img_path -> $target_path"
        cwebp -size "$TARGET_SIZE" "$img_path" -o "$target_path" -quiet
    fi
done

echo "Done."
