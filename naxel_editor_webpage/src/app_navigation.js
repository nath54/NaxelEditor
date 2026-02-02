
//
window.not_available = [];
window.current_compo = "simple_one_window";

// Compos: "simple_one_window", "duo_vertical", "duo_horizontal", "trio_horizontal_2_1", "trio_vertical_2_1", "quadro"

//
function go_to_page(page_id){

    // Go through all the subpages, hide the one we don't want and display only the one we want
    var all_subpages = document.getElementsByClassName("subpage");

    for(page of all_subpages){

        if( page.id == page_id ){

            // The page we want to view
            page.style.display = "flex";

        } else{

            // The page we don't want to view
            page.style.display = "none";

        }

    }

}


//
function create_surface_navigation_node(surface_id){

    //
    var div_node = document.createElement("div");
    div_node.style.display = "flex";
    div_node.style.flexGrow = 1;
    div_node.style.flexDirection = "row";

    //
    var bt_compo = document.createElement("button");
    bt_compo.innerText = "comp";
    bt_compo.setAttribute("onclick", "show_composition_menu_selection();");
    div_node.appendChild(bt_compo);

    //
    var select = document.createElement("select");
    select.style.display = "flex";
    select.style.flexGrow = 1;
    select.style.textAlign = "center";
    div_node.appendChild(select);

    //
    for(surface_menu of ["camera", "palette", "grid", "environment", "lights", "metadata"]){
        
        var option = document.createElement("option");
        option.innerText = surface_menu;
        option.style.textAlign = "center";
        option.classList.add( "option_surface_menu_"+surface_menu );
        option.setAttribute("onclick", "on_select_surface_menu( \""+surface_menu+"\", \""+surface_id+"\" )");

        select.appendChild( option );

        if( window.not_available.includes(surface_menu) ){

            option.disabled = true;

        }

    }

    //
    return div_node;

}

//
function apply_surface_navigation_node(){

    //
    var all_nodes = document.getElementsByClassName("surface_nav");

    //
    for(node of all_nodes){

        //
        var surface_id = node.parentElement.id;
        
        //
        var div = create_surface_navigation_node(surface_id);

        //
        node.appendChild( div );

    }

}

//
function add_to_not_available(surface_menu){

    //
    window.not_available.push( surface_menu );

    //
    for( node of document.getElementsByClassName("option_surface_menu_"+surface_menu) ){

        node.disabled = true;

    }

}

//
function remove_from_not_available(surface_menu){

    //
    const index = window.not_available.indexOf(surface_menu);
    if (index > -1) { // only splice array when item is found
        window.not_available.splice(index, 1); // 2nd parameter means remove one item only
    }

    //
    for( node of document.getElementsByClassName("option_surface_menu_"+surface_menu) ){

        node.disabled = false;

    }

}

//
function on_select_surface_menu( surface_menu, surface_id ){

    //
    surface_node = document.getElementById(surface_id);

    //
    old_surface_menu = surface_node.getAttribute("data-surface-menu");

    //
    if(old_surface_menu != "" && old_surface_menu != null){
        remove_from_not_available(old_surface_menu);
    }

    //
    add_to_not_available(surface_menu);

    //
    set_surface_menu( surface_menu, surface_id );

    //
    surface_node.setAttribute("data-surface-menu", surface_menu);

}


//
function set_surface_menu( surface_menu, surface_id ){

    // TODO

}

//
function show_composition_menu_selection(){

    //
    document.getElementById("composition_selection_menu").style.display = "flex";

}

//
function on_composition_change(new_composition){

    //
    for(node of document.getElementsByClassName("")){
        
    }


}

