// This variable stores the timestamp of the last looted chest
var lastLoot = null;

// Track the current equipment setup (either "regular" or "gold")
var currentEquipment = "regular";

// This function is responsible for looting chests in batches
function lootChests(chests) {
    // If the current equipment is "regular", switch to gold looting equipment and booster
    if (currentEquipment === "regular") {
        prepForGold(); // Switch to gold looting equipment and booster
        currentEquipment = "gold";

        // Revert to regular setup after all chests are looted
        setTimeout(() => {
            prepForLoot();
            currentEquipment = "regular";
        }, 25 * chests.length); // Timeout based on the number of chests
    }

    // Mark chests as being looted and initiate the looting process
    for (let i = 0; i < chests.length; i++) {
        timeoutLoot(chests[i]);
    }
}

// Prepares the character for using gold looting equipment
function prepForGold() {
    console.log("Switching to equipment for gold looting...");
    // Set local storage state for gold looting
    localStorage.setItem("LootState", "gold");
    var slot = findHighestBoosterSlot();
    // Equip various items for gold looting
    equipIfNeeded("wcap", "helmet");
    equipIfNeeded("wattire", "chest");
    equipIfNeeded("wbreeches", "pants");
    equipIfNeeded("wshoes", "shoes");
    equipIfNeeded("handofmidas", "gloves");
    shift(slot, "goldbooster");
}

// Prepares the character for using regular looting equipment
function prepForLoot() {
    console.log("Switching to regular looting equipment...");
    // Set local storage state for regular looting
    localStorage.setItem("LootState", "loot");
    var slot = findHighestBoosterSlot();
    // Equip various items for regular looting
    equipIfNeeded("xhelmet", "helmet");
    equipIfNeeded("tshirt88", "chest");
    equipIfNeeded("starkillers", "pants");
    equipIfNeeded("wingedboots", "shoes");
    equipIfNeeded("xgloves", "gloves");
    shift(slot, "luckbooster");
}

// Initiate looting chest batches at a regular interval
setInterval(lootChestBatches, 200);

// Loops through chests to loot them in batches
function lootChestBatches() {
    if (getNumChests() > 0) {
        // Check conditions for looting chests
        if (lastLoot === null || new Date() - lastLoot > 500) {
            if (getNumChests() >= 15) {
                var chestsToLoot = Object.keys(parent.chests).slice(0, 15); // Get the first 10 chest IDs
                lastLoot = new Date();
                lootChests(chestsToLoot); // Loot the chests
            }
        }
    }
}

// Initiates the looting process for individual chests with a timeout
function timeoutLoot(id) {
    setTimeout(function () {
        console.log(`Looting chest ID: ${id}`);
        if (parent.chests[id]) {
            parent.open_chest(id);
        }
    }, 200); // Timeout for looting a single chest
}

// Finds the slot with the highest level booster item
function findHighestBoosterSlot() {
    var slot = null;
    var maxLevel = null;
    for (var i = 0; i <= 41; i++) {
        var curSlot = character.items[i];
        if (curSlot != null && parent.G.items[curSlot.name].type == "booster") {
            if (maxLevel == null || curSlot.level > maxLevel) {
                maxLevel = curSlot.level;
                slot = i;
            }
        }
    }
    return slot;
}

// Counts the number of available chests
function getNumChests() {
    var count = 0;
    for (id in parent.chests) {
        count++;
    }
    return count;
}
