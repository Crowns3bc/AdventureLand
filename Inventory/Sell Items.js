sell_whitelist = [
	'vitearring', 'iceskates', 'cclaw', 'hpbelt', 'ringsj', 'hpamulet', 'warmscarf',
	'quiver', 'snowball', 'vitring', 'wcap', 'wattire', 'wbreeches', 'wshoes',
	'wgloves', "strring", "dexring", "intring",
];
function sellItems() {
	for (let i = 0; i < character.items.length; i++) {
		let c = character.items[i];
		if (c) {
			if (c && sell_whitelist.includes(c.name)) {
				if (c.p == undefined) {
					if (c.l != "l") {
						sell(i);
					}
				}
			}
		}
	}
}
setInterval(sellItems, 5000);
