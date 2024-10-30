function elixirUsage() {
	try {
		let elixir = character.slots.elixir?.name;
		let isPriest = character.ctype === "priest";
		let requiredElixir = isPriest ? "elixirluck" : "pumpkinspice";

		// Use the required elixir if it's not currently equipped
		if (elixir !== requiredElixir) {
			let item = locate_item(requiredElixir);
			if (item) {
				use(item);
			}
		}

		// Ensure the priest always has 2 elixirs
		if (isPriest) {
			let currentQuantity = item_quantity("elixirluck");
			if (currentQuantity < 2) {
				buy("elixirluck", 2 - currentQuantity);
			}
		}
	} catch (e) {
		console.error("Error in elixirUsage function:", e);
	}
}

// Run elixirUsage every 5 seconds
setInterval(elixirUsage, 5000);
