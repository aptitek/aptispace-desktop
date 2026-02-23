function Pandoc(doc)
    -- Execute the font download script which checks for the font and downloads if missing
    os.execute("bash _extensions/aptitek/download-fonts/download_fonts.sh")
    return doc
end
