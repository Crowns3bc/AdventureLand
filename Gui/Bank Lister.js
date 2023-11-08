function add_bank_button() {
    let $ = parent.$;
    let trc = $("#toprightcorner");
    $('#bankbutton').remove();
    let bankButton = $('<div id="bankbutton" class="gamebutton" onclick="parent.$(`#maincode`)[0].contentWindow.render_bank_items()">BANK</div>');
    trc.children().first().after(bankButton);
}

add_bank_button();

function render_bank_items() {
    if (!character.bank) return game_log("Not inside the bank");

    function itm_cmp(a, b) {
        return (
            (a == null) - (b == null) ||
            (a && (a.name < b.name ? -1 : +(a.name > b.name))) ||
            (a && b.level - a.level)
        );
    }

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

    let slot_ids = [
        "helmet", "chest", "pants", "gloves", "shoes", "cape", "ring", "earring", "amulet", "belt",
        "orb", "weapon", "shield", "offhand", "elixir", "pot", "scroll", "material", "exchange", "",
    ];

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
                    const dest_type = b[1].id;
                    let type_in_bank = [];
                    for (let bank_pock in character.bank) {
                        const bank_pack = character.bank[bank_pock];
                        for (let bonk_item in bank_pack) {
                            const bank_item = bank_pack[bonk_item];
                            if (bank_item && bank_item.name == dest_type)
                                type_in_bank.push(bank_item);
                        }
                    }
                    type_in_bank.sort(itm_cmp);
                    for (let io = type_in_bank.length - 1; io >= 1; io--) {
                        if (itm_cmp(type_in_bank[io], type_in_bank[io - 1]) == 0) {
                            type_in_bank[io - 1].q =
                                (type_in_bank[io - 1].q || 1) + (type_in_bank[io].q || 1);
                            type_in_bank.splice(io, 1);
                        }
                    }
                    a[c][1].push(type_in_bank);
                    break;
                }
    });

    for (var c = 0; c < a.length; c++) {
        let stackableItems = [];
        let unstackableItems = [];
        let stackableMap = new Map(); // Map to consolidate stackable items

        a[c][1].flat().forEach(item => {
            if (item.q && item.q > 1) {
                if (stackableMap.has(item.name + item.level)) { // Group by item name and level
                    stackableMap.set(item.name + item.level, {
                        name: item.name,
                        level: item.level,
                        q: stackableMap.get(item.name + item.level).q + item.q
                    });
                } else {
                    stackableMap.set(item.name + item.level, { name: item.name, level: item.level, q: item.q });
                }
            } else {
                unstackableItems.push(item);
            }
        });

        a[c][1] = Array.from(stackableMap, ([nameLevel, data]) => {
            if (data.q > 1000) {
                if (data.q % 1 === 0) {
                    return { name: data.name, level: data.level, q: (data.q / 1000).toFixed(0) + "k" };
                } else {
                    return { name: data.name, level: data.level, q: (data.q / 1000).toFixed(1).replace(/\.0$/, "") + "k" };
                }
            } else {
                return { name: data.name, level: data.level, q: data.q };
            }
        });

        a[c][1] = a[c][1].concat(unstackableItems);

        a[c][1] = a[c][1].sort((a, b) => (a.name > b.name ? 1 : -1)); // Sorting the items by name
    }

    render_items(a);
}

function render_items(a) {
    if (a.length > 0 && !Array.isArray(a[0])) {
        a = [["Items", a]];
    }

    let html = "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%; height: 90%;'>";

    a.forEach((category) => {
        html += `<div style='float:left; margin-left:5px;'><div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>${category[0]}</div>`;
        html += "<div style='margin-bottom: 10px'>";

        category[1].forEach((item) => {
            let itemDiv = parent.item_container({ skin: G.items[item.name].skin, onclick: `render_item_info('${item.name}')` }, item);

            if (item.p) {
                let corner = "";
                switch (item.p) {
                    case "festive":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#79ff7e'>F</div>`;
                        break;
                    case "firehazard":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#f79b11'>H</div>`;
                        break;
                    case "glitched":
                        corner = `<div class='trruui imu' style='border-color: grey; color:grey'>#</div>`;
                        break;
                    case "gooped":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#64B867'>G</div>`;
                        break;
                    case "legacy":
                        corner = `<div class='trruui imu' style='border-color: grey; color:white'>L</div>`;
                        break;
                    case "lucky":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#00f3ff'>L</div>`;
                        break;
                    case "shiny":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#99b2d8'>S</div>`;
                        break;
                    case "superfast":
                        corner = `<div class='trruui imu' style='border-color: grey; color:#c681dc'>U</div>`;
                        break;
                    default:
                        corner = `<div class='trruui imu' style='border-color: black; color:grey'>?</div>`;
                        break;
                }
                itemDiv = itemDiv.replace('</div></div>', `</div>${corner}</div>`);
            }

            html += itemDiv;
        });

        html += "</div></div>";
    });

    html += "<div style='clear:both;'></div></div>";
    parent.show_modal(html, { wrap: false, hideinbackground: true, url: "/docs/guide/all/items" });
}
