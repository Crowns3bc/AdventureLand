// Define constants
const goldThreshold = 11 * 1000000;
const minGoldTransfer = 10 * 1000000;
const itemsToExclude = [
	"hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "pumpkinspice",
	"xptome", "orbofdex", "orbofstr", "strbelt", "intbelt", "dexbelt", "cscroll0",
	"cscroll1",
];

// Function to transfer gold
function transferGold(lootMule) {
	if (character.gold > goldThreshold) {
		const goldToSend = Math.floor(character.gold - minGoldTransfer);
		if (distance(character, lootMule) <= 250) {
			send_gold(lootMule, goldToSend);
		} else {
			//console.log("Loot mule out of range for gold transfer.");
		}
	}
}

function sendItems(lootMule) {
	if (!lootMule || distance(character, lootMule) > 250) {
		//console.log("Loot mule out of range for item transfer.");
		return;
	}

	character.items.forEach((item, index) => {
		if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
			send_item(lootMule, index, item.q ?? 1);
		}
	});

	for (let i = 37; i < 41; i++) {
		const item = character.items[i];
		if (item /*&& item.q > 0*/) { //i dont remember why i commented this out
			send_item(lootMule, i, item.q);
		}
	}
}

// Main function to manage loot
function manageLoot() {
	const lootMule = get_entity("CrownMerch");
	if (!lootMule) {
		//console.log("No loot mule found.");
		return;
	}

	transferGold(lootMule);
	sendItems(lootMule);
}

// Run manageLoot every second
setInterval(manageLoot, 1000);
