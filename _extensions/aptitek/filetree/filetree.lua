-- _extensions/aptitek/filetree/filetree.lua

return {
    ["filetree"] = function(args, kwargs)
        local folder = args[1]
        if not folder then return pandoc.Strong("❌ Erreur: Dossier manquant") end

        -- ID Unique pour gérer l'affichage conditionnel
        local clean_id = folder:gsub("/", "_"):gsub("\\", "_"):gsub("%.", "")
        local frame_name = "viewer_" .. clean_id
        local container_id = "ide_" .. clean_id

        -- Chemin vers le script Python (relatif à la racine du projet Quarto)
        local script_path = "assets/scripts/generate_filetree.py"

        -- Construction de la commande
        -- On doit s'assurer que python3 est disponible
        -- Ajout de --output-root _site pour générer le zip dans le dossier de sortie
        local cmd = string.format("python3 %s '%s' '%s' '%s' --output-root _site", script_path, folder, frame_name,
            container_id)

        local result = nil

        -- Tentative 1: python3
        local handle = io.popen(cmd)
        if handle then
            result = handle:read("*a")
            handle:close()
        end

        -- Tentative 2: python (si échec ou vide)
        if not result or result == "" then
            cmd = string.format("python %s '%s' '%s' '%s' --output-root _site", script_path, folder, frame_name,
                container_id)
            handle = io.popen(cmd)
            if handle then
                result = handle:read("*a")
                handle:close()
            end
        end

        if not result or result == "" then
            return pandoc.RawBlock('html',
                "<div style='color:red; border:1px solid red; padding:10px'>❌ Erreur: Impossible d'exécuter le script de génération d'arbre. Vérifiez que python est installé et que assets/scripts/generate_filetree.py existe.</div>")
        end

        return pandoc.RawBlock('html', result)
    end
}
