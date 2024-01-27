// Adds scroll to upgrade window
function add_upgrade_buttons() {
    if (parent.upgrade_buttons_added) return;
    parent.upgrade_buttons_added = true;

    let full_function_text = parent.render_upgrade_shrine.toString();
    
    // Search for the correct position to add first div
    let insert_index = 0;
    let search_sequence = ['<div style=', '+="'];
    for (const to_search of search_sequence) {
        insert_index = full_function_text.indexOf(to_search, insert_index);
        
        if (insert_index === -1) {
            game_log(`ERROR: unable to find ${to_search} in parent.render_upgrade_shrine`, "red");
            return;
        }

        // Add the length of the search string to get index of next character
        insert_index += to_search.length;
    }

    // Add first div
    full_function_text = full_function_text.slice(0, insert_index) + "<div style='display: inline-block'>" + full_function_text.slice(insert_index);

    // Search for position to add the buttons
    //insert_index = 0; (can continue from last position)
    search_sequence = ['UPGRADE', '+="</div>";'];
    for (const to_search of search_sequence) {
        insert_index = full_function_text.indexOf(to_search, insert_index);
        
        if (insert_index === -1) {
            game_log(`ERROR: unable to find ${to_search} in parent.render_upgrade_shrine`, "red");
            return;
        }

        // Add the length of the search string to get index of next character
        insert_index += to_search.length;
    }

    // Add dps for monster
    full_function_text = full_function_text.slice(0, insert_index) +
    `html+=\`<div style='display: inline-block; vertical-align: top; padding-left: 5px'>
        <div style='display: block'>
            ${parent.item_container({skin: "scroll0", size: 20, onclick:"buy('scroll0')"})}
            <div class='gamebutton clickable' onclick='buy("scroll0", 10)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+10</div>
            <div class='gamebutton clickable' onclick='buy("scroll0", 100)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+100</div>
        </div>
        <div style='display: block'>
            ${parent.item_container({skin: 'scroll1', size: 20, onclick:"buy('scroll1')"})}
            <div class='gamebutton clickable' onclick='buy("scroll1", 10)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+10</div>
            <div class='gamebutton clickable' onclick='buy("scroll1", 100)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+100</div>
        </div>
        <div style='display: block'>
            ${parent.item_container({skin: "scroll2", size: 20, onclick:"buy('scroll2')"})}
            <div class='gamebutton clickable' onclick='buy("scroll2", 10)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+10</div>
            <div class='gamebutton clickable' onclick='buy("scroll2", 100)' style='line-height: 18px; font-size: 24px; padding: 4px; border: 2px solid gray; margin-top: 2px'>+100</div>
        </div>
        <div style='display: block'>
            ${parent.item_container({skin: "scroll3", size: 20, onclick:"buy('scroll3')"})}
        </div>
        <div style='display: block'>
            ${parent.item_container({skin: "skill_massproduction", size: 30, onclick:"use_skill('massproduction'); upgrade(u_item,u_scroll,u_offering);"})}
            ${parent.item_container({skin: "skill_massproductionpp", size: 30, onclick:"use_skill('massproductionpp'); upgrade(u_item,u_scroll,u_offering);"})}
            ${parent.item_container({skin: "shade_offering", size: 30, onclick:"buy('offering')"})}
        </div>
    </div>\`;`
    +
    `html+="</div>";` // End the first div added
    +
    full_function_text.slice(insert_index);

    // Eval the function string in parent scope
    parent.eval("this.original_render_upgrade_shrine = this.render_upgrade_shrine");
    parent.eval("this.render_upgrade_shrine = " + full_function_text);
}

setInterval(add_upgrade_buttons, 250);
