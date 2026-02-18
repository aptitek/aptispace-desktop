# assets/scripts/build_lite.py
import os
import subprocess
import shutil

def build_jupyterlite():
    # 1. Définition des chemins
    # Racine du projet (là où on lance quarto)
    base_dir = os.getcwd() 
    
    # Dossier source des TPs
    lab_dir = os.path.join(base_dir, "lab")
    
    # Dossier de destination (DANS le site généré par Quarto)
    # On le met dans un sous-dossier 'lite' pour séparer proprement
    output_dir = os.path.join(base_dir, "_site", "lite")

    print(f"🚀 [JupyterLite] Démarrage du build...")
    print(f"   - Source: {lab_dir}")
    print(f"   - Destination: {output_dir}")

    # 2. La commande magique
    # --contents : Copie vos TPs dans le système de fichier virtuel de Jupyter
    # --output-dir : L'endroit où générer le site web
    cmd = [
        "jupyter", "lite", "build",
        "--contents", lab_dir,
        "--output-dir", output_dir
    ]

    # 3. Exécution
    try:
        subprocess.run(cmd, check=True)
        print("✅ [JupyterLite] Build terminé avec succès dans _site/lite")
    except subprocess.CalledProcessError as e:
        print(f"❌ [JupyterLite] Erreur lors du build: {e}")
        # On ne bloque pas le déploiement si ça rate, mais c'est visible dans les logs
    except FileNotFoundError:
        print("❌ [JupyterLite] Commande 'jupyter' introuvable. Avez-vous installé jupyterlite-core ?")

if __name__ == "__main__":
    build_jupyterlite()