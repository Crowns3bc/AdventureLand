const moveStuff = {
    tracker: 0,
    computer: 1,
    hpot1: 2,
    mpot1: 3,
    offering: 4,
    offeringp: 5,
    stand0: 6,
    gemfragment: 20,
    orbofstr: [0, 41],
    orbofdex: [0, 41],
    rod: 28,
};

setInterval(() => {
    character.items.forEach((item, i) => {
        if (!item || !(item.name in moveStuff)) return;

        const target = moveStuff[item.name];
        if (typeof target === "number") {
            if (i !== target) {
                parent.socket.emit("imove", { a: i, b: target });
            }
        } else {
            const [targetLevel, ...slots] = target;
            if (item.level === targetLevel) {
                for (const slot of slots) {
                    if (!character.items[slot]) {
                        [character.items[slot], character.items[i]] = [character.items[i], character.items[slot]];
                        parent.socket.emit("imove", { a: i, b: slot });
                        break;
                    }
                }
            }
        }
    });
}, 500);
