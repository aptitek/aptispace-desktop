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

    local is_binary = false
    local f = io.open(path, "rb")
    if f then
        local bytes = f:read(1024)
        if bytes and bytes:find("\0") then
            is_binary = true
        end
        f:close()
    end

    if ext == ".ipynb" then
        -- Treat as fully rendered HTML file (Quarto renders .ipynb to .html)
        -- We want to show it statically in viewer.html
        local html_path = web_path:gsub("%.ipynb$", ".html")
        -- URL encode path just in case
        local safe_path = html_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path .. "&mode=render"

    elseif is_binary == false then
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

        -- Use data attributes for the event listener
        return string.format(
            '<li class="file"><a href="#" class="filetree-link" data-url="%s" data-frame="%s" data-container="%s"><i class="bi %s"></i> %s</a></li>'
            ,
            final_url, frame_name, container_id, icon, filename
        )
    end

end

local function generate_zip(zip_path, source_dir)
    -- zip_path: where to save the zip (e.g., "_site/lab/TP1.zip")
    -- source_dir: what to zip (e.g., "lab/TP1")

    -- Ensure the directory for the zip exists
    local zip_dir = zip_path:match("(.+)/[^/]+$")
    if zip_dir then
        os.execute("mkdir -p '" .. zip_dir .. "'")
    end

    -- Command: zip -r -q {zip_path} {source_dir}
    -- We assume source_dir is relative to project root
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

                -- Determine output path in _site
                -- zip_link is like "lab/TP1.zip"
                -- we want to write to "_site/lab/TP1.zip"
                local site_zip_path = "_site/" .. zip_link

                -- Check if it exists in _site
                local f = io.open(site_zip_path, "r")
                if f ~= nil then
                    io.close(f)
                else
                    -- source folder is inferred from zip_link (stripping .zip)
                    -- e.g. "lab/TP1.zip" -> "lab/TP1"
                    local source_dir = zip_link:match("(.+)%.zip$")
                    if source_dir then
                        generate_zip(site_zip_path, source_dir)
                    end
                end
            end

            local list_content = ""

            if quarto.doc.is_format("typst") then
                local link_text = title
                if not title or title == "EXPLORATEUR" then
                    if zip_link then
                        link_text = zip_link:match("^.+/(.+)$") or zip_link
                    else
                        link_text = "Filetree"
                    end
                end

                if zip_link then
                    return pandoc.Para({
                        pandoc.Link(pandoc.Str(link_text), zip_link)
                    })
                else
                    return pandoc.Para({ pandoc.Str(link_text) })
                end
            end

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
  <script>
    (function() {
        var container = document.getElementById('%s');
        if (!container) return;
        var links = container.querySelectorAll('.filetree-link');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var url = this.getAttribute('data-url');
                var frameName = this.getAttribute('data-frame');
                var containerId = this.getAttribute('data-container');
                
                console.log('File clicked:', url);
                
                var container = document.getElementById(containerId);
                if (container) container.classList.add('is-active');
                
                var iframe = document.querySelector('iframe[name="' + frameName + '"]');
                if (iframe) {
                    iframe.src = url;
                    console.log('Iframe src set to', url);
                } else {
                    console.error('Iframe not found:', frameName);
                }
            });
        });
    })();
  </script>
</div>
]]           , id, title, zip_html, list_content, frame_name, id)

            return pandoc.RawBlock("html", html)
        end
    end
}
