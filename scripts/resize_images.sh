#!/bin/bash

# Konfigurace
SOURCE_DIR="./assets/images/team/avif"
OUTPUT_DIR="./assets/images/team/avif-versions"
SIZES=(400 800 1200)
QUALITY=75

echo "🚀 Startuji rekurzivní optimalizaci ve složce: $SOURCE_DIR"

# Najde všechny soubory s danými příponami (case-insensitive)
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.avif" \) | while read -r img; do
    
    # Cesta k souboru bez zdrojové složky (např. blog/foto.jpg)
    relative_path="${img#$SOURCE_DIR/}"
    # Adresář souboru (např. blog)
    rel_dir=$(dirname "$relative_path")
    # Název souboru bez cesty
    filename=$(basename -- "$img")
    # Název bez přípony
    filename_noext="${filename%.*}"

    # Ignorovat již vygenerované varianty
    if [[ "$filename_noext" =~ -[0-9]+w$ ]]; then
        continue
    fi

    # Vytvoření cílové podsložky
    target_dir="$OUTPUT_DIR/$rel_dir"
    mkdir -p "$target_dir"

    echo "📦 Zpracovávám: $relative_path"

    for size in "${SIZES[@]}"; do
        # Generování WebP
        # magick "$img" -resize "${size}x" -quality "$QUALITY" -strip \
        #     "$target_dir/${filename_noext}-${size}w.webp"
        
        # Generování AVIF
        magick "$img" -resize "${size}x" -quality "$QUALITY" -strip \
            "$target_dir/${filename_noext}-${size}w.avif"
    done
done

echo "✅ Hotovo! Všechny vnořené složky byly zpracovány do $OUTPUT_DIR"