// Initialize variables for various equipment and timing-related values
let bataxe_time = 0;
let offhand = 0;
let equip_mainhand = 0;
let equip_offhand = 0;
let unequip_offhand = 0;
let equipTime = 500;

// Main function for handling the warrior's skill rotation
async function skillLoop() {
    let Mainhand, Offhand, delay;
    // Retrieve the names of the mainhand and offhand equipment, and set a delay for the loop
    Mainhand = character.slots.mainhand?.name;
    Offhand = character.slots.offhand?.name;
    delay = 15;

    // Check if the warrior has enough mana after the cleave skill and checks Code Cost
    let aoe = character.mp >= character.mp_cost * 4 + G.skills.cleave.mp + 320;
    let cc = character.cc < 135;

    try {
        // Execute skill rotation if the character is a warrior and not moving
        if (character.ctype === 'warrior' && !smart.moving) {
            // Check conditions for using the "Cleave" skill
            if (cc && aoe && !is_on_cooldown("cleave")) {
                // Filter monsters within the range for the "Cleave" skill
                const monstersInRange = Object.values(parent.entities)
                    .filter((entity) => {
                        if (entity.mtype === home || //let home = "fireroamer";
                            (entity.visible && !entity.dead)) {
                            const dist = distance(character, entity);
                            return dist <= G.skills.cleave.range;
                        }
                        return false;
                    });

                // Filter monsters that are not already targeted
                const untargetedMonsters = monstersInRange.filter((monster) => !monster.target);
               // Only use "cleave" in these maps cause i was having issues at certain events
                const mapsToInclude = ["desertland", "goobrawl", "main"];

                // Check if there are enough monsters and all are targeted
                if (monstersInRange.length >= 2 && untargetedMonsters.length === 0 && mapsToInclude.includes(character.map)) {
                    // Unequip offhand if equipped and not recently unequipped
                    if (character.slots.offhand && performance.now() - unequip_offhand > 500) {
                        unequip_offhand = performance.now();
                        unequip("offhand");
                    }

                    // Equip "scythe" and use the "Cleave" skill
                    if (Mainhand !== "scythe" && performance.now() - bataxe_time > 500) {
                        bataxe_time = performance.now();
                        equip(locate_item("scythe"));
                        use_skill("cleave");
                    }
                    // Make sure the "Cleave" skill was used
                    use_skill("cleave");
                }
            } else if (character.map !== "winterland") {
                // Equip "vhammer" in Mainhand if not equipped
                if (Mainhand !== "vhammer" && performance.now() - equip_mainhand > 500) {
                    equip_mainhand = performance.now();
                    equipIfNeeded("vhammer", "mainhand", 9, "s"); // My custon equip function to differentiate duplicate items
                }
                // Equip "vhammer" in Offhand if not equipped
                if (Offhand !== "vhammer" && performance.now() - equip_offhand > 500) {
                    equip_offhand = performance.now();
                    equipIfNeeded("vhammer", "offhand", 9, "l"); // My custon equip function to differentiate duplicate items
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    // Set a delay and recursively call the skillLoop function
    setTimeout(skillLoop, delay);
}

// Initial call to start the skill loop
skillLoop();




async function equipIfNeeded(itemName, slotName, level, l) {
    // Initialize the 'name' variable to null
    let name = null;

    // If 'itemName' is an object, extract its properties; otherwise, use 'itemName' directly
    if (typeof itemName === 'object') {
        name = itemName.name;
        level = itemName.level;
        l = itemName.l;
    } else {
        name = itemName;
    }

    // Iterate through the character's items to find a matching item
    for (var i = 0; i < character.items.length; ++i) {
        const item = character.items[i];

        // Check if the item exists
        if (item != null) {
            // Set the 'slot' property of the item to the current iteration index
            item.slot = i;

            // Check if the item matches the specified criteria
            if (item.name === name && item.level === level && item.l === l) {
                // Check if the item is not already equipped in the specified slot
                if (character.slots[slotName]?.name !== itemName) {
                    // Equip the item and wait for the operation to complete
                    await equip(i, slotName);
                }
                // Exit the function as the item has been equipped
                return;
            }
        }
    }
}
