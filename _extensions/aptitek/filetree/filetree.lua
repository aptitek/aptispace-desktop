-- _extensions/aptitek/filetree/filetree.lua

local function get_icon(filename)
    local ext = filename:match("^.+(%..+)$")
    if not ext then return "bi-file-earmark" end
    ext = ext:lower()

    if ext == ".ipynb" then return "bi-journal-code"
    elseif ext == ".png" or ext == ".jpg" or ext == ".jpeg" or ext == ".gif" or ext == ".svg" then return "bi-file-earmark-image"
    elseif ext == ".pdf" then return "bi-file-earmark-pdf"
    elseif ext == ".py" or ext == ".java" or ext == ".js" or ext == ".ts" or ext == ".html" or ext == ".css" or
        ext == ".scss" or ext == ".json" or ext == ".xml" or ext == ".qmd" or ext == ".md" or ext == ".yml" then return "bi-file-earmark-code"
    else return "bi-file-earmark" end
end

local function get_href(path, filename)
    local ext = filename:match("^.+(%..+)$")
    if not ext then return path end
    ext = ext:lower()

    -- Ensure path starts with / if it doesn't (assuming relative to root for viewer)
    -- But Quarto resolves links. Let's assume the user provided path is correct for now.
    -- We might need to prefix with / if it's relative and viewer is at /assets/viewer.html

    local web_path = path
    if path:sub(1, 1) ~= "/" then
        web_path = "/" .. path
    end

    if ext == ".ipynb" then
        -- Treat as fully rendered HTML file (Quarto renders .ipynb to .html)
        -- We assume the .html exists in the same relative path
        -- If file is "lab/TP1/test.ipynb", Quarto outputs "lab/TP1/test.html"
        local html_path = web_path:gsub("%.ipynb$", ".html")
        return html_path

    elseif ext == ".py" or ext == ".java" or ext == ".js" or ext == ".ts" or ext == ".html" or ext == ".css" or
        ext == ".scss" or ext == ".json" or ext == ".xml" or ext == ".qmd" or ext == ".md" or ext == ".yml" then
        -- Use static viewer
        -- Need to URL encode the path
        -- Lua doesn't have built-in urlencode, doing simple one or minimal
        -- Since we don't have python's urllib, we hope path is simple or we use pandoc's util if available?
        -- Only minimal replacements: space to %20
        local safe_path = web_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path

    else
        -- Direct link (Images, PDF, etc)
        return web_path
    end
end

local function render_item(item, frame_name, container_id)
    -- Item is a Block (Plain or Para) containing Link or Str
    -- or a BulletList (subfolder)

    -- We need to check if it's a folder (has sublist) or file
    -- But pandoc AST for BulletList is [[Blocks], [Blocks], ...]
    -- Often: [Para(Link), BulletList(...)] is how a folder with children looks in Markdown list?
    -- Actually:
    -- - Folder
    --   - Child
    -- Is represented as one item containing [Para(Str "Folder"), BulletList(...)]

    local blocks = item
    local is_folder = false
    local link = nil
    local sublist = nil
    local text = ""

    for _, block in ipairs(blocks) do
        if block.t == "BulletList" then
            is_folder = true
            sublist = block
        elseif block.t == "Para" or block.t == "Plain" then
            -- Check content
            -- Usually [Link] or [Str]
            -- We extract text or link
            pandoc.walk_block(block, {
                Link = function(el) link = el end,
                Str = function(el) if text == "" then text = el.text end end,
                Code = function(el) if text == "" then text = el.text end end
            })
            if not text and link then
                text = pandoc.utils.stringify(link.content)
            end
        end
    end

    if is_folder then
        local content = ""
        local folder_name = text
        if link then folder_name = pandoc.utils.stringify(link.content) end
        if folder_name == "" then folder_name = "Folder" end

        content = content ..
            '<li class="folder"><details open><summary><i class="bi bi-chevron-right folder-arrow"></i>'
            .. folder_name .. '</summary><ul>'

        if sublist then
            for _, child_item in ipairs(sublist.content) do
                content = content .. render_item(child_item, frame_name, container_id)
            end
        end

        content = content .. '</ul></details></li>'
        return content
    else
        -- File
        if not link then
            -- Plain text in list, maybe just a file name without link?
            -- If no link provided, we can't really open it. Treat as disabled or just text.
            return '<li class="file"><span style="opacity:0.5"><i class="bi bi-file-earmark"></i> ' ..
                text .. '</span></li>'
        end

        local path = link.target
        local filename = text
        if filename == "" then filename = path:match("^.+/(.+)$") or path end

        local icon = get_icon(filename)
        local final_url = get_href(path, filename)
        local activate_js = "document.getElementById('" .. container_id .. "').classList.add('is-active')"

        return '<li class="file"><a href="' ..
            final_url ..
            '" target="' ..
            frame_name ..
            '" onclick="' .. activate_js .. '"><i class="bi ' .. icon .. '"></i> ' .. filename .. '</a></li>'
    end

end

local function generate_zip(zip_path)
    -- fast zip generation if not exists or force?
    -- zip_path is like "lab/TP1.zip"
    -- source folder is inferred as "lab/TP1" (stripping .zip)
    local source_dir = zip_path:match("(.+)%.zip$")
    if not source_dir then return end

    -- Check if source dir exists? os.execute allows shell command
    -- We'll try to execute zip. Ideally we check if it outdated.
    -- For simplicity, we just run zip -r -u (update) or just zip -r
    -- Quarto runs in project root usually.

    -- Ensure directory for zip exists? zip command might validly handle it if parent implies?
    -- Actually "lab/TP1.zip" -> "lab" exists presumably.

    -- Command: zip -r -q {zip_path} {source_dir}
    -- We use 'zip -FSr' if available (sync file system) or just 'zip -r'
    local cmd = string.format("zip -r -q '%s' '%s'", zip_path, source_dir)
    os.execute(cmd)
end

return {
    ["filetree"] = function(args, kwargs, meta)
        -- This is a custom block: ::: {.filetree} ... :::
        -- But wait, standard Div filter signature is (div)
        -- If registered as 'filetree' in custom Lua module, it might be for a Shortcode?
        -- The user wants "remplace l'extension actuelle".
        -- The previous extension returned: ["filetree"] = function(args, kwargs) ... which is a Shortcode.
        -- Shortcodes can't contain block content (like a list) easily.
        -- So we should probably keep it as a Div filter -> `function Div(div)`
        -- BUT the user might use it as shortcode? No, shortcode is {{< filetree >}}.
        -- New requirement: "structure de liste Markdown simple".
        -- This implies using a Div `::: {.filetree}`
    end,

    Div = function(div)
        if div.classes:includes("filetree") then
            local content = ""
            local id = div.identifier
            if id == "" then id = "ide_" .. tostring(os.time()) .. tostring(math.random(1000)) end

            local frame_name = "viewer_" .. id
            local title = div.attributes["title"] or "EXPLORATEUR"
            local zip_link = div.attributes["zip"]

            local zip_html = ""
            if zip_link then
                local zip_name = zip_link:match("^.+/(.+)$") or zip_link
                zip_html = string.format('<a href="%s" class="ide-download-btn" title="Download %s"><i class="bi bi-file-earmark-zip-fill"></i> ZIP</a>'
                    , zip_link, zip_name)

                -- Attempt to generate the zip file
                generate_zip(zip_link)
            end

            -- We expect the first block to be a BulletList
            local list_content = ""

            for _, block in ipairs(div.content) do
                if block.t == "BulletList" then
                    for _, item in ipairs(block.content) do
                        list_content = list_content .. render_item(item, frame_name, id)
                    end
                end
            end

            local html = string.format([[
<div class="ide-container" id="%s">
  <div class="ide-sidebar">
    <div class="ide-header-row">
        <span class="ide-title">%s</span>
        %s
    </div>
    <ul class="file-tree-list">
        %s
    </ul>
  </div>
  <div class="ide-main">
    <iframe name="%s" src="about:blank" onload="this.style.opacity=1"></iframe>
  </div>
</div>
]]           , id, title, zip_html, list_content, frame_name)

            return pandoc.RawBlock("html", html)
        end
    end
}
