const stackBankItems = true;
// false = show every single copy separately (but still display .q when present)
// true  = stack all items by name:level:p

function pretty3(q) {
    // Below 10 000, show the exact count
    if (q < 10_000) {
        return `${q}`;
    }
    // Millions
    if (q >= 1_000_000) {
        let mil = q / 1_000_000;
        return mil >= 100
            ? `${Math.floor(mil)}m`
            : `${strip(mil)}m`;
    }
    // Thousands  (10 000 ≤ q < 1 000 000)
    let k = q / 1_000;
    return k >= 100
        ? `${Math.floor(k)}k`
        : `${strip(k)}k`;
}

function strip(num) {
    let fixed = num.toFixed(1);
    return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

function add_bank_button() {
    let $ = parent.$;
    let trc = $("#toprightcorner");
    $('#bankbutton').remove();
    let bankButton = $(
        `<div id="bankbutton" class="gamebutton" 
         onclick="parent.$('#maincode')[0].contentWindow.render_bank_items()">
         🏧
       </div>`
    );
    trc.children().first().after(bankButton);
}
add_bank_button();

function saveBankLocal() {
    if (character.bank) {
        localStorage.setItem("savedBank", JSON.stringify(character.bank));
        game_log("Bank saved!");
    } else {
        game_log("No bank data!");
    }
}

function load_bank_from_local_storage() {
    const saved = localStorage.getItem("savedBank");
    if (saved) return JSON.parse(saved);
    game_log("No saved bank data found.");
    return null;
}

function render_items(categories, used, total) {
    categories = categories.filter(([, items]) => items.length > 0);
    let html = `
      <div style='position: relative; border: 5px solid gray;
                  background-color: black; padding: 10px;
                  width: 90%; height: 90%;'>
        <div style="position: absolute; top: 5px; right: 10px;
                    font-size: 24px; color: white; z-index: 10;">
          ${used}/${total}
        </div>
    `;

    categories.forEach(([label, items]) => {
        html += `
          <div style='float:left; margin-left:5px;'>
            <div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>
              ${label}
            </div>
            <div style='margin-bottom: 10px'>
        `;

        items.forEach(item => {
            let opts = { skin: G.items[item.name].skin, onclick: `render_item_info('${item.name}')` };
            let itemDiv = parent.item_container(opts, item);
            if (item.p) {
                let corner = "";
                switch (item.p) {
                    case "festive": corner = `<div class='trruui imu' style='border-color:grey;color:#79ff7e'>F</div>`; break;
                    case "firehazard": corner = `<div class='trruui imu' style='border-color:grey;color:#f79b11'>H</div>`; break;
                    case "glitched": corner = `<div class='trruui imu' style='border-color:grey;color:grey'>#</div>`; break;
                    case "gooped": corner = `<div class='trruui imu' style='border-color:grey;color:#64B867'>G</div>`; break;
                    case "legacy": corner = `<div class='trruui imu' style='border-color:grey;color:white'>L</div>`; break;
                    case "lucky": corner = `<div class='trruui imu' style='border-color:grey;color:#00f3ff'>L</div>`; break;
                    case "shiny": corner = `<div class='trruui imu' style='border-color:grey;color:#99b2d8'>S</div>`; break;
                    case "superfast": corner = `<div class='trruui imu' style='border-color:grey;color:#c681dc'>U</div>`; break;
                    default: corner = `<div class='trruui imu' style='border-color:black;color:grey'>?</div>`; break;
                }
                itemDiv = itemDiv.replace('</div></div>', `</div>${corner}</div>`);
            }
            html += itemDiv;
        });

        html += `</div></div>`;
    });

    html += `<div style='clear:both;'></div></div>`;
    parent.show_modal(html, {
        wrap: false,
        hideinbackground: true,
        url: "/docs/guide/all/items"
    });
}

function render_bank_items() {
    let bankData = character.bank || load_bank_from_local_storage();
    if (!bankData) return game_log("No bank data found.");

    function itm_cmp(a, b) {
        return (a == null) - (b == null)
            || (a && (a.name < b.name ? -1 : +(a.name > b.name)))
            || (a && b.level - a.level);
    }

    // Categories & slot mapping
    let categories = [
        ["Helmets", []], ["Armors", []], ["Underarmors", []],
        ["Gloves", []], ["Shoes", []], ["Capes", []],
        ["Rings", []], ["Earrings", []], ["Amulets", []],
        ["Belts", []], ["Orbs", []], ["Weapons", []],
        ["Shields", []], ["Offhands", []], ["Elixirs", []],
        ["Potions", []], ["Scrolls", []],
        ["Crafting and Collecting", []],
        ["Exchangeables", []], ["Others", []]
    ];
    let slot_ids = [
        "helmet", "chest", "pants", "gloves", "shoes", "cape", "ring",
        "earring", "amulet", "belt", "orb", "weapon", "shield",
        "offhand", "elixir", "pot", "scroll", "material", "exchange", ""
    ];

    // Gather raw slices
    object_sort(G.items, "gold_value").forEach(([id, def]) => {
        if (def.ignore) return;
        for (let ci = 0; ci < categories.length; ci++) {
            let type = slot_ids[ci];
            if (
                !type
                || def.type === type
                || (type === "offhand" && in_arr(def.type, ["source", "quiver", "misc_offhand"]))
                || (type === "scroll" && in_arr(def.type, ["cscroll", "uscroll", "pscroll", "offering"]))
                || (type === "exchange" && def.e)
            ) {
                let slice = [];
                for (let pack in bankData) {
                    let arr = bankData[pack];
                    if (!Array.isArray(arr)) continue;
                    arr.forEach(it => { if (it && it.name === id) slice.push(it); });
                }
                slice.sort(itm_cmp);
                categories[ci][1].push(slice);
                break;
            }
        }
    });

    // Final pass: stack vs. flatten
    categories.forEach(cat => {
        let flat = cat[1].flat();

        if (stackBankItems) {
            let map = new Map();
            flat.forEach(item => {
                let key = `${item.name}:${item.level}:${item.p || ""}`;
                if (!map.has(key)) {
                    map.set(key, { ...item, q: item.q || 1 });
                } else {
                    map.get(key).q += (item.q || 1);
                }
            });
            cat[1] = Array.from(map.values()).map(d => {
                d.q = pretty3(d.q);
                return d;
            });
        } else {
            // keep original .q if present (formatted), otherwise show individual copy
            cat[1] = flat.map(item => {
                if (item.q != null) {
                    return { ...item, q: pretty3(item.q) };
                }
                return { ...item };
            });
        }

        cat[1].sort((a, b) => a.name > b.name ? 1 : -1);
    });

    // Count slots
    let used = 0, total = 0;
    Object.values(bankData).forEach(arr => {
        if (Array.isArray(arr)) {
            total += arr.length;
            used += arr.filter(x => !!x).length;
        }
    });

    render_items(categories, used, total);
}

let saveBtn = $(
    `<div id="saveBankButton" class="gamebutton"
         onclick="parent.$('#maincode')[0].contentWindow.saveBankLocal()">
     SAVE BANK
   </div>`
);
$("#toprightcorner").children().first().after(saveBtn);
