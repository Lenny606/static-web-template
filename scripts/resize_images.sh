#!/bin/bash

# Konfigurace
SOURCE_DIR="./images"
OUTPUT_DIR="./dist/images"
SIZES=(400 800 1200) # Šířky v pixelech
QUALITY=75

# Vytvoření výstupního adresáře
mkdir -p "$OUTPUT_DIR"

echo "🚀 Startuji hromadnou optimalizaci..."

# Prohledá všechny běžné formáty (case-insensitive)
shopt -s nocaseglob
for img in "$SOURCE_DIR"/*.{jpg,jpeg,png,webp,avif}; do
    [ -e "$img" ] || continue

    filename=$(basename -- "$img")
    extension="${filename##*.}"
    filename_noext="${filename%.*}"

    # Preskočit soubory, které už mají v názvu rozměr (prevence smyčky)
    if [[ $filename_noext =~ -[0-9]+w$ ]]; then
        continue
    fi

    echo "📦 Zpracovávám: $filename"

    for size in "${SIZES[@]}"; do
        # Varianta WebP
        magick "$img" -resize "${size}x" -quality "$QUALITY" -strip \
            "$OUTPUT_DIR/${filename_noext}-${size}w.webp"
        
        # Varianta AVIF
        magick "$img" -resize "${size}x" -quality "$QUALITY" -strip \
            "$OUTPUT_DIR/${filename_noext}-${size}w.avif"
            
        echo "  - vytvořena verze ${size}w (WebP i AVIF)"
    done
done

echo "✅ Hotovo! Všechny varianty jsou v $OUTPUT_DIR"