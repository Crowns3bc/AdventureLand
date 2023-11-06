// Variable to store the timestamp of the last loot
var lastLoot = null;

// Interval function that runs every 100 milliseconds
setInterval(function () {
    // Check if enough time has passed since the last loot
    if ((lastLoot == null || new Date() - lastLoot > 200)) {
        // Check if there is at least one chest available
        if (getNumChests() >= 1) {
            // Delayed loot function is called
            delayedLoot();
            // Update the timestamp of the last loot
            lastLoot = new Date();
        }
    }
    // Check if there are no chests left and tryloot flag is true
    if (getNumChests() == 0 && tryloot) {
        // Revert the loot state
        timoutRevertLootState();
    }
}, 100);

// Function to prepare for looting gold
function prepForGold() {
    // Set the loot state in the browser's localStorage to "gold"
    localStorage.setItem("LootState", "gold");
    // Find the slot index of the highest level booster item
    var slot = findHighestBoosterSlot();
    // Shift the booster item to the "goldbooster" slot
    shift(slot, "goldbooster");
}

// Function to prepare for looting other items
function prepForLoot() {
    // Set the loot state in the browser's localStorage to "loot"
    localStorage.setItem("LootState", "loot");
    // Find the slot index of the highest level booster item
    var slot = findHighestBoosterSlot();
    // Shift this booster to Luck/XP unless Crab farming
    shift(slot, "goldbooster");
}

// Function to find the slot index of the highest level booster item
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

// Object to store information about currently looting chests
var looting = {};

// Flag to indicate if looting is attempted
var tryloot = false;

// Function for delayed looting of chests
function delayedLoot() {
    var looted = 0;
    last_loot = new Date();
    for (id in parent.chests) {
        var chest = parent.chests[id];
        // If not already attempting to loot, prepare for gold looting
        if (!tryloot) {
            prepForGold();
        }
        // Mark the chest as currently being looted
        looting[id] = true;
        tryloot = true;
        // Set a timeout for looting the chest
        timeoutLoot(id, new Date());
        looted++;
        // Break the loop if 50 chests have been looted
        if (looted == 50) break;
    }
}

// Timeout function for looting a chest
function timeoutLoot(id, lootTimeStart) {
    setTimeout(function () {
        var cid = id;
        // Remove the chest from the looting object
        delete looting[cid];
        if (parent.chests[cid]) {
            //console.log("Merch looting" + cid); // testing 
            // Open the chest
            parent.open_chest(cid);
        }
        //parent.socket.emit("open_chest",{id:id});
    }, 200);
}

// Function to revert the loot state
function timoutRevertLootState() {
    // Set the tryloot flag to false
    tryloot = false;
    // Prepare for looting other items
    prepForLoot();
}

// Function to get the number of chests available
function getNumChests() {
    var count = 0;
    for (id in parent.chests) {
        count++;
    }
    return count;
}

// Function to find the slot index of a booster item
function findBoosterSlot() {
    var booster = scanInventoryForItemIndex("xpbooster");
    if (booster == null) {
        booster = scanInventoryForItemIndex("luckbooster");
    }
    if (booster == null) {
        booster = scanInventoryForItemIndex("goldbooster");
    }
    return booster;
}
