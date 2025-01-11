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

const home = 'plantoid';
const mobMap = 'desertland';
const destination = {
    map: mobMap,
    x: locations[home][0].x,
    y: locations[home][0].y
};

let angle = 0;
const speed = 1.8;
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

const zone = Object.values(G.maps[mobMap].monsters).find(e => e.type === home).boundary;
const [topLeftX, topLeftY, bottomRightX, bottomRightY] = zone;
const centerX2 = (topLeftX + bottomRightX) / 2;
const centerY2 = (topLeftY + bottomRightY) / 2;
let lastUpdateTime = performance.now();

async function eventer() {
    const delay = 100;
    try {
        if (events) {
            handleEvents();
        } else if (harpyActive || skeletorActive) {
            //handleBosses();
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
        } else {
            walkInCircle();
        }
        if (character.map !== mobMap) {
            //loot();
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(eventer, delay);
}
eventer();

async function checkRespawnTimers() {
    let delay = 1000;
    try {
        if (Date.now() - harpyDeath >= harpyRespawnTime) {
            harpyActive = true;
        }
        if (Date.now() - skeletorDeath >= skeletorRespawnTime) {
            skeletorActive = true;
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
    } /*else {
        // Handle standard events
        //handleSpecificEvent('dragold', 'cave', 1190, -810, 500000, 900);
        //handleSpecificEvent('snowman', 'winterland', 1190, -900, 50);
        //handleSpecificEventWithJoin('goobrawl', 'goobrawl', 42, -169, 50000);
        //handleSpecificEventWithJoin('crabxx', 'main', -976, 1785, 100000);
        //handleSpecificEventWithJoin('franky', 'level2w', 23, 38, 1000000);
        //handleSpecificEventWithJoin('icegolem', 'winterland', 820, 420, 50000);
    }*/
}

function handleBosses() {
    if (harpyActive) {
        handleHarpyEvent();
    }
    if (skeletorActive) {
        handleSkeletorEvent();
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
                    equipSet("dps");
                }
            } else if (character.cc < 100) {
                equipSet("luck");
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
                    equipSet("dps");
                }
            } else if (character.cc < 100) {
                equipSet("luck");
            }
        }
    }
}

function handleHome() {
    if (character.cc < 100) {
        //equipSet("dps");
    }
    if (!smart.moving) {
        smart_move(destination);
        game_log(`Moving to ${home}`);
    }
}

function walkInCircle() {
    if (!smart.moving) {
        const center = locations[home][0];
        const radius = 25;

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
    draw_circle(center.x, center.y, radius, 3, 0xFFFFFF); // priest path
    draw_circle(center.x, center.y, 35, 3, 0xFF00FB); // warr path
    draw_circle(center.x, center.y, 45, 3, 0xE8FF00); // ranger path
    draw_circle(center.x, center.y, 1, 3, 0x00FF00); // center point
    draw_circle(center.x, center.y, 40, 3, 0x00FF00); //kill zone

    draw_line(topLeftX, topLeftY, bottomRightX, topLeftY, 2, 0xFF0000);
    draw_line(bottomRightX, topLeftY, bottomRightX, bottomRightY, 2, 0xFF0000);
    draw_line(bottomRightX, bottomRightY, topLeftX, bottomRightY, 2, 0xFF0000);
    draw_line(topLeftX, bottomRightY, topLeftX, topLeftY, 2, 0xFF0000);
    draw_circle(centerX2, centerY2, 1, 2, 0x00FF00);
    draw_circle(character.x, character.y, G.skills.zapperzap.range, 3);
}

function handleHarpyEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 130 || character.y !== -300 || character.map !== "winter_cove") {
            smart_move({ x: 130, y: -300, map: "winter_cove" });
            game_log("Moving to Rharpy location");
        }
    }

    const harpy = get_nearest_monster({ type: "rharpy" });

    // If the harpy isn't nearby, mark it as dead and reset the death timer
    if (!harpy && distance(character, { x: 135, y: -311 }) <= 300 && character.map === 'winter_cove') {
        harpyDeath = Date.now();
        harpyActive = false;
        game_log("Rharpy is not here, resetting death time");
        localStorage.setItem('harpyDeath', harpyDeath);
    } else if (harpy) {
        // Manage gear based on harpy's health
        if (harpy.hp < 50000 && character.cc < 100) {
            equipSet("maxLuck");
        } else if (harpy.hp > 50000 && character.cc < 100) {
            equipSet("dps");
        }
    }
}

function handleSkeletorEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 280 || character.y !== -571 || character.map !== "arena") {
            smart_move({ x: 280, y: -571, map: "arena" });
            game_log("Moving to Skeletor location");
        }
    }

    const skele = get_nearest_monster({ type: "skeletor" });

    // If the harpy isn't nearby, mark it as dead and reset the death timer
    if (!skele && distance(character, { x: 280, y: -571 }) <= 300 && character.map === 'arena') {
        skeletorDeath = Date.now();
        skeletorActive = false;
        game_log("Skeletor is not here, resetting death time");
        localStorage.setItem('skeletorDeath', skeletorDeath);
    } else if (skele) {
        // Manage gear based on harpy's health
        if (skele.hp < 50000 && character.cc < 100) {
            equipSet("maxLuck");
        } else if (skele.hp > 50000 && character.cc < 100) {
            equipSet("dps");
        }
    }
}

const equipmentSets = {
    zapOn: [
        { itemName: "zapper", slot: "ring2", level: 2, l: "u" },
    ],
    zapOff: [
        { itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
    ],
    maxLuck: [
        { itemName: "eears", slot: "helmet", level: 8, l: "l" },
        { itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
        { itemName: "xmaspants", slot: "pants", level: 9, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        { itemName: "santasbelt", slot: "belt", level: 3, l: "l" },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        { itemName: "mshield", slot: "offhand", level: 9, l: "l" },
        //{ itemName: "ringofluck", slot: "ring1", level: 2, l: "u" },
        //{ itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
        { itemName: "rabbitsfoot", slot: "orb", level: 3, l: "l" },
        //{ itemName: "spookyamulet", slot: "amulet", l: "l" },
        { itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
        { itemName: "ecape", slot: "cape", level: 8, l: "l" },
        { itemName: "mearring", slot: "earring1", level: 0, l: "l" },
        { itemName: "mearring", slot: "earring2", level: 0, l: "u" }

    ],
    luck: [
        { itemName: "eears", slot: "helmet", level: 8, l: "l" },
        //{ itemName: "xhelmet", slot: "helmet", level: 9, l: "l"  },
        { itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
        { itemName: "starkillers", slot: "pants", level: 8, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        { itemName: "intbelt", slot: "belt", level: 6, l: "l" },
        //{ itemName: "santasbelt", slot: "belt", level: 3, l: "l"  },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        { itemName: "mshield", slot: "offhand", level: 9, l: "l" },
        { itemName: "ringofluck", slot: "ring1", level: 2, l: "u" },
        { itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
        { itemName: "rabbitsfoot", slot: "orb", level: 3, l: "l" },
        //{ itemName: "spookyamulet", slot: "amulet", l: "l" },
        { itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
        { itemName: "ecape", slot: "cape", level: 8, l: "l" },
        //{ itemName: "bcape", slot: "cape", level: 7, l: "l"  },
    ],
    gold: [
        { itemName: "wcap", slot: "helmet", level: 9, l: "l" },
        { itemName: "wattire", slot: "chest", level: 9, l: "l" },
        { itemName: "wbreeches", slot: "pants", level: 6, l: "l" },
        { itemName: "wshoes", slot: "shoes", level: 10, l: "l" },
        { itemName: "handofmidas", slot: "gloves", level: 8, l: "l" },
        { itemName: "spookyamulet", slot: "amulet", l: "l" },
        { itemName: "stealthcape", slot: "cape", level: 0, l: "l" },
    ],
    dps: [
        { itemName: "xhelmet", slot: "helmet", level: 9, l: "l" },
        //{ itemName: "xarmor", slot: "chest", level: 8, l: "l"  },
        { itemName: "vattire", slot: "chest", level: 8, l: "l" },
        //{ itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
        { itemName: "starkillers", slot: "pants", level: 8, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        { itemName: "intbelt", slot: "belt", level: 6, l: "l" },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        //{ itemName: "firestaff", slot: "mainhand", level: 9, l: "s" },
        //{ itemName: "wbook0", slot: "offhand", level: 6, l: "l" },
        { itemName: "mshield", slot: "offhand", level: 9, l: "l" },
        //{ itemName: "zapper", slot: "ring1", level: 2, l: "l" },
        //{ itemName: "zapper", slot: "ring2", level: 2, l: "u" },
        { itemName: "jacko", slot: "orb", level: 5, l: "l" },
        //{ itemName: "t2intamulet", slot: "amulet", level: 4, l: "l" },
        { itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
        //{ itemName: "amuletofspooks", slot: "amulet", l: "l"  },
        { itemName: "gcape", slot: "cape", level: 9, l: "l" },
        //{ itemName: "bcape", slot: "cape", level: 7, l: "l" },
        { itemName: "cearring", slot: "earring1", level: 4, l: "l" },
        { itemName: "cearring", slot: "earring2", level: 4, l: "u" },
    ],
    rHome: [
        { itemName: "xhelmet", slot: "helmet", level: 9, l: "l" },
        { itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
        { itemName: "starkillers", slot: "pants", level: 8, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        { itemName: "intbelt", slot: "belt", level: 6, l: "l" },
        //{ itemName: "santasbelt", slot: "belt", level: 3, l: "l"  },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        { itemName: "mshield", slot: "offhand", level: 9, l: "l" },
        //{ itemName: "shield", slot: "offhand", level: 9, l: "l" },
        { itemName: "ringofluck", slot: "ring1", level: 2, l: "u" },
        { itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
        { itemName: "rabbitsfoot", slot: "orb", level: 3, l: "l" },
        //{ itemName: "test_orb", slot: "orb", level: 0, l: "l" },
        //{ itemName: "talkingskull", slot: "orb", level: 4, l: "l" },
        //{ itemName: "t2stramulet", slot: "amulet", level: 4, l: "l"  },
        //{ itemName: "t2intamulet", slot: "amulet", level: 4, l: "l"  },
        //{ itemName: "amuletofspooks", slot: "amulet", l: "l"  },
        { itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
        //{ itemName: "bcape", slot: "cape", level: 7, l: "l" },
        //{ itemName: "gcape", slot: "cape", level: 9, l: "l" },
        { itemName: "fcape", slot: "cape", level: 4, l: "l" },
    ],
    aHome: [
        { itemName: "xhelmet", slot: "helmet", level: 9, l: "l" },
        { itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
        { itemName: "starkillers", slot: "pants", level: 8, l: "l" },
        { itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
        { itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
        { itemName: "intbelt", slot: "belt", level: 6, l: "l" },
        //{ itemName: "sbelt", slot: "belt", level: 2, l: "l"  },
        { itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
        { itemName: "mshield", slot: "offhand", level: 9, l: "l" },
        //{ itemName: "shield", slot: "offhand", level: 9, l: "l" },
        { itemName: "ringofluck", slot: "ring1", level: 2, l: "u" },
        { itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
        { itemName: "rabbitsfoot", slot: "orb", level: 3, l: "l" },
        //{ itemName: "test_orb", slot: "orb", level: 0, l: "l" },
        //{ itemName: "talkingskull", slot: "orb", level: 4, l: "l" },
        //{ itemName: "t2stramulet", slot: "amulet", level: 4, l: "l"  },
        { itemName: "t2intamulet", slot: "amulet", level: 4, l: "l" },
        //{ itemName: "amuletofspooks", slot: "amulet", l: "l"  },
        //{ itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
        { itemName: "bcape", slot: "cape", level: 7, l: "l" },
        //{ itemName: "gcape", slot: "cape", level: 9, l: "l" },
        //{ itemName: "fcape", slot: "cape", level: 4, l: "l" },
    ],
};

let harpyDeath = parseInt(localStorage.getItem('harpyDeath')) || 0;
let skeletorDeath = parseInt(localStorage.getItem('skeletorDeath')) || 0;
let stompyDeath = parseInt(localStorage.getItem('stompyDeath')) || 0;

game.on('death', function (data) {
    if (parent.entities[data.id]) { // Check if the entity exists
        const mob = parent.entities[data.id];
        const mobName = mob.mtype; // Get the mob type
        const mobTarget = mob.target; // Get the mob's target

        // Get your party members
        const party = get_party();
        const partyMembers = party ? Object.keys(party) : [];

        // Check if the mob's target was the player or someone in the party
        if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
            game_log(`${mobName} died with ${data.luckm} luck`, "#96a4ff");
        }
    }
});

const targetNames = ["CrownTown", "CrownPriest"];

async function attackLoop() {
    let delay = 1;
    let disabled = (parent.is_disabled(character) === undefined);
    let bosses = ["bscorpion", "grinch"];
    try {
        if (disabled) {
            let heal_target = lowest_health_partymember();
            if (heal_target && heal_target.hp < heal_target.max_hp - (character.heal / 1.33) && is_in_range(heal_target)) {
                await heal(heal_target);
                if (heal_target.name === "CrownPriest") {
                    game_log("Healing " + heal_target.name, "#FFFFFF");
                } else if (heal_target.name === "CrownTown") {
                    game_log("Healing " + heal_target.name, "#FF00E0");
                } else if (heal_target.name === "CrownTown") {
                    game_log("Healing " + heal_target.name, "#FFFF00");
                } else if (heal_target.name === "CrownZone") {
                    game_log("Healing " + heal_target.name, "#585858");
                } else {
                    game_log("Healing " + heal_target.name, "#27FF00");
                }
                delay = ms_to_next_skill('attack');
            } else {
                let target = null;
                let bossMonster = null;

                //Prioritize Bosses
                if (!target) {
                    for (let i = 0; i < bosses.length; i++) {
                        bossMonster = get_nearest_monster_v2({
                            type: bosses[i],
                            max_distance: 250, // Higher range for bosses
                        });
                        if (bossMonster) break;
                    }
                }

                // If no Bosses, find regular mobs
                for (let i = 0; i < targetNames.length; i++) {
                    target = get_nearest_monster_v2({
                        target: targetNames[i],
                        check_min_hp: true,
                        max_distance: 50, // Only consider monsters within 50 units
                    });
                    if (target) break;
                }

                // Prioritize boss target if found, otherwise use regular target
                if (bossMonster) {
                    target = bossMonster;
                }

                if (target) {
                    if (is_in_range(target)) {
                        await attack(target);
                        delay = ms_to_next_skill('attack');
                    }
                }
            }
        }
    } catch (e) {
        //console.error(e);
    }
    setTimeout(attackLoop, delay);
}

attackLoop();
///////////////////////////////////////////////////////////////////////////////////////////////////
async function SkillLoop() {
    const X = locations[home][0].x;
    const Y = locations[home][0].y;
    const delay = 40;
    const dead = character.rip;
    const disabled = parent.is_disabled(character) === undefined;
    const targetNames = ["CrownTown", "CrownPriest"];
    const mapsToExclude = ["level2n", "level2w"];
    const eventMaps = ["desertland", "halloween"];
    const eventMobs = ["rgoo", "bgoo", "snowman", "icegolem", "franky", "grinch", "dragold", "wabbit", "mrgreen", "mrpumpkin"];
    try {
        if (character.ctype === "priest") {
            handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps);
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(SkillLoop, delay);
}

SkillLoop();

async function handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps, zapperMobs) {
    if (!dead && disabled) {
        handleCursing(X, Y, targetNames);
        handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps);
        handlePartyHeal(dead);
        handleDarkBlessing(dead);
        //handleZapSpam(dead, zapperMobs);
    } else {
        //console.log("Dead or disabled, skipping handlePriestSkills");
    }
}

async function handleCursing(X, Y, targetNames) {
    let ctargetTypes = ["rgoo", "bgoo", "skeletor", "crabxx", "phoenix", "mvampire", "rharpy", "stompy", "grinch"];
    let ctarget = null;

    // Find the nearest monster of any type in the ctargetTypes array
    for (let i = 0; i < ctargetTypes.length; i++) {
        ctarget = get_nearest_monster_v2({
            type: ctargetTypes[i],
        });
        if (ctarget && !is_on_cooldown("curse")) {
            await use_skill("curse", ctarget);
            return;
        }
    }

    // If no target found with the initial search, try to find one based on the specific conditions
    if (!ctarget) {
        for (const name of targetNames) {
            ctarget = get_nearest_monster_v2({
                target: "CrownTown",
                check_min_hp: true,
                type: "ent",
                //target: "CrownPriest",
                //check_max_hp: true,
                //max_distance: 75,
                //point_for_distance_check: [X, Y],
            });
            if (ctarget) break;
        }
    }

    // If still no target found, try to get the targeted monster
    if (!ctarget) ctarget = get_targeted_monster();

    // If a valid target is found, and conditions are met, use the curse skill
    if (ctarget && ctarget.hp >= ctarget.max_hp * 0.01 && !ctarget.immune && !is_on_cooldown("curse")) {
        //if (ctarget && ctarget.hp >= ctarget.max_hp * 0.8 && !ctarget.immune && !is_on_cooldown("curse")) {
        await use_skill("curse", ctarget);
    }
}

async function handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps) {
    if (character.party) {
        for (let char_name in get_party()) {
            if (character.name == char_name) continue;
            let monster = get_nearest_monster({ type: home, target: "CrownsAnal" }); // target: char_name
            if (monster) {
                if (!is_on_cooldown("absorb") && !mapsToExclude.includes(character.map)) {
                    await use_skill("absorb", char_name);
                    game_log("absorbing " + char_name, "#FFA600");
                }
            }
        }
    }

    if (eventMaps.includes(character.map)) {
        const entities = Object.values(parent.entities).filter(
            entity => entity && eventMobs.includes(entity.mtype) && entity.target && entity.target !== character.name
        );
        for (const entity of entities) {
            if (!is_on_cooldown("absorb") && character.mp > 4500) {
                await use_skill("absorb", entity.target);
            }
        }
    }
}

async function handlePartyHeal(dead) {
    for (let char_name of parent.party_list) {
        let allies = get_entity(char_name);
        if (allies && allies.hp < allies.max_hp * 0.65 && !allies.rip) {
            if (!is_on_cooldown("partyheal") && character.mp > 2000) {
                await use_skill("partyheal");
            }
        }
    }
}

async function handleDarkBlessing(dead) {
    let isHome = get_nearest_monster({ type: home });
    if (!dead && isHome) {
        if (!is_on_cooldown("darkblessing")) {
            await use_skill("darkblessing");
        }
    }
}

async function handleZapSpam(dead) {
    let isHome = get_nearest_monster({ type: home });
    if (!dead && isHome) {
        if (!is_on_cooldown("zapperzap") && isHome.hp > 15000) {
            if (character.mp > 3000) {
                await use_skill("zapperzap", isHome);
            }
        }
    }
}

async function handleZap() {
    const zapperMobs = [home, "rgoo", "bgoo"];  // List of mobs to zap
    const delay = 100;
    let zap = true;
    try {
        if (zap && !smart.moving) {
            // Scan all mobs that are in the zapperMobs list
            const entities = Object.values(parent.entities).filter(entity =>
                entity && entity.type === "monster" && !entity.target &&
                zapperMobs.includes(entity.mtype) &&
                is_in_range(entity, "zapperzap") &&
                entity.visible && !entity.dead
            );
            //console.log("Entities:", entities.length, entities.map(e => e.mtype));  // For debugging
            // Step 1: Equip the correct set based on mob presence
            if (entities.length > 0 && character.cc < 175 && character.slots.ring2?.name !== "zapper") {
                // Equip the zapOn set if there are zapable mobs
                equipSet("zapOn");
                //console.log("Equipped zapper set.");
            } else if (entities.length === 0 && character.cc < 175 && character.slots.ring2?.name !== "ringofluck") {
                // Equip the zapOff set if all mobs are targeted, dead, or invisible
                equipSet("zapOff");
                //console.log("Equipped luck ring set.");
            }

            // Step 2: Use zapper skill if conditions are met
            if (entities.length > 0 && !is_on_cooldown("zapperzap") && character.mp > G?.skills?.zapperzap?.mp + 3250) {
                for (const entity of entities) {
                    if (!is_on_cooldown("zapperzap")) {
                        await use_skill("zapperzap", entity);  // Zap the entity
                        //console.log(`Zapped ${entity.mtype}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(handleZap, delay);
}
handleZap();
//////////////////////////
async function moveLoop() {
    let delay = 100;

    try {
        // Use the global 'boss' object for movement logic
        if (boss) {
            const nearestBoss = get_nearest_monster({ type: boss.mtype });
            if (nearestBoss) {
                if (can_move_to(nearestBoss.real_x, nearestBoss.real_y)) {
                    await move(
                        character.real_x + (nearestBoss.real_x - character.real_x) / 2,
                        character.real_y + (nearestBoss.real_y - character.real_y) / 2
                    );
                } else if (!smart.moving) {
                    smart_move({
                        x: nearestBoss.real_x,
                        y: nearestBoss.real_y
                    });
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(moveLoop, delay);
}

//moveLoop();
////////////////////////////////////////////////////
// boundary is an array of 4 numbers (2 Points) which will define our intended space
// function should return true if the point is inside our boundary and false if not

//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
var rangeBuffer = 65;

//How far away we want to consider monsters for
var calcRadius = 300;

//What types of monsters we want to try to avoid
var avoidTypes = ["bscorpion"];
var mapWeHuntIn = ['desertland']
//var boundaryOur = Object.values(G.maps[mapWeHuntIn].monsters).filter(e => e.type == avoidTypes[0])[0].boundary// our own boundary to use monster boundarys use Object.values(G.maps[mapWeHuntIn].monsters).filter(e=> e.type==avoidTypes[0])[0].boundary or [x1,y1,x2,y2]
let boundaryOur = [-562, -1369, -285, -1134]
var avoidPlayers = false;//Set to false to not avoid players at all
var playerBuffer = 30;//Additional Range around players
var avoidPlayersWhitelist = [];//Players want to avoid differently
var avoidPlayersWhitelistRange = 30; //Set to null here to not avoid whitelisted players
var playerRangeOverride = 65; //Overrides how far to avoid, set to null to use player range.
var playerAvoidIgnoreClasses = ["merchant"];//Classes we don't want to try to avoid

//Tracking when we send movements to avoid flooding the socket and getting DC'd
var lastMove;

//Whether we want to draw the various calculations done visually
var drawDebug = false;

setInterval(function () {
    if (drawDebug) {
        clear_drawings();
    }
    if (drawDebug) {
        draw_line(boundaryOur[0], boundaryOur[1], boundaryOur[0], boundaryOur[3], 2, 0xfc031c)
        draw_line(boundaryOur[2], boundaryOur[1], boundaryOur[2], boundaryOur[3], 2, 0xfc031c)

        draw_line(boundaryOur[0], boundaryOur[3], boundaryOur[2], boundaryOur[3], 2, 0xfc031c)
        draw_line(boundaryOur[0], boundaryOur[1], boundaryOur[2], boundaryOur[1], 2, 0xfc031c)
    }
    var goal = null;

    var phoenix;

    for (id in parent.entities) {
        var entity = parent.entities[id];

        if (entity.mtype == "troll") {
            goal = { x: entity.real_x, y: entity.real_y };
            break;
        }
    }

    //Try to avoid monsters, 
    var avoiding = avoidMobs(goal);

    if (!avoiding && goal != null) {
        if (lastMove == null || new Date() - lastMove > 100) {
            move(goal.x, goal.y);
            lastMove = new Date();
        }
    }
    //draw_circle(character.x,character.y,character.range,1);
    //draw_circle(character.x,character.y,155,1);
}, 25);

function avoidMobs(goal) {
    var noGoal = false;

    if (goal == null || goal.x == null || goal.y == null) {
        noGoal = true;
    }

    if (drawDebug && !noGoal) {
        draw_circle(goal.x, goal.y, 25, 1, 0xDFDC22);
    }

    var maxWeight;
    var maxWeightAngle;
    var movingTowards = false;

    var monstersInRadius = getMonstersInRadius();

    var avoidRanges = getAnglesToAvoid(monstersInRadius);
    var inAttackRange = isInAttackRange(monstersInRadius);
    if (!noGoal) {
        var desiredMoveAngle = angleToPoint(character, goal.x, goal.y);



        var movingTowards = angleIntersectsMonsters(avoidRanges, desiredMoveAngle);

        var distanceToDesired = distanceToPoint(character.real_x, character.real_y, goal.x, goal.y);

        var testMovePos = pointOnAngle(character, desiredMoveAngle, distanceToDesired);

        if (drawDebug) {
            draw_line(character.real_x, character.real_y, testMovePos.x, testMovePos.y, 3, 0xDFDC22);
        }
    }


    //If we can't just directly walk to the goal without being in danger, we have to try to avoid it
    if (inAttackRange || movingTowards || (!noGoal && !defineCanMoveToOurWay(goal.x, goal.y, boundaryOur))) {
        //Loop through the full 360 degrees (2PI Radians) around the character
        //We'll test each point and see which way is the safest to  go
        for (i = 0; i < Math.PI * 2; i += Math.PI / 60) {
            var weight = 0;

            var position = pointOnAngle(character, i, 75);

            //Exclude any directions we cannot move to (walls and whatnot)
            if (defineCanMoveToOurWay(position.x, position.y, boundaryOur)) {

                //If a direction takes us away from a monster that we're too close to, apply some pressure to that direction to make it preferred
                var rangeWeight = 0;
                var inRange = false;
                for (id in monstersInRadius) {
                    var entity = monstersInRadius[id];
                    var monsterRange = getRange(entity);

                    var distToMonster = distanceToPoint(position.x, position.y, entity.real_x, entity.real_y);

                    var charDistToMonster = distanceToPoint(character.real_x, character.real_y, entity.real_x, entity.real_y);

                    if (charDistToMonster < monsterRange) {
                        inRange = true;
                    }

                    if (charDistToMonster < monsterRange && distToMonster > charDistToMonster) {
                        rangeWeight += distToMonster - charDistToMonster;
                    }

                }

                if (inRange) {
                    weight = rangeWeight;
                }

                //Determine if this direction would cause is to walk towards a monster's radius
                var intersectsRadius = angleIntersectsMonsters(avoidRanges, i);

                //Apply some selective pressure to this direction based on whether it takes us closer or further from our intended goal
                if (goal != null && goal.x != null && goal.y != null) {
                    var tarDistToPoint = distanceToPoint(position.x, position.y, goal.x, goal.y);

                    weight -= tarDistToPoint / 10;
                }

                //Exclude any directions which would make us walk towards a monster's radius
                if (intersectsRadius === false) {
                    //Update the current max weight direction if this one is better than the others we've tested
                    if (maxWeight == null || weight > maxWeight) {
                        maxWeight = weight;
                        maxWeightAngle = i;
                    }
                }
            }
        }

        //Move towards the direction which has been calculated to be the least dangerous
        var movePoint = pointOnAngle(character, maxWeightAngle, 25);

        if (lastMove == null || new Date() - lastMove > 100) {
            lastMove = new Date();
            move(movePoint.x, movePoint.y);
        }

        if (drawDebug) {
            draw_line(character.real_x, character.real_y, movePoint.x, movePoint.y, 2, 0xF20D0D);
            //draw_circle(character.x,character.y,character.range,2);
        }

        return true;
    }
    else {
        return false;
    }

}

function getRange(entity) {
    var monsterRange;

    if (entity.type != "character" && entity.type != "npc") {
        //console.log(entity.mtype)
        monsterRange = parent.G.monsters[entity.mtype].range + rangeBuffer;
    }
    else {
        if (avoidPlayersWhitelist.includes(entity.id) && avoidPlayersWhitelistRange != null) {
            monsterRange = avoidPlayersWhitelistRange;
        }
        else if (playerRangeOverride != null) {
            monsterRange = playerRangeOverride + playerBuffer;
        }
        else {
            monsterRange = entity.range + playerBuffer;
        }
    }

    return monsterRange;
}

function isInAttackRange(monstersInRadius) {
    for (id in monstersInRadius) {
        var monster = monstersInRadius[id];
        var monsterRange = getRange(monster);

        var charDistToMonster = distanceToPoint(character.real_x, character.real_y, monster.real_x, monster.real_y);

        if (charDistToMonster < monsterRange) {
            return true;
        }
    }

    return false;
}

function angleIntersectsMonsters(avoidRanges, angle) {
    for (id in avoidRanges) {
        var range = avoidRanges[id];

        var between = isBetween(range[1], range[0], angle);



        if (between) {
            return true;
        }
    }

    return false;
}

function getAnglesToAvoid(monstersInRadius) {
    var avoidRanges = [];

    if (monstersInRadius.length > 0) {
        for (id in monstersInRadius) {
            var monster = monstersInRadius[id];

            var monsterRange = getRange(monster);

            var tangents = findTangents({ x: character.real_x, y: character.real_y }, { x: monster.real_x, y: monster.real_y, radius: monsterRange });

            //Tangents won't be found if we're within the radius
            if (!isNaN(tangents[0].x)) {
                var angle1 = angleToPoint(character, tangents[0].x, tangents[0].y);
                var angle2 = angleToPoint(character, tangents[1].x, tangents[1].y);

                if (angle1 < angle2) {
                    avoidRanges.push([angle1, angle2]);
                }
                else {
                    avoidRanges.push([angle2, angle1]);
                }
                if (drawDebug) {
                    draw_line(character.real_x, character.real_y, tangents[0].x, tangents[0].y, 1, 0x17F20D);
                    draw_line(character.real_x, character.real_y, tangents[1].x, tangents[1].y, 1, 0x17F20D);
                }
            }

            if (drawDebug) {
                draw_circle(monster.real_x, monster.real_y, monsterRange, 1, 0x17F20D);
            }
        }
    }

    return avoidRanges;
}

function getMonstersInRadius() {
    var monstersInRadius = [];

    for (id in parent.entities) {
        var entity = parent.entities[id];
        var distanceToEntity = distanceToPoint(entity.real_x, entity.real_y, character.real_x, character.real_y);

        var range = getRange(entity);

        if (entity.type === "monster" && avoidTypes.includes(entity.mtype)) {

            var monsterRange = getRange(entity);

            if (distanceToEntity < calcRadius) {
                monstersInRadius.push(entity);
            }
        }
        else {
            if (avoidPlayers && entity.type === "character" && !entity.npc && !playerAvoidIgnoreClasses.includes(entity.ctype)) {
                if (!avoidPlayersWhitelist.includes(entity.id) || avoidPlayersWhitelistRange != null) {
                    if (distanceToEntity < calcRadius || distanceToEntity < range)
                        monstersInRadius.push(entity);
                }
            }
        }
    }

    return monstersInRadius;
}


function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

//Source: https://stackoverflow.com/questions/11406189/determine-if-angle-lies-between-2-other-angles
function isBetween(angle1, angle2, target) {
    if (angle1 <= angle2) {
        if (angle2 - angle1 <= Math.PI) {
            return angle1 <= target && target <= angle2;
        } else {
            return angle2 <= target || target <= angle1;
        }
    } else {
        if (angle1 - angle2 <= Math.PI) {
            return angle2 <= target && target <= angle1;
        } else {
            return angle1 <= target || target <= angle2;
        }
    }
}

//Source: https://stackoverflow.com/questions/1351746/find-a-tangent-point-on-circle
function findTangents(point, circle) {
    var dx = circle.x - point.x;
    var dy = circle.y - point.y;
    var dd = Math.sqrt(dx * dx + dy * dy);
    var a = Math.asin(circle.radius / dd);
    var b = Math.atan2(dy, dx);

    var t = b - a;

    var ta = { x: circle.x + (circle.radius * Math.sin(t)), y: circle.y + (circle.radius * -Math.cos(t)) };

    t = b + a;
    var tb = { x: circle.x + circle.radius * -Math.sin(t), y: circle.y + circle.radius * Math.cos(t) }



    return [ta, tb];
}

function offsetToPoint(x, y) {
    var angle = angleToPoint(x, y) + Math.PI / 2;

    return angle - characterAngle();

}

function pointOnAngle(entity, angle, distance) {
    var circX = entity.real_x + (distance * Math.cos(angle));
    var circY = entity.real_y + (distance * Math.sin(angle));

    return { x: circX, y: circY };
}

function entityAngle(entity) {
    return (entity.angle * Math.PI) / 180;
}

function angleToPoint(entity, x, y) {
    var deltaX = entity.real_x - x;
    var deltaY = entity.real_y - y;

    return Math.atan2(deltaY, deltaX) + Math.PI;
}

function characterAngle() {
    return (character.angle * Math.PI) / 180;
}

function distanceToPoint(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function defineCanMoveToOurWay(x, y, boundary) {
    const upperLeftCorner = { x: boundary[0], y: boundary[1] };
    const bottomRightCorner = { x: boundary[2], y: boundary[3] };
    let result;
    if ((x < upperLeftCorner.x || x > bottomRightCorner.x) || (y < upperLeftCorner.y || y > bottomRightCorner.y)) {
        result = false;
    }
    else {
        result = true;
    }
    return result;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
function clearInventory() {
    if (character.gold > 5000000) {
        send_gold('CrownsAnal', character.gold - 5000000);
    }

    let lootMule = get_player("CrownsAnal");

    if (!lootMule) {
        //game_log("Nobody to transfer to");
        lootMule = get_player("CrownMerch")
        if (!lootMule) {
            loot_transfer = false;
            return;
        }
    }

    // Add locked and sealed properties to the exclusion list
    let itemsToExclude = ["hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "elixirluck", "xptome", "essenceoflife"];

    for (let i = 0; i < 42; i++) {
        const item = character.items[i];

        // Check if the item is not in the exclusion list, and doesn't have locked or sealed properties
        if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
            send_item(lootMule.id, i, item.q ?? 1);
        }
    }
}
setInterval(clearInventory, 1000);

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

// Utility Function to Check if a Set Is Equipped
function isSetEquipped(setName) {
    const set = equipmentSets[setName];
    if (!set) return false;

    return set.every(item =>
        character.slots[item.slot]?.name === item.itemName &&
        character.slots[item.slot]?.level === item.level
    );
}

// Shared state to manage activities
let currentState = "idle"; // Can be "idle", "looting", or "boss"
let lastLoot = null;
let setSwapTime = 0;
const swapCooldown = 500;

// Constants
const chestThreshold = 12;
const settings = {
    delay: 25,
    bossHpThreshold: 50000,
    bosses: ["grinch"],
};

// Determine which set to equip
let targetSet = "maxLuck";

// Helper function to set gear
function equipSet(setName) {
    if (!isSetEquipped(setName)) {
        equipSet(setName);
        console.log(`Equipping ${setName} set`);
    }
}

// Function to manage boss fighting
function handleBosses() {
    if (currentState !== "idle" && currentState !== "boss") return;

    const now = Date.now();
    let bossMonster = null;
    for (let bossType of settings.bosses) {
        bossMonster = get_nearest_monster_v2({ type: bossType });
        if (bossMonster) break;
    }

    if (bossMonster) {
        currentState = "boss";
        targetSet = bossMonster.hp < settings.bossHpThreshold ? "maxLuck" : "dps";
    } else {
        currentState = "idle";
        targetSet = "maxLuck";
    }

    if (now - setSwapTime > swapCooldown) {
        equipSet(targetSet);
        setSwapTime = now;
    }
}

// Function to manage boss fighting
function handleLooting() {
    if (currentState !== "looting") return;

    // Step 1: Equip gold set and swap boosters
    lastLoot = Date.now();
    equipSet("gold"); // Equip gold set
    let slot = locate_item("luckbooster"); // Find luck booster
    if (slot !== -1) {
        shift(slot, "goldbooster"); // Swap to gold booster
    }

    // Step 2: Loot chests after delay
    setTimeout(() => {
        let looted = 0;
        for (let id in get_chests()) {
            if (looted >= chestThreshold) break;
            parent.open_chest(id);
            console.log("Looting chests with " + character.goldm + " goldm");
            looted++;
        }

        // Step 3: Return to the appropriate target set
        currentState = "idle";
        equipSet(targetSet); // Return to the original set
        let luckSlot = locate_item("goldbooster"); // Find gold booster
        if (luckSlot !== -1) {
            shift(luckSlot, "luckbooster"); // Swap back to luck booster
        }
    }, 500); // Increased delay to ensure equipment changes are applied
}

// Main loop to coordinate activities
setInterval(() => {
    // Handle looting if chests are ready and character is not in combat
    if (currentState === "idle" && getNumChests() >= chestThreshold && character.targets < 7) {
        currentState = "looting";
        handleLooting();
    }

    // Handle bosses if no looting is ongoing
    if (currentState !== "looting") {
        handleBosses();
    }
}, settings.delay);

// Function to count the number of available chests
function getNumChests() {
    return Object.keys(get_chests()).length;
}

function on_cm(name, data) {
    if (name == "CrownsAnal") {
        if (data.message == "location") {
            respawn();
            smart_move({ x: data.x, y: data.y, map: data.map });
            game_log("Repsawning & Moving");
        }
    }
}

let moveStuff = {
    tracker: 0,
    computer: 1,
    hpot1: 2,
    mpot1: 3,
    luckbooster: 4,
    elixirluck: 5,
    xptome: 6,
    //lmace: 19,
    //mshield: 18,
    //pinkie: 29,
};
function inventorySorter() {
    for (let i = 0; i < 42; i++) {
        let item = character.items[i];
        if (item && item.name in moveStuff) {
            let filterOrIndex = moveStuff[item.name];
            if (typeof filterOrIndex == "number") {
                if (i != moveStuff[item.name]) {
                    parent.socket.emit("imove", {
                        a: i,
                        b: moveStuff[item.name]
                    });
                }
            } else {
                let targetLevel = filterOrIndex[0];
                if (item.level == targetLevel) {
                    for (let j = 1; j < filterOrIndex.length; j++) {
                        if (i == filterOrIndex[j]) {
                            break;
                        }
                        if (character.items[filterOrIndex[j]] == null) {
                            let temp = character.items[filterOrIndex[j]];
                            character.items[filterOrIndex[j]] = character.items[i];
                            character.items[i] = temp;
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
}
setInterval(inventorySorter, 250);

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
    priest: { skin: "tm_white", skinRing: { name: "tristone", level: 0, locked: "l" }, normalRing: { name: "ringofluck", level: 2, locked: "u" } },
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

function equipSet(setName) {
    const set = equipmentSets[setName];
    if (set) {
        equipBatch(set);
    } else {
        console.error(`Set "${setName}" not found.`);
    }
}

function lowest_health_partymember() {
    let party_mems = Object.keys(parent.party).filter(e => parent.entities[e] && !parent.entities[e].rip);
    let the_party = [];

    for (let key of party_mems)
        the_party.push(parent.entities[key]);

    the_party.push(character);

    // Search for fieldgen0 and add it to the array if it exists and its health is below 60%
    let fieldgen0 = get_nearest_monster({ type: "fieldgen0" });
    if (fieldgen0 && (fieldgen0.hp / fieldgen0.max_hp) <= 0.6) {
        the_party.push(fieldgen0);
    }

    // Populate health percentages
    let res = the_party.sort(function (a, b) {
        let a_rat = a.hp / a.max_hp;
        let b_rat = b.hp / b.max_hp;
        return a_rat - b_rat;
    });

    return res[0];
}

function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) - character.ping;
    return ms < 0 ? 0 : ms;
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
    let optimal_hp = args.check_max_hp ? 0 : 999999999; // Set initial optimal HP based on whether we're checking for max or min HP

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_level !== undefined && current.level < args.min_level) continue;
        if (args.max_level !== undefined && current.level > args.max_level) continue;
        if (args.target && !args.target.includes(current.target)) continue;
        if (args.no_target && current.target && current.target != character.name) continue;

        // Status effects (debuffs/buffs) check
        if (args.statusEffects && !args.statusEffects.every(effect => current.s[effect])) continue;

        // Min/max XP check
        if (args.min_xp !== undefined && current.xp < args.min_xp) continue;
        if (args.max_xp !== undefined && current.xp > args.max_xp) continue;

        // Attack power limit
        if (args.max_att !== undefined && current.attack > args.max_att) continue;

        // Path check
        if (args.path_check && !can_move_to(current)) continue;

        // Distance calculation
        let c_dist = args.point_for_distance_check
            ? Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y)
            : parent.distance(character, current);

        if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

        // Generalized HP check (min or max)
        if (args.check_min_hp || args.check_max_hp) {
            let c_hp = current.hp;
            if ((args.check_min_hp && c_hp < optimal_hp) || (args.check_max_hp && c_hp > optimal_hp)) {
                optimal_hp = c_hp;
                target = current;
            }
            continue;
        }

        // If no specific HP check, choose the closest monster
        if (c_dist < min_d) {
            min_d = c_dist;
            target = current;
        }
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
    let delay = null; // Shorter delay to handle frequent checks

    try {
        const currentTime = Date.now();

        // Use MP potion if needed
        if (character.mp <= mpThreshold && !is_on_cooldown('use_mp') && item_quantity("mpot1") > 0 && currentTime - lastPotion > potionCooldown) {
            await use('use_mp');
            delay = ms_to_next_skill('use_mp');
            lastPotion = currentTime;
        }

        // Use HP potion if needed
        if (character.hp <= hpThreshold && !is_on_cooldown('use_hp') && item_quantity("hpot1") > 0 && currentTime - lastPotion > potionCooldown) {
            await use('use_hp');
            delay = ms_to_next_skill('use_hp');
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

//let group = ["Mommy", "CrownsAnal", "CrownTown", "CrownPriest", "CrownMerch", "CrownMage"];
//let group = ["earthWar", "CrownsAnal", "CrownTown", "CrownPriest"];
let group = ["CrownsAnal", "CrownTown", "CrownPriest"];

function partyMaker() {
    let partyLead = get_entity(group[0]); // The first character in the group is the leader
    let currentParty = character.party; // Get the current party details
    let healer = get_entity("CrownPriest");
    // If you're the leader and party size is less than 3, invite group members
    if (character.name === group[0]) {
        console.log("Party leader inviting members.");
        for (let i = 1; i < group.length; i++) {
            let name = group[i];
            send_party_invite(name);
        }
    } else {
        // If you're in a party that's not led by the group leader, leave it
        if (currentParty && currentParty !== group[0] && healer) {
            console.log(`In a party with ${currentParty}, but leader should be ${group[0]}. Leaving party.`);
            leave_party();
        }

        // If not in a party and the leader exists, send a party request
        if (!currentParty && partyLead) {
            console.log(`Requesting to join ${group[0]}'s party.`);
            send_cm(group[0], "party");
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

function sendUpdates() {
    parent.socket.emit("send_updates", {})
}
setInterval(sendUpdates, 20000);

if (parent.prev_handlersranger) {
    for (let [event, handler] of parent.prev_handlersranger) {
        parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersranger = [];

function register_rangerhandler(event, handler) {
    parent.prev_handlersranger.push([event, handler]);
    parent.socket.on(event, handler);
}

let ratKills = 0;
let ratKillStart = new Date();

function killHandler(data) {
    if (typeof data == "string" && data.includes("killed")) {
        ratKills++;
        let elapsed = (new Date() - ratKillStart) / 1000;
        let killsPerSec = ratKills / elapsed;
        let dailyKillRate = Math.round(killsPerSec * 60 * 60);
        set_message(dailyKillRate.toLocaleString() + ' kph');
    }
}

register_rangerhandler("game_log", killHandler);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function modify_parent_function() {
    const change_parent_function = function () {
        this.render_tracker = function () {
            //...
            var a = "";
            a += "<div style='font-size: 32px'>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerm\").show();'>Monsters</div>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackere\").show();'>Exchanges and Quests</div>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerx\").show();'>Stats</div>";
            a += "</div>";
            a += "<div class='trackers trackerm'>";
            object_sort(G.monsters, "hpsort").forEach(function (b) {
                if ((!b[1].stationary && !b[1].cute || b[1].achievements) && !b[1].unlist) {
                    var c = (tracker.monsters[b[0]] || 0) + (tracker.monsters_diff[b[0]] || 0), d = "#50ADDD";

                    let borderColor = "#9F9FB0";

                    tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] > c && (c = tracker.max.monsters[b[0]][0], d = "#DCC343");
                    if ((tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] && tracker.max.monsters[b[0]][0]) && (b[1] && b[1].achievements)) {
                        if (tracker.max.monsters[b[0]][0] >= b[1].achievements[b[1].achievements.length - 1][0]) {
                            borderColor = "#22c725";
                        }
                    }

                    a += "<div style='background-color:#575983; border: 2px solid" + borderColor + ";position: relative; display: inline-block; margin: 2px; /*" + b[0] + "*/' class='clickable' onclick='pcs(event); render_monster_info(\"" + b[0] + "\")'>";

                    a = 1 > (G.monsters[b[0]].size || 1) ? a + sprite(b[1].skin || b[0], {
                        scale: 1
                    }) : a + sprite(b[1].skin || b[0], {
                        scale: 1.5
                    });
                    c && (a += "<div style='background-color:#575983; border: 2px solid " + borderColor + "; position: absolute; top: -2px; left: -2px; color:" + d + "; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(c) + "</div>");
                    tracker.drops && tracker.drops[b[0]] && tracker.drops[b[0]].length && (a += "<div style='background-color:#FD79B0; border: 2px solid " + borderColor + "; position: absolute; bottom: -2px; right: -2px; display: inline-block; padding: 1px 1px 1px 1px; height: 2px; width: 2px'></div>");
                    a += "</div>"
                }
            });
            a += "</div>";
            a += "<div class='trackers trackere hidden' style='margin-top: 3px'>";
            object_sort(G.items).forEach(function (b) {

                if (b[1].e && !b[1].ignore) {
                    var c = [[b[0], b[0], void 0]];
                    if (b[1].upgrade || b[1].compound) {
                        c = [];
                        for (var d = 0; 13 > d; d++)
                            G.drops[b[0] + d] && c.push([b[0], b[0] + d, d])
                    }

                    c.forEach(function (b) {
                        a += "<div style='margin-right: 3px; margin-bottom: 3px; display: inline-block; position: relative;'";
                        a = G.drops[b[1]] ? a + (" class='clickable' onclick='pcs(event); render_exchange_info(\"" + b[1] + '",' + (tracker.exchanges[b[1]] || 0) + ")'>") : a + ">";
                        a += item_container({
                            skin: G.items[b[0]].skin
                        }, {
                            name: b[0],
                            level: b[2]
                        });
                        tracker.exchanges[b[1]] && (a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#ED901C; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(tracker.exchanges[b[1]]) + "</div>");
                        a += "</div>"
                    })
                }
            });
            a += "</div>";

            const kills = parent.tracker.max.monsters;

            const achievements = {};

            for (const mtype in kills) {
                if (!(mtype in G.monsters) || !G.monsters[mtype].achievements) continue;

                const kill_count = kills[mtype][0];

                for (const achievement of G.monsters[mtype].achievements) {
                    const needed = achievement[0];
                    const type = achievement[1];
                    const reward = achievement[2];
                    const amount = achievement[3];
                    if (kill_count < needed) {
                        if (type !== "stat") continue;

                        if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0 }
                        achievements[reward].value += 0;
                        achievements[reward].maxvalue += amount;
                    }
                    else {
                        if (type !== "stat") continue;
                        if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0 }
                        achievements[reward].value += amount;
                        achievements[reward].maxvalue += amount;
                    }

                }
            }
            let k = achievements;
            a += "<div class='trackers trackerx hidden' style='margin-top: 3px'>";
            a += "<div style='font-size: 32px'>";
            for (const ac in k) {
                a += "<div style='background-color:#575983; border: 2px solid #9F9FB0;position: relative; display: inline-block; margin: 2px; padding: 2px;'>" + `${ac}:${k[ac].value.toFixed(2)} of ${k[ac].maxvalue.toFixed(2)}` + "</div>";
            }
            a += "</div>"
            a += "</div>";
            a += "</div>";

            show_modal(a, {
                wwidth: 578,
                hideinbackground: !0
            })

            //...
        }
        ///
        this.render_drop = function (a, b, c) {
            //...
            var d = "";
            if ("open" == a[1]) {
                var e = 0;
                G.drops[a[2]].forEach(function (a) {
                    e += a[0]
                });
                G.drops[a[2]].forEach(function (g) {
                    d += render_drop(g, b * a[0] / e, c)
                });
                return d
            }
            d += "<div style='position: relative; white-space: nowrap;'>";
            var f = ""
                , g = void 0;
            G.items[a[1]] ? (f = G.items[a[1]].skin,
                g = {
                    name: a[1],
                    q: a[2],
                    data: a[3]
                }) : "empty" == a[1] ? d += "<div style='z-index: 1; background-color:#575983; border: 200px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#C5C7E0; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>ZILCH</div>" : "shells" == a[1] ? (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#8DE33B; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>",
                    f = "shells") : "gold" == a[1] && (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:gold; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>",
                        f = "gold");
            "cx" == a[1] ? d += cx_sprite(a[2], {
                mright: 4
            }) : "cxbundle" == a[1] ? G.cosmetics.bundle[a[2]].forEach(function (a) {
                d += cx_sprite(a, {
                    mright: 4
                })
            }) : d += "<span class='clickable' onclick='pcs(event); render_item_info(\"" + a[1] + '",0,"' + (g && g.data || "") + "\")'>" + item_container({
                skin: f
            }, g) + "</span>";
            d = 1 <= round(a[0] * b) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>" + to_pretty_num(round(a[0] * b)) + " / 1</div>") : 1.1 <= 1 / (a[0] * b) && 10 > 1 / (a[0] * b) && 10 * parseInt(1 / (a[0] * b)) != parseInt(10 / (a[0] * b)) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>10 / " + to_pretty_num(round(10 / (a[0] * b))) + "</div>") : d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>1 / " + to_pretty_num(round(1 / ((a[0] * b) * parent.character.luckm))) + "</div>");
            return d += "</div>"

            //...
        }
    }
    // Eval the function string to have to defined in parent scope
    const full_function_text = change_parent_function.toString();
    parent.smart_eval(full_function_text.slice(full_function_text.indexOf("{") + 1, full_function_text.lastIndexOf("}")));
}
modify_parent_function();
//////////////////////////////////////////////
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
// All currently supported damageTypes: "Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF" "DPS"
// The order of the array will be the order of the display
const damageTypes = ["Base", "Blast", "HPS", "DPS"];
let displayClassTypeColors = true; // Set to false to disable class type colors
let displayDamageTypeColors = true; // Set to false to disable damage type colors
let showOverheal = true; // Set to true to show overhealing
let showOverManasteal = true; // Set to true to show overMana'ing?

const damageTypeColors = {
    Base: '#A92000',
    HPS: '#9A1D27',
    Blast: '#782D33',
    Burn: '#FF7F27',
    MPS: '#353C9C',
    DR: '#E94959',
    RF: '#D880F0',
};

// Initialize the DPS meter
function initDPSMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing DPS meter
    brc.find('#dpsmeter').remove();

    // Create a container for the DPS meter
    let dpsmeter_container = $('<div id="dpsmeter"></div>').css({
        //position: 'relative',
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });

    // Create a div for the DPS meter content
    let dpsmeter_content = $('<div id="dpsmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0)',
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
let dreturn = 0;
let reflect = 0;
let METER_START = performance.now();

// Damage tracking object for party members
let partyDamageSums = {};
let playerDamageReturns = {}; // Initialize playerDamageReturns
let playerDamageReflects = {}; // Initialize playerDamageReflects

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
            let player = get_entity(targetId);
            let maxHealth = player.max_hp;
            let currentHealth = player.hp;
            let maxMana = player.max_mp;
            let currentMana = player.mp;

            if (parent.party_list && parent.party_list.includes(targetId)) {
                let entry = partyDamageSums[targetId] ?? {
                    startTime: performance.now(),
                    sumDamage: 0,
                    sumHeal: 0,
                    sumBurnDamage: 0,
                    sumBlastDamage: 0,
                    sumBaseDamage: 0,
                    sumLifesteal: 0,
                    sumManaSteal: 0,
                    sumDamageReturn: 0,
                    sumReflection: 0,
                };

                // Calculate actual heal and lifesteal
                let actualHeal = (data.heal ?? 0) + (data.lifesteal ?? 0);

                // Add healing and lifesteal based on the toggle for showing overheal
                if (showOverheal) {
                    entry.sumHeal += actualHeal; // Include all heal and lifesteal
                } else {
                    entry.sumHeal += Math.min(actualHeal, maxHealth - currentHealth); // Only actual healing
                }

                // Handle mana steal based on the toggle for showing overmana steal
                if (showOverManasteal) {
                    entry.sumManaSteal += data.manasteal ?? 0; // Include all manasteal
                } else {
                    entry.sumManaSteal += Math.min(data.manasteal ?? 0, maxMana - currentMana); // Only actual manasteal
                }

                // Accumulate damage values
                entry.sumDamage += data.damage ?? 0;

                if (data.source === "burn") {
                    entry.sumBurnDamage += data.damage;
                } else if (data.splash) {
                    entry.sumBlastDamage += data.damage;
                } else {
                    entry.sumBaseDamage += data.damage ?? 0;
                }

                // Update partyDamageSums with the entry
                partyDamageSums[targetId] = entry;
            }

            // Handle damage return
            if (data.dreturn) {
                let playerId = data.id;

                if (!playerDamageReturns[playerId]) {
                    playerDamageReturns[playerId] = {
                        startTime: performance.now(),
                        sumDamageReturn: 0,
                    };
                }

                let playerEntry = playerDamageReturns[playerId];
                playerEntry.sumDamageReturn += data.dreturn ?? 0;

                // Update the partyDamageSums for damage return
                if (parent.party_list && parent.party_list.includes(playerId)) {
                    let partyEntry = partyDamageSums[playerId] ?? {
                        startTime: performance.now(),
                        sumDamage: 0,
                        sumHeal: 0,
                        sumBurnDamage: 0,
                        sumBlastDamage: 0,
                        sumBaseDamage: 0,
                        sumLifesteal: 0,
                        sumManaSteal: 0,
                        sumDamageReturn: 0,
                        sumReflection: 0,
                    };
                    partyEntry.sumDamageReturn += data.dreturn ?? 0; // Add dreturn to party damage sums
                    partyDamageSums[playerId] = partyEntry; // Update the partyDamageSums
                }
            }
            // Handle reflection damage
            if (data.reflect) {
                console.log(`Reflection event: Target = ${data.target}, Reflect Damage = ${data.reflect}`);
                let playerId = data.id;

                // Initialize playerDamageReflects entry for the player if it doesn't exist
                if (!playerDamageReflects[playerId]) {
                    playerDamageReflects[playerId] = {
                        startTime: performance.now(),
                        sumReflection: 0,
                    };
                }

                // Update reflection damage in playerDamageReflects
                let playerEntry = playerDamageReflects[playerId];
                playerEntry.sumReflection += data.reflect ?? 0;

                // Update partyDamageSums for reflection damage
                if (parent.party_list && parent.party_list.includes(playerId)) {
                    let partyEntry = partyDamageSums[playerId] ?? {
                        startTime: performance.now(),
                        sumDamage: 0,
                        sumHeal: 0,
                        sumBurnDamage: 0,
                        sumBlastDamage: 0,
                        sumBaseDamage: 0,
                        sumLifesteal: 0,
                        sumManaSteal: 0,
                        sumDamageReturn: 0,
                        sumReflection: 0,
                    };

                    partyEntry.sumReflection += data.reflect ?? 0; // Add reflect to party damage sums
                    partyDamageSums[playerId] = partyEntry; // Update the partyDamageSums
                }
            }
        }
    } catch (error) {
        console.error('Error in hit event handler:', error);
    }
});

// Function to calculate the elapsed time in hours and minutes
function getElapsedTime() {
    let elapsedMs = performance.now() - METER_START;
    let elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    let elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${elapsedHours}h ${elapsedMinutes}m`;
}

// Update the DPS meter UI
function updateDPSMeterUI() {
    try {
        let elapsed = performance.now() - METER_START;

        // Initialize damage variables
        let dps = Math.floor((damage * 1000) / elapsed);
        let burnDps = Math.floor((burnDamage * 1000) / elapsed);
        let blastDps = Math.floor((blastDamage * 1000) / elapsed);
        let baseDps = Math.floor((baseDamage * 1000) / elapsed);
        let hps = Math.floor((baseHeal * 1000) / elapsed);
        let mps = Math.floor((manasteal * 1000) / elapsed);
        let dr = Math.floor((dreturn * 1000) / elapsed);
        let RF = Math.floor((reflect * 1000) / elapsed);

        let $ = parent.$;
        let dpsDisplay = $('#dpsmetercontent');

        if (dpsDisplay.length === 0) return;

        let elapsedTime = getElapsedTime();

        let listString = `<div>👑 Elapsed Time: ${elapsedTime} 👑</div>`;
        listString += '<table border="1" style="width:100%">';

        // Header row
        listString += '<tr><th></th>';
        for (const type of damageTypes) {
            const color = displayDamageTypeColors ? (damageTypeColors[type] || 'white') : 'white'; // Use color if enabled
            listString += `<th style="color: ${color};">${type}</th>`;
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

        // Define a color mapping for player classes
        const classColors = {
            mage: '#3FC7EB',
            paladin: '#F48CBA',
            priest: '#FFFFFF', // White
            ranger: '#AAD372',
            rogue: '#FFF468',
            warrior: '#C69B6D'
        };

        // Player rows
        for (let { id, entry } of sortedPlayers) {
            const player = get_player(id);
            if (player) {
                listString += '<tr>';
                // Get the player's class type and corresponding color
                const playerClass = player.ctype.toLowerCase(); // Ensure class type is in lowercase
                const nameColor = displayClassTypeColors ? (classColors[playerClass] || '#FFFFFF') : '#FFFFFF'; // Use color if enabled

                // Apply color to the player's name
                listString += `<td style="color: ${nameColor};">${player.name}</td>`;

                for (const type of damageTypes) {
                    // Directly fetch value for each type from entry
                    let value = getTypeValue(type, entry);
                    listString += `<td>${getFormattedDPS(value)}</td>`; // No color for values
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
            listString += `<td>${getFormattedDPS(totalDPS)}</td>`; // No color for total values
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

    // Ensure elapsedTime is greater than 0 to prevent division by zero
    if (elapsedTime > 0) {
        switch (type) {
            case "DPS":
                return calculateDPSForPartyMember(entry);
            case "Burn":
                return Math.floor((entry.sumBurnDamage * 1000) / elapsedTime) || 0;
            case "Blast":
                return Math.floor((entry.sumBlastDamage * 1000) / elapsedTime) || 0;
            case "Base":
                return Math.floor((entry.sumBaseDamage * 1000) / elapsedTime) || 0;
            case "HPS":
                return Math.floor((entry.sumHeal * 1000) / elapsedTime) || 0;
            case "MPS":
                return Math.floor((entry.sumManaSteal * 1000) / elapsedTime) || 0;
            case "DR":
                return Math.floor((entry.sumDamageReturn * 1000) / elapsedTime) || 0;
            case "RF":
                return Math.floor((entry.sumReflection * 1000) / elapsedTime) || 0;
            default:
                return 0;
        }
    } else {
        return 0; // If elapsedTime is 0 or less, return 0 for safety
    }
}

// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = performance.now() - (entry.startTime || performance.now());
        const totalDamage = entry.sumDamage || 0;
        const totalDamageReturn = entry.sumDamageReturn || 0;
        const totalReflection = entry.sumReflection || 0; // Include reflection damage
        const totalCombinedDamage = totalDamage + totalDamageReturn + totalReflection; // Combine for DPS calculation

        // Prevent division by zero
        if (elapsedTime > 0) {
            return Math.floor((totalCombinedDamage * 1000) / elapsedTime);
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error calculating DPS for party member:', error);
        return 0;
    }
}

// Initialize the DPS meter and set up the update interval
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
