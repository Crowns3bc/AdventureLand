const items = [
{ name: "orbofdex", level: 2, price: 60_000_000, slots: ["trade13", "trade14", "trade15", "trade16", "trade17"] },
{ name: "orbofdex", level: 3, price: 360_000_000, slots:["trade7", "trade8", "trade9"] },
{ name: "orbofdex", level: 4, price: 2_500_000_000, slots:["trade10", "trade11"] },
{ name: "orbofstr", level: 2, price: 60_000_000, slots: ["trade19", "trade20", "trade21", "trade22", "trade23"] },
{ name: "orbofstr", level: 3, price: 360_000_000, slots: ["trade25", "trade26", "trade27"] },
{ name: "orbofstr", level: 4, price: 2_000_000_000, slots: ["trade28", "trade29"] },
{ name: "essenceoffire", q: 9999, price: 108_490, slots: ["trade6", "trade12", "trade18", "trade24", "trade30"] },
  // Add more items here if needed
];

setInterval(() => {
  if (!character.stand) return; // Merchant stand not open

  for (const { slots, ...item } of items) {
    for (const slotName of slots) {
      const slotData = character.slots[slotName];

      if (!slotData || slotData.q === 0) {
        const itemIndex = character.items.findIndex(
          (i) =>
            i && i.name === item.name && (item.level === undefined || i.level === item.level) && (item.q === undefined || i.q >= item.q)
        );

        if (itemIndex !== -1) {
          const quantity = item.q !== undefined ? character.items[itemIndex].q : 1;
          trade(itemIndex, slotName, item.price, quantity);
          return; // We did our best to find and list an item.
        }
      }
    }
  }
}, 500);
