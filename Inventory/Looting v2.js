
// Variable to store the time of the last looting action
var lastLoot = null;

// Function that repeats every 100 milliseconds
setInterval(function () {
    // Checks if enough time has passed since the last loot and there's at least one chest available
    if ((lastLoot == null || new Date() - lastLoot > 500)) {
        if (getNumChests() >= 10) {
            // Attempt to loot if conditions are met
            delayedLoot();
            lastLoot = new Date(); // Update the time of the last loot
        }
    }

    // If no chests are available and 'tryloot' flag is set, revert to looting state
    if (getNumChests() <= 9 && tryloot) {
        timoutRevertLootState();
    }
}, 100);

// Function to prepare the character for obtaining gold
function prepForGold() {
    // Set the character's state to focus on collecting gold
    localStorage.setItem("LootState", "gold");
    var slot = findHighestBoosterSlot();
    // Equip specific items for gold collection
	goldSet();
    shift(slot, "goldbooster"); // Shift booster items as needed
}

// Function to prepare the character for looting
function prepForLoot() {
    // Set the character's state to focus on looting
    localStorage.setItem("LootState", "loot");
    var slot = findHighestBoosterSlot();
    // Equip specific items for looting
	homeSet();
	//maxLuckSet();
    shift(slot, "luckbooster"); // Shift booster items as needed
}

// Function to find the inventory slot with the highest level booster item
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

// Object to store looting information
var looting = {};
var tryloot = false;

// Function to delay looting action for a chest
function delayedLoot() {
    var looted = 0;
    last_loot = new Date(); // Update the last loot time
    for (id in parent.chests) {
        var chest = parent.chests[id];
        if (!tryloot) {
            prepForGold(); // Set up for gold collection if 'tryloot' is not set
        }
        looting[id] = true;
        tryloot = true;
        timeoutLoot(id, new Date()); // Initiate looting action with a timeout
        looted++;
        if (looted >= 10) break;
    }
}

// Function to initiate a looting action after a timeout
function timeoutLoot(id, lootTimeStart) {
    setTimeout(function () {
        var cid = id;
        delete looting[cid]; // Remove the chest from the looting object
        if (parent.chests[cid]) {
            // Perform the looting action (Open the chest)
            parent.open_chest(cid);
        }
    }, 200); // Timeout set to 200 milliseconds
}

// Function to revert to looting state
function timoutRevertLootState() {
    tryloot = false;
    prepForLoot(); // Set up for looting state
}

// Function to count the number of available chests
function getNumChests() {
    var count = 0;
    for (id in parent.chests) {
        count++;
    }
    return count;
}

// Function to find the inventory slot for different booster items
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
