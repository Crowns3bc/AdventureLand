var lastLoot = null;

// Run the code inside the setInterval function every 100 milliseconds
setInterval(function () {
    // Check if enough time has passed since the last loot
    if (lastLoot == null || new Date() - lastLoot > 100) {
        // Check if there is at least one chest available
        if (getNumChests() >= 1) {
            delayedLoot(); // Call the delayedLoot function
            lastLoot = new Date(); // Update the lastLoot variable with the current time
        }
    }

    // Check if there are no chests and tryloot is true
    if (getNumChests() == 0 && tryloot) {
        timoutRevertLootState(); // Call the timoutRevertLootState function
    }
}, 100);

function prepForGold() {
    localStorage.setItem("LootState", "gold"); // Set the value of "LootState" in localStorage to "gold"
    var slot = findHighestBoosterSlot(); // Get the inventory slot with the highest level booster
    shift(slot, "goldbooster"); // Shift the booster to the "goldbooster" slot
}

function prepForLoot() {
    localStorage.setItem("LootState", "loot"); // Set the value of "LootState" in localStorage to "loot"
    var slot = findHighestBoosterSlot(); // Get the inventory slot with the highest level booster
    shift(slot, "goldbooster"); // Shift the booster to the "goldbooster" slot
}

function findHighestBoosterSlot() {
    var slot = null;
    var maxLevel = null;

    // Iterate over the inventory slots
    for (var i = 0; i <= 41; i++) {
        var curSlot = character.items[i];
        if (curSlot != null && parent.G.items[curSlot.name].type == "booster") {
            // Check if the item in the slot is a booster
            if (maxLevel == null || curSlot.level > maxLevel) {
                // Update the maxLevel and slot variables with the current slot's level and index
                maxLevel = curSlot.level;
                slot = i;
            }
        }
    }

    return slot; // Return the slot with the highest level booster
}

function getNumChests() {
    var count = 0;

    // Iterate over the available chests
    for (id in parent.chests) {
        count++;
    }

    return count; // Return the number of chests
}

var looting = {};
var tryloot = false;

function delayedLoot() {
    var looted = 0;
    last_loot = new Date();

    // Iterate over the chests
    for (id in parent.chests) {
        var chest = parent.chests[id];
        if (!tryloot) {
            prepForGold(); // Call the prepForGold function
        }
        looting[id] = true;
        tryloot = true;
        timeoutLoot(id, new Date()); // Call the timeoutLoot function with the chest's id and current time
        looted++;
        if (looted == 75) break; // Exit the loop if 75 chests have been looted
    }
}

function timeoutLoot(id, lootTimeStart) {
    setTimeout(function () {
        var cid = id;
        delete looting[cid];
        if (parent.chests[cid]) {
            console.log("Merch looting" + cid);
            parent.open_chest(cid); // Open the chest with the given id
        }
        //parent.socket.emit("open_chest",{id:id});
    }, 200);
}

function timoutRevertLootState() {
    tryloot = false;
    prepForLoot(); // Call the prepForLoot function
}

function getNumChests() {
    var count = 0;

    // Iterate over the available chests
    for (id in parent.chests) {
        count++;
    }

    return count; // Return the number of chests
}

function findBoosterSlot() {
    var booster = scanInventoryForItemIndex("xpbooster"); // Check if "xpbooster" is present in the inventory
    if (booster == null) {
        booster = scanInventoryForItemIndex("luckbooster"); // Check if "luckbooster" is present in the inventory
    }
    if (booster == null) {
        booster = scanInventoryForItemIndex("goldbooster"); // Check if "goldbooster" is present in the inventory
    }

    return booster; // Return the slot of the booster
}
