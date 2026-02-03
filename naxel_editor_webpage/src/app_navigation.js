
//
window.not_available = [];
window.current_compo = "simple_one_window";

//
window.surfaces_menus = {
    "none": "none",
    "camera": "📹 camera",
    "palette": "🎨 palette",
    "grid": "✏️ grid",
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

//
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


//
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

//
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

//
function add_to_not_available(surface_menu) {

    //
    window.not_available.push(surface_menu);

    //
    for (node of document.getElementsByClassName("option_surface_menu_" + surface_menu)) {

        node.disabled = true;

    }

}

//
function remove_from_not_available(surface_menu) {

    //
    const index = window.not_available.indexOf(surface_menu);
    if (index > -1) { // only splice array when item is found
        window.not_available.splice(index, 1); // 2nd parameter means remove one item only
    }

    //
    for (node of document.getElementsByClassName("option_surface_menu_" + surface_menu)) {

        node.disabled = false;

    }

}

//
function update_all_surface_menu_options(new_composition) {

    //
    for (node of document.getElementsByClassName(new_composition + "_surface")) {

        surface_id = node.id;

        //
        for (surface_menu of Object.keys(window.surfaces_menus)) {

            var option_id = "option_" + surface_id + "_" + surface_menu;
            var option = document.getElementById(option_id);

            //
            if (window.not_available.includes(surface_menu)) {

                option.disabled = true;

            } else {

                option.disabled = false;

            }

        }

    }

}

//
function on_select_surface_menu(surface_menu, surface_id) {

    //
    surface_node = document.getElementById(surface_id);

    //
    old_surface_menu = surface_node.getAttribute("data-surface-menu");

    //
    if (old_surface_menu != "" && old_surface_menu != null) {
        remove_from_not_available(old_surface_menu);
    }

    //
    add_to_not_available(surface_menu);

    //
    set_surface_menu(surface_menu, surface_id);

    //
    surface_node.setAttribute("data-surface-menu", surface_menu);

}


//
function set_surface_menu(surface_menu, surface_id) {

    //
    surface_node = document.getElementById(surface_id + "_main");

    //
    surface_node.innerHTML = "";

    //
    surface_node.appendChild(window.surfaces_menu_creation[surface_menu]());

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

    //
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

}

function on_page_init(){

    //
    apply_surface_navigation_node();

    return;

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
    on_select_surface_menu("grid", "quadro_surface_3");

    // Update everything correctly
    on_composition_change("one_simple_window");

}

