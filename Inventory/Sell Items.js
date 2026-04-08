sell_whitelist = [ // what you want to sell.
    'vitearring', 'cclaw', 'stramulet', 'dexamulet'
];

function sellItems() {
    character.items.forEach((item, index) => {
        if (item && sell_whitelist.includes(item.name) && !item.p && item.l !== "l") {
            sell(index, item.q || 1); // Sell the entire stack if stackable
        }
    });

    setTimeout(sellItems, 1000);
}

sellItems();
