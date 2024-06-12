// Variable to store the time of the last looting action
let lastLoot = null;
let tryLoot = false;

// Number of chests to wait for before looting
const chestThreshold = 15;

// Function to prepare the character for obtaining gold
function prepForGold(callback) {
    // Equip specific items for gold collection
    goldSet();
    let slot = locate_item("luckbooster");
    if (slot !== -1) {
        shift(slot, "goldbooster");
    }
    // Delay the callback to ensure the equipment is fully equipped
    setTimeout(callback, 100); // Delay for 500ms before proceeding
}

// Function to prepare the character for looting
function prepForLoot() {
    // Equip specific items for looting
    homeSet();
    let slot = locate_item("goldbooster");
    if (slot !== -1) {
        shift(slot, "luckbooster");
    }
}

// Function to count the number of available chests
function getNumChests() {
    return Object.keys(get_chests()).length;
}

// Function to delay looting action for a chest
function delayedLoot() {
	lastLoot = new Date(); // Update the last loot time
	prepForGold(() => {
		let looted = 0;
		for (let id in get_chests()) {
			if (looted >= chestThreshold) break;
			parent.open_chest(id);
			game_log("Looting chests with " + character.goldm + " goldm");
			console.log("Looting chests with " + character.goldm + " goldm");
			looted++;
		}
		tryLoot = true;
	});
}

// Function to revert to looting state
function timeoutRevertLootState() {
    tryLoot = false;
    prepForLoot(); // Set up for looting state
}

// Main loop to check and perform looting
setInterval(function () {
    // Checks if enough time has passed since the last loot and there's at least one chest available
    if ((lastLoot == null || new Date() - lastLoot > 500)) {
        if (getNumChests() >= chestThreshold) {
            // Attempt to loot if conditions are met
            delayedLoot();
        }
    }

    // If no chests are available and 'tryLoot' flag is set, revert to looting state
    if (getNumChests() < chestThreshold && tryLoot) {
        timeoutRevertLootState();
    }
}, 100);
