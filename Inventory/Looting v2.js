var lastLoot = null;
var chestsToLoot = []; // Array to store chest IDs for looting in batches
var looting = {}; // Object to track which chests are being looted
var currentEquipment = "regular"; // Track the current equipment setup

function lootChests(chests) {
    if (currentEquipment === "regular") {
        prepForGold(); // Switch to gold looting equipment and booster
        currentEquipment = "gold";

        setTimeout(() => {
            // Revert to regular setup after all chests are looted
            prepForLoot(); 
            currentEquipment = "regular";
        }, 40 * chests.length);
    }

    for (let i = 0; i < chests.length; i++) {
        looting[chests[i]] = true; // Mark the chest as being looted
        timeoutLoot(chests[i], new Date());
    }

    chestsToLoot = []; // Clear the array after looting
}

function prepForGold() {
    console.log("Switching to equipment for gold looting...");
    localStorage.setItem("LootState", "gold");
    var slot = findHighestBoosterSlot();
    equipIfNeeded("wcap", "helmet");
    equipIfNeeded("wattire", "chest");
    equipIfNeeded("wbreeches", "pants");
    equipIfNeeded("wshoes", "shoes");
    equipIfNeeded("handofmidas", "gloves");
    shift(slot, "goldbooster");
}

function prepForLoot() {
    console.log("Switching to regular looting equipment...");
    localStorage.setItem("LootState", "loot");
    var slot = findHighestBoosterSlot();
    equipIfNeeded("xhelmet", "helmet");
    equipIfNeeded("tshirt88", "chest");
    equipIfNeeded("starkillers", "pants");
    equipIfNeeded("wingedboots", "shoes");
    equipIfNeeded("xgloves", "gloves");
    shift(slot, "luckbooster");
}

setInterval(lootChestBatches, 100);

function lootChestBatches() {
    if (getNumChests() > 0) {
        if (lastLoot === null || new Date() - lastLoot > 500) {
            if (getNumChests() >= 10) {
                if (chestsToLoot.length === 0) {
                    chestsToLoot = Object.keys(parent.chests).slice(0, 10); // Get the first 10 chest IDs
                    lastLoot = new Date();
                    lootChests(chestsToLoot); // Loot the chests
                }
            }
        }
    }
}

function timeoutLoot(id, lootTimeStart) {
    setTimeout(function () {
        var cid = id;
        delete looting[cid];
        console.log(`Looting chest ID: ${cid}`);
        if (parent.chests[cid]) {
            parent.open_chest(cid);
        }
    }, 200);
}

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

function getNumChests() {
    var count = 0;
    for (id in parent.chests) {
        count++;
    }
    return count;
}
