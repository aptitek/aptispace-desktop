#!/bin/bash
set -e

FONT_URL="https://github.com/arrowtype/recursive/releases/download/v1.085/ArrowType-Recursive-1.085.zip"
FONT_DIR="fonts"
FONT_FILE="$FONT_DIR/Recursive_VF_1.085.ttf"

if [ ! -f "$FONT_FILE" ]; then
  echo "Downloading Recursive font..."
  mkdir -p "$FONT_DIR"
  curl -L -s -o recursive.zip "$FONT_URL"
  unzip -q -j -o recursive.zip "ArrowType-Recursive-1.085/Recursive_Desktop/Recursive_VF_1.085.ttf" -d "$FONT_DIR/"
  rm recursive.zip
  echo "Font downloaded."
else
  echo "Recursive font already installed."
fi
