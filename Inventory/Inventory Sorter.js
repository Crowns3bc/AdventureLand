// Define a mapping of item names to their corresponding slot indices or filter arrays
var moveStuff = {
    tracker: 0,
    computer: 1,
    hpot1: 2,
    mpot1: 3,
    xptome: 4,
    pumpkinspice: 5,
    luckbooster: 6,
};

// Run the item movement logic at regular intervals
setInterval(function () {
    for (var i = 0; i < 42; i++) {
        var item = character.items[i];
        if (item && item.name in moveStuff) {
            let filterOrIndex = moveStuff[item.name];

            // Check if the mapping value is a slot index
            if (typeof filterOrIndex == "number") {
                if (i != moveStuff[item.name]) {
                    // Move the item to the specified slot index if it's not already there
                    parent.socket.emit("imove", {
                        a: i,
                        b: moveStuff[item.name]
                    });
                }
            } else {
                let targetLevel = filterOrIndex[0];

                // Check if the item level matches the target level
                if (item.level == targetLevel) {
                    for (let j = 1; j < filterOrIndex.length; j++) {
                        if (i == filterOrIndex[j]) {
                            break;
                        }

                        // Find an empty slot in the filter array and swap the items
                        if (character.items[filterOrIndex[j]] == null) {
                            let temp = character.items[filterOrIndex[j]];
                            character.items[filterOrIndex[j]] = character.items[i];
                            character.items[i] = temp;

                            // Move the item to the desired slot index
                            parent.socket.emit("imove", {
                                a: i,
                                b: filterOrIndex[j]
                            });
                            break;
                        }
                    }
                }
            }
        }
    }
}, 100);
