#!/bin/bash
# Build script for Cloudflare Pages
set -e

# Specify the version of Quarto to use
QUARTO_VERSION="1.4.550"

echo "Downloading Quarto v${QUARTO_VERSION}..."
curl -L -o quarto.tar.gz "https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-amd64.tar.gz"

echo "Extracting Quarto..."
mkdir -p quarto
tar -zxvf quarto.tar.gz -C quarto --strip-components=1

# Add Quarto to PATH so 'quarto render' works smoothly
export PATH="${PWD}/quarto/bin:${PATH}"

echo "Rendering Quarto project..."
quarto render

echo "Build complete. Output generated in _site folder."
