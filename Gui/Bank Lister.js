// Function to add a bank button to the game interface
function add_bank_button() {
    let $ = parent.$; // Assigning jQuery reference from the parent window
    let trc = $("#toprightcorner"); // Selecting the top right corner element
    $('#bankbutton').remove(); // Removing any existing bank button

    // Creating a new bank button element and defining its click event to render bank items
    let bankButton = $('<div id="bankbutton" class="gamebutton" onclick="parent.$(`#maincode`)[0].contentWindow.render_bank_items()">BANK</div>');
    trc.children().first().after(bankButton); // Adding the bank button after the first child of the top right corner
}

// Call the function to add the bank button when the script loads
add_bank_button();

// Function to render bank items
function render_bank_items() {
    // Check if the character is inside the bank
    if (!character.bank) return game_log("Not inside the bank");

    // Sorting items into different categories for display
    // 'a' holds the category names and respective items
    var a = [
        ["Helmets", []],
        ["Armors", []],
        ["Underarmors", []],
        ["Gloves", []],
        ["Shoes", []],
        ["Capes", []],
        ["Rings", []],
        ["Earrings", []],
        ["Amulets", []],
        ["Belts", []],
        ["Orbs", []],
        ["Weapons", []],
        ["Shields", []],
        ["Offhands", []],
        ["Elixirs", []],
        ["Potions", []],
        ["Scrolls", []],
        ["Crafting and Collecting", []],
        ["Exchangeables", []],
        ["Others", []],
    ];
    var b = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%'>"; // HTML template for styling

    // Defining slot IDs for different types of equipment
    let slot_ids = [
        "helmet",
        "chest",
        "pants",
        "gloves",
        "shoes",
        "cape",
        "ring",
        "earring",
        "amulet",
        "belt",
        "orb",
        "weapon",
        "shield",
        "offhand",
        "elixir",
        "pot",
        "scroll",
        "material",
        "exchange",
        "",
    ];

    // Loop through game items and categorize them based on their types
    object_sort(G.items, "gold_value").forEach(function (b) {
        if (!b[1].ignore)
            for (var c = 0; c < a.length; c++)
                if (
                    !slot_ids[c] ||
                    b[1].type == slot_ids[c] ||
                    ("offhand" == slot_ids[c] &&
                        in_arr(b[1].type, ["source", "quiver", "misc_offhand"])) ||
                    ("scroll" == slot_ids[c] &&
                        in_arr(b[1].type, ["cscroll", "uscroll", "pscroll", "offering"])) ||
                    ("exchange" == slot_ids[c] && G.items[b[0]].e)
                ) {
                    // Code to identify items in the bank and categorize them
                    // ... (processing items in the bank)
                }
    });

    // Flatten the categorized items and render them
    for (var c = 0; c < a.length; c++) {
        a[c][1] = a[c][1].flat(); // Flattening the nested arrays
    }
    render_items(a); // Rendering the categorized items
}

// Function to render items on the interface
function render_items(a) {
    // Check if the 'a' array contains nested arrays; if not, structure it to contain nested arrays
    if (a.length > 0 && !Array.isArray(a[0])) {
        a = [["Items", a]];
    }

    let b = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%, height:90%'>"; // HTML template for styling

    // Iterate through the array and generate HTML to display items
    a.forEach(function (a) {
        b += "<div style='float:left; margin-left:5px;'><div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>" + a[0] + "</div>";
        b += "<div style='margin-bottom: 10px'>";
        a[1].forEach(function (a) {
            // Creating HTML elements for each item and its respective information
            b += parent.item_container({
                skin: G.items[a.name].skin,
                onclick: "render_item_info('" + a.name + "')",
            }, a);
        });
        b += "</div></div>";
    });

    b += "<div style='clear:both;'></div></div>";
    // Display the items in a modal window
    parent.show_modal(b, {
        wrap: !1,
        hideinbackground: !0,
        url: "/docs/guide/all/items",
    });
}
