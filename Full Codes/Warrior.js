const locations = {
    bat: [{ x: 1200, y: -782 }],
    bigbird: [{ x: 1343, y: 248 }],
    bscorpion: [{ x: -408, y: -1241 }],
    boar: [{ x: 19, y: -1109 }],
    cgoo: [{ x: -221, y: -274 }],
    crab: [{ x: -11840, y: -37 }],
    ent: [{ x: -420, y: -1960 }],
    fireroamer: [{ x: 222, y: -827 }],
    ghost: [{ x: -405, y: -1642 }],
    gscorpion: [{ x: 390, y: -1422 }],
    iceroamer: [{ x: 823, y: -45 }],
    mechagnome: [{ x: 0, y: 0 }],
    mole: [{ x: 14, y: -1072 }],
    mummy: [{ x: 256, y: -1417 }],
    oneeye: [{ x: -255, y: 176 }],
    pinkgoblin: [{ x: 366, y: 377 }],
    poisio: [{ x: -121, y: 1360 }],
    prat: [{ x: -280, y: 552 }], //[{ x: 6, y: 430 }]
    pppompom: [{ x: 292, y: -189 }],
    plantoid: [{ x: -780, y: -387 }], // [{ x: -840, y: -340 }]
    rat: [{ x: 6, y: 430 }],
    scorpion: [{ x: -495, y: 685 }],
    stoneworm: [{ x: 830, y: 7 }],
    spider: [{ x: 1247, y: -91 }],
    squig: [{ x: -1175, y: 422 }],
    wolf: [{ x: 433, y: -2745 }],
    wolfie: [{ x: 113, y: -2014 }],
    xscorpion: [{ x: -495, y: 685 }]
};

const home = 'oneeye';
const mobMap = 'level2w';
const destination = {
    map: mobMap,
    x: locations[home][0].x,
    y: locations[home][0].y
};
let angle = 0;
const speed = 2; // normal 2 or .65
let events = false;

const harpyRespawnTime = 410000; //400 seconds
let harpyActive = false;
const skeletorRespawnTime = 1151954; // Example time, adjust as needed
let skeletorActive = false;
const stompyRespawnTime = 400000; //400 seconds
let stompyActive = false;
const mvampireRespawnTime = 1151954; // Example time, adjust as needed
let mvampireActive = false;
const fvampireRespawnTime = 1151954; // Example time, adjust as needed
let fvampireActive = false;

const boundaryOur = Object.values(G.maps[mobMap].monsters).find(e => e.type === home).boundary;
const [topLeftX, topLeftY, bottomRightX, bottomRightY] = boundaryOur;
const centerX = (topLeftX + bottomRightX) / 2;
const centerY = (topLeftY + bottomRightY) / 2;

async function eventer() {
    const delay = 100;
    try {
        if (events) {
            handleEvents();
        } else if (stompyActive || skeletorActive) {
            //handleBosses();
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
        } else {
            //walkInCircle();
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(eventer, delay);
}

async function checkRespawnTimers() {
    let delay = 1000;
    try {
        /*
        if (Date.now() - harpyDeath >= harpyRespawnTime) {
            harpyActive = true;
            game_log("Harpy Respawned");
        }*/
        if (Date.now() - skeletorDeath >= skeletorRespawnTime) {
            skeletorActive = true;
            game_log("Skeletor Respawned");
        }
        if (Date.now() - stompyDeath >= stompyRespawnTime) {
            stompyActive = true;
            game_log("Stompy Respawned");
        }
        // Repeat for other bosses as needed
    } catch (e) {
        console.error(e);
    }
    setTimeout(checkRespawnTimers, delay);
}
//checkRespawnTimers();

function handleEvents() {
    if (parent?.S?.holidayseason && !character?.s?.holidayspirit) {
        if (!smart.moving) {
            smart_move({ to: "town" }, () => {
                parent.socket.emit("interaction", { type: "newyear_tree" });
            });
        }
    } else {
        // Handle standard events
        //handleSpecificEvent('dragold', 'cave', 1190, -810, 500000, 900);
        //handleSpecificEvent('snowman', 'winterland', 1190, -900, 50);
        //handleSpecificEventWithJoin('goobrawl', 'goobrawl', 42, -169, 50000);
        //handleSpecificEventWithJoin('crabxx', 'main', -976, 1785, 100000);
        //handleSpecificEventWithJoin('franky', 'level2w', 23, 38, 1000000);
        //handleSpecificEventWithJoin('icegolem', 'winterland', 820, 420, 50000);
    }
}

function handleBosses() {
    /*if (harpyActive) {
        handleHarpyEvent();
    }*/
    if (skeletorActive) {
        handleSkeletorEvent();
    }
    if (stompyActive) {
        handleStompyEvent();
    }
}

function handleSpecificEvent(eventType, mapName, x, y, hpThreshold, skillMs = 0) {
    if (parent?.S?.[eventType]?.live) {
        if (character.map !== mapName && !smart.moving) {
            smart_move({ x, y, map: mapName });
        }

        const monster = get_nearest_monster({ type: eventType });
        if (monster) {
            if (monster.hp > hpThreshold && (skillMs === 0 || monster.s.multi_burn.ms > skillMs)) {
                if (character.cc < 100) {
                    dpsSet();
                }
            } else if (character.cc < 100) {
                luckSet();
            }
        }
    }
}

function handleSpecificEventWithJoin(eventType, mapName, x, y, hpThreshold) {
    if (parent?.S?.[eventType]) {
        if (character.map !== mapName) {
            parent.socket.emit('join', { name: eventType });
        } else if (!smart.moving) {
            smart_move({ x, y, map: mapName });
        }

        const monster = get_nearest_monster({ type: eventType });
        if (monster) {
            if (monster.hp > hpThreshold) {
                if (character.cc < 100) {
                    dpsSet();
                }
            } else if (character.cc < 100) {
                luckSet();
            }
        }
    }
}

function handleHome() {
    if (character.cc < 100) {
        //homeSet();
        //scorpSet();
        //game_log("set 5");
    }
    if (!smart.moving) {
        smart_move(destination);
        game_log(`Moving to ${home}`);
    }
}

let lastUpdateTime = performance.now();
function walkInCircle() {
    if (!smart.moving) {
        const center = locations[home][0];
        const radius = 35;

        // Calculate time elapsed since the last update
        const currentTime = performance.now();
        const deltaTime = currentTime - lastUpdateTime;
        lastUpdateTime = currentTime;

        // Calculate the new angle based on elapsed time and speed
        const deltaAngle = speed * (deltaTime / 1000); // Convert milliseconds to seconds
        angle = (angle + deltaAngle) % (2 * Math.PI);

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        const targetX = center.x + offsetX;
        const targetY = center.y + offsetY;

        if (!character.moving) {
            xmove(targetX, targetY);
        }

        drawCirclesAndLines(center, radius);
    }
}

function drawCirclesAndLines(center, radius) {
    clear_drawings();
    draw_circle(center.x, center.y, radius, 3, 0xFF00FB); // warr path
    draw_circle(center.x, center.y, 45, 3, 0xE8FF00); // ranger path
    draw_circle(center.x, center.y, 25, 3, 0xFFFFFF); // priest path
    draw_circle(center.x, center.y, 1, 3, 0x00FF00); // center point
    draw_circle(center.x, center.y, 40, 3, 0x00FF00); // kill zone

    draw_line(topLeftX, topLeftY, bottomRightX, topLeftY, 2, 0xFF0000);
    draw_line(bottomRightX, topLeftY, bottomRightX, bottomRightY, 2, 0xFF0000);
    draw_line(bottomRightX, bottomRightY, topLeftX, bottomRightY, 2, 0xFF0000);
    draw_line(topLeftX, bottomRightY, topLeftX, topLeftY, 2, 0xFF0000);
    draw_circle(centerX, centerY, 1, 2, 0x00FF00);
    draw_circle(character.x, character.y, G.skills.agitate.range, 3)
    //draw_circle(character.x,character.y,G.skills.cleave.range,3,"yellow")
}

function handleHarpyEvent() {
    const harpyRespawnTime = 400000; // 400,000 ms = 400 seconds (example time, adjust as needed)

    if (Date.now() - harpyDeath >= harpyRespawnTime) {
        if (!smart.moving) {
            if (character.x != 140 && character.y != -300) {
                smart_move({ x: 140, y: -300, map: "winter_cove" });
                game_log("Moving to Rharpy location");
            }
            if (character.cc < 100) {
                dpsSet();
            }
        }

        const harpy = get_nearest_monster({ type: "rharpy" });
        if (!harpy && distance(character, { x: 135, y: -311 }) <= 300 && character.map === 'winter_cove') {
            harpyDeath = Date.now();
            game_log("Rharpy is not here, resetting death time");
            localStorage.setItem('harpyDeath', harpyDeath);
        } else if (harpy && harpy.hp < 50000) {
            if (character.cc < 100) {
                luckSet();
            }
        }
    }
}

function handleSkeletorEvent() {
    const skeletorRespawnTime = 1151954; // Example time, adjust as needed

    if (Date.now() - skeletorDeath >= skeletorRespawnTime) {
        if (!smart.moving) {
            if (character.x != 260 && character.y != -571) {
                smart_move({ x: 260, y: -571, map: "arena" });
                game_log("Moving to Skeletor location");
            }
            if (character.cc < 100) {
                dpsSet();
            }
        }

        const skeletor = get_nearest_monster({ type: "skeletor" });
        if (!skeletor && distance(character, { x: 260, y: -571 }) <= 300 && character.map === 'arena') {
            skeletorDeath = Date.now();
            game_log("Skeletor is not here, resetting death time");
            localStorage.setItem('skeletorDeath', skeletorDeath);
        } else if (skeletor && skeletor.hp < 50000) {
            if (character.cc < 100) {
                luckSet();
            }
        }
    }
}

function handleStompyEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 443 || character.y !== -2745 || character.map !== "winterland") {
            smart_move({ x: 443, y: -2745, map: "winterland" });
            game_log("Moving to Stompy location");
        }
    }

    const stompy = get_nearest_monster({ type: "stompy" });

    // If the harpy isn't nearby, mark it as dead and reset the death timer
    if (!stompy && distance(character, { x: 443, y: -2745 }) <= 300 && character.map === 'winterland') {
        stompyDeath = Date.now();
        stompyActive = false;
        game_log("Stompy is not here, resetting death time");
        localStorage.setItem('stompyDeath', stompyDeath);
    } else if (stompy) {
        // Manage gear based on harpy's health
        if (stompy.hp < 50000 && character.cc < 100) {
            //maxLuckSet();
        } else if (harpy.hp > 50000 && character.cc < 100) {
            homeSet();
        }
    }
}

eventer();

let harpyDeath = parseInt(localStorage.getItem('harpyDeath')) || 0;
let skeletorDeath = parseInt(localStorage.getItem('skeletorDeath')) || 0;
let stompyDeath = parseInt(localStorage.getItem('stompyDeath')) || 0;

game.on('death', data => {
    if (parent.entities[data.id]) {
        const mob = parent.entities[data.id];
        const mobType = mob.mtype;
        if (mobType === 'rharpy') {
            harpyDeath = Date.now();
            localStorage.setItem('harpyDeath', harpyDeath);
            harpyActive = false; // Reset the active flag on death
            console.log(`The mob "${mobType}" has died.`);
        }
        if (mobType === 'skeletor') {
            skeletorDeath = Date.now();
            localStorage.setItem('skeletorDeath', skeletorDeath);
            skeletorActive = false; // Reset the active flag on death
            console.log(`The mob "${mobType}" has died.`);
        }
        if (mobType === 'stompy') {
            skeletorDeath = Date.now();
            localStorage.setItem('stompyDeath', stompyDeath);
            stompyActive = false; // Reset the active flag on death
            console.log(`The mob "${mobType}" has died.`);
        }
    }
});

function dpsSet() {
    equipBatch([
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 12, l: "s" },
        { itemName: "pants", slot: "pants", level: 13, l: "l" },
        { itemName: "snring", slot: "amulet", level: 2, l: "l" },
        { itemName: "vcape", slot: "cape", level: 4, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "s" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "l" },
        { itemName: "fireblade", slot: "mainhand", level: 13, l: "s" },
        { itemName: "vhammer", slot: "offhand", level: 9, l: "l" }
    ]);
}

function scorpSet() {
    equipBatch([
        { itemName: "molesteeth", slot: "earring1", level: 3, l: "l" },
        { itemName: "cearring", slot: "earring2", level: 5, l: "l" },
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 12, l: "s" },
        { itemName: "pants", slot: "pants", level: 13, l: "l" },
        { itemName: "snring", slot: "amulet", level: 2, l: "l" },
        { itemName: "vcape", slot: "cape", level: 4, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "s" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "l" },
        { itemName: "fireblade", slot: "mainhand", level: 13, l: "s" },
        { itemName: "vhammer", slot: "offhand", level: 9, l: "s" }
    ]);
}

function snowSet() {
    unequip("offhand");
    equipBatch([
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 12, l: "s" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "s" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "l" },
        { itemName: "rapier", slot: "mainhand", level: 0, l: "l" }
    ]);
}

function homeSet() {
    equipBatch([
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        { itemName: "tshirt9", slot: "chest", level: 6, l: "l" },
        { itemName: "pants", slot: "pants", level: 13, l: "l" },
        { itemName: "vcape", slot: "cape", level: 4, l: "l" },
        { itemName: "snring", slot: "amulet", level: 2, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "l" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "s" }
    ]);
}

function luckSet() {
    equipBatch([
        { itemName: "rabbitsfoot", slot: "orb", level: 2, l: "l" },
        { itemName: "ringofluck", slot: "ring1", level: 1, l: "s" },
        { itemName: "ringofluck", slot: "ring2", level: 0, l: "l" },
        { itemName: "tshirt88", slot: "chest", level: 0, l: "l" }
    ]);
}

function arenaSet() {
    unequip("offhand");
    equipBatch([
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 12, l: "s" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "s" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "l" },
        { itemName: "scythe", slot: "mainhand", level: 7, l: "l" }
    ]);
}

function mageSet() {
    equipBatch([
        { itemName: "jacko", slot: "orb", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 10, l: "l" },
        { itemName: "pants", slot: "pants", level: 10, l: "l" },
        { itemName: "ecape", slot: "cape", level: 8, l: "l" },
        { itemName: "intamulet", slot: "amulet", level: 5, l: "l" },
        { itemName: "zapper", slot: "ring1", level: 1, l: "l" },
        { itemName: "zapper", slot: "ring2", level: 2, l: "l" }
    ]);
}

function stSet() {
    equipBatch([
        { itemName: "fireblade", slot: "mainhand", level: 13, l: "s" },
        { itemName: "vhammer", slot: "offhand", level: 9, l: "s" },
    ]);
}

function aoeSet() {
    equipBatch([
        { itemName: "vhammer", slot: "mainhand", level: 9, l: "s" },
        { itemName: "ololipop", slot: "offhand", level: 10, l: "l" },
    ]);
}

function scytheSet() {
    unequip("offhand");
    equipBatch([
        { itemName: "scythe", slot: "mainhand", level: 8, l: "l" },
    ]);
}

function basherSet() {
    unequip("offhand");
    equipBatch([
        { itemName: "basher", slot: "mainhand", level: 8, l: "l" }
    ]);
}

function manaSet() {
    equipBatch([
        { itemName: "tshirt9", slot: "chest", level: 6, l: "l" }
    ]);
}

function statSet() {
    equipBatch([
        { itemName: "coat", slot: "chest", level: 12, l: "s" }
    ]);
}

function fireSet() {
    equipBatch([
        { itemName: "fireblade", slot: "mainhand", level: 13, l: "s" },
        { itemName: "vhammer", slot: "offhand", level: 9, l: "s" },
    ]);
}

function srSet() {
    equipBatch([
        { itemName: "candycanesword", slot: "mainhand", level: 0, l: "s" },
        { itemName: "candycanesword", slot: "offhand", level: 0, l: "l" },
    ]);
}

function goldSet() {
    equipBatch([
        { itemName: "wcap", slot: "helmet", level: 9, l: "l" },
        { itemName: "wattire", slot: "chest", level: 9, l: "l" },
        { itemName: "wbreeches", slot: "pants", level: 6, l: "l" },
        { itemName: "wshoes", slot: "shoes", level: 10, l: "l" },
        { itemName: "handofmidas", slot: "gloves", level: 8, l: "l" },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        //{ itemName: "wbookhs", slot: "offhand", level: 4, l: "l" },
        // { itemName: "spookyamulet", slot: "amulet", l: "l" }
    ]);
}

function palSet() {
    equipBatch([
        { itemName: "fury", slot: "helmet", level: 5, l: "l" },
        { itemName: "coat", slot: "chest", level: 12, l: "s" },
        { itemName: "pants", slot: "pants", level: 10, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        //{ itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        //{ itemName: "wbookhs", slot: "offhand", level: 4, l: "l" },
        // { itemName: "spookyamulet", slot: "amulet", l: "l" }
    ]);
}

function xpSet() {
    equipBatch([
        { itemName: "talkingskull", slot: "orb", level: 3, l: "l" },
        //{ itemName: "tshirt3", slot: "chest", level: 7, l: "l" },
    ]);
}

function stealthSet() {
    equipBatch([
        { itemName: "stealthcape", slot: "cape", level: 0, l: "l" },
    ]);
}

function capeSet() {
    equipBatch([
        { itemName: "vcape", slot: "cape", level: 4, l: "l" },
    ]);
}

function orbSet() {
    equipBatch([
        { itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
        //{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" },
    ]);
}

async function moveLoop() {
    let delay = 50;
    let earth = get_entity("earthWar");
    try {
        let tar = null;
        //let tar = get_nearest_monster({target:"CrownPriest"});
        //let tar = getNearestMonster({target: ["CrownPriest"], cursed: true});
        //if (!tar) tar = getNearestMonster({target: ["CrownPriest", "earthWar", "earthPri", "Atlus", "Mommy", "CrownMerch", "FatherRob"]});
        if (!tar) {
            for (let i = 0; i < targetNames.length; i++) {
                tar = get_nearest_monster_v2({
                    target: targetNames[i],
                    max_distance: character.range + 70,
                    check_max_hp: true,
                });
                if (tar) break;
            }
        }
        const eventMaps = ["goobrawl", "level2e", "halloween", "winterland", "arena", "cave", "winter_cove", "desertland"];
        if (eventMaps.includes(character.map)) {
            if (tar) {
                if (can_move_to(tar.real_x, tar.real_y)) {
                    smart.moving = false;
                    smart.searching = false;
                    await move(
                        character.real_x + (tar.real_x - character.real_x) / 2,
                        character.real_y + (tar.real_y - character.real_y) / 2
                    );
                } else {
                    if (!smart.moving) {
                        smart_move({
                            x: tar.real_x,
                            y: tar.real_y
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(moveLoop, delay)
}
//moveLoop();
//////////////////////////////////////////////////////////////////////////
const targetNames = ["Miau", "BamBam", "Atlus", "DoubleG", "SingleG", "OlDrippy"];

async function attackLoop() {
    let delay = 10;  // Default delay to 1 second
    const X = locations[home][0].x; // X coordinate of home location
    const Y = locations[home][0].y; // Y coordinate of home location
    try {
        let nearest = null;

        // Find the nearest monster based on the targetNames
        for (let i = 0; i < targetNames.length; i++) {
            nearest = get_nearest_monster_v2({
                target: targetNames[i],
                check_max_hp: true, // Prioritize highest HP
                point_for_distance_check: [X, Y],
                max_distance: 50, // Only consider monsters within 50 units
            });
            if (nearest) break;
        }
        if (!nearest) {
            for (let i = 0; i < targetNames.length; i++) {
                nearest = get_nearest_monster_v2({
                    target: targetNames[i],
                    max_distance: character.range,
                    check_max_hp: true,
                });
                if (nearest) break;
            }
        }

        // If a monster is found and is in range, execute the attack
        if (nearest && is_in_range(nearest)) {
            await attack(nearest);  // Perform the attack
            delay = ms_to_next_skill('attack');  // Get delay until next attack
        }
    } catch (e) {
        //console.error(e);
    }
    setTimeout(attackLoop, delay);
}

attackLoop();
////////////////////////////////////////////////////////////////
let scythe = 0;
let eTime = 0;
let basher = 0;
async function skillLoop() {
    let delay = 40;
    try {
        let zap = false;
        const dead = character.rip;
        const Mainhand = character.slots?.mainhand?.name;
        const aoe = character.mp >= character.mp_cost * 2 + G.skills.cleave.mp + 320;
        const cc = character.cc < 135;
        const zapperMobs = ["plantoid"];
        const stMaps = ["", "winter_cove", "arena", "",];
        const aoeMaps = ["halloween", "goobrawl", "spookytown", "tunnel", "main", "winterland", "cave", "level2n", "level2w", "desertland"];
        let tank = get_entity("Miau");

        if (character.ctype === "warrior") {
            try {
                if (tank && tank.hp < tank.max_hp * 0.4) {
                    //console.log("Calling handleStomp");
                    handleStomp(Mainhand, stMaps, aoeMaps, tank);
                }
                if (character.name === "CrownTown") {
                    //console.log("Calling handleCleave");
                    handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps, tank);
                    //console.log("Calling handleWarriorSkills");
                    handleWarriorSkills(tank);
                }
            } catch (e) {
                //console.error("Error in warrior section:", e);
            }
        }

        if (character.ctype === 'paladin') {
            try {
                //console.log("Calling handlePaladinSkills");
                //handlePaladinSkills();
            } catch (e) {
                console.error("Error in paladin section:", e);
            }
        }

        if (character.ctype === "mage") {
            try {
                //console.log("Calling handleMageSkills");
                //handleMageSkills();
            } catch (e) {
                console.error("Error in mage section:", e);
            }
        }
    } catch (e) {
        //console.error("Error in skillLoop:", e);
    }
    setTimeout(skillLoop, delay);
}
skillLoop()

async function handleStomp(Mainhand, stMaps, aoeMaps, tank) {
    if (!is_on_cooldown("stomp")) {
        if (Mainhand !== "basher" && performance.now() - basher > 5000) {
            basher = performance.now();
            basherSet();
        }
        use_skill("stomp");
        game_log("Using STOMP", "#B900FF");
    } else {
        handleWeaponSwap(stMaps, aoeMaps);
    }
}

function handleWeaponSwap(stMaps, aoeMaps) {
    const currentTime = performance.now();
    if (stMaps.includes(character.map) && currentTime - eTime > 5) {
        eTime = currentTime;
        stSet();
    } else if (aoeMaps.includes(character.map) && currentTime - eTime > 5) {
        eTime = currentTime;
        aoeSet();
    }
}

let lastCleaveTime = 0;
const CLEAVE_THRESHOLD = 1000; // Time in milliseconds between cleave uses

function handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps, tank) {
    const currentTime = performance.now();
    const timeSinceLastCleave = currentTime - lastCleaveTime;

    if (!smart.moving && cc && aoe && timeSinceLastCleave >= CLEAVE_THRESHOLD && !is_on_cooldown("cleave")) {
        const monstersInRange = Object.values(parent.entities)
            .filter(entity => entity.type === "monster" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.cleave.range);
        const untargetedMonsters = monstersInRange.filter(monster => !monster.target);
        const mapsToInclude = ["desertland", "goobrawl", "main", "level2w", "cave", "halloween", "spookytown", "tunnel", "winterland", "level2n"];

        if (monstersInRange.length >= 1 && untargetedMonsters.length === 0 && mapsToInclude.includes(character.map) && tank) {
            if (Mainhand !== "scythe") {
                scytheSet(); // Equip the scythe
            }
            use_skill("cleave"); // Use the cleave skill
            lastCleaveTime = currentTime; // Update the last cleave time
        }
    }
    // Handle weapon swapping outside of cleave logic to keep it separate
    handleWeaponSwap(stMaps, aoeMaps);
}

async function handleWarriorSkills(tank) {
    if (!is_on_cooldown("warcry") && !character.s.warcry && character.s.darkblessing) {
        await use_skill("warcry");
    }

    const crabsInRange = Object.values(parent.entities)
        .filter(entity => entity.mtype === "crabx" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedCrabs = crabsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && crabsInRange.length >= 5 && untargetedCrabs.length === 5 && tank) {
        await use_skill("agitate");
    }

    const mobTypes = ["boar", "plantoid"];
    const mobsInRange = Object.values(parent.entities)
        .filter(entity => mobTypes.includes(entity.mtype) && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedMobs = mobsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && mobsInRange.length >= 3 && untargetedMobs.length >= 3 && !smart.moving && tank) {
        let porc = get_nearest_monster({ type: "porcupine" });
        if (!is_in_range(porc, "agitate")) {
            await use_skill("agitate");
        }
    }

    if (!is_on_cooldown("charge")) {
        await use_skill("charge");
    }

    if (!is_on_cooldown("hardshell") && character.hp < 12000) {
        await use_skill("hardshell");
    }

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.mtype === "ent" && current.target !== character.name) {
            if (is_in_range(current, "taunt") && !is_on_cooldown("taunt")) {
                await use_skill("taunt", current.id);
                game_log("Taunting " + current.name, "#FFA600");
            }
        }
    }
}

async function handlePaladinSkills() {
    // Find the nearest cursed monster targeting someone in targetNames, prioritizing high HP
    const tar = targetNames
        .map(name => get_nearest_monster_v2({
            target: name,
            max_distance: character.range + 10,
            check_max_hp: true,
            //cursed: true
        }))
        .find(monster => monster);

    // Smash skill if a valid target is found and conditions are met
    if (tar && !is_on_cooldown("smash") && character.mp > 2000 && is_in_range(tar)) {
        await use_skill("smash", tar);
    }

    // Prioritize purifying "Miau" if its HP is low and conditions are met
    const prio = get_nearest_monster_v2({ target: "Miau" });
    //console.log(tar.hp)
    if (tar && tar.hp <= 2000 && character.mp > 800 && !is_on_cooldown("purify")) {
        use_skill("purify", tar);
    }

    // Self-heal if your HP is below a certain threshold
    if (character.hp < character.max_hp - 800) {
        await use_skill("selfheal");
    }
}

async function handleMageSkills() {
    const c1 = get_player("CrownsAnal");
    const c2 = get_player("CrownMage");

    if (c1 && c1.mp < 450 && character.mp > 2700) {
        //await use_skill("energize", 'CrownsAnal');
    }

    if (c2 && c2.mp < 14000 && character.mp > 2700) {
        if (!is_on_cooldown("energize")) {
            await use_skill("energize", 'CrownMage', 1);
        }
    }

    let nearest = get_nearest_monster({ target: "CrownPriest" });
    if (nearest && character.mp > 6000) {
        //await use_skill("zapperzap", nearest);
    }
}

function clearInventory() {
    try {
        // Transfer excess gold to loot mule
        if (character.gold > 5000000) {
            send_gold('CrownsAnal', character.gold - 5000000);
        }

        // Determine the loot mule
        let lootMule = get_player("CrownsAnal") || get_player("CrownMerch");
        if (!lootMule) {
            loot_transfer = false; // No loot mule available
            return;
        }

        // Define items to exclude from transfer
        const itemsToExclude = ["hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "pumpkinspice", "xptome"];

        // Iterate through inventory and transfer items
        for (let i = 0; i < 42; i++) {
            const item = character.items[i];
            if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
                const quantity = item.q ?? 1; // Default to 1 if quantity is undefined
                send_item(lootMule.id, i, quantity);
            }
        }
    } catch (e) {
        console.error("Error in clearInventory function:", e);
    }
}

// Adjusted interval for efficiency
setInterval(clearInventory, 5000); // Increased interval to 5 seconds

/*
function scare() {
    const slot = character.items.findIndex(i => i && i.name === "jacko");
    const orb = character.items.findIndex(i => !i);
    let mobnum = 0;
    let targetedForMoreThanOneSecond = false;

    for (id in parent.entities) {
        var current = parent.entities[id];
        if (current.mtype === home && current.target == character.name) {
            mobnum++;
            targetedForMoreThanOneSecond = true;
        }
    }

    if (mobnum > 0 && targetedForMoreThanOneSecond) {
        if (!is_on_cooldown("scare")) {
            setTimeout(() => {
                if (!is_on_cooldown("scare")) {
                    equip(slot);
                    use("scare");
                    equip(slot);
                }
            }, 1000); // 1000 milliseconds = 1 second
        }
    }
}*/

const scareThreshold = 1000; // 1 second

let lastScareTime = 0;

function scare() {
    // Find the index of the "jacko" item and an empty slot
    const jackoSlot = character.items.findIndex(item => item && item.name === "jacko");
    const emptySlot = character.items.findIndex(item => !item);

    // Count the number of monsters targeting the character
    const mobCount = Object.values(parent.entities).filter(entity => 
        entity.type === "monster" && entity.target === character.name
    ).length;

    const currentTime = performance.now();
    const timeSinceLastScare = currentTime - lastScareTime;

    // Check if we need to use the scare
    if (mobCount > 0 && timeSinceLastScare >= scareThreshold && !is_on_cooldown("scare")) {
        if (jackoSlot !== -1) {
            equip(jackoSlot);
            use("scare");
            game_log("Scare!!!", "#ff6822");
            equip(emptySlot); // Re-equip the original item if an empty slot was found
            lastScareTime = currentTime;
        }
    }
}

// Run scare every 100 milliseconds
setInterval(scare, 100);

function mluckRefresh() {
    if (character.s.mluck == undefined || character.s.mluck.f != "CrownMerch") {
        send_cm("CrownMerch", {
            message: "location",
            x: character.x,
            y: character.y,
            map: character.map
        });
    }
}
setInterval(mluckRefresh, 5000);

function on_cm(name, data) {
    if (name == "CrownsAnal") {
        if (data === "skeletor") {
            smart_move("skeletor");
        }
        if (data === "mvampire") {
            smart_move({ x: -197, y: -1172, map: 'cave' });
        }
        if (data == "dps") {
            dpsSet();
            game_log("Equipping DPS");
        }
        if (data == "luck") {
            luckSet();
            game_log("Equipping Luck");
        }
        if (data == "arena") {
            arenaSet();
            game_log("Equipping Arena");
        }
        if (data.message == "location") {
            respawn();
            smart_move({ x: data.x, y: data.y, map: data.map });
            game_log("Repsawning & Moving");
        }
    }
}

let lastSwapTime = 0;
const swapCooldown = 500; // 500ms cooldown between swaps
let capeSwapTime = 0;

async function itemSwap() {
    const delay = 150;
    const hpThreshold = 30000;
    const now = Date.now();

    try {
        // Check if any monster is below hpThreshold
        const monstersBelowThreshold = Object.values(parent.entities).some(entity => 
            entity.mtype === home && entity.hp < hpThreshold
        );
		/*
        // Only allow swap if enough time has passed since the last swap
        if (now - lastSwapTime > swapCooldown) {
            // Equip xpSet if any monster is below hpThreshold
            if (monstersBelowThreshold && character.slots?.orb?.name !== "talkingskull") {
                xpSet();
                lastSwapTime = now; // Update last swap time
            } 
            // Equip orbSet if no monster is below hpThreshold
            else if (character.slots?.orb?.name !== "orbofstr") {
                orbSet();
                lastSwapTime = now; // Update last swap time
            }
        }*/

        // Cape Swap
        if (now - capeSwapTime > swapCooldown) {
            // Equip stealthSet if enough chests are present
            if (getNumChests() >= 6 && character.slots?.cape?.name !== "stealthcape") {
                stealthSet();
                //console.log("Equipping Stealth Cape");
                //game_log("Equipping Stealth Cape");
                capeSwapTime = now; // Update last swap time
            } 
            // Equip capeSet if not already equipped
            else if (character.slots?.cape?.name !== "vcape") {
                capeSet();
                //game_log("Equipping Normal Cape");
                capeSwapTime = now; // Update last swap time
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(itemSwap, delay);
}

itemSwap();

let moveStuff = {
    basher: 40,
    computer: 1,
    fireblade: 35,
    hpot1: 2,
    luckbooster: 6,
    mpot1: 3,
    pumpkinspice: 5,
    rapier: 41,
    scythe: 39,
    tracker: 0,
    woodensword: 36,
    xptome: 4,
    //vhammer: [9, 38, 37],
};
// Inventory sorter function
function inventorySorter() {
    for (let i = 0; i < 42; i++) {
        let item = character.items[i];
        if (item && item.name in moveStuff) {
            let filterOrIndex = moveStuff[item.name];
            if (typeof filterOrIndex === "number") {
                // Swap item to the correct position
                if (i !== filterOrIndex) {
                    swap(i, filterOrIndex);
                }
            } else {
                let targetLevel = filterOrIndex[0];
                if (item.level === targetLevel) {
                    for (let j = 1; j < filterOrIndex.length; j++) {
                        if (i === filterOrIndex[j]) {
                            break;
                        }
                        if (character.items[filterOrIndex[j]] === null) {
                            // Perform swap and update inventory
                            swap(i, filterOrIndex[j]);
                            break;
                        }
                    }
                }
            }
        }
    }
}

// Run inventorySorter every 500ms
setInterval(inventorySorter, 500);

let lastLoot = null;
setInterval(function () {
    if (lastLoot == null || new Date() - lastLoot > 100) {
        if (getNumChests() >= 1) {
            delayedLoot();
            lastLoot = new Date();
        }
    }
    if (getNumChests() == 0 && tryloot) {
        timoutRevertLootState();
    }
}, 100);
function prepForGold() {
    localStorage.setItem("LootState", "gold");
    let slot = findHighestBoosterSlot();
    shift(slot, "xpbooster");
}
function prepForLoot() {
    localStorage.setItem("LootState", "loot");
    let slot = findHighestBoosterSlot();
    shift(slot, "xpbooster");
}
function findHighestBoosterSlot() {
    let slot = null;
    let maxLevel = null;
    for (let i = 0; i <= 41; i++) {
        let curSlot = character.items[i];
        if (curSlot != null && parent.G.items[curSlot.name].type == "booster") {
            if (maxLevel == null || curSlot.level > maxLevel) {
                maxLevel = curSlot.level;
                slot = i;
            }
        }
    }
    return slot;
}
let looting = {};
let tryloot = false;
let chestTimers = {}; // Object to store the timestamps when each chest was first seen

function delayedLoot() {
    let currentTime = Date.now();
    let looted = 0;

    for (id in parent.chests) {
        if (!(id in chestTimers)) {
            chestTimers[id] = currentTime; // Initialize the chest timer with the current time
        }

        let chestTimer = chestTimers[id];
        let timeDifference = currentTime - chestTimer;
        let secondsPassed = timeDifference / 1000;

        if (secondsPassed >= 100) {
            if (!tryloot) {
                prepForGold();
            }
            looting[id] = true;
            tryloot = true;
            timeoutLoot(id, currentTime);
            looted++;
            if (looted == 1) break;
        }
    }
}
function timeoutLoot(id, lootTimeStart) {
    setTimeout(function () {
        let cid = id;
        delete looting[cid];
        if (parent.chests[cid]) {
            console.log("Ranger looting" + cid);
            parent.open_chest(cid);
        }
        //parent.socket.emit("open_chest",{id:id});
    }, 200);
}
function timoutRevertLootState() {
    tryloot = false;
    prepForLoot();
}

function getNumChests() {
    return Object.keys(get_chests()).length;
}

function findBoosterSlot() {
    var booster = scanInventoryForItemIndex("xpbooster");
    if (booster == null) {
        booster = scanInventoryForItemIndex("luckbooster");
    }
    if (booster == null) {
        booster = scanInventoryForItemIndex("goldbooster");
    }
    return booster;
}

function suicide() {
    if (!character.rip && character.hp < 2000) {
        parent.socket.emit('harakiri');
        game_log("Harakiri");
        setTimeout(function () {
            respawn();
        }, 12000);
    }
}
setInterval(suicide, 100);

const skinConfigs = {
    ranger: { skin: "tm_yellow", skinRing: { name: "tristone", level: 2, locked: "l" }, normalRing: { name: "suckerpunch", level: 1, locked: "l" } },
    priest: { skin: "tm_white", skinRing: { name: "tristone", level: 1, locked: "l" }, normalRing: { name: "zapper", level: 1, locked: "l" } },
    paladin: { skin: "tf_pink", skinRing: { name: "tristone", level: 1, locked: "l" }, normalRing: { name: "suckerpunch", level: 1, locked: "l" } },
    warrior: { skin: "tf_pink", skinRing: { name: "tristone", level: 1, locked: "l" }, normalRing: { name: "suckerpunch", level: 1, locked: "l" } },
    mage: { skin: "tf_green", skinRing: { name: "tristone", level: 1, locked: "l" }, normalRing: { name: "cring", level: 4, locked: "l" } }
};

// Function to equip a ring if needed and emit 'activate' if required
function skinNeeded(ringName, ringLevel, slot = 'ring1', locked = "l", ccThreshold = 135) {
    if (character.cc <= ccThreshold) {
        if (character.slots[slot]?.name !== ringName || character.slots[slot]?.level !== ringLevel) {
            equipIfNeeded(ringName, slot, ringLevel, locked);
        }
        parent.socket.emit('activate', { slot });
    }
}

// Main function for checking skin and equipping rings
async function skinChanger() {
    const delay = 500;
    try {
        const config = skinConfigs[character.ctype];

        if (config) {
            if (character.skin !== config.skin) {
                // Equip skinRing if skin doesn't match
                skinNeeded(config.skinRing.name, config.skinRing.level, 'ring1', config.skinRing.locked);
            } else {
                // Equip normalRing when skin matches
                if (character.slots.ring1?.name !== config.normalRing.name || character.slots.ring1?.level !== config.normalRing.level) {
                    equipIfNeeded(config.normalRing.name, 'ring1', config.normalRing.level, config.normalRing.locked);
                }
                return; // Exit if the normal ring is equipped
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(skinChanger, delay);
}

skinChanger();

function lowest_health_partymember() {
    let party_mems = Object.keys(parent.party).filter(e => parent.entities[e] && !parent.entities[e].rip);
    let the_party = []

    for (key of party_mems)
        the_party.push(parent.entities[key])
    the_party.push(character)
    //Populate health percentages
    let res = the_party.sort(function (a, b) {
        let a_rat = a.hp / a.max_hp
        let b_rat = b.hp / b.max_hp
        return a_rat - b_rat;
    })
    return res[0]
}

function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) - 165
    return ms < 0 ? 0 : ms
}

function mobTargets_inRange(mtypes, radius, mobs_target, point) {
    // If point is not provided, default to character's current position
    if (!point) point = [character.x, character.y];

    let count = 0;

    // Loop through all entities in the game
    for (let id in parent.entities) {
        let entity = parent.entities[id];

        // Skip entities that are not monsters or are not visible
        if (!entity || entity.type !== 'monster' || entity.dead || !entity.visible) {
            continue;
        }
        // Check if the monster type is included in the provided list of monster types
        if (!mtypes.includes(entity.mtype)) continue;

        //Check if the monster's target is included in the provided list of target names
        if (!mobs_target.includes(entity.target)) continue;

        // Calculate the distance between the monster and the provided point
        if (Math.hypot(point[0] - entity.x, point[1] - entity.y) <= radius) {
            // If the distance is within the specified radius, increment the count
            ++count;
        }
    }

    // Return the total count of monsters within the specified radius and meeting the criteria
    return count;
}

function get_nearest_monster_v2(args = {}) {
    let min_d = 999999, target = null;
    let min_hp = 999999999; // Track the minimum HP of monsters encountered
    let max_hp = 0; // Track the maximum HP of monsters encountered

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_level !== undefined && current.level < args.min_level) continue;
        if (args.max_level !== undefined && current.level > args.max_level) continue;
        if (args.target && !args.target.includes(current.target)) continue;
        if (args.no_target && current.target && current.target != character.name) continue;
        if (args.cursed && !current.s.cursed) continue;
        if (args.min_xp !== undefined && current.xp < args.min_xp) continue;
        if (args.max_att !== undefined && current.attack > args.max_att) continue;
        if (args.path_check && !can_move_to(current)) continue;

        let c_dist;
        if (args.point_for_distance_check) {
            c_dist = Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y); // Calculate distance from a specified point
        } else {
            c_dist = parent.distance(character, current);
        }
        if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

        if (args.check_min_hp) {
            let c_hp = current.hp;
            if (c_hp < min_hp) min_hp = c_hp, target = current; // Update target based on minimum HP
            continue;
        } else if (args.check_max_hp) {
            let c_hp = current.hp;
            if (c_hp > max_hp) max_hp = c_hp, target = current; // Update target based on maximum HP
            continue;
        }
        if (c_dist < min_d) min_d = c_dist, target = current;
    }
    return target;
}

function item_quantity(name) {
    for (let i = 0; i < 42; i++) {
        if (character.items[i]?.name === name) {
            return character.items[i].q;
        }
    }
    return 0;
}

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

let lastPotion = 0; // Track the time of the last potion usage
let lastBuy = 0; // Track the time of the last purchase

async function handle_potions() {
    const hpThreshold = character.max_hp - 400;
    const mpThreshold = character.max_mp - 500;
    const potAmount = 100;
    const tomeAmount = 1;
    const potionCooldown = 1000; // Minimum time between potion usages
    const buyCooldown = 1000; // Minimum time between purchases
    let delay = 100; // Shorter delay to handle frequent checks

    try {
        const currentTime = Date.now();

        // Use MP potion if needed
        if (character.mp <= mpThreshold && !is_on_cooldown('use_mp') && item_quantity("mpot1") > 0 && currentTime - lastPotion > potionCooldown) {
            await use('use_mp');
            lastPotion = currentTime;
        }

        // Use HP potion if needed
        if (character.hp <= hpThreshold && !is_on_cooldown('use_hp') && item_quantity("hpot1") > 0 && currentTime - lastPotion > potionCooldown) {
            await use('use_hp');
            lastPotion = currentTime;
        }

        // Buy potions if quantities are low
        if (currentTime - lastBuy > buyCooldown) {
            if (item_quantity("mpot1") < potAmount) {
                buy("mpot1", potAmount);
                lastBuy = currentTime;
            }
            if (item_quantity("hpot1") < potAmount) {
                buy("hpot1", potAmount);
                lastBuy = currentTime;
            }
            if (item_quantity("xptome") < tomeAmount) {
                buy("xptome", tomeAmount - item_quantity("xptome"));
                lastBuy = currentTime;
            }
        }
    } catch (e) {
        console.error("Error in handle_potions function:", e);
    }

    setTimeout(handle_potions, delay);
}

handle_potions();

async function fixPromise(promise) {
    const promises = [];
    promises.push(promise);
    // Guarantees it will resolve in 2.5s, might want to use reject instead, though
    promises.push(new Promise((resolve) => setTimeout(resolve, 150)));
    return Promise.race(promises);
}

let group = ["OlDrippy", "CrownsAnal", "CrownTown", "CrownPriest", "CrownMerch", "CrownMage"];

function partyMaker() {
    let partyLead = group[0]; // The first character in the group is the leader
    let currentParty = character.party; // Get the current party details

    // If you're the leader and party size is less than 3, invite group members
    if (character.name === group[0]) {
        console.log("Party leader inviting members.");
        for (let i = 1; i < group.length; i++) {
            let name = group[i];
            send_party_invite(name);
        }
    } else {
        // If you're in a party that's not led by the group leader, leave it
        if (currentParty && currentParty !== group[0]) {
            console.log(`In a party with ${currentParty}, but leader should be ${group[0]}. Leaving party.`);
            leave_party();
        }

        // If not in a party and the leader exists, send a party request
        if (!currentParty && partyLead) {
            console.log(`Requesting to join ${group[0]}'s party.`);
			send_cm("OlDrippy", "party");
            send_party_request(group[0]);
        }
    }
}

// Call this function every second to manage the party
setInterval(partyMaker, 1000);

// Automatically accept party requests from group members
function on_party_request(name) {
    console.log("Party Request from " + name);
    if (group.indexOf(name) != -1) {
        console.log("Accepting party request from " + name);
        accept_party_request(name);
    }
}

// Automatically accept party invites from group members
function on_party_invite(name) {
    console.log("Party Invite from " + name);
    if (group.indexOf(name) != -1) {
        console.log("Accepting party invite from " + name);
        accept_party_invite(name);
    }
}

async function equipBatch(data) {
    if (!Array.isArray(data)) {
        game_log("Can't equipBatch non-array");
        return handleEquipBatchError("Invalid input: not an array");
    }
    if (data.length > 15) {
        game_log("Can't equipBatch more than 15 items");
        return handleEquipBatchError("Too many items");
    }

    let validItems = [];

    for (let i = 0; i < data.length; i++) {
        let itemName = data[i].itemName;
        let slot = data[i].slot;
        let level = data[i].level;
        let l = data[i].l;

        if (!itemName) {
            game_log("Item name not provided. Skipping.");
            continue;
        }

        let found = false;
        if (parent.character.slots[slot]) {
            let slotItem = parent.character.items[parent.character.slots[slot]];
            if (slotItem && slotItem.name === itemName && slotItem.level === level && slotItem.l === l) {
                found = true;
            }
        }

        if (found) {
            game_log("Item " + itemName + " is already equipped in " + slot + " slot. Skipping.");
            continue;
        }

        for (let j = 0; j < parent.character.items.length; j++) {
            const item = parent.character.items[j];
            if (item && item.name === itemName && item.level === level && item.l === l) {
                validItems.push({ num: j, slot: slot });
                break;
            }
        }
    }

    if (validItems.length === 0) {
        return //handleEquipBatchError("No valid items to equip");
    }

    try {
        parent.socket.emit("equip_batch", validItems);
        await parent.push_deferred("equip_batch");
    } catch (error) {
        console.error('Error in equipBatch:', error);
        return handleEquipBatchError("Failed to equip items");
    }
}

// Helper function to handle errors
function handleEquipBatchError(message) {
    game_log(message);
    // You may decide to implement a delay or other error handling mechanism here
    return Promise.reject({ reason: "invalid", message });
}

async function equipIfNeeded(itemName, slotName, level, l) {
    let name = null;

    // Check if itemName is an object, if so, extract item properties
    if (typeof itemName === 'object') {
        name = itemName.name;
        level = itemName.level;
        l = itemName.l;
    } else {
        name = itemName;
    }

    if (character.slots[slotName] != null) {
        let slotItem = character.slots[slotName];
        if (slotItem.name === name && slotItem.level === level && slotItem.l === l) {
            return;
        }
    }

    // Iterate over character items
    for (let i = 0; i < character.items.length; i++) {
        const item = character.items[i];
        // Check if item matches the specified criteria
        if (item != null && item.name === name && item.level === level && item.l === l) {
            // Equip the item to the specified slot
            return equip(i, slotName); // Exit the function once the item is equipped, can await if needed
        }
    }
}

let Deaths = 0; // Variable to track the number of deaths
let StartTime = new Date(); // Start time to calculate elapsed time
game.on('death', function (data) {
    if (parent.entities[data.id]) { // Check if the entity exists
        const mob = parent.entities[data.id];
        const mobName = mob.type;

        // Check if the mob is a monster
        if (mobName === 'monster') {
            const mobTarget = mob.target; // Get the mob's target
            const party = get_party(); // Get your party members

            // If party exists, extract party member names into an array
            const partyMembers = party ? Object.keys(party) : [];

            // Check if the mob's target was the player or someone in the party
            if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
                //console.log("slain", data); // Log the death event
                Deaths++; // Increment the death count
                killHandler(); // Call the killHandler function
            }
        }
    }
});
function killHandler() {
    let elapsed = (new Date() - StartTime) / 1000; // Calculate elapsed time in seconds
    let DeathsPerSec = Deaths / elapsed; // Calculate deaths per second
   let dailyKillRate = Math.round(DeathsPerSec * 60 * 60 * 24); // Calculate deaths per day
    set_message(dailyKillRate.toLocaleString() + ' kpd');
}
////////////////////////////////////////////////////////////////////////////////
var till_level = 0; // Kills till level = 0, XP till level = 1

setInterval(function () {
    updateGUI();
}, 1000 / 4);

function initGUI() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Adjust the width of the outer container of the XP bar
    $('.xpsui').css({
        width: '97%', // Adjust the width as needed
        borderWidth: '3px 3px',
    });

    // Modify other styles as necessary
    $('#xpui').css({
        fontSize: '25px'
    });

    brc.find('.xpsui').css({
        background: 'url("https://i.imgur.com/zCb8PGK.png")',
        backgroundSize: 'cover'
    });
}

function updateGUI() {
    let $ = parent.$;
    let xp_percent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
    let xp_string = `LV${character.level} ${xp_percent}%`;

    if (till_level === 0) {
        if (parent.ctarget && parent.ctarget.type == 'monster') {
            last_target = parent.ctarget.mtype;
        }
        /*if (last_target) {
            let xp_missing = parent.G.levels[character.level] - character.xp;
            let monster_xp = parent.G.monsters[last_target].xp;
            let party_modifier = character.party ? 1.5 / parent.party_list.length : 1;
            let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
            //xp_string += ` (${ncomma(monsters_left)} kills left)`;
        }*/
    } else if (till_level === 1) {
        let xp_missing = ncomma(parent.G.levels[character.level] - character.xp);
        //xp_string += ` (${xp_missing} xp to go!)`;
    }

    $('#xpui').html(xp_string);
    $('#goldui').html(ncomma(character.gold) + " GOLD");
}

function ncomma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

initGUI();
//////////////////////////////////////////////////////////////////////////////////////////
var startTime = new Date();
var sumGold = 0;
var largestGoldDrop = 0;
setInterval(function () {
    update_goldmeter();
}, 400);

function init_goldmeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#goldtimer').remove();
    let xpt_container = $('<div id="goldtimer"></div>').css({
        fontSize: '25px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: '100%'
    });
    //vertical centering in css is fun
    let xptimer = $('<div id="goldtimercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html("")
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}

function updateGoldTimerList() {
    let $ = parent.$;
    var gold = getGold();
    var goldString = "<div>" + gold.toLocaleString('en') + " Gold/Hr" + "</div>";
    goldString += "<div>" + largestGoldDrop.toLocaleString('en') + " Largest Gold Drop</div>";
    $('#' + "goldtimercontent").html(goldString).css({
        background: 'black',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Add a background color
        border: 'solid gray',
        borderWidth: '4px 4px',
        height: '50px',
        lineHeight: '25px',
        fontSize: '25px',
        color: '#FFD700',
        textAlign: 'center',
    });
}

function update_goldmeter() {
    updateGoldTimerList();
}

init_goldmeter();

function getGold() {
    var elapsed = new Date() - startTime;
    var goldPerSecond = parseFloat(Math.round((sumGold / (elapsed / 1000)) * 100) / 100);
    return parseInt(goldPerSecond * 60 * 60);
}

function trackLargestGoldDrop(gold) {
    if (gold > largestGoldDrop) {
        largestGoldDrop = gold;
    }
}

//Clean out any pre-existing listeners
if (parent.prev_handlersgoldmeter) {
    for (let [event, handler] of parent.prev_handlersgoldmeter) {
        parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersgoldmeter = [];

function register_goldmeterhandler(event, handler) {
    parent.prev_handlersgoldmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function goldMeterGameResponseHandler(event) {
    if (event.response == "gold_received") {
        var gold = event.gold;
        sumGold += gold;
        trackLargestGoldDrop(gold);
    }
}

function goldMeterGameLogHandler(event) {
    if (event.color == "gold") {
        var gold = parseInt(event.message.replace(" gold", "").replace(",", ""));
        sumGold += gold;
        trackLargestGoldDrop(gold);
    }
}

register_goldmeterhandler("game_log", goldMeterGameLogHandler);
register_goldmeterhandler("game_response", goldMeterGameResponseHandler);

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// Initialize the XP timer and set the update interval
setInterval(update_xptimer, 500);

// Initialize variables
let minute_refresh;
let timeStart = new Date(); // Record the start time for XP calculation
let startXP = character.xp; // Record the starting XP

// Initialize the XP timer display
function init_xptimer(minref) {
    minute_refresh = minref || 1;
    parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#xptimer').remove();
    let xpt_container = $('<div id="xptimer"></div>').css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '4px 4px',
        width: '98%',
        height: '66px',
        fontSize: '25px',
        color: '#00FF00',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    });
    let xptimer = $('<div id="xptimercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 30px !important; line-height: 25px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}

// Update the XP timer display
function update_xptimer() {
    if (character.xp === startXP) return;

    let $ = parent.$;
    let now = new Date();
    let time = Math.round((now.getTime() - timeStart.getTime()) / 1000);

    if (time < 1) return;

    let elapsedTime = (now.getTime() - timeStart.getTime()) / 1000;
    let xpGain = character.xp - startXP;
    let averageXPGain = Math.round(xpGain / elapsedTime);

    let xp_rate = Math.round((character.xp - startXP) / elapsedTime);
    let xp_missing = parent.G.levels[character.level] - character.xp;
    let seconds = Math.round(xp_missing / xp_rate);
    let minutes = Math.round(seconds / 60);
    let hours = Math.round(minutes / 60);
    let days = Math.floor(hours / 24);

    let remainingHours = hours % 24;
    let remainingMinutes = minutes % 60;

    let counter = `${days}d ${remainingHours}h ${remainingMinutes}min`;
    $('#xpcounter').css('color', '#87CEEB').text(counter);

    let xpRateDisplay = $('#xpRateDisplay');
    xpRateDisplay.empty();

    let xprateContainer = $('<div class="xprate-container"></div>')
        .css({
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center' // Center the content horizontally
        });

    xprateContainer.append('<br>');
    xprateContainer.append(`<span id="xpRateDisplay">${ncomma(Math.round(averageXPGain))} XP/s</span>`); // Updated to use simplified XP rate calculation

    $('#xprate').empty().append(xprateContainer);
}

// Function to format numbers with commas for better readability
function ncomma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

init_xptimer();
/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// Initialize the DPS meter
function initDPSMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing DPS meter
    brc.find('#dpsmeter').remove();

    // Create a container for the DPS meter
    let dpsmeter_container = $('<div id="dpsmeter"></div>').css({
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });

    // Create a div for the DPS meter content
    let dpsmeter_content = $('<div id="dpsmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '2px',
        border: '4px solid grey',
    }).appendTo(dpsmeter_container);

    // Insert the DPS meter container
    brc.children().first().after(dpsmeter_container);
}

// Initialize variables
let damage = 0;
let burnDamage = 0;
let blastDamage = 0;
let baseDamage = 0;
let baseHeal = 0;
let lifesteal = 0;
let manasteal = 0;
let METER_START = performance.now();

// Damage tracking object for party members
let partyDamageSums = {};

// Format DPS with commas for readability
function getFormattedDPS(dps) {
    try {
        return dps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('Formatting DPS error:', error);
        return 'N/A';
    }
}

// Handle "hit" events
parent.socket.on("hit", function (data) {
    try {
        if (data.hid) {
            let targetId = data.hid;
            if (parent.party_list && parent.party_list.includes(targetId)) {
                let entry = partyDamageSums[targetId] || {
                    startTime: performance.now(),
                    sumDamage: 0,
                    sumHeal: 0,
                    sumBurnDamage: 0,
                    sumBlastDamage: 0,
                    sumBaseDamage: 0,
                    sumLifesteal: 0,
                    sumManaSteal: 0,
                };

                if (targetId == character.id) {
                    entry.sumDamage += data.damage || 0;
                    entry.sumHeal += (data.heal || 0) + (data.lifesteal || 0);
                    entry.sumManaSteal += data.manasteal || 0;

                    if (data.source == "burn") {
                        entry.sumBurnDamage += data.damage;
                    } else if (data.splash) {
                        entry.sumBlastDamage += data.damage;
                    } else {
                        entry.sumBaseDamage += data.damage || 0;
                    }
                } else {
                    entry.sumDamage += data.damage || 0;
                    entry.sumHeal += (data.heal || 0) + (data.lifesteal || 0);
                    entry.sumManaSteal += data.manasteal || 0;

                    if (data.source == "burn") {
                        entry.sumBurnDamage += data.damage;
                    } else if (data.splash) {
                        entry.sumBlastDamage += data.damage;
                    } else {
                        entry.sumBaseDamage += data.damage || 0;
                    }
                }

                partyDamageSums[targetId] = entry;
            }
        }
    } catch (error) {
        console.error('Error in hit event handler:', error);
    }
});

// Update the DPS meter UI
function updateDPSMeterUI() {
    try {
        //All supported types can freely be added or removed
        //const damageTypes = ["Base", "Blast", "Burn", "HPS", "MPS", "DPS"]; are all that are currently available
        const damageTypes = ["Base", "Blast", "Burn", "HPS", "MPS", "DPS"];
        let elapsed = performance.now() - METER_START;

        let dps = Math.floor((damage * 1000) / elapsed);
        let burnDps = Math.floor((burnDamage * 1000) / elapsed);
        let blastDps = Math.floor((blastDamage * 1000) / elapsed);
        let baseDps = Math.floor((baseDamage * 1000) / elapsed);
        let hps = Math.floor((baseHeal * 1000) / elapsed);
        let mps = Math.floor((manasteal * 1000) / elapsed);

        let $ = parent.$;
        let dpsDisplay = $('#dpsmetercontent');

        if (dpsDisplay.length === 0) return;

        let listString = '<div>👑 Crowns Damage Meter 👑</div>';
        listString += '<table border="1" style="width:100%">';

        // Header row
        listString += '<tr><th></th>';
        for (const type of damageTypes) {
            listString += `<th>${type}</th>`;
        }
        listString += '</tr>';

        // Sort players by DPS
        let sortedPlayers = Object.entries(partyDamageSums)
            .map(([id, entry]) => ({
                id,
                dps: calculateDPSForPartyMember(entry),
                entry
            }))
            .sort((a, b) => b.dps - a.dps);

        // Player rows
        for (let { id, entry } of sortedPlayers) {
            const player = get_player(id);
            if (player) {
                listString += '<tr>';
                listString += `<td>${player.name}</td>`;

                for (const type of damageTypes) {
                    const value = getTypeValue(type, entry);
                    listString += `<td>${getFormattedDPS(value)}</td>`;
                }

                listString += '</tr>';
            }
        }

        // Total DPS row
        listString += '<tr><td>Total DPS</td>';
        for (const type of damageTypes) {
            let totalDPS = 0;

            for (let id in partyDamageSums) {
                const entry = partyDamageSums[id];
                const value = getTypeValue(type, entry);
                totalDPS += value;
            }

            listString += `<td>${getFormattedDPS(totalDPS)}</td>`;
        }
        listString += '</tr>';

        listString += '</table>';

        dpsDisplay.html(listString);
    } catch (error) {
        console.error('Error updating DPS meter UI:', error);
    }
}

// Get value for a specific damage type
function getTypeValue(type, entry) {
    const elapsedTime = performance.now() - (entry.startTime || performance.now());
    switch (type) {
        case "DPS":
            return calculateDPSForPartyMember(entry);
        case "Burn":
            return Math.floor((entry.sumBurnDamage * 1000) / elapsedTime);
        case "Blast":
            return Math.floor((entry.sumBlastDamage * 1000) / elapsedTime);
        case "Base":
            return Math.floor((entry.sumBaseDamage * 1000) / elapsedTime);
        case "HPS":
            return Math.floor((entry.sumHeal * 1000) / elapsedTime);
        case "MPS":
            return Math.floor((entry.sumManaSteal * 1000) / elapsedTime);
        default:
            return 0;
    }
}

// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = performance.now() - (entry.startTime || performance.now());
        const totalDamage = entry.sumDamage || 0;
        return Math.floor((totalDamage * 1000) / elapsedTime);
    } catch (error) {
        console.error('Error calculating DPS for party member:', error);
        return 0;
    }
}

// Initialize the DPS meter and set up the update interval
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
