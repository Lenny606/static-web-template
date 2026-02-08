#!/bin/bash

# Configuration
SOURCE_BASE="assets/images/philosophy/original"
TARGET_BASE="assets/images/philosophy/avif"
QUALITY=60
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
    # Try to automatically determine TARGET_BASE by replacing 'original' with 'avif'
    if [[ "$SOURCE_BASE" == *"original"* ]]; then
        TARGET_BASE="${SOURCE_BASE/original/avif}"
    else
        # Fallback: put it in an 'avif' sibling or subdirectory if 'original' is not in path
        TARGET_BASE="$(dirname "$SOURCE_BASE")/avif"
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
    target_path="$target_dir/$filename_no_ext.avif"

    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$target_dir"
    fi

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

echo "Done."
