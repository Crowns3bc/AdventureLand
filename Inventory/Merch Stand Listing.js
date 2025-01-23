const items = [
    { name: "intbelt", level: 4, price: 315_000_000, slots: ["trade7", "trade8", "trade9", "trade10"] },
    { name: "dexbelt", level: 4, price: 315_000_000, slots: ["trade13", "trade14", "trade15", "trade16"] },

    { name: "zapper", level: 0, price: 4_000_000_000, slots: [] },
    { name: "trigger", level: 0, price: 52_000_000_000, slots: [] },
    { name: "mpxamulet", level: 0, price: 6_000_000_000, slots: [] },
    { name: "mpxgloves", level: 0, price: 15_000_000_000, slots: [] },
    { name: "warpvest", level: 0, price: 25_000_000_000, slots: [] },
    { name: "starkillers", level: 0, price: 1_000_000_000, slots: [] },
    { name: "sbelt", level: 0, price: 1_000_000_000, slots: [] },

    { name: "fury", level: 0, price: 100_000_000_000, slots: [] },
    { name: "mshield", level: 7, price: 100_000_000_000, slots: [] },
    { name: "supermittens", level: 5, price: 100_000_000_000, slots: [] },
    //{ name: "mearring", level: 0, price: 100_000_000_000, slots: [] },
    { name: "angelwings", level: 0, price: 8_144_000, slots: ["trade16", "trade17", "trade18", "trade22", "trade23", "trade24"] },
    // Add more items here if needed
];

setInterval(() => {
    if (!character.stand) return; // Merchant stand not open

    for (const { slots, ...item } of items) {
        let targetSlot = null;

        // If slots are specified, find the first available trade slot among them
        if (slots && slots.length > 0) {
            for (const slotName of slots) {
                if (slotName.startsWith("trade")) {
                    const slotData = character.slots[slotName];
                    if (!slotData || slotData.q === 0) {
                        targetSlot = slotName;
                        break;
                    }
                }
            }
        } else {
            // If no specific slots are specified, find the first available trade slot
            for (const slotName in character.slots) {
                if (slotName.startsWith("trade")) {
                    const slotData = character.slots[slotName];
                    if (!slotData || slotData.q === 0) {
                        targetSlot = slotName;
                        break;
                    }
                }
            }
        }

        if (targetSlot) {
            const itemIndex = character.items.findIndex(
                (i) =>
                    i && i.name === item.name && (item.level === undefined || i.level === item.level) && (item.q === undefined || i.q >= item.q)
            );

            if (itemIndex !== -1) {
                const quantity = item.q !== undefined ? character.items[itemIndex].q : 1;
                trade(itemIndex, targetSlot, item.price, quantity);
                return; // We did our best to find and list an item.
            }
        }
    }
}, 500);
