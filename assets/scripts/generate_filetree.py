#!/usr/bin/env python3
import os
import sys
import argparse
import zipfile
import urllib.parse
import json

def create_zip(root_folder, zip_filename, output_dir=None):
    """Creates a zip archive of the folder, excluding the zip itself and hidden files."""
    if output_dir is None:
        output_dir = root_folder
    zip_path = os.path.join(output_dir, zip_filename)
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(root_folder):
                for file in files:
                    if file == zip_filename or file.startswith('.') or file == "__pycache__" or file == "_site": 
                        continue
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, root_folder)
                    zipf.write(file_path, arcname)
        return True
    except Exception as e:
        sys.stderr.write(f"Error creating zip: {e}\n")
        return False

def generate_tree_html(path, root_folder, container_id, frame_name, zip_filename):
    """Recursively generates HTML for the file tree."""
    res = ""
    try:
        # Sort: Directories first, then files (case-insensitive)
        items = sorted(os.listdir(path), key=lambda x: (not os.path.isdir(os.path.join(path, x)), x.lower()))
    except OSError:
        return ""

    for item in items:
        # Filtering
        if (item.startswith('.') or 
            item == "__pycache__" or 
            item == "_site" or 
            item == zip_filename): 
            continue
        
        full_path = os.path.join(path, item)
        # Web path logic (assumes relative from site root)
        # We need to construct the URL relative to the website root.
        # The 'root_folder' passed in arg is usually a relative path from project root (e.g., 'lab/tp1').
        
        # Calculate relative path from the root_folder to the current item
        rel_path_from_root = os.path.relpath(full_path, root_folder)
        
        # Construct the web path. 
        # CAUTION: This logic assumes the script is run from project root and 'root_folder' is relative to it.
        # web_path should start with / and include root_folder.
        if root_folder.startswith("./"):
            clean_root = root_folder[2:]
        else:
            clean_root = root_folder
            
        # If full_path is "lab/tp1/file.py", web_path should be "/lab/tp1/file.py"
        web_path = "/" + full_path.replace(os.sep, "/")
        
        # JS to toggle layout
        activate_js = f"document.getElementById('{container_id}').classList.add('is-active')"

        if os.path.isdir(full_path):
            icon_html = '<i class="bi bi-folder-fill" style="margin-right:5px; color:var(--sol-yellow, #b58900);"></i>'
            res += f'<li class="folder"><details open><summary>{icon_html}{item}</summary><ul>' 
            res += generate_tree_html(full_path, root_folder, container_id, frame_name, zip_filename) 
            res += '</ul></details></li>'
        else:
            ext = os.path.splitext(item)[1].lower()
            icon_cls = "bi-file-earmark"
            final_url = ""
            
            # Logic Icons / URLs
            if ext == ".ipynb":
                icon_cls = "bi-journal-code"
                # JupyterLite link
                # The content is at the root of the Lite instance (because of --contents lab)
                # So we use the relative path from the 'lab' folder.
                # Logic: Find 'lab/' in full_path and take everything after.
                try:
                    # Determine path relative to "lab" directory
                    # We assume the project structure is standard and "lab" is the container.
                    # If full_path is "lab/TP1/notebook.ipynb", we want "TP1/notebook.ipynb"
                    
                    parts = full_path.split(os.sep)
                    if "lab" in parts:
                        lab_index = parts.index("lab")
                        # Join everything after 'lab'
                        lite_path = "/".join(parts[lab_index+1:])
                    else:
                        # Fallback: just use the filename if 'lab' is not found (shouldn't happen in standard structure)
                        lite_path = item
                        
                    final_url = f"/lite/lab/index.html?path={lite_path}&theme=JupyterLab Solarized Dark&mode=single-document"
                except ValueError:
                     final_url = f"/lite/lab/index.html?path={item}&theme=JupyterLab Solarized Dark&mode=single-document" 
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg']:
                icon_cls = "bi-file-earmark-image"
                final_url = web_path
            elif ext == ".pdf":
                icon_cls = "bi-file-earmark-pdf"
                final_url = web_path
            elif ext in ['.py', '.java', '.js', '.ts', '.html', '.css', '.scss', '.json', '.xml', '.qmd', '.md', '.yml']:
                icon_cls = "bi-file-earmark-code"
                safe_path = urllib.parse.quote(web_path)
                final_url = f"/assets/viewer.html?file={safe_path}"
            else:
                safe_path = urllib.parse.quote(web_path)
                final_url = f"/assets/viewer.html?file={safe_path}"

            icon_html = f'<i class="bi {icon_cls}"></i>'
            
            res += f'<li class="file"><a href="{final_url}" target="{frame_name}" onclick="{activate_js}">{icon_html} {item}</a></li>'
            
    return res

def main():
    parser = argparse.ArgumentParser(description="Generate File Tree HTML")
    parser.add_argument("folder", help="Root folder to scan")
    parser.add_argument("frame_name", help="Name of the target iframe")
    parser.add_argument("container_id", help="ID of the container div")
    parser.add_argument("--output-root", help="Root folder for output (e.g. _site)", default=None)
    
    args = parser.parse_args()
    
    # Normalize the path to avoid ./ prefix issues in web paths
    args.folder = os.path.normpath(args.folder)
    
    if not os.path.exists(args.folder):
        print(f"<div style='color:var(--sol-red); border:1px solid var(--sol-red); padding:10px'>❌ Folder not found: {args.folder}</div>")
        sys.exit(1)

    # 1. Create ZIP
    folder_name = os.path.basename(os.path.normpath(args.folder))
    zip_filename = f"{folder_name}.zip"

    # Determine zip location
    if args.output_root:
        # Create same directory structure in output root
        # e.g. if folder is "lab/TP1" and output_root is "_site"
        # zip will be in "_site/lab/TP1/TP1.zip"
        zip_dir = os.path.join(args.output_root, args.folder)
        if not os.path.exists(zip_dir):
            os.makedirs(zip_dir, exist_ok=True)
        # Create zip in the new location
        create_zip(args.folder, zip_filename, output_dir=zip_dir)
    else:
        # Default behavior: create zip in the source folder
        create_zip(args.folder, zip_filename)
        
    
    zip_web_path = f"/{args.folder}/{zip_filename}"
    zip_web_path = zip_web_path.replace("//", "/") # cleaning

    # 2. Generate HTML
    tree_html = generate_tree_html(args.folder, args.folder, args.container_id, args.frame_name, zip_filename)
    
    zip_icon = '<i class="bi bi-file-earmark-zip-fill"></i>'
    
    output = f"""
<div class="ide-container" id="{args.container_id}">
  <div class="ide-sidebar">
    <div class="ide-header-row">
        <span class="ide-title">{folder_name}</span>
        <a href="{zip_web_path}" class="ide-download-btn" title="Download {zip_filename}">{zip_icon} ZIP</a>
    </div>
    <ul class="file-tree-list">
        {tree_html}
    </ul>
  </div>
  <div class="ide-main">
    <iframe name="{args.frame_name}" src="about:blank" onload="this.style.opacity=1"></iframe>
  </div>
</div>
"""
    print(output)

if __name__ == "__main__":
    main()
