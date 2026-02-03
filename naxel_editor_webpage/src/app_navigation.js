
//
window.not_available = [];
window.current_compo = "simple_one_window";

// Registry to store menu assignments for each surface (without creating them)
window.surface_menu_assignments = {};

//
window.surfaces_menus = {
    "none": "none",
    "camera": "📹 camera",
    "palette": "🎨 palette",
    "grid": "✏️ grid",
    "tools": "🔧 tools",
    "environment": "🏔️ environment",
    "lights": "💡 lights",
    "metadata": "📰 metadata"
};

//
window.surfaces_menu_creation = {
    "none": create_none_menu,
    "camera": create_camera_menu,
    "palette": create_palette_menu,
    "grid": create_grid_menu,
    "tools": create_tools_menu,
    "environment": create_environment_menu,
    "lights": create_lights_menu,
    "metadata": create_metadata_menu
};

//
window.composition_icons = {
    "simple_one_window": "res/composition/simple_one_window.svg",
    "duo_vertical": "res/composition/duo_vertical.svg",
    "duo_horizontal": "res/composition/duo_horizontal.svg",
    "trio_horizontal_2_1": "res/composition/trio_horizontal_2_1.svg",
    "trio_vertical_2_1": "res/composition/trio_vertical_2_1.svg",
    "quadro": "res/composition/quadro.svg"
}


/*
Function that is called when the user clicks on a button of the main navigation bar
between the "Edit", "View" or "JSON" pages.
*/
function go_to_page(page_id) {

    // Go through all the subpages, hide the one we don't want and display only the one we want
    var all_subpages = document.getElementsByClassName("subpage");

    for (page of all_subpages) {

        if (page.id == page_id) {

            // The page we want to view
            page.style.display = "flex";

        } else {

            // The page we don't want to view
            page.style.display = "none";

        }

    }

}


/*
Function that create the sub navigation bar (Composition Button + Select options surface menus)
*/
function create_surface_navigation_node(surface_id) {

    //
    var parent_node = document.getElementById(surface_id).parentElement;
    if (!Object.keys(window.composition_icons).includes(parent_node.id)) {
        parent_node = parent_node.parentElement;
    }
    var composition_name = parent_node.id;

    //
    var div_node = document.createElement("div");
    div_node.style.display = "flex";
    div_node.style.flexGrow = 1;
    div_node.style.flexDirection = "row";

    //
    var bt_compo = document.createElement("button");
    bt_compo.style.backgroundImage = "url(" + window.composition_icons[composition_name] + ")";
    bt_compo.style.backgroundSize = "cover";
    bt_compo.style.backgroundPosition = "center";
    bt_compo.style.backgroundRepeat = "no-repeat";
    bt_compo.style.backgroundColor = "#080819ff";
    bt_compo.style.border = "1px solid #080819ff";
    bt_compo.style.cursor = "pointer";
    bt_compo.style.height = "100%";
    bt_compo.style.minWidth = "25px";
    bt_compo.style.aspectRatio = "1 / 1";
    bt_compo.setAttribute("onclick", "show_composition_menu_selection();");
    div_node.appendChild(bt_compo);

    //
    var select = document.createElement("select");
    select.id = surface_id + "_select";
    select.style.display = "flex";
    select.style.flexGrow = 1;
    select.style.textAlign = "center";
    select.style.backgroundColor = "#080819ff";
    select.style.border = "1px solid #080819ff";
    select.style.color = "#ffffff";
    div_node.appendChild(select);

    //
    for (surface_menu of Object.keys(window.surfaces_menus)) {

        var option = document.createElement("option");
        option.id = "option_" + surface_id + "_" + surface_menu;
        option.value = surface_menu;
        option.innerText = window.surfaces_menus[surface_menu];
        option.style.textAlign = "center";
        option.classList.add("option_surface_menu_" + surface_menu);
        option.setAttribute("onclick", "on_select_surface_menu( \"" + surface_menu + "\", \"" + surface_id + "\" )");

        select.appendChild(option);

        if (window.not_available.includes(surface_menu)) {

            option.disabled = true;

        }

    }

    //
    return div_node;

}

/*
Function that create the sub navigation bar for all the surface parts
*/
function apply_surface_navigation_node() {

    //
    var all_nodes = document.getElementsByClassName("surface_nav");

    //
    for (node of all_nodes) {

        //
        var surface_id = node.parentElement.id;

        //
        var div = create_surface_navigation_node(surface_id);

        //
        node.appendChild(div);

    }

}

/*
Function that adds to the not available list a surface menu
*/
function add_to_not_available(surface_menu) {
    if (!window.not_available.includes(surface_menu)) {
        window.not_available.push(surface_menu);
    }
}

/*
Function that remove a surface menu to the not available list
*/
function remove_from_not_available(surface_menu) {
    const index = window.not_available.indexOf(surface_menu);
    if (index > -1) {
        window.not_available.splice(index, 1);
    }
}

/*
Function that update all the surface menu options from the current not available list.
*/
function update_all_surface_menu_options(new_composition) {

    //
    for (node of document.getElementsByClassName(new_composition + "_surface")) {

        surface_id = node.id;

        // Get current surface assignment
        const current_assignment = window.surface_menu_assignments[surface_id] || node.getAttribute("data-surface-menu");

        //
        for (surface_menu of Object.keys(window.surfaces_menus)) {

            var option_id = "option_" + surface_id + "_" + surface_menu;
            var option = document.getElementById(option_id);

            //
            if (window.not_available.includes(surface_menu) && surface_menu !== current_assignment) {

                option.disabled = true;

            } else {

                option.disabled = false;

            }

        }

    }

}

/*
Function that is called when a user changes the menu of a surface.
This now stores the assignment and only creates the menu if the surface is in the active composition.
*/
function on_select_surface_menu(surface_menu, surface_id) {

    //
    surface_node = document.getElementById(surface_id);
    if (!surface_node) return;

    //
    old_surface_menu = surface_node.getAttribute("data-surface-menu");

    //
    if (old_surface_menu != "" && old_surface_menu != null) {
        remove_from_not_available(old_surface_menu);
    }

    //
    add_to_not_available(surface_menu);

    // Store the assignment in registry
    window.surface_menu_assignments[surface_id] = surface_menu;

    // Store on the node
    surface_node.setAttribute("data-surface-menu", surface_menu);

    // Only create the menu if this surface is in the currently active composition
    const parentCompo = getParentComposition(surface_id);
    if (parentCompo === window.current_compo) {
        set_surface_menu(surface_menu, surface_id);
    }

    // Update select dropdown if it exists
    const select_node = document.getElementById(surface_id + "_select");
    if (select_node) {
        select_node.value = surface_menu;
    }

    // Update all dropdowns options visibility
    update_all_surface_menu_options(window.current_compo);
}

/**
 * Get the parent composition ID for a surface
 */
function getParentComposition(surface_id) {
    const surface = document.getElementById(surface_id);
    if (!surface) return null;

    let parent = surface.parentElement;
    while (parent) {
        if (Object.keys(window.composition_icons).includes(parent.id)) {
            return parent.id;
        }
        parent = parent.parentElement;
    }
    return null;
}

/*
Function to set the menu of a surface - creates the actual menu elements
*/
function set_surface_menu(surface_menu, surface_id) {

    //
    const surface_node = document.getElementById(surface_id + "_main");
    if (!surface_node) return;

    // Clear existing content
    surface_node.innerHTML = "";

    // Create and append the new menu
    if (window.surfaces_menu_creation[surface_menu]) {
        surface_node.appendChild(window.surfaces_menu_creation[surface_menu]());
    }

    // Update select dropdown
    const select_node = document.getElementById(surface_id + "_select");
    if (select_node) {
        select_node.value = surface_menu;
    }
}

//
function show_composition_menu_selection() {

    //
    document.getElementById("composition_selection_menu").style.display = "flex";

}

//
function update_not_available_surfaces(new_composition) {

    //
    window.not_available = [];

    //
    for (node of document.getElementsByClassName(new_composition + "_surface")) {

        //
        window.not_available.push(node.getAttribute("data-surface-menu"));

    }

}

//
function on_composition_change(new_composition) {

    // Store old composition
    const old_composition = window.current_compo;

    // Update current composition
    window.current_compo = new_composition;

    // Clear menus from old composition
    clearCompositionMenus(old_composition);

    // Show/hide composition views
    for (node of document.getElementsByClassName("comp_view")) {
        if (node.id == new_composition) {
            node.style.display = "flex";
        }
        else {
            node.style.display = "none";
        }
    }

    //
    update_not_available_surfaces(new_composition);
    //
    update_all_surface_menu_options(new_composition);

    //
    document.getElementById("composition_selection_menu").style.display = "none";

    // Create menus for the new composition after it's visible
    requestAnimationFrame(() => {
        createCompositionMenus(new_composition);
    });
}

/**
 * Clear all menus from a composition (destroy them)
 */
function clearCompositionMenus(composition) {
    if (!composition) return;
    const surfaces = document.getElementsByClassName(composition + "_surface");
    for (const surface of surfaces) {
        const mainNode = document.getElementById(surface.id + "_main");
        if (mainNode) {
            mainNode.innerHTML = "";
        }
    }
}

/**
 * Create menus for a composition based on stored assignments
 */
function createCompositionMenus(composition) {
    const surfaces = document.getElementsByClassName(composition + "_surface");
    for (const surface of surfaces) {
        const menuType = window.surface_menu_assignments[surface.id] ||
            surface.getAttribute("data-surface-menu") ||
            "none";
        if (menuType && menuType !== "none") {
            set_surface_menu(menuType, surface.id);
        }
    }
}

function on_page_init() {

    //
    apply_surface_navigation_node();

    // Initialize JSON subpage
    if (typeof initJsonSubpage === "function") {
        initJsonSubpage();
    }

    // Apply default pages menus

    // One
    on_select_surface_menu("camera", "simple_one_window_surface");

    // Duo vertical
    on_select_surface_menu("camera", "duo_vertical_surface_1");
    on_select_surface_menu("grid", "duo_vertical_surface_2");

    // Duo horizontal
    on_select_surface_menu("camera", "duo_horizontal_surface_1");
    on_select_surface_menu("grid", "duo_horizontal_surface_2");

    // Trio vertical 2 1
    on_select_surface_menu("camera", "trio_vertical_2_1_surface_1");
    on_select_surface_menu("palette", "trio_vertical_2_1_surface_2");
    on_select_surface_menu("grid", "trio_vertical_2_1_surface_3");

    // Trio horizontal 2 1
    on_select_surface_menu("camera", "trio_horizontal_2_1_surface_1");
    on_select_surface_menu("palette", "trio_horizontal_2_1_surface_2");
    on_select_surface_menu("grid", "trio_horizontal_2_1_surface_3");

    // Quadro
    on_select_surface_menu("camera", "quadro_surface_1");
    on_select_surface_menu("palette", "quadro_surface_2");
    on_select_surface_menu("environment", "quadro_surface_3");
    on_select_surface_menu("grid", "quadro_surface_4");

    // Update everything correctly
    if (window.innerHeight > window.innerWidth) {
        // Vertical screen ratio
        on_composition_change("trio_vertical_2_1");
    }
    else {
        // Horizontal screen ratio
        on_composition_change("trio_horizontal_2_1");
    }

    // on_composition_change("simple_one_window");

}

