function add_bank_button(){
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
    ],
    b =
      "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%'>";
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
          //a[c][1].push({name:b[1].id});
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
          //sucessive merge, flatten
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
    a[c][1] = a[c][1].flat();
  }
  //show_json(a);
  render_items(a);
}
function render_items(a) {
  if (a.length > 0 && !Array.isArray(a[0])) {
    a = [["Items", a]];
  }
  let b =
    "<div style='border: 5px solid gray; background-color: black; padding: 10px; width: 90%, height:90%'>";
  a.forEach(function (a) {
    b +=
      "<div style='float:left; margin-left:5px;'><div class='gamebutton gamebutton-small' style='margin-bottom: 5px'>" +
      a[0] +
      "</div>";
    b += "<div style='margin-bottom: 10px'>";
    a[1].forEach(function (a) {
      b += parent.item_container(
        {
          skin: G.items[a.name].skin,
          onclick: "render_item_info('" + a.name + "')",
        },
        a
      );
    });
    b += "</div></div>";
  });
  b += "<div style='clear:both;'></div></div>";
  parent.show_modal(b, {
    wrap: !1,
    hideinbackground: !0,
    url: "/docs/guide/all/items",
  });
}
