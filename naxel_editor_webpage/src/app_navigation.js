
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


