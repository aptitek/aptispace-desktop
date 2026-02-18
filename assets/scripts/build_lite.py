# assets/scripts/build_lite.py
import os
import subprocess
import shutil
import sys

def build_jupyterlite():
    """
    Builds the JupyterLite site from the 'lab' directory contents.
    The output is placed in '_site/lite'.
    """
    # 1. Define Paths
    base_dir = os.getcwd() 
    lab_dir = os.path.join(base_dir, "lab")
    # Output inside the Quarto generated site
    output_dir = os.path.join(base_dir, "_site", "lite")

    print(f"🚀 [JupyterLite] Starting build...")
    print(f"   - Source: {lab_dir}")
    print(f"   - Destination: {output_dir}")

    if not os.path.exists(lab_dir):
        print(f"⚠️  [JupyterLite] Source directory '{lab_dir}' not found. Skipping build.")
        return

    # 2. Build Command
    # --contents : Copies labs into the virtual FS
    # --output-dir : Where to generate the static site
    cmd = [
        "jupyter", "lite", "build",
        "--contents", lab_dir,
        "--output-dir", output_dir
    ]

    # 3. Execution
    try:
        # Check and install theme
        try:
             import jupyterlab_theme_solarized_dark
             print("✅ [JupyterLite] Theme 'jupyterlab-theme-solarized-dark' found.")
        except ImportError:
             print("⚠️  [JupyterLite] Theme 'jupyterlab-theme-solarized-dark' not found. Installing...")
             try:
                 subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "jupyterlab-theme-solarized-dark"])
                 print("✅ [JupyterLite] Theme installed successfully.")
             except subprocess.CalledProcessError:
                 print("❌ [JupyterLite] Failed to install theme automatically.")
                 print("👉 Please run: pip install jupyterlab-theme-solarized-dark")
                 # We continue, but the theme might not be available
        
        # Verify jupyter command availability again after potential install
        if shutil.which("jupyter") is None:
             # Try to find it in user site-packages if we just installed it
             # But usually jupyter should be there.
             pass

        subprocess.run(cmd, check=True)
        print("✅ [JupyterLite] Build successful in _site/lite")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ [JupyterLite] Build failed with exit code {e.returncode}: {e}")
        # We don't exit(1) to avoid breaking the whole Quarto render if Lite fails
    except FileNotFoundError:
        print("❌ [JupyterLite] 'jupyter' command not found. Please install jupyterlite-core (pip install jupyterlite-core).")
    except Exception as e:
        print(f"❌ [JupyterLite] Unexpected error: {e}")

if __name__ == "__main__":
    build_jupyterlite()