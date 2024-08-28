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
      if (itemIndex === -1) {
        missing++;
        if (parent.G.npcs["basics"].items.includes(itemName)) {
          buyableMissing.push(itemName);
        }
      }
    });

    if (missing === 0) {
      //console.log(`Crafting ${craftName}...`);
      try {
        await auto_craft(craftName);  // Wait until crafting is done
        //console.log(`${craftName} crafted.`);
      } catch (error) {
        console.error(`Error crafting ${craftName}: ${error}`);
      }
    } else if (buyableMissing.length === missing) {
      for (const buyName of buyableMissing) {
        //console.log(`Buying missing item: ${buyName}`);
        try {
          await buy(buyName);
        } catch (error) {
          console.error(`Error buying ${buyName}: ${error}`);
        }
      }
    } else {
      //console.log(`Unable to craft ${craftName} due to missing items.`);
    }
  }
}
