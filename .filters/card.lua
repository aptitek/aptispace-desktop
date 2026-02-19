function Div(el)
    local target_classes = {
        ["primary"] = true,
        ["secondary"] = true,
        ["success"] = true,
        ["danger"] = true,
        ["warning"] = true,
        ["info"] = true,
        ["light"] = true,
        ["dark"] = true
    }

    local color = nil
    for i, class in ipairs(el.classes) do
        if target_classes[class] then
            color = class
            break
        end
    end

    if color then
        -- Create the new classes list
        local new_classes = { "card", "bg-" .. color }
        -- Add text-white for darker backgrounds to match Bootstrap styling if needed,
        -- but sticking to user request: just .card .bg-danger.
        -- (User example: ::: {.card .bg-danger})
        -- However, Bootstrap cards usually need margin/spacing?
        -- User didn't ask for it.

        -- Copy other classes
        for i, class in ipairs(el.classes) do
            if class ~= color then
                table.insert(new_classes, class)
            end
        end

        local header_text = el.attributes["header"]

        -- Create new attributes (copying id, etc, but updating classes)
        local new_attr = el.attr
        new_attr.classes = new_classes

        -- Filter out the 'header' attribute so it doesn't appear in output HTML
        if new_attr.attributes["header"] then
            new_attr.attributes["header"] = nil
        end

        local card_content = pandoc.List()

        -- Handle Header
        if header_text then
            -- We treat the header attribute as plain text.
            -- To support basic markdown in header would require parsing,
            -- but usually attributes are simple strings.
            local header_inlines = { pandoc.Str(header_text) }
            local header_block = pandoc.Plain(header_inlines)
            local header_div = pandoc.Div({ header_block }, pandoc.Attr("", { "card-header" }))
            card_content:insert(header_div)
        end

        -- Prepare Body Content
        -- We need to add .card-title to any Header elements inside the card body.
        -- We use a temporary Div to walk the content.
        local body_wrapper = pandoc.Div(el.content)
        body_wrapper = pandoc.walk_block(body_wrapper, {
            Header = function(h)
                h.classes:insert("card-title")
                return h
            end
        })

        local card_body = pandoc.Div(body_wrapper.content, pandoc.Attr("", { "card-body" }))
        card_content:insert(card_body)

        return pandoc.Div(card_content, new_attr)
    end
end
