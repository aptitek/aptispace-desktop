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

local doc_dir = nil
local project_dir = nil

local function get_dirs()
    if not doc_dir then
        if quarto and quarto.doc and quarto.doc.input_file then
            doc_dir = quarto.doc.input_file:match("(.+)/[^/]+$")
        else
            doc_dir = "."
        end
    end
    if not project_dir then
        if quarto and quarto.project and quarto.project.directory then
            project_dir = quarto.project.directory
        else
            project_dir = os.getenv("QUARTO_PROJECT_DIR") or "."
        end
    end
    return doc_dir, project_dir
end

local function resolve_to_absolute(path)
    if not path then return nil end
    if path:match("^%a+://") then
        return nil -- External URL
    end

    local d_dir, p_dir = get_dirs()

    -- If the path starts with "/" or "lab/" or is project-relative
    if path:sub(1, 1) == "/" then
        return p_dir .. path
    elseif path:sub(1, 4) == "lab/" then
        return p_dir .. "/" .. path
    elseif path:sub(1, 3) == "../" or path:sub(1, 2) == "./" then
        -- Relative to document directory
        return d_dir .. "/" .. path
    else
        -- Default: try project-relative first, if not found try document-relative
        local proj_path = p_dir .. "/" .. path
        local f = io.open(proj_path, "r")
        if f then
            io.close(f)
            return proj_path
        else
            return d_dir .. "/" .. path
        end
    end
end

local function get_href(path, filename)
    local ext = filename:match("^.+(%..+)$")
    if not ext then return path end
    ext = ext:lower()

    local _, p_dir = get_dirs()
    local abs_path = resolve_to_absolute(path)
    local web_path = path
    if abs_path then
        -- Determine web path relative to project root
        local rel_path = abs_path
        if abs_path:sub(1, #p_dir) == p_dir then
            rel_path = abs_path:sub(#p_dir + 2)
        end
        if rel_path:sub(1, 1) ~= "/" then
            web_path = "/" .. rel_path
        else
            web_path = rel_path
        end
    end

    local is_binary = false
    if abs_path then
        local f = io.open(abs_path, "rb")
        if f then
            local bytes = f:read(1024)
            if bytes and bytes:find("\0") then
                is_binary = true
            end
            f:close()
        end
    end

    if ext == ".ipynb" then
        -- Treat as fully rendered HTML file (Quarto renders .ipynb to .html)
        -- We want to show it statically in viewer.html
        local html_path = web_path:gsub("%.ipynb$", ".html")
        
        -- Auto-render notebook to HTML in source folder if not already done or if notebook is newer
        if abs_path then
            local abs_html_path = abs_path:gsub("%.ipynb$", ".html")
            
            local check_cmd = string.format("[ '%s' -nt '%s' ]", abs_html_path, abs_path)
            local ret = os.execute(check_cmd)
            local html_is_newer = (ret == 0 or ret == true)
            
            if not html_is_newer then
                local theme_scss = p_dir .. "/.theme/theme.scss"
                local f_scss = io.open(theme_scss, "r")
                local theme_arg = "-M theme:solar"
                if f_scss then
                    f_scss:close()
                    theme_arg = string.format("-M theme=\"[solar, '%s']\"", theme_scss)
                end
                
                local cmd = string.format(
                    "quarto render '%s' --to html %s -M mainfont:Recursive -M monofont:Recursive -M highlight-style:solarized -M code-overflow:wrap -M toc:true -M code-copy:true -M html-math-method:katex",
                    abs_path, theme_arg
                )
                os.execute(cmd)
            end
        end

        -- URL encode path just in case
        local safe_path = html_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path .. "&mode=render"

    elseif is_binary == false then
        -- Use static viewer
        -- Need to URL encode the path
        -- Only minimal replacements: space to %20
        local safe_path = web_path:gsub(" ", "%20")
        return "/assets/viewer.html#file=" .. safe_path

    else
        -- Direct link (Images, PDF, etc)
        return web_path
    end
end

local function split_name_desc(text)
    local name, desc = text:match("^([^([^]+)(.*)$")
    if not name then
        name = text
        desc = ""
    end
    -- Trim whitespace
    name = name:gsub("^%s*(.-)%s*$", "%1")
    desc = desc:gsub("^%s*(.-)%s*$", "%1")
    return name, desc
end

local function format_item_html(name, desc, icon_class, is_link, url, frame_name, container_id)
    local desc_html = ""
    if desc ~= "" then
        desc_html = string.format(' <span class="filetree-comment text-muted small ms-1">%s</span>', desc)
    end
    
    local name_html = string.format('<span class="filetree-name">%s</span>', name)
    
    if is_link then
        return string.format(
            '<li class="file"><a href="#" class="filetree-link d-flex align-items-center gap-2 py-1 text-decoration-none text-body rounded px-2" data-url="%s" data-frame="%s" data-container="%s"><i class="bi %s text-info filetree-file-icon"></i> %s%s</a></li>',
            url, frame_name, container_id, icon_class, name_html, desc_html
        )
    else
        local li_class = "file-leaf"
        local icon_color_class = "text-secondary"
        -- If it represents a directory
        if name:find("/$") then
            li_class = "folder-leaf"
            icon_color_class = "text-warning"
        end
        return string.format(
            '<li class="%s"><span class="d-flex align-items-center gap-2 py-1 text-body opacity-75 px-2"><i class="bi %s %s"></i> %s%s</span></li>',
            li_class, icon_class, icon_color_class, name_html, desc_html
        )
    end
end

local function render_item(item, frame_name, container_id)
    -- Item is a Block (Plain or Para) containing Link or Str
    -- or a BulletList (subfolder)

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
            text = pandoc.utils.stringify(block)
            pandoc.walk_block(block, {
                Link = function(el) link = el end
            })
        end
    end

    if is_folder then
        local content = ""
        local folder_name = text
        if link then folder_name = pandoc.utils.stringify(link.content) end
        if folder_name == "" then folder_name = "Folder" end

        local f_name, f_desc = split_name_desc(folder_name)
        local desc_html = ""
        if f_desc ~= "" then
            desc_html = string.format(' <span class="filetree-comment text-muted small ms-1">%s</span>', f_desc)
        end
        local name_html = string.format('<span class="filetree-name fw-semibold">%s</span>', f_name)

        content = content ..
            '<li class="folder mb-1"><details open><summary class="d-flex align-items-center gap-2 py-1 text-body rounded px-2" style="cursor: pointer; list-style: none;"><i class="bi bi-chevron-right folder-arrow small text-muted"></i><i class="bi bi-folder-fill text-warning"></i> '
            .. name_html .. desc_html .. '</summary><ul class="list-unstyled ps-3 ms-2 border-start">'

        if sublist then
            for _, child_item in ipairs(sublist.content) do
                content = content .. render_item(child_item, frame_name, container_id)
            end
        end

        content = content .. '</ul></details></li>'
        return content
    else
        -- Leaf node (File or empty Directory)
        if not link then
            local is_dir = text:find("/%s") or text:find("/$")
            local f_name, f_desc = split_name_desc(text)
            local icon = is_dir and "bi-folder-fill" or "bi-file-earmark"
            
            if not is_dir then
                -- Try to extract extension from first word
                local first_word = f_name:match("^%s*([^%s]+)") or f_name
                icon = get_icon(first_word)
            end
            
            return format_item_html(f_name, f_desc, icon, false, nil, nil, nil)
        end

        local path = link.target
        local f_name, f_desc = split_name_desc(text)
        if f_name == "" then f_name = path:match("^.+/(.+)$") or path end

        local is_dir = f_name:find("/$") or path:find("/$")
        local icon = is_dir and "bi-folder-fill" or get_icon(path)
        local final_url = get_href(path, f_name)

        return format_item_html(f_name, f_desc, icon, true, final_url, frame_name, container_id)
    end
end

local function generate_zip(abs_zip_path, abs_source_dir)
    -- Ensure the directory for the zip exists
    local zip_dir = abs_zip_path:match("(.+)/[^/]+$")
    if zip_dir then
        os.execute("mkdir -p '" .. zip_dir .. "'")
    end

    -- To avoid absolute paths in the zip, we cd into the parent directory of abs_source_dir,
    -- and run zip on the folder name.
    local parent_dir, folder_name = abs_source_dir:match("(.+)/([^/]+)$")
    if not parent_dir then
        parent_dir = "."
        folder_name = abs_source_dir
    end

    local cmd = string.format("cd '%s' && zip -r -q '%s' '%s'", parent_dir, abs_zip_path, folder_name)
    os.execute(cmd)
end

return {
    ["filetree"] = function(args, kwargs, meta)
        -- This is a custom block: ::: {.filetree} ... :::
    end,

    Div = function(div)
        if div.classes:includes("filetree") then
            local content = ""
            local id = div.identifier
            if id == "" then id = "ide_" .. tostring(os.time()) .. tostring(math.random(1000)) end

            local frame_name = "viewer_" .. id
            local title = div.attributes["title"] or "EXPLORATEUR"
            local zip_link = div.attributes["zip"]

            local d_dir, p_dir = get_dirs()

            local zip_html = ""
            if zip_link then
                local zip_name = zip_link:match("^.+/(.+)$") or zip_link

                -- Determine the source directory from the first local file in the tree
                local first_local_link = nil
                for _, block in ipairs(div.content) do
                    if block.t == "BulletList" then
                        pandoc.walk_block(block, {
                            Link = function(el)
                                if not first_local_link and el.target and not el.target:match("^%a+://") then
                                    first_local_link = el.target
                                end
                            end
                        })
                    end
                end

                local source_dir = nil
                if first_local_link then
                    source_dir = first_local_link:match("(.+)/[^/]+$")
                end
                if not source_dir then
                    source_dir = zip_link:match("(.+)%.zip$")
                end

                -- Resolve paths to absolute paths
                local abs_zip_path = resolve_to_absolute(zip_link)
                local abs_source_dir = resolve_to_absolute(source_dir)

                -- Compute output zip path in _site directory
                local site_zip_path = nil
                local web_zip_url = zip_link
                if quarto and quarto.project and quarto.project.output_directory and abs_zip_path then
                    local zip_rel_path = abs_zip_path:sub(#p_dir + 2)
                    site_zip_path = quarto.project.output_directory .. "/" .. zip_rel_path
                    web_zip_url = "/" .. zip_rel_path
                else
                    if quarto and quarto.doc and quarto.doc.output_file then
                        local output_doc_dir = quarto.doc.output_file:match("(.+)/[^/]+$")
                        site_zip_path = output_doc_dir .. "/" .. zip_link
                    else
                        site_zip_path = "_site/" .. zip_link
                    end
                    web_zip_url = zip_link
                end

                zip_html = string.format('<a href="%s" class="ui-ide-download btn btn-sm btn-outline-primary fw-bold py-0 px-2 small" title="Download %s"><i class="bi bi-file-earmark-zip-fill"></i> ZIP</a>'
                    , web_zip_url, zip_name)

                -- Check if zip exists on disk in site output directory
                local f = io.open(site_zip_path, "r")
                if f ~= nil then
                    io.close(f)
                else
                    if abs_source_dir then
                        generate_zip(site_zip_path, abs_source_dir)
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
<div class="ui-ide d-flex border rounded overflow-hidden mb-4" id="%s">
  <div class="ui-ide-sidebar p-3">
    <div class="ui-ide-header d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
        <span class="ui-ide-title fw-bold text-uppercase small text-muted">%s</span>
        %s
    </div>
    <ul class="ui-ide-list list-unstyled m-0 p-0">
        %s
    </ul>
  </div>
  <div class="ui-ide-main d-none flex-column flex-grow-1">
    <iframe name="%s" src="about:blank" class="w-100 h-100 border-0" onload="this.style.opacity=1"></iframe>
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
                
                var actives = container.querySelectorAll('.filetree-link.is-active');
                actives.forEach(function(el) { el.classList.remove('is-active'); });
                this.classList.add('is-active');
                
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
