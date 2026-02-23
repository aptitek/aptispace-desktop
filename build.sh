#!/bin/bash
# Build script for Cloudflare Pages
set -e

# Specify the version of Quarto to use
QUARTO_VERSION="1.6.39"

echo "script version : 1.3"
echo "Quarto version : ${QUARTO_VERSION}"

echo "Downloading Quarto v${QUARTO_VERSION}..."
curl -L -o quarto.tar.gz "https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-amd64.tar.gz"

echo "Extracting Quarto..."
mkdir -p quarto
tar -zxvf quarto.tar.gz -C quarto --strip-components=1

# Add Quarto to PATH so 'quarto render' works smoothly
export PATH="${PWD}/quarto/bin:${PATH}"

# Install chromium for Mermaid diagram PDF snapshots
echo "Installing chromium..."
quarto install tool chromium

# Install zip manually without sudo (Cloudflare Pages environment)
echo "Installing zip..."
wget -qO zip.deb http://archive.ubuntu.com/ubuntu/pool/main/z/zip/zip_3.0-12build2_amd64.deb
dpkg -x zip.deb ./zip_install
export PATH="${PWD}/zip_install/usr/bin:${PATH}"

echo "Rendering Quarto project..."
quarto render

echo "Build complete. Output generated in _site folder."
