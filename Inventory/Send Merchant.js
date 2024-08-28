// Define constants
const LOOT_MULE_NAME = "CrownMerch";
const GOLD_THRESHOLD = 11 * 1000000;
const MIN_GOLD_TRANSFER = 10 * 1000000;
const ITEMS_TO_EXCLUDE = [
    "hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "pumpkinspice",
    "xptome", "cscroll0", "cscroll1"
];

// Function to transfer gold
const transferGold = (lootMule) => {
    if (character.gold > GOLD_THRESHOLD) {
        const goldToSend = Math.floor((character.gold - MIN_GOLD_TRANSFER) / 1000000) * 1000000;
        send_gold(lootMule.id, goldToSend);
    }
};

// Function to send items to the loot mule
const sendItemsToLootMule = (lootMule) => {
    character.items.forEach((item, index) => {
        if (item && !ITEMS_TO_EXCLUDE.includes(item.name) && !item.l && !item.s) {
            send_item(lootMule.id, index, item.q ?? 1);
        }
    });
};

// Main function to manage loot
const manageLoot = () => {
    const lootMule = get_player(LOOT_MULE_NAME);

    if (!lootMule) {
        //game_log("Nobody to transfer to");
        loot_transfer = false;
        return;
    }

    transferGold(lootMule);
    sendItemsToLootMule(lootMule);
};

// Run manageLoot every second
setInterval(manageLoot, 1000);
