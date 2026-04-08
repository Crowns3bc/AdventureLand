const craftList = ["fireblade"];

async function tryCraft() {
  for (const craftName of craftList) {
    //console.log(`Checking recipe for: ${craftName}`);

    const craftDef = parent.G.craft[craftName];
    if (!craftDef) {
      //console.log(`No recipe found for: ${craftName}`);
      continue;
    }

    let missing = 0;
    const buyableMissing = [];

    craftDef.items.forEach(([itemQuantity, itemName]) => {
      const itemIndex = locate_item(itemName);
      console.log(`Checking ${itemName}: ${itemIndex}`);
      if (itemIndex === -1) {
        missing++;
        if (parent.G.npcs["basics"].items.includes(itemName)) {
          buyableMissing.push({ name: itemName, quantity: itemQuantity });
        }
      }
    });

    //console.log(`Missing items: ${missing}`);
    //console.log(`Buyable missing items: ${buyableMissing.map(item => item.name).join(', ')}`);

    if (missing === 0) {
      //console.log(`Crafting ${craftName}...`);
      try {
        await auto_craft(craftName);  // Wait until crafting is done
        //console.log(`${craftName} crafted.`);
      } catch (error) {
        console.error(`Error crafting ${craftName}: ${error.message || JSON.stringify(error)}`);
      }
    } else if (buyableMissing.length === missing) {
      //console.log(`Buying missing items: ${buyableMissing.map(item => item.name).join(', ')}`);
      try {
        // Batch buy items
        for (const { name, quantity } of buyableMissing) {
          await buy(name, quantity);  // Ensure each buy operation completes before continuing
          //console.log(`Bought ${quantity} of ${name}.`);
        }
      } catch (error) {
        console.error(`Error buying items: ${error.message || JSON.stringify(error)}`);
      }
    } else {
      console.log(`Unable to craft ${craftName} due to missing items.`);
    }
  }
}
