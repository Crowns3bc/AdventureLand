let lastLoot = null;
let tryLoot = false;
const chestThreshold = 12;

// Function to prepare the character for obtaining gold
const prepForGold = (callback) => {
	equipSet("gold");
	const slot = locate_item("luckbooster"); // luckbooster normal
	if (slot !== -1) {
		shift(slot, "goldbooster");
	}
	// Delay the callback to ensure equipment is fully equipped
	setTimeout(callback, 250);
};

// Function to prepare the character for looting
const prepForLoot = () => {
	equipSet("luck");
	const slot = locate_item("goldbooster");
	if (slot !== -1) {
		shift(slot, "luckbooster"); // luckbooster normal
	}
};

// Function to count the number of available chests
const getNumChests = () => Object.keys(get_chests()).length;

// Function to delay looting action for a chest
const delayedLoot = () => {
	lastLoot = Date.now(); // Update the last loot time
	prepForGold(() => {
		let looted = 0;
		for (const id in get_chests()) {
			if (looted >= chestThreshold) break;
			parent.open_chest(id);
			console.log(`Looting chests with ${character.goldm} goldm`);
			looted++;
		}
		tryLoot = true;
	});
};

// Function to revert to looting state
const timeoutRevertLootState = () => {
	tryLoot = false;
	prepForLoot();
};

// Main loop to check and perform looting
setInterval(() => {
	if ((lastLoot ?? 0) + 500 < Date.now()) {
		if (getNumChests() >= chestThreshold && character.fear < 6) {
			delayedLoot();
		}
	}
	if (getNumChests() < chestThreshold && tryLoot) {
		timeoutRevertLootState();
	}
}, 100);
