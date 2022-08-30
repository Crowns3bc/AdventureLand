setInterval(function(){
    sellItems();
  },10000);
  
  sell_whitelist = [ // what you want to sell.
    'vitearring', ''
];
  function sellItems() { 
    for (let i = 0; i < character.items.length; i++) { 
        let c = character.items[i];
        if (c) { 
            if (c && sell_whitelist.includes(c.name)) {
                sell(i); 
        }
      }
    }
  }