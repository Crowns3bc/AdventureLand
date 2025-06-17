pause();
// Define constants for character names
const chars = {
    //MAGE: "CrownMage",
    MERCHANT: "CrownMerch",
    //PALADIN: "CrownPal",
    PRIEST: "CrownPriest",
    //ROGUE: "CrownZone",
    WARRIOR1: "CrownTown",
    //WARRIOR2: "CrownCity",
};

// Define starting levels
const codeSlots = {
    //MAGE: 28,
    MERCHANT: 95,
    //PALADIN: 18,
    PRIEST: 3,
    //ROGUE: 18,
    WARRIOR1: 2,
    //WARRIOR2: 2,
};
true
let startChar = true;

function teamStarter() {
    // Cache active characters
    const activeCharacters = get_active_characters();

    if (startChar) {
        // Start characters if they are not active
        for (const [key, value] of Object.entries(chars)) {
            if (!activeCharacters[value]) {
                start_character(value, codeSlots[key]);
            }
        }
    }
}

// Adjust the interval based on your needs
setInterval(teamStarter, 5000);

const locations = {
    bat: [{ x: 1200, y: -782 }],
    bbpompom: [{ x: -82, y: -949 }],
    bigbird: [{ x: 1300, y: -69 }],
    bluefairy: [{ x: -357, y: -675 }],
    boar: [{ x: 19, y: -1109 }],
    bscorpion: [{ x: -616, y: -1279 }],
    cgoo: [{ x: -221, y: -274 }],
    crab: [{ x: -11840, y: -37 }],
    dryad: [{ x: 403, y: -347 }],
    ent: [{ x: -420, y: -1960 }],
    fireroamer: [{ x: 222, y: -827 }],
    ghost: [{ x: -405, y: -1642 }],
    gscorpion: [{ x: 390, y: -1422 }],
    iceroamer: [{ x: 823, y: -45 }],
    mechagnome: [{ x: 0, y: 0 }],
    mole: [{ x: 14, y: -1072 }],
    mummy: [{ x: 256, y: -1417 }],
    odino: [{ x: -52, y: 756 }],
    oneeye: [{ x: -270, y: 160 }],
    pinkgoblin: [{ x: 366, y: 377 }],
    poisio: [{ x: -121, y: 1360 }],
    prat: [{ x: -296, y: 558 }], //[{ x: 6, y: 430 }]
    pppompom: [{ x: 292, y: -189 }],
    plantoid: [{ x: -780, y: -387 }], // [{ x: -840, y: -340 }]
    rat: [{ x: 6, y: 430 }],
    scorpion: [{ x: -495, y: 685 }],
    stoneworm: [{ x: 830, y: 7 }],
    spider: [{ x: 1247, y: -91 }],
    squig: [{ x: -1175, y: 422 }],
    targetron: [{ x: -544, y: -275 }],
    wolf: [{ x: 433, y: -2745 }],
    wolfie: [{ x: 113, y: -2014 }],
    xscorpion: [{ x: -495, y: 685 }]
};

const home = 'targetron';
const mobMap = 'uhills';
const destination = {
    map: mobMap,
    x: locations[home][0].x,
    y: locations[home][0].y
};

let angle = 0;
const speed = 1; // normal 1.5315;
let events = false;

const harpyRespawnTime = 410000; //400 seconds
let harpyActive = false;
const skeletorRespawnTime = 1151954; // Example time, adjust as needed
let skeletorActive = false;
const stompyRespawnTime = 2160000; //400 seconds
let stompyActive = false;
const mvampireRespawnTime = 1151954; // Example time, adjust as needed
let mvampireActive = false;
const fvampireRespawnTime = 1151954; // Example time, adjust as needed
let fvampireActive = false;
const jrRespawnTime = 420000; // Example time, adjust as needed
let jrActive = false;

const boundaryOur = Object.values(G.maps[mobMap].monsters).find(e => e.type === home).boundary;
const [topLeftX, topLeftY, bottomRightX, bottomRightY] = boundaryOur;
const centerX = (topLeftX + bottomRightX) / 2;
const centerY = (topLeftY + bottomRightY) / 2;

async function eventer() {
    const delay = 100;
    try {
        if (events) {
            handleEvents();
            //game_log("Event Time");
        } else if (jrActive) {
            //handleBosses();
            //game_log("Boss Time");
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
            //game_log("Home Time");
        } else if (get_nearest_monster({ type: home })) {
            walkInCircle();
            //game_log("Circle Time");
            //clear_drawings();
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(eventer, delay);
}

async function checkRespawnTimers() {
    let delay = 1000;
    try {/*
		if (Date.now() - harpyDeath >= harpyRespawnTime) {
			harpyActive = true;
			game_log("Harpy Respawned");
		}
		if (Date.now() - skeletorDeath >= skeletorRespawnTime) {
			skeletorActive = true;
			game_log("Skeletor Respawned");
		}
		if (Date.now() - stompyDeath >= stompyRespawnTime) {
			stompyActive = true;
			game_log("Stompy Respawned");
		}*/
        if (Date.now() - jrDeath >= jrRespawnTime) {
            //jrActive = true;
            //game_log("JR Respawned");
        }
        // Repeat for other bosses as needed
    } catch (e) {
        console.error(e);
    }
    setTimeout(checkRespawnTimers, delay);
}
checkRespawnTimers();

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
    if (harpyActive) {
        //handleHarpyEvent();
    }
    if (skeletorActive) {
        //handleSkeletorEvent();
    }
    if (stompyActive) {
        //handleStompyEvent();
    }
    if (jrActive) {
        //handleJrEvent();
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
                    equipSet('dps');
                }
            } else if (character.cc < 100) {
                equipSet('luck');
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
                    equipSet('dps');
                }
            } else if (character.cc < 100) {
                equipSet('luck');
            }
        }
    }
}

function handleHome() {
    if (character.cc < 100) {
        //equipSet('dps');
    }
    if (!smart.moving) {
        smart_move(destination);
        game_log(`Moving to ${home}`);
    }
}

let lastUpdateTime = performance.now();
async function walkInCircle() {
    if (!smart.moving) {
        const center = locations[home][0];
        const radius = 75;

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

        if (!character.moving && lastUpdateTime > 100) {
            await xmove(targetX, targetY);
        }

        drawCirclesAndLines(center, radius);
    }
}

function drawCirclesAndLines(center, radius) {
    clear_drawings();

    draw_circle(center.x, center.y, radius, 3, 0xE8FF00); // ranger path
    draw_circle(center.x, center.y, 35, 3, 0xFF00FB); // warr path
    draw_circle(center.x, center.y, 25, 3, 0xFFFFFF); //priest path
    draw_circle(center.x, center.y, 1, 3, 0x00FF00); // center point
    draw_circle(center.x, center.y, 50, 3, 0x00FF00); //kill zone

    //draw_line(topLeftX, topLeftY, bottomRightX, topLeftY, 2, 0xFF0000);
    //draw_line(bottomRightX, topLeftY, bottomRightX, bottomRightY, 2, 0xFF0000);
    //draw_line(bottomRightX, bottomRightY, topLeftX, bottomRightY, 2, 0xFF0000);
    //draw_line(topLeftX, bottomRightY, topLeftX, topLeftY, 2, 0xFF0000);
    draw_circle(centerX, centerY, 1, 2, 0x00FF00);
    //draw_circle(character.x, character.y, G.skills.zapperzap.range, 2, 0x00C7FF);

    //draw_circle(character.x, character.y, character.range, 2, 0xE8FF00)
    //draw_all_boxes_on_map();
    //draw_circle(264,-804,2,2,0x00FF00)
    //draw_circle(character.x, character.y, 600, 2, 0x000000)
}

function handleHarpyEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 120 || character.y !== -300 || character.map !== "winter_cove") {
            smart_move({ x: 120, y: -300, map: "winter_cove" });
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
            equipSet('luck');
        } else if (harpy.hp > 50000 && character.cc < 100) {
            equipSet('dps');
        }
    }
}

function handleSkeletorEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 270 || character.y !== -571 || character.map !== "arena") {
            smart_move({ x: 270, y: -571, map: "arena" });
            game_log("Moving to Skeletor location");
        }
    }

    const skele = get_nearest_monster({ type: "skeletor" });

    // If the harpy isn't nearby, mark it as dead and reset the death timer
    if (!skele && distance(character, { x: 270, y: -571 }) <= 300 && character.map === 'arena') {
        skeletorDeath = Date.now();
        skeletorActive = false;
        game_log("Skeletor is not here, resetting death time");
        localStorage.setItem('skeletorDeath', skeletorDeath);
    } else if (skele) {
        // Manage gear based on harpy's health
        if (skele.hp < 50000 && character.cc < 100) {
            //equipSet('luck');
        } else if (skele.hp > 50000 && character.cc < 100) {
            equipSet('dps');
        }
    }
}

function handleStompyEvent() {
    // Move to the harpy location if harpyActive is true
    if (!smart.moving) {
        if (character.x !== 423 || character.y !== -2745 || character.map !== "winterland") {
            smart_move({ x: 423, y: -2745, map: "winterland" });
            game_log("Moving to Stompy location");
        }
    }

    const stompy = get_nearest_monster({ type: "stompy" });

    // If the harpy isn't nearby, mark it as dead and reset the death timer
    if (!stompy && distance(character, { x: 423, y: -2745 }) <= 300 && character.map === 'winterland') {
        stompyDeath = Date.now();
        stompyActive = false;
        game_log("Stompy is not here, resetting death time");
        localStorage.setItem('stompyDeath', stompyDeath);
    } else if (stompy) {
        // Manage gear based on harpy's health
        if (stompy.hp < 50000 && character.cc < 100) {
            //equipSet('luck');
        } else if (harpy.hp > 50000 && character.cc < 100) {
            equipSet('dps');
        }
    }
}

function handleJrEvent() {
    // Move to the jr location if jrActive is true
    if (!smart.moving) {
        if (character.x !== -783 || character.y !== -292 || character.map !== "spookytown") {
            smart_move({ x: -783, y: -292, map: "spookytown" });
            game_log("Moving to Jr location");
        }
    }

    const jr = get_nearest_monster({ type: "jr" });

    // If the jr isn't nearby, mark it as dead and reset the death timer
    if (!jr && distance(character, { x: -783, y: -292 }) <= 300 && character.map === 'spookytown') {
        jrDeath = Date.now();
        jrActive = false;
        game_log("JR is not here, resetting death time");
        localStorage.setItem('jrDeath', jrDeath);
    } else if (jr) {
        // Manage gear based on jr's health
        if (jr.hp < 50000 && character.cc < 100) {
            //equipSet('luck');
        } else if (jr.hp > 50000 && character.cc < 100) {
            equipSet('dps');
        }
    }
}

eventer();

let harpyDeath = parseInt(localStorage.getItem('harpyDeath')) || 0;
let skeletorDeath = parseInt(localStorage.getItem('skeletorDeath')) || 0;
let stompyDeath = parseInt(localStorage.getItem('stompyDeath')) || 0;
let jrDeath = parseInt(localStorage.getItem('jrDeath')) || 0;

game.on("death", function (data) {
    const entity = parent.entities[data.id];
    const now = Date.now();

    // === Goldenbot tracker ===
    if (entity && entity.mtype === "goldenbot") {
        const key = "goldenbotDeaths";
        const deathLog = JSON.parse(localStorage.getItem(key) || "[]");
        deathLog.push(now);
        localStorage.setItem(key, JSON.stringify(deathLog));
        game_log(`Goldenbot killed at ${new Date(now).toLocaleString()}`, "#FFD700");
    }

    // === Party member death tracker ===
    const party = get_party();
    const partyMembers = party ? Object.keys(party) : [];
    const isPartyMember = data.id === character.name || partyMembers.includes(data.id);

    if (isPartyMember) {
        const key = "partyDeaths";
        const deathLog = JSON.parse(localStorage.getItem(key) || "[]");
        deathLog.push({ name: data.id, time: now });
        localStorage.setItem(key, JSON.stringify(deathLog));
        game_log(`${data.id} died at ${new Date(now).toLocaleString()}`, "#ff6961");
    }
});

const equipmentSets = {

    dps: [
		{ itemName: "amuletofm", slot: "amulet", level: 0, l: "l" },
        { itemName: "dexearring", slot: "earring2", level: 5, l: "l" },
        { itemName: "dexearring", slot: "earring1", level: 5, l: "l" },
        { itemName: "orbofdex", slot: "orb", level: 5, l: "l" },
        //{ itemName: "test_orb", slot: "orb", level: 0, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 2, l: "l" },
        { itemName: "suckerpunch", slot: "ring2", level: 2, l: "u" },
    ],
    luck: [
        { itemName: "mearring", slot: "earring1", level: 0, l: "l" },
        //{ itemName: "mearring", slot: "earring2", level: 0, l: "u" },
        { itemName: "rabbitsfoot", slot: "orb", level: 2, l: "l" },
        { itemName: "ringofluck", slot: "ring2", level: 0, l: "u" },
        { itemName: "ringofluck", slot: "ring1", level: 0, l: "l" }
    ],
    single: [
        { itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },

    ],
    dead: [
        { itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
        { itemName: "t2quiver", slot: "offhand", level: 9, l: "l" },

    ],
    boom: [
        { itemName: "pouchbow", slot: "mainhand", level: 13, l: "l" },
        { itemName: "alloyquiver", slot: "offhand", level: 9, l: "l" },
    ],
    heal: [
        { itemName: "cupid", slot: "mainhand", level: 9, l: "l" },
    ],
    xp: [
        { itemName: "talkingskull", slot: "orb", level: 4, l: "l" },
        { itemName: "northstar", slot: "amulet", level: 2, l: "l" },
    ],
    stealth: [
        { itemName: "stealthcape", slot: "cape", level: 0, l: "l" },
    ],
    cape: [
        { itemName: "bcape", slot: "cape", level: 8, l: "l" },
    ],
    orb: [
        { itemName: "test_orb", slot: "orb", level: 0, l: "l" },
        //{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" },
    ],
    mana: [
        { itemName: "tshirt9", slot: "chest", level: 7, l: "l" }
    ],
    stat: [
        { itemName: "coat", slot: "chest", level: 12, l: "s" }
    ],
};
//////////////////////////////////////////////////////////////////
let lastSwitchTime = 0, state = "attacking";
const switchCooldown = 750;
const rangeThreshold = 45;
const targetNames = ["CrownTown", "CrownPriest"];
const X = locations[home][0].x, Y = locations[home][0].y;
let lastEquippedSet = null;

function smartEquip(setName) {
    const now = performance.now();
    if (setName !== lastEquippedSet && now - lastSwitchTime > switchCooldown) {
        equipSet(setName);
        lastEquippedSet = setName;
        lastSwitchTime = now;
    }
}

async function attackLoop() {
    const now = performance.now();
    const entities = Object.values(parent.entities);
    const healer = get_entity("CrownPriest");
    const healThreshold = (!healer || healer.rip) ? 0.9 : 0.4;

    const sortedByHP = [];
    for (const e of entities) {
        if (e.type === "monster" && (e.target === targetNames[0] || e.target === targetNames[1])) {
            sortedByHP.push(e);
        }
    }
    sortedByHP.sort((a, b) => b.hp - a.hp);

    const inRange = [], outOfRange = [];
    for (const mob of sortedByHP) {
        (Math.hypot(mob.x - X, mob.y - Y) <= rangeThreshold ? inRange : outOfRange).push(mob);
    }

    const healTarget = lowest_health_partymember(); // Still using external func here
    if (healTarget && healTarget.hp < healTarget.max_hp * healThreshold) {
        state = "healing";
    } else {
        state = "attacking";
    }

    let delay;

    try {
        switch (state) {
            case "healing":
                smartEquip("heal");
                await attack(healTarget);
                delay = ms_to_next_skill("attack");
                break;

            case "attacking":
                if (sortedByHP.length) {
                    const cursed = get_nearest_monster_v2({ statusEffects: ["cursed"] });
                    if (cursed) {
                        change_target(cursed);
                        if (!is_on_cooldown("huntersmark")) await use_skill("huntersmark", cursed);
                        if (!is_on_cooldown("supershot")) await use_skill("supershot", cursed);
                    }

                    if (inRange.length >= 4) {
                        smartEquip("boom");
                        await use_skill("5shot", inRange.slice(0, 5).map(e => e.id));
                    } else if (outOfRange.length >= 4) {
                        smartEquip("dead");
                        await use_skill("5shot", outOfRange.slice(0, 5).map(e => e.id));
                    } else if (sortedByHP.length >= 2) {
                        smartEquip("dead");
                        await use_skill("3shot", sortedByHP.slice(0, 3).map(e => e.id));
                    } else if (sortedByHP.length === 1 && is_in_range(sortedByHP[0])) {
                        smartEquip("single");
                        await attack(sortedByHP[0]);
                    }
                    delay = ms_to_next_skill("attack");
                }
                break;

            default:
                console.error("Unknown state:", state);
                break;
        }
    } catch (err) {
        console.error(err);
    }

    setTimeout(attackLoop, delay);
}

attackLoop();
////////////////////////////////////////////////////////////////////////////////
async function moveLoop() {
    let delay = 50;
    try {
        let tar = get_nearest_monster({ type: home });
        if (tar && !smart.moving) {
            if (!is_in_range(tar)) {
                if (can_move_to(tar.real_x, tar.real_y)) {
                    // Calculate halfway point and move there
                    let halfway_x = character.real_x + (tar.real_x - character.real_x) / 2;
                    let halfway_y = character.real_y + (tar.real_y - character.real_y) / 2;
                    await move(halfway_x, halfway_y);
                } else {
                    if (!smart.moving) {
                        // Use smart_move if direct path is not possible
                        smart_move({
                            x: tar.real_x,
                            y: tar.real_y
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(moveLoop, delay);
}

//moveLoop();
////////////////////////////////////////////////////////////////////////////////
// Extra range to add to a monster's attack range to give more wiggle room
const rangeBuffer = 125;

// How far away we want to consider monsters
const calcRadius = 300;

// Types of monsters we want to avoid
const avoidTypes = ["bscorpion"];

const avoidPlayers = false; // Set to false to not avoid players at all
const playerBuffer = 0; // Additional range around players
const avoidPlayersWhitelist = []; // Players to avoid differently
const avoidPlayersWhitelistRange = 30; // Set to null to not avoid whitelisted players
const playerRangeOverride = 3; // Overrides how far to avoid, set to null to use player range
const playerAvoidIgnoreClasses = ["merchant"]; // Classes we don't want to avoid

// Tracking when we send movements to avoid flooding the socket
let lastMove;

// Whether we want to draw the various calculations visually
const drawDebug = false;

function avoidance() {
    if (drawDebug) {
        clear_drawings();
    }

    // Try to avoid monsters
    const avoiding = avoidMobs();

    if (!avoiding) {
        if (!lastMove || new Date() - lastMove > 100) {
            move(character.real_x, character.real_y); // Move to current position (no goal used)
            lastMove = new Date();
        }
    }

}
//setInterval(avoidance, 50);

function avoidMobs() {
    let maxWeight = -Infinity;
    let maxWeightAngle = 0;

    const monstersInRadius = getMonstersInRadius();
    const avoidRanges = getAnglesToAvoid(monstersInRadius);
    const inAttackRange = isInAttackRange(monstersInRadius);

    // If we are in attack range or need to avoid monsters, find the safest direction to move
    if (inAttackRange || (!can_move_to(character.real_x, character.real_y))) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 60) {
            let weight = 0;

            const position = pointOnAngle(character, angle, 75);

            if (can_move_to(position.x, position.y)) {
                let rangeWeight = 0;
                let inRange = false;

                for (const id in monstersInRadius) {
                    const entity = monstersInRadius[id];
                    const monsterRange = getRange(entity);
                    const distToMonster = distanceToPoint(position.x, position.y, entity.real_x, entity.real_y);
                    const charDistToMonster = distanceToPoint(character.real_x, character.real_y, entity.real_x, entity.real_y);

                    if (charDistToMonster < monsterRange) {
                        inRange = true;
                        if (distToMonster > charDistToMonster) {
                            rangeWeight += distToMonster - charDistToMonster;
                        }
                    }
                }

                if (inRange) {
                    weight = rangeWeight;
                }

                const intersectsRadius = angleIntersectsMonsters(avoidRanges, angle);
                if (!can_move_to(character.real_x, character.real_y)) {
                    weight -= distanceToPoint(position.x, position.y, character.real_x, character.real_y) / 10;
                }

                if (!intersectsRadius) {
                    if (weight > maxWeight) {
                        maxWeight = weight;
                        maxWeightAngle = angle;
                    }
                }
            }
        }

        const movePoint = pointOnAngle(character, maxWeightAngle, 20);
        if (!lastMove || new Date() - lastMove > 100) {
            lastMove = new Date();
            move(movePoint.x, movePoint.y);
        }

        if (drawDebug) {
            draw_line(character.real_x, character.real_y, movePoint.x, movePoint.y, 2, 0xF20D0D);
        }

        return true;
    }

    return false;
}

function getRange(entity) {
    if (entity.type !== "character") {
        return (parent.G.monsters[entity.mtype]?.range || 100) + rangeBuffer;
    } else {
        if (avoidPlayersWhitelist.includes(entity.id) && avoidPlayersWhitelistRange != null) {
            return avoidPlayersWhitelistRange;
        } else if (playerRangeOverride != null) {
            return playerRangeOverride + playerBuffer;
        } else {
            return (entity.range || 100) + playerBuffer;
        }
    }
}

function isInAttackRange(monstersInRadius) {
    return monstersInRadius.some(monster => {
        const monsterRange = getRange(monster);
        const charDistToMonster = distanceToPoint(character.real_x, character.real_y, monster.real_x, monster.real_y);
        return charDistToMonster < monsterRange;
    });
}

function angleIntersectsMonsters(avoidRanges, angle) {
    return avoidRanges.some(range => isBetween(range[1], range[0], angle));
}

function getAnglesToAvoid(monstersInRadius) {
    const avoidRanges = [];
    for (const id in monstersInRadius) {
        const monster = monstersInRadius[id];
        const monsterRange = getRange(monster);
        const tangents = findTangents({ x: character.real_x, y: character.real_y }, { x: monster.real_x, y: monster.real_y, radius: monsterRange });

        if (!isNaN(tangents[0].x)) {
            const angle1 = angleToPoint(character, tangents[0].x, tangents[0].y);
            const angle2 = angleToPoint(character, tangents[1].x, tangents[1].y);
            avoidRanges.push(angle1 < angle2 ? [angle1, angle2] : [angle2, angle1]);

            if (drawDebug) {
                draw_line(character.real_x, character.real_y, tangents[0].x, tangents[0].y, 1, 0x17F20D);
                draw_line(character.real_x, character.real_y, tangents[1].x, tangents[1].y, 1, 0x17F20D);
            }
        }

        if (drawDebug) {
            draw_circle(monster.real_x, monster.real_y, monsterRange, 1, 0x17F20D);
        }
    }
    return avoidRanges;
}

function getMonstersInRadius() {
    return Object.values(parent.entities).filter(entity => {
        const distanceToEntity = distanceToPoint(entity.real_x, entity.real_y, character.real_x, character.real_y);
        const range = getRange(entity);
        return (entity.type === "monster" && avoidTypes.includes(entity.mtype) && distanceToEntity < calcRadius) ||
            (avoidPlayers && entity.type === "character" && !entity.npc && !playerAvoidIgnoreClasses.includes(entity.ctype) &&
                (!avoidPlayersWhitelist.includes(entity.id) || avoidPlayersWhitelistRange != null) &&
                (distanceToEntity < calcRadius || distanceToEntity < range));
    });
}

function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function isBetween(angle1, angle2, target) {
    if (angle1 <= angle2) {
        return angle2 - angle1 <= Math.PI ? angle1 <= target && target <= angle2 : angle2 <= target || target <= angle1;
    } else {
        return angle1 - angle2 <= Math.PI ? angle2 <= target && target <= angle1 : angle1 <= target || target <= angle2;
    }
}

function findTangents(point, circle) {
    const dx = circle.x - point.x;
    const dy = circle.y - point.y;
    const dd = Math.sqrt(dx * dx + dy * dy);
    const a = Math.asin(circle.radius / dd);
    const b = Math.atan2(dy, dx);

    const ta = { x: circle.x + circle.radius * Math.sin(b - a), y: circle.y - circle.radius * Math.cos(b - a) };
    const tb = { x: circle.x - circle.radius * Math.sin(b + a), y: circle.y + circle.radius * Math.cos(b + a) };

    return [ta, tb];
}

function offsetToPoint(x, y) {
    const angle = angleToPoint(x, y) + Math.PI / 2;
    return angle - characterAngle();
}

function pointOnAngle(entity, angle, distance) {
    return { x: entity.real_x + distance * Math.cos(angle), y: entity.real_y + distance * Math.sin(angle) };
}

function entityAngle(entity) {
    return (entity.angle * Math.PI) / 180;
}

function angleToPoint(entity, x, y) {
    const deltaX = entity.real_x - x;
    const deltaY = entity.real_y - y;
    return Math.atan2(deltaY, deltaX) + Math.PI;
}

function characterAngle() {
    return (character.angle * Math.PI) / 180;
}

function distanceToPoint(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function rareItemPickup() {
    const itemsToLookFor = ["platinumnugget", "pvptoken",];

    for (var i = 0; i < 42; i++) {
        var item = character.items[i];
        if (item && itemsToLookFor.includes(item.name)) {
            send_cm("CrownMerch", {
                message: "location",
                x: character.x,
                y: character.y,
                map: character.map
            });
            break;
        }
    }
}
//setInterval(rareItemPickup, 1000);

function sendUpdates() {
    parent.socket.emit("send_updates", {})
}
setInterval(sendUpdates, 20000);

function pingButton() {
    add_top_button("Ping", character.ping.toFixed(0));
}
setInterval(pingButton, 1000);

function getRspeed() {
    const oneMinute = 60000; // 1 minute in milliseconds
    if (!character.s.rspeed || (character.s.rspeed.ms < oneMinute)) {
        //start_character("CrownZone",16);
    }
}
setInterval(getRspeed, 5000);
function on_cm(name, data) {
    if (name === "CrownZone" && data.message === "rspeed done") {
        stop_character("CrownZone");
    }
}

function topButtons() {
    add_top_button("Stop", "🔄", () => {
        stop_character("CrownMerch");
        startChar = false;
    });/*
	add_top_button("MLuck", "ML", () => {
		send_cm("CrownMerch", {
			message: "location",
			x: character.x,
			y: character.y,
			map: character.map
		});
	});*/
    add_top_button("Return", "R&M", () => {
        send_cm(["CrownPriest", "CrownMage", "CrownTown"], {
            message: "location",
            x: character.x,
            y: character.y,
            map: character.map
        });
    });
    /*
    add_top_button("Pause", "PP", () => {
        parent.no_html = true
        parent.no_graphics = true
        pause();
        startChar = true;
    });*/
    add_top_button("showLoot", "💼", displayLoot);
    add_top_button("Pause2", "⏸️", () => {
        pause();
        startChar = true;
    });
}
topButtons();

// Define constants
const goldThreshold = 1.1 * 1e7; // 10 million gold
const minGoldTransfer = 1 * 1e7; // 1 billion gold
const itemsToExclude = [
    "hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "pumpkinspice",
    "xptome", "orbofdex", "orbofstr", "strbelt", "intbelt", "dexbelt", "cscroll0",
    "cscroll1", "greenbomb", "xshot", "darktristone"
];

// Function to transfer gold
function transferGold(lootMule) {
    if (character.gold > goldThreshold) {
        const goldToSend = Math.floor(character.gold - minGoldTransfer);
        if (distance(character, lootMule) <= 250) {
            send_gold(lootMule, goldToSend);
        } else {
            //console.log("Loot mule out of range for gold transfer.");
        }
    }
}

function sendItems(lootMule) {
    if (!lootMule || distance(character, lootMule) > 250) {
        //console.log("Loot mule out of range for item transfer.");
        return;
    }

    character.items.forEach((item, index) => {
        if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
            send_item(lootMule, index, item.q ?? 1);
        }
    });

    for (let i = 37; i < 41; i++) {
        const item = character.items[i];
        if (item /*&& item.q > 0*/) {
            send_item(lootMule, i, item.q);
        }
    }
}

// Main function to manage loot
function manageLoot() {
    const lootMule = get_entity("CrownMerch");
    if (!lootMule) {
        //console.log("No loot mule found.");
        return;
    }

    transferGold(lootMule);
    sendItems(lootMule);
}

// Run manageLoot every second
setInterval(manageLoot, 2000);

function findSpecialChests() {
    let chests = get_chests();
    let specialChests = [];

    for (let chestId in chests) {
        let chest = chests[chestId];

        // Check for special chests
        if (chest.skin === "chest6" || chest.skin === "chest7") {
            specialChests.push({ id: chestId, chest: chest });
        }
    }

    // Send the chest IDs of special chests to your merchant if any are found
    if (specialChests.length > 0) {
        send_cm("CrownMerch", {
            message: "Chest ID",
            chestID: specialChests.id// Sending only chest IDs
        });
    }

    return specialChests;
}

// Check for special chests every 5 seconds
//setInterval(findSpecialChests, 50);

// Define the target player name constant
const targetPlayerName = "CrownMerch";

// Function to send location updates
async function sendLocationUpdate() {
    try {
        // Check if character has mluck and if it's not from targetPlayerName
        const needsUpdate = !character.s.mluck || character.s.mluck.f !== targetPlayerName;

        // Count the number of null slots in the inventory
        const nullCount = character.items.filter(item => item === null).length;

        // Send update if either condition is met
        if (needsUpdate || nullCount <= 7) {
            send_cm(targetPlayerName, {
                message: "location",
                x: character.x,
                y: character.y,
                map: character.map
            });
        }
    } catch (error) {
        console.error("Failed to send location update:", error);
    }
}

// Run sendLocationUpdate every second
setInterval(sendLocationUpdate, 1000);

let lastScareTime = 0;
const SCARE_THRESHOLD = 1000; // 1 second

function scare() {
    const slot = character.items.findIndex(i => i && i.name === "jacko");
    const orb = character.items.findIndex(i => !i);
    let mobnum = 0;

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.type === "monster" && current.target === character.name) mobnum++;
    }

    const currentTime = new Date().getTime();
    const timeSinceLastScare = currentTime - lastScareTime;

    if (mobnum > 0 && timeSinceLastScare >= SCARE_THRESHOLD && !is_on_cooldown("scare")) {
        equip(slot);
        use("scare");
        game_log("Scare!!!", "#ff6822");
        equip(slot); // Re-equipping the original orb
        lastScareTime = currentTime;
    }
}
setInterval(scare, 100);

let orbSwapTime = 0; // Tracks last orb swap time
let capeSwapTime = 0; // Tracks last cape swap time
let coatSwapTime = 0; // Tracks last coat swap time
let boosterSwapTime = 0;
const swapCooldown = 500; // Cooldown between swaps in ms

const settings = {
    delay: 25, // Delay in ms for the loop
    hpThreshold: 15000, // HP threshold for swaps
    bossHpThreshold: 50000, // HP threshold for boss swaps
    xpMonsters: ["sparkbot"], // Monsters to monitor for XP swaps
    mpThresholds: { upper: 1800, lower: 2400 }, // MP thresholds for coat swap
    chestThreshold: 12, // Chest count for cape swap
};

async function itemSwap() {
    const now = Date.now();

    try {
        let targetOrbSet = null; // Determine which orb set to equip
        let targetCapeSet = null; // Determine which cape set to equip
        let targetCoatSet = null; // Determine which coat set to equip

        // BOOSTER SWAP LOGIC
        if (now - boosterSwapTime > swapCooldown) {
            const grinch = parent.S.grinch;
            let desiredBooster = null;

            if (grinch && grinch.hp < settings.bossHpThreshold) {
                desiredBooster = "luckbooster";
            } else {
                const monstersBelowThreshold = Object.values(parent.entities).some(entity =>
                    settings.xpMonsters.includes(entity.mtype) && entity.hp < settings.hpThreshold
                );

                if (monstersBelowThreshold) {
                    desiredBooster = "xpbooster";
                } else {
                    desiredBooster = "xpbooster"; // Default booster
                }
            }

            const currentBoosterSlot = locate_item(desiredBooster);

            if (currentBoosterSlot === -1) {
                // If the desired booster isn't already in inventory, find the highest level booster
                const otherBoosterSlot = findBoosterSlot();

                if (otherBoosterSlot !== null) {
                    shift(otherBoosterSlot, desiredBooster);
                    boosterSwapTime = now; // Update the last shift time
                }
            }
        }

        // ORB SWAP LOGIC
        const grinch = parent.S.grinch;
        if (grinch && grinch.hp < settings.bossHpThreshold) {
            targetOrbSet = "luck";
        } else {
            const monstersBelowThreshold = Object.values(parent.entities).some(entity =>
                settings.xpMonsters.includes(entity.mtype) && entity.hp < settings.hpThreshold
            );

            if (monstersBelowThreshold) {
                targetOrbSet = "xp";
            }
        }
        if (!targetOrbSet) {
            targetOrbSet = "dps";
        }

        // CAPE SWAP LOGIC
        const chestCount = getNumChests();
        const numTargets = getNumTargets("CrownPriest"); // Check number of monsters targeting CrownPriest
        if (chestCount >= settings.chestThreshold && numTargets < 6) {
            targetCapeSet = "stealth";
        } else {
            targetCapeSet = "cape";
        }

        // COAT SWAP LOGIC
        if (character.mp > settings.mpThresholds.upper) {
            targetCoatSet = "stat";
        } else if (character.mp < settings.mpThresholds.lower) {
            targetCoatSet = "mana";
        }

        // EQUIP ITEMS BASED ON TARGET SETS AND COOLDOWN
        // Equip Orb Set
        if (now - orbSwapTime > swapCooldown && targetOrbSet && !isSetEquipped(targetOrbSet)) {
            equipSet(targetOrbSet);
            //game_log(`Equipping ${targetOrbSet} set`);
            orbSwapTime = now; // Update the last swap time for orb
        }

        // Equip Cape Set
        if (now - capeSwapTime > swapCooldown && targetCapeSet && !isSetEquipped(targetCapeSet)) {
            equipSet(targetCapeSet);
            //game_log(`Equipping ${targetCapeSet} cape`);
            capeSwapTime = now; // Update the last swap time for cape
        }

        // Equip Coat Set
        if (now - coatSwapTime > swapCooldown && targetCoatSet && !isSetEquipped(targetCoatSet)) {
            equipSet(targetCoatSet);
            //game_log(`Equipping ${targetCoatSet} coat`);
            coatSwapTime = now; // Update the last swap time for coat
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(itemSwap, settings.delay);
}

// Utility Function to Check if a Set Is Equipped
function isSetEquipped(setName) {
    const set = equipmentSets[setName];
    if (!set) return false;

    return set.every(item =>
        character.slots[item.slot]?.name === item.itemName &&
        character.slots[item.slot]?.level === item.level
    );
}

function getNumTargets(playerName) {
    if (!playerName) return 0; // Return 0 if no player name is provided
    let targetCount = 0;

    for (const id in parent.entities) {
        const entity = parent.entities[id];
        if (entity.type === "monster" && entity.target === playerName) {
            targetCount++;
        }
    }

    return targetCount;
}

// Start the item swapping loop
itemSwap();


let moveStuff = {
    armorbox: 38,
    candypop: 37,
    //candycane: 38,
    //carrot: 37,
    cupid: [0, 37, 38, 39],
    //daggerofthedead: 41,
    dexamulet: [3, 37, 38, 39],
    dexearring: [2, 37, 38, 39],
    dexring: [3, 37, 38, 39],
    dexbelt: [1, 37, 38, 39],
    elixirluck: 24,
    essenceoffire: 40,
    feather0: 37,
    fun_token: 38,
    gem0: 38,
    gem1: 40,
    gcape: [6, 38],
    greenenvelope: 39,
    intamulet: [3, 37, 38, 39],
    intearring: [2, 37, 38, 39],
    intring: [3, 37, 38, 39],
    lmace: 39,
    luckbooster: 6,
    maceofthedead: 41,
    mcape: 38,
    mpot1: 3,
    orbofdex: [1, 37],
    orbofstr: [1, 38],
    pumpkinspice: 5,
    //pmaceofthedead: 41,
    quiver: [6, 37, 38, 39],
    //ringofluck: 38,
    scythe: 38,
    snring: 37,
    //staffofthedead: 41,
    stramulet: [3, 37, 38, 39],
    strbelt: [1, 37, 38, 39],
    strring: [3, 37, 38, 39],
    //swordofthedead: 41,
    tigerhelmet: 39,
    tigercape: 39,
    vitring: [2, 37, 38, 39],
    wbookhs: 38,
    xptome: 4,
    //xmace: 38,
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
    let slot = findBoosterSlot();
    //shift(slot, "xpbooster");
}
function prepForLoot() {
    localStorage.setItem("LootState", "loot");
    let slot = findBoosterSlot();
    //shift(slot, "xpbooster");
}
function findBoosterSlot() {
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

        if (secondsPassed >= 100 || character.map === "spookytown") {
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

sell_whitelist = [
    'vitearring', 'iceskates', 'cclaw', 'hpbelt', 'ringsj', 'hpamulet', 'warmscarf',
    'quiver', 'snowball', 'vitring', '', '', '', '',
    '', "strring", "dexring", "intring",
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

let upgradeMaxLevel = 0;
let upgradeWhitelist =
{
    vhammer: 0,
};
let combineWhitelist =
{
    wbook0: 3,
    lostearring: 1,
    cring: 1,
    ringsj: 0,
    cearring: 1,
    strring: 0,
    intring: 0,
    dexring: 0,
    dexamulet: 0,
    intamulet: 0,
    stramulet: 0,
    dexbelt: 1,
    intbelt: 1,
    strbelt: 1,
    orbofvit: 1,
    orbofint: 1,
    orbofdex: 1,
    orbofstr: 1,
}
setInterval(function () {
    if (parent != null && parent.socket != null) {
        upgrade();
        compound_items();
    }
}, 300);
function upgrade() {
    for (let i = 0; i < character.items.length; i++) {
        let c = character.items[i];
        if (c) {
            var level = upgradeWhitelist[c.name];
            if (level && c.level < level) {
                let grades = get_grade(c);
                let scrollname;
                if (c.level < grades[0])
                    scrollname = 'scroll0';
                else if (c.level < grades[1])
                    scrollname = 'scroll1';
                else
                    scrollname = 'scroll2';
                let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
                if (!scroll) {
                    parent.buy(scrollname);
                    return;
                }
                parent.socket.emit('upgrade', {
                    item_num: i,
                    scroll_num: scroll_slot,
                    offering_num: null,
                    clevel: c.level
                });
                return;
            }
        }
    }
}
function compound_items() {
    let to_compound = character.items.reduce((collection, item, index) => {
        if (item && combineWhitelist[item.name] != null && item.level < combineWhitelist[item.name]) {
            let key = item.name + item.level;
            !collection.has(key) ? collection.set(key, [item.level, item_grade(item), index]) : collection.get(key).push(index);
        }
        return collection;
    }, new Map());
    for (var c of to_compound.values()) {
        let scroll_name = "cscroll" + c[1];
        for (let i = 2; i + 2 < c.length; i += 3) {
            let [scroll, _] = find_item(i => i.name == scroll_name);
            if (scroll == -1) {
                parent.buy(scroll_name);
                return;
            }
            game_log(scroll_name);
            game_log(c[i]);
            game_log(c[i + 1]);
            game_log(c[i + 2]);
            parent.socket.emit('compound', {
                items: [c[i], c[i + 1], c[i + 2]],
                scroll_num: scroll,
                offering_num: null,
                clevel: c[0]
            });
            return;
        }
    }
}
function get_grade(item) {
    return parent.G.items[item.name].grades;
}
function find_item(filter) {
    for (let i = 0; i < character.items.length; i++) {
        let item = character.items[i];
        if (item && filter(item))
            return [i, character.items[i]];
    }
    return [-1, null];
}

let respawnCooldown = false;

function suicide() {
    if (!character.rip && character.hp < 2000) {
        parent.socket.emit('harakiri');
        game_log("Harakiri");
    }
    let tome = locate_item("xptome");
    if (tome !== -1 && !respawnCooldown) {
        respawnCooldown = true;
        setTimeout(() => {
            respawn();
            respawnCooldown = false; // Reset cooldown after respawning
        }, 5000); // 5-second delay before respawning
    }
}
setInterval(suicide, 100);

const skinConfigs = {
    // tm_yellow
    ranger: { skin: "tm_yellow", skinRing: { name: "tristone", level: 2, locked: "l" }, normalRing: { name: "suckerpunch", level: 2, locked: "l" } },
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

function equipSet(setName) {
    const set = equipmentSets[setName];
    if (set) {
        equipBatch(set);
    } else {
        console.error(`Set "${setName}" not found.`);
    }
}

function lowest_health_partymember() {
    // Get all party members that are not dead (rip) and filter out specific names
    let party_mems = Object.keys(parent.party)
        .filter(e => parent.entities[e] && !parent.entities[e].rip && e !== character.name);
    let the_party = [];

    for (let key of party_mems) {
        if (parent.entities[key]) {
            let hp_ratio = (parent.entities[key].hp / parent.entities[key].max_hp) * 100;  // Convert to percentage
            // Add valid party members to the array
            the_party.push(parent.entities[key]);
        }
    }

    // Optionally, add yourself to the list if needed for another purpose
    // the_party.push(character); 

    // Sort the party by HP ratio (ascending), so lowest HP comes first
    let res = the_party.sort(function (a, b) {
        let a_rat = a.hp / a.max_hp;
        let b_rat = b.hp / b.max_hp;
        return a_rat - b_rat;
    });

    if (res.length > 0) {
        //console.log("Lowest HP member: " + res[0].name + " with HP Percentage " + ((res[0].hp / res[0].max_hp) * 100).toFixed(2) + "%");
        return res[0];  // Return the member with the lowest HP
    } else {
        return null;  // Return null if no valid party member is found
    }
}

function getPrioritizedTargets(targetNames, homeX, homeY, rangeThreshold) {
    // Step 1: Filter and sort all valid monster targets
    const targets = Object.values(parent.entities)
        .filter(({ type, target }) =>
            type === "monster" &&        // Ensure the entity is a monster
            target &&                    // The monster has a target
            targetNames.includes(target) // The target is in the prioritized list
        )
        .map(monster => {
            // Calculate and store distance once for reuse
            const { x, y, hp, target } = monster;
            const distance = Math.hypot(x - homeX, y - homeY);
            return { ...monster, distance, priority: targetNames.indexOf(target) };
        })
        .sort((a, b) => {
            // Step 2: Sort by priority, distance, and HP
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (a.distance !== b.distance) return a.distance - b.distance;
            return b.hp - a.hp; // Highest HP last
        });

    // Step 3: Separate monsters into in-range and out-of-range categories
    const inRange = [];
    const outOfRange = [];

    for (const monster of targets) {
        (monster.distance <= rangeThreshold ? inRange : outOfRange).push(monster);
    }

    // Step 4: Return the combined targets and categorized lists
    return {
        targets: [...inRange, ...outOfRange], // Combined list with inRange prioritized
        inRange,
        outOfRange
    };
}

// Function to check if the cooldown period has passed
function CD() {
    return performance.now() - lastSwitchTime > switchCooldown;
}

function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill];
    let time = Math.min(...parent.pings)
    let now = Date.now()
    let ping = character.ping
    if (next_skill == undefined) return 0;
    const ms = parent.next_skill[skill].getTime() - now - time;
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

function displayLoot() {
    let savedLoot = JSON.parse(localStorage.getItem("lootItemsJune") || "{}");

    // Sort the loot by item name
    let sortedLoot = {};
    Object.keys(savedLoot)
        .sort()
        .forEach((key) => {
            sortedLoot[key] = savedLoot[key];
        });

    console.log("Saved Loot (Sorted):", sortedLoot);
    show_json(sortedLoot); // Display the sorted loot
}

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

let group = ["CrownsAnal", "CrownTown", "CrownPriest"];

function partyMaker() {
    let partyLead = get_entity(group[0]); // The first character in the group is the leader
    let currentParty = get_party(); // Get the current party details
    let healer = get_entity("CrownPriest");

    // If you're the leader and party size is less than 3, invite group members
    if (character.name === group[0]) {
        for (let i = 1; i < group.length; i++) {
            let name = group[i];

            // Check if the member is already in the party
            if (!currentParty[name]) {
                send_party_invite(name);
                console.log("Party leader inviting member:", name);
            }
        }
    } else {
        // If you're in a party that's not led by the group leader, leave it
        if (currentParty && currentParty[character.name] && currentParty[character.name].in !== group[0] && healer) {
            console.log(`In a party with ${currentParty[character.name].in}, but leader should be ${group[0]}. Leaving party.`);
            leave_party();
        }

        // If not in a party and the leader exists, send a party request
        if (!currentParty[character.name] && partyLead) {
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
    //if (group.indexOf(name) != -1) {
    console.log("Accepting party request from " + name);
    accept_party_request(name);
    //}
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

const rareItems = {
    "ololipop": { name: "Orange Lolipop Mace", imgurLink: "https://imgur.com/PMCUrYx.jpg" },
    "suckerpunch": { name: "Sucker Punch", imgurLink: "https://imgur.com/a/60Rz6er.jpg" },
    "ringofluck": { name: "Ring of Luck", imgurLink: "https://imgur.com/cuitOec.jpg" },
    //"hdagger": { name: "Heartbreaker Dagger", imgurLink: "https://imgur.com/JAlMNrL.jpg" },
    "mpxbelt": { name: "Mana Belt", imgurLink: "https://imgur.com/kl6TM2j.jpg" },
    "amuletofm": { name: "Amulet of Mystery", imgurLink: "https://imgur.com/uN97ktu.jpg" },
	"goldring": { name: "Gold Ring", imgurLink: "https://imgur.com/mMmyLLQ.jpg" },
	"ukey": { name: "Underground Key", imgurLink: "https://imgur.com/KAoyTcH.jpg" },
	"goldenpowerglove": { name: "Golden Power Glove", imgurLink: "https://imgur.com/3tk5Oqb.jpg" },
	"goldbooster": { name: "Gold Booster", imgurLink: "https://imgur.com/LCW5Fo1.jpg" },
    // Add more items here
};

// Function to determine whether to use "a" or "an"
function getArticle(itemName) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    return vowels.includes(itemName[0].toUpperCase()) ? "an" : "a";
}

// Function to send a Discord message with item details and imgur link
function sendRareLootToDiscord(itemID, quantity, itemData, mentionUserID) {
    const article = getArticle(itemData.name);
    let messageContent = `${character.name} Found ${article} ${itemData.name}!`;

    // If a user ID is provided, mention them in the message
    if (mentionUserID) {
        messageContent += ` <@${mentionUserID}>`;  // Mention the user
    }

    // Prepare the Discord message object
    const discordMessage = {
        content: messageContent,
        username: 'CrownPriest',
        embeds: [{
            title: itemData.name,
            description: `Looted by ${character.name}`,
            image: {
                url: itemData.imgurLink
            }
        }]
    };

    // Send message to Discord
    fetch("https://discordapp.com/api/webhooks/1327927131732447265/**********************************************", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage)
    })
        .then(response => response.json())
        .then(result => console.log(`Discord message sent: ${itemData.name}`))
        .catch(error => console.error('Error sending to Discord:', error));
}

let ui_gamelog = function () {
    let gamelog_data = {
        kills: {
            show: false,
            regex: /killed/,
            tab_name: 'Kills'
        },
        gold: {
            show: true,
            regex: /gold/,
            tab_name: 'Gold'
        },
        party: {
            show: true,
            regex: /party/,
            tab_name: 'Party'
        },
        items: {
            show: true,
            regex: /found/,
            tab_name: 'Items'
        },
        upgrade_and_compound: {
            show: true,
            regex: /(upgrade|combination)/,
            tab_name: 'Upgr.'
        },
        errors: {
            show: true,
            regex: /(error|line|column)/i,
            tab_name: 'Errors'
        }
    };
    // filter buttons are alternating lighter and darker for aesthetic effect
    // colours in order are: dark blue, light blue, white, dark gray, light gray, lighter gray
    let filter_colours = {
        on_dark: '#151342',
        on_light: '#1D1A5C',
        on_text: '#FFF',
        off_dark: '#222',
        off_light: '#333',
        off_text: '#999'
    };
    let $ = parent.$;
    init_timestamps();
    init_gamelog_filter();
    function init_gamelog_filter() {
        //$('#bottomrightcorner').find('#goldui')[0].style.lineHeight = '30px';
        $('#bottomrightcorner').find('#gamelog-tab-bar').remove();
        let gamelog_tab_bar = $('<div id="gamelog-tab-bar" class="enableclicks" />').css({
            border: '4px solid gray',
            height: '22px',
            background: 'black',
            width: "98%",
            margin: '-5px 0',
            display: 'flex',
            fontSize: '20px',
            fontFamily: 'pixel',
        });
        let gamelog_tab = $('<div class="gamelog-tab enableclicks" />').css({
            height: '100%',
            width: 'calc(100% / 6)',
            textAlign: 'center',
            lineHeight: '24px',
            cursor: 'pointer'
        });
        for (let key in gamelog_data) {
            if (!gamelog_data.hasOwnProperty(key)) continue;
            let filter = gamelog_data[key];
            gamelog_tab_bar.append(
                gamelog_tab
                    .clone()
                    .attr('id', `gamelog-tab-${key}`)
                    .css({
                        background: gamelog_tab_bar.children().length % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light
                    })
                    .text(filter.tab_name)
                    .click(function () {
                        toggle_gamelog_filter(key);
                    })
            );
        }
        $('#gamelog').before(gamelog_tab_bar);
    }
    function filter_gamelog() {
        $('.gameentry').each(function () {
            for (let filter of Object.values(gamelog_data)) {
                if (filter.regex.test(this.innerHTML)) {
                    this.style.display = filter.show ? 'block' : 'none';
                    return;
                }
            }
        });
    }
    function toggle_gamelog_filter(filter) {
        gamelog_data[filter].show = !gamelog_data[filter].show;
        console.log(JSON.stringify(gamelog_data));
        let tab = $(`#gamelog-tab-${filter}`);
        if (gamelog_data[filter].show) {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light,
                color: filter_colours.on_text
            });
        } else {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.off_dark : filter_colours.off_dark,
                color: filter_colours.off_text
            });
        }
        filter_gamelog();
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }
    function pad(num, pad_amount_) {
        pad_amount = pad_amount_ || 2;
        return ("0".repeat(pad_amount) + num).substr(-pad_amount, pad_amount);
    }
    function add_log_filtered(c, a) {
        if (parent.mode.dom_tests || parent.inside == "payments") {
            return;
        }
        if (parent.game_logs.length > 1000) {
            var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
            parent.game_logs = parent.game_logs.slice(-720);
            parent.game_logs.forEach(function (d) {
                b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
            });
            $("#gamelog").html(b)
        }
        parent.game_logs.push([c, a]);
        let display_mode = 'block';
        for (let filter of Object.values(gamelog_data)) {
            if (filter.regex.test(c)) {
                display_mode = filter.show ? 'block' : 'none';
                break;
            }
        }
        $("#gamelog").append(`<div class='gameentry' style='color: ${a || "white"}; display: ${display_mode};'>${c}</div>`);
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }
    function init_timestamps() {
        if (parent.socket.hasListeners("game_log")) {
            parent.socket.removeListener("game_log");
            parent.socket.on("game_log", data => {
                parent.draw_trigger(function () {
                    let now = new Date();
                    if (is_string(data)) {
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data}`, "gray");
                    } else {
                        if (data.sound) sfx(data.sound);
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data.message}`, data.color);
                    }
                })
            });
        }
    }
}();
///////////////////////////////////////////
// Universal function to toggle any meter's visibility
function toggleMeter(meterId) {
    let $ = parent.$;
    let meter = $(`#${meterId}`);

    if (meter.length) {
        meter.toggle();  // Toggles the visibility
    }
}

// Function to create the toggle popup window
function createTogglePopup() {
    let $ = parent.$;

    // Remove any existing popup window to avoid duplicates
    $('#togglePopupWindow').remove();

    // Create a popup window container
    let togglePopup = $('<div id="togglePopupWindow"></div>').css({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        border: '2px solid gray',
        borderRadius: '10px',
        zIndex: 9999,
        width: '300px',
        textAlign: 'center'
    });

    // Add a title to the popup
    togglePopup.append('<h3>UI Addon Toggles</h3>');

    // Add toggle buttons for each UI element
    let pdpsToggleBtn = $('<button>Toggle PDPS Meter</button>').css({
        margin: '5px',
        padding: '10px'
    }).click(function () {
        toggleMeter('pdpsmeter');  // Toggle PDPS meter visibility
    });

    let dpsToggleBtn = $('<button>Toggle DPS Meter</button>').css({
        margin: '5px',
        padding: '10px'
    }).click(function () {
        toggleMeter('dpsmeter');  // Toggle DPS meter visibility
    });

    let xpToggleBtn = $('<button>Toggle XP Meter</button>').css({
        margin: '5px',
        padding: '10px'
    }).click(function () {
        toggleMeter('xptimer');  // Toggle DPS meter visibility
    });

    let goldToggleBtn = $('<button>Toggle Gold Meter</button>').css({
        margin: '5px',
        padding: '10px'
    }).click(function () {
        toggleMeter('goldtimer');  // Toggle DPS meter visibility
    });
    let partyToggleBtn = $('<button>Toggle Party</button>').css({
        margin: '5px',
        padding: '10px'
    }).click(function () {
        toggleMeter('newparty');  // Toggle DPS meter visibility
    });

    // Add buttons to the popup window
    togglePopup.append(pdpsToggleBtn);
    togglePopup.append(dpsToggleBtn);
    togglePopup.append(xpToggleBtn);
    togglePopup.append(goldToggleBtn);
    togglePopup.append(partyToggleBtn);

    // Add a close button to hide the popup
    let closeButton = $('<button>Close</button>').css({
        margin: '5px',
        padding: '10px',
        backgroundColor: '#FF0000',
        color: 'white'
    }).click(function () {
        $('#togglePopupWindow').remove();  // Close the popup
    });

    togglePopup.append(closeButton);

    // Append the popup window to the game screen
    $('body').append(togglePopup);
}

// Add a button to the top to open the toggle popup
add_top_button("toggle_ui_popup", "Toggle UI", createTogglePopup);
///////////////////////////////////////////////
function initXP() {
    let $ = parent.$;
    $('#xpui').css({
        fontSize: '28px',
        width: "100%",
    });
}

function displayXP() { // Renamed function
    let $ = parent.$;
    let xpPercent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
    let xpString = `LV${character.level} ${xpPercent}%`;
    $('#xpui').html(xpString);
}

// Initialize GUI and set interval for updates
initXP();
setInterval(displayXP, 1000);
//////////////////////////////////////////////////////////////////////////////////////////
let sumGold = 0;
let largestGoldDrop = 0;
const startTime = new Date(); // Start time to calculate elapsed time
let interval = 'hour'; // Set default interval (options: 'minute', 'hour', 'day')

// Initialize the gold meter UI
const initGoldMeter = () => {
    const $ = parent.$;
    const brc = $('#bottomrightcorner');
    brc.find('#goldtimer').remove();

    const goldContainer = $('<div id="goldtimer"></div>').css({
        fontSize: '25px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: "100%",
    });

    $('<div id="goldtimercontent"></div>')
        .css({ display: 'table-cell', verticalAlign: 'middle' })
        .appendTo(goldContainer);

    brc.children().first().after(goldContainer);
};

// Format gold string to display
const formatGoldString = (averageGold) => `
    <div>${averageGold.toLocaleString('en')} Gold/${interval.charAt(0).toUpperCase() + interval.slice(1)}</div>
    <div>${largestGoldDrop.toLocaleString('en')} Jackpot</div>
`;

// Update the gold display with current data
const updateGoldDisplay = () => {
    const $ = parent.$;
    const averageGold = calculateAverageGold(); // Calculate average gold based on the selected interval
    $('#goldtimercontent').html(formatGoldString(averageGold)).css({
        background: 'black',
        //backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        border: 'solid gray',
        borderWidth: '4px 4px',
        height: '50px',
        lineHeight: '25px',
        fontSize: '25px',
        color: '#FFD700',
        textAlign: 'center',
    });
};

// Set up a timer to update the display
setInterval(updateGoldDisplay, 500);

// Initialize gold meter
initGoldMeter();

character.on("loot", (data) => {
    // Ensure the gold received is valid
    if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
        const partyShare = parent.party[character.name]?.share || 1; // Default to 1 if not in a party
        const totalGoldInChest = Math.round(data.gold / partyShare); // Calculate total chest gold

        sumGold += totalGoldInChest; // Track the actual total gold received

        // Track the largest gold drop
        if (totalGoldInChest > largestGoldDrop) {
            largestGoldDrop = totalGoldInChest;
        }
    } else {
        console.warn("Invalid gold value:", data.gold);
    }

    // Existing item tracker code for loot...
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item) => {
            let quantity = item.q !== undefined ? item.q : 1;
            let savedLoot = JSON.parse(localStorage.getItem("lootItemsJune") || "{}");

            // Track loot in localStorage
            if (savedLoot[item.name]) {
                savedLoot[item.name] += quantity;
            } else {
                savedLoot[item.name] = quantity;
            }
            localStorage.setItem("lootItemsJune", JSON.stringify(savedLoot));

            console.log(`Looted: ${item.name}, Quantity: ${quantity}`);

            // Check if the item is a rare item by ID
            if (rareItems[item.name]) {
                // Send Discord message for rare item
                sendRareLootToDiscord(item.name, quantity, rareItems[item.name], "212506590950064130");
            }
        });
    }
});

// Calculate average gold based on the selected interval
const calculateAverageGold = () => {
    const elapsedTime = (new Date() - startTime) / 1000; // Elapsed time in seconds
    const divisor = elapsedTime / (interval === 'minute' ? 60 : interval === 'hour' ? 3600 : 86400);

    // Prevent division by zero or near-zero values
    if (divisor <= 0) return 0;

    return Math.round(sumGold / divisor); // Return gold per the specified interval
};


// Function to change the interval (can be called externally)
const setGoldInterval = (newInterval) => {
    if (['minute', 'hour', 'day'].includes(newInterval)) {
        interval = newInterval;
    } else {
        console.warn("Invalid interval. Use 'minute', 'hour', or 'day'.");
    }
};
//////////////////////////////////////////////////////////////////////////////////////////
let sumXP = 0;
let largestXPGain = 0;
const timeStart = new Date(); // Record the start time for XP calculation
const startXP = character.xp; // Record the starting XP
let xpInterval = 'second'; // Default interval (options: 'second', 'minute', 'hour', 'day')
let targetXpRate = 40000; // Set as the target xp rate you want to be achieving and the color will automatically update

// Initialize the XP timer display
const initXpTimer = () => {
    const $ = parent.$;
    $('#bottomrightcorner').find('#xptimer').remove();

    const xpContainer = $('<div id="xptimer"></div>').css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '4px 4px',
        width: "98%",
        height: '66px',
        fontSize: '25px',
        color: '#00FF00',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        //backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundColor: 'rgba(0, 0, 0, 1)',
    });

    $('<div id="xptimercontent"></div>')
        .css({ display: 'table-cell', verticalAlign: 'middle' })
        .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 30px;">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpContainer);

    $('#bottomrightcorner').children().first().after(xpContainer);
};

// Update the XP timer display
const updateXpTimer = () => {
    if (character.xp === startXP) return;

    const $ = parent.$;
    const now = new Date();
    const elapsedTime = Math.round((now - timeStart) / 1000);
    if (elapsedTime < 1) return;

    const xpGain = character.xp - startXP;
    const xpMissing = parent.G.levels[character.level] - character.xp;
    const seconds = Math.round(xpMissing / calculateXpRate(elapsedTime, xpGain));

    const counter = formatRemainingTime(seconds);
    $('#xpcounter').css('color', '#87CEEB').text(counter);

    // Calculate average XP based on the selected interval
    const averageXP = calculateAverageXP(elapsedTime, xpGain);
    const xpRateColor = getXpRateColor(averageXP, targetXpRate);
    $('#xprate').css('color', xpRateColor).html(`<span class="xprate-container">${ncomma(Math.round(averageXP))} XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}</span>`);
};

// Function to calculate XP rate
const calculateXpRate = (elapsedTime, xpGain) => {
    return Math.round(xpGain / elapsedTime);
};

// Function to format the remaining time based on seconds
const formatRemainingTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}min`;
};

// Function to calculate average XP based on the selected interval
const calculateAverageXP = (elapsedTime, xpGain) => {
    switch (xpInterval) {
        case 'second':
            return Math.round(xpGain / elapsedTime); // XP per second
        case 'minute':
            return Math.round(xpGain / (elapsedTime / 60)); // XP per minute
        case 'hour':
            return Math.round(xpGain / (elapsedTime / 3600)); // XP per hour
        case 'day':
            return Math.round(xpGain / (elapsedTime / 86400)); // XP per day
        default:
            console.warn(`Invalid interval: ${xpInterval}. Use 'second', 'minute', 'hour', or 'day'.`);
            return 0;
    }
};

// Function to determine the color based on average XP rate
const getXpRateColor = (averageXP, targetXpRate) => {
    if (averageXP < targetXpRate * 0.5) {
        return '#FF0000'; // Dark Red for way below target
    } else if (averageXP < targetXpRate) {
        return '#FFA500'; // Orange for below target
    } else if (averageXP >= targetXpRate && averageXP <= targetXpRate * 1.2) {
        return '#FFFF00'; // Yellow for at target
    } else if (averageXP <= targetXpRate * 1.5) {
        return '#90EE90'; // Light Green for above target
    } else {
        return '#00FF00'; // Green for way above target
    }
};

const ncomma = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Function to change the interval (can be called externally)
const setXPInterval = (newInterval) => {
    if (['second', 'minute', 'hour', 'day'].includes(newInterval)) {
        xpInterval = newInterval;
        console.log(`XP interval set to ${xpInterval}.`);
    } else {
        console.warn(`Invalid interval: ${newInterval}. Use 'second', 'minute', 'hour', or 'day'.`);
    }
};

// Initialize XP timer and set interval to update
initXpTimer();
setInterval(updateXpTimer, 500);
/////////////////////////////////////////////////////////////////////////////////
// All currently supported damageTypes: "Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF", "DPS", "Dmg Taken"
// Displaying too many "Types" will result in a really wide meter that will effect the game_log window. i reccomend only tracking 4/5 things at a time for general use
const damageTypes = ["Base", "Blast", "HPS", "DPS"];

// Toggle settings
let displayClassTypeColors = true;
let displayDamageTypeColors = true;
let showOverheal = false;
let showOverManasteal = true;

// Color mapping
const damageTypeColors = {
    Base: '#A92000',
    Blast: '#782D33',
    Burn: '#FF7F27',
    HPS: '#9A1D27',
    MPS: '#353C9C',
    DR: '#E94959',
    RF: '#D880F0',
    DPS: '#FFD700',
    "Dmg Taken": '#FF4C4C'
};

// Initialize the class color mapping
const classColors = {
    mage: '#3FC7EB',
    paladin: '#F48CBA',
    priest: '#FFFFFF', // White
    ranger: '#AAD372',
    rogue: '#FFF468',
    warrior: '#C69B6D'
};

// Overall-sums variables (optional use)
let damage = 0, burnDamage = 0, blastDamage = 0, baseDamage = 0;
let baseHeal = 0, lifesteal = 0, manasteal = 0, dreturn = 0, reflect = 0;
const METER_START = performance.now();

// Per-member tracking
let playerDamageSums = {};

function getPlayerEntry(id) {
    if (!playerDamageSums[id]) {
        playerDamageSums[id] = {
            startTime: performance.now(),
            sumDamage: 0,
            sumBurnDamage: 0,
            sumBlastDamage: 0,
            sumBaseDamage: 0,
            sumHeal: 0,
            sumLifesteal: 0,
            sumManaSteal: 0,
            sumDamageReturn: 0,
            sumReflection: 0,
            sumDamageTakenPhys: 0,
            sumDamageTakenMag: 0
        };
    }
    return playerDamageSums[id];
}

function getFormatted(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initDPSMeter() {
    const $ = parent.$;
    const brc = $('#bottomrightcorner');
    brc.find('#dpsmeter').remove();
    const container = $("<div id='dpsmeter'></div>").css({
        fontSize: '20px', color: 'white', textAlign: 'center', display: 'table', overflow: 'hidden', marginBottom: '-3px', width: '100%', backgroundColor: 'rgba(0,0,0,1)'
    });
    container.append(
        $("<div id='dpsmetercontent'></div>").css({ display: 'table-cell', verticalAlign: 'middle', padding: '2px', border: '4px solid grey' })
    );
    brc.children().first().after(container);
}

// Handle all hit events
parent.socket.on('hit', data => {
    const isParty = id => parent.party_list.includes(id)
    try {
        // == Party-only filter ==
        const attackerInParty = isParty(data.hid);
        const targetInParty = isParty(data.id);

        if (!attackerInParty && !targetInParty) return;

        // == Overall sums ==
        if (data.damage) {
            damage += data.damage;
            if (data.source === 'burn') burnDamage += data.damage;
            else if (data.splash) blastDamage += data.damage;
            else baseDamage += data.damage;
        }
        if (data.heal || data.lifesteal) {
            baseHeal += (data.heal ?? 0) + (data.lifesteal ?? 0);
            lifesteal += data.lifesteal ?? 0;
        }
        if (data.manasteal) manasteal += data.manasteal;

        // == Damage Return attribution (only mob→player) ==
        if (data.dreturn && get_player(data.id) && !get_player(data.hid)) {
            dreturn += data.dreturn;
            const e = getPlayerEntry(data.id);
            e.sumDamageReturn ??= 0;
            e.sumDamageReturn += data.dreturn;
        }

        // == Reflection attribution (only mob→player) ==
        if (data.reflect && get_player(data.id) && !get_player(data.hid)) {
            reflect += data.reflect;
            const e = getPlayerEntry(data.id);
            e.sumReflection ??= 0;
            e.sumReflection += data.reflect;
        }

        // == Damage taken by character ==
        // — normal hits from mobs
        if (data.damage && get_player(data.id)) {
            const e = getPlayerEntry(data.id);
            if (data.damage_type === 'physical') e.sumDamageTakenPhys += data.damage;
            else e.sumDamageTakenMag += data.damage;
        }
        // — self-damage from hitting a dreturn mob (physical)
        if (data.dreturn && get_player(data.hid)) {
            //console.log('Dreturn self-hit by', data.hid, 'for', data.dreturn);
            const e = getPlayerEntry(data.hid);
            e.sumDamageTakenPhys += data.dreturn;
        }
        // — self-damage from hitting a reflect mob (magical)
        if (data.reflect && get_player(data.hid)) {
            //console.log('Reflect self-hit by', data.hid, 'for', data.reflect);
            const e = getPlayerEntry(data.hid);
            e.sumDamageTakenMag += data.reflect;
        }

        // == Character actions ==
        // Heal / Lifesteal
        if (get_player(data.hid) && (data.heal || data.lifesteal)) {
            const e = getPlayerEntry(data.hid);
            const healer = get_player(data.hid);
            const target = get_player(data.id);

            const totalHeal = (data.heal ?? 0) + (data.lifesteal ?? 0);
            if (showOverheal) {
                e.sumHeal += totalHeal;
            } else {
                const actualHeal = (data.heal
                    ? Math.min(data.heal, (target?.max_hp ?? 0) - (target?.hp ?? 0))
                    : 0
                ) + (data.lifesteal
                    ? Math.min(data.lifesteal, healer.max_hp - healer.hp)
                    : 0
                    );
                e.sumHeal += actualHeal;
            }
        }

        // Mana steal
        if (get_player(data.hid) && data.manasteal) {
            const e = getPlayerEntry(data.hid);
            const p = get_entity(data.hid);
            if (showOverManasteal) e.sumManaSteal += data.manasteal;
            else e.sumManaSteal += Math.min(data.manasteal, p.max_mp - p.mp);
        }

        // Other damage done (per-player breakdown)
        if (data.damage && get_player(data.hid)) {
            const e = getPlayerEntry(data.hid);
            e.sumDamage += data.damage;
            if (data.source === 'burn') e.sumBurnDamage += data.damage;
            else if (data.splash) e.sumBlastDamage += data.damage;
            else e.sumBaseDamage += data.damage;
        }

    } catch (err) {
        console.error('hit handler error', err);
    }
});

// Compute stat value for type
function getTypeValue(type, entry) {
    const elapsed = performance.now() - entry.startTime;
    if (elapsed <= 0) return 0;
    switch (type) {
        case 'DPS': {
            const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
            return Math.floor(total * 1000 / elapsed);
        }
        case 'Burn': return Math.floor(entry.sumBurnDamage * 1000 / elapsed);
        case 'Blast': return Math.floor(entry.sumBlastDamage * 1000 / elapsed);
        case 'Base': return Math.floor(entry.sumBaseDamage * 1000 / elapsed);
        case 'HPS': return Math.floor(entry.sumHeal * 1000 / elapsed);
        case 'MPS': return Math.floor(entry.sumManaSteal * 1000 / elapsed);
        case 'DR': return Math.floor(entry.sumDamageReturn * 1000 / elapsed);
        case 'RF': return Math.floor(entry.sumReflection * 1000 / elapsed);
        case 'Dmg Taken': {
            const phys = Math.floor(entry.sumDamageTakenPhys * 1000 / elapsed);
            const mag = Math.floor(entry.sumDamageTakenMag * 1000 / elapsed);
            return { phys, mag };
        }
        default:
            return 0;
    }
}

// Calculate DPS for sorting
function calculateDPSForEntry(entry) {
    const elapsed = performance.now() - entry.startTime;
    if (elapsed <= 0) return 0;
    const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
    return Math.floor(total * 1000 / elapsed);
}

// Render the DPS meter UI
function updateDPSMeterUI() {
    const $ = parent.$;
    const c = $('#dpsmetercontent'); if (!c.length) return;
    // Elapsed time display
    const elapsedMs = performance.now() - METER_START;
    const hrs = Math.floor(elapsedMs / 3600000);
    const mins = Math.floor((elapsedMs % 3600000) / 60000);
    let html = `<div>👑 Elapsed Time: ${hrs}h ${mins}m 👑</div>` +
        '<table border="1" style="width:100%"><tr><th></th>';
    // Header row
    damageTypes.forEach(t => {
        const col = displayDamageTypeColors ? damageTypeColors[t] || 'white' : 'white';
        html += `<th style='color:${col}'>${t}</th>`;
    });
    html += '</tr>';
    // Player rows
    const classColors = { mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF', ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D' };
    const sorted = Object.entries(playerDamageSums)
        .map(([id, e]) => ({ id, dps: calculateDPSForEntry(e), e }))
        .sort((a, b) => b.dps - a.dps);
    sorted.forEach(({ id, e }) => {
        const p = get_player(id); if (!p) return;
        const nameCol = displayClassTypeColors ? classColors[p.ctype.toLowerCase()] || '#FFFFFF' : '#FFFFFF';
        html += `<tr><td style='color:${nameCol}'>${p.name}</td>`;
        damageTypes.forEach(t => {
            if (t === 'Dmg Taken') {
                const { phys, mag } = getTypeValue(t, e);
                html += `<td><span style='color:#FF4C4C'>${getFormatted(phys)}</span> | <span style='color:#6ECFF6'>${getFormatted(mag)}</span></td>`;
            } else {
                const val = getTypeValue(t, e);
                html += `<td>${getFormatted(val)}</td>`;
            }
        });
        html += '</tr>';
    });
    // Total row
    html += `<tr><td style='color:${damageTypeColors['DPS']}'>Total DPS</td>`;
    damageTypes.forEach(t => {
        if (t === 'Dmg Taken') {
            let totP = 0, totM = 0;
            Object.values(playerDamageSums).forEach(e => {
                const { phys, mag } = getTypeValue(t, e);
                totP += phys; totM += mag;
            });
            html += `<td><span style='color:#FF4C4C'>${getFormatted(totP)}</span> | <span style='color:#6ECFF6'>${getFormatted(totM)}</span></td>`;
        } else if (t === 'DPS') {
            let totalDmg = 0;
            Object.values(playerDamageSums).forEach(e => {
                totalDmg += e.sumDamage + e.sumDamageReturn + e.sumReflection;
            });
            const elapsed = performance.now() - METER_START;
            const totalDPS = Math.floor(totalDmg * 1000 / Math.max(elapsed, 1));
            html += `<td>${getFormatted(totalDPS)}</td>`;
        } else {
            let tot = 0;
            Object.values(playerDamageSums).forEach(e => tot += getTypeValue(t, e));
            html += `<td>${getFormatted(tot)}</td>`;
        }
    });
    html += '</tr></table>';
    c.html(html);
}

// Initialize and run
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
////////////////////////////////
// Initialize the PDPS meter
function initPDPSMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing PDPS meter
    brc.find('#pdpsmeter').remove();

    // Create a container for the PDPS meter
    let pdpsmeter_container = $('<div id="pdpsmeter"></div>').css({
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });

    // Create a div for the PDPS meter content
    let pdpsmeter_content = $('<div id="pdpsmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        padding: '2px',
        border: '4px solid grey',
    }).appendTo(pdpsmeter_container);

    // Insert the PDPS meter container
    brc.children().first().after(pdpsmeter_container);
}

// Function to get nearby players/entities and sort by PDPS
function updatePDPSMeterUI() {
    try {
        let $ = parent.$;
        let pdpsDisplay = $('#pdpsmetercontent');

        if (pdpsDisplay.length === 0) return;

        let entitiesWithPDPS = [];

        // Add your character's .s.coop.p
        entitiesWithPDPS.push({
            name: character.name, // Your character's name
            pdps: character.s.coop.p, // Accessing the new PDPS value
            classType: character.ctype // Get the class type of your character
        });

        // Add nearby players/entities with .s.coop.p
        for (let id in parent.entities) {
            let entity = parent.entities[id];
            if (entity.s && entity.s.coop && entity.s.coop.p !== undefined) {  // Include only those with .s.coop.p
                entitiesWithPDPS.push({
                    name: entity.name || entity.mtype, // Use player name or monster type
                    pdps: entity.s.coop.p, // Accessing the new PDPS value
                    classType: entity.ctype // Get the class type of the entity
                });
            }
        }

        // Sort by PDPS in descending order
        entitiesWithPDPS.sort((a, b) => b.pdps - a.pdps);

        // Get the highest .s.coop.p to calculate percentages
        let highestPDPS = entitiesWithPDPS[0]?.pdps || 1; // Prevent division by zero

        // Prepare the display string
        let listString = '<div>👑 Boss Contribution 👑</div>';
        listString += '<table border="1" style="width:100%;">';

        // Track the max rows per column
        let maxRows = 6;
        let totalPlayers = entitiesWithPDPS.length;
        let numColumns = Math.ceil(totalPlayers / maxRows);

        // Calculate column width based on number of columns
        let columnWidth = (100 / numColumns).toFixed(2) + '%'; // e.g., '50.00%', '33.33%', etc.

        // Iterate over each row (up to maxRows)
        for (let row = 0; row < maxRows; row++) {
            listString += '<tr>'; // Start a new row
            for (let col = 0; col < numColumns; col++) {
                let index = row + col * maxRows;
                if (index >= totalPlayers) break; // Stop if no more players

                let entity = entitiesWithPDPS[index];
                const playerClass = entity.classType.toLowerCase(); // Ensure class type is in lowercase
                const nameColor = classColors[playerClass] || '#FFFFFF'; // Default to white if class not found

                // Calculate the percentage for the progress bar using .s.coop.p
                let percentBarWidth = (entity.pdps / highestPDPS) * 100;

                // Create the progress bar with styling and the PDPS value inside the bar
                let progressBar = `<div style="width: 100%; background-color: gray; border-radius: 5px; overflow: hidden; position: relative;">
                    <div style="width: ${percentBarWidth}%; background-color: ${nameColor}; height: 10px;"></div>
                    <span style="position: absolute; top: -2px; left: 50%; transform: translateX(-50%); color: black; font-size: 16px; font-weight: bold;">${getFormattedPDPS(entity.pdps)}</span>
                </div>`;

                // Apply color to the player's name and display the progress bar with PDPS inside
                listString += `<td style="color: ${nameColor}; width: ${columnWidth};">${entity.name} ${progressBar}</td>`;
            }
            listString += '</tr>'; // End the row
        }

        listString += '</table>';
        pdpsDisplay.html(listString);

    } catch (error) {
        //console.error('Error updating PDPS meter UI:', error);
    }
}

// Helper function to format PDPS with commas for readability and round to nearest whole number
function getFormattedPDPS(pdps) {
    try {
        let roundedPDPS = Math.round(pdps); // Round to the nearest whole number
        return roundedPDPS.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('Formatting PDPS error:', error);
        return 'N/A';
    }
}

// Initialize the PDPS meter and update it every 250ms
//initPDPSMeter();
setInterval(updatePDPSMeterUI, 250);
////////////////////////////////////////////
function modifyGamelogAppearance() {
    let $ = parent.$;
    let gamelog = $('#gamelog');
    let referenceElement = $('#dpsmeter'); // Replace with your reference element ID

    if (gamelog.length && referenceElement.length) {
        // Get the width of the reference element, including padding and border
        let referenceWidth = referenceElement.outerWidth(); // true includes margin

        // Modify the appearance of the gamelog window
        gamelog.css({
            position: 'relative',
            //background: 'rgba(0,0,0,0.7)',
            background: 'rgba(0,0,0,1)',
            border: '4px solid gray',
            width: referenceWidth + 'px', // Set width to match the reference element
            height: '150px', // Set a fixed height, or adjust as needed
            fontSize: '20px',
            color: 'white',
            textAlign: 'left',
            overflowY: 'scroll',
            lineHeight: '24px',
            padding: '10px',
            fontFamily: 'pixel',
            wordWrap: 'break-word',
            WebkitFontSmoothing: 'subpixel-antialiased',
            pointerEvents: 'auto',
            fontWeight: 'normal',
            verticalAlign: 'middle',
            boxSizing: 'border-box' // Ensures padding and border are included in the width
        });
    } else {
        console.log("Element with ID 'gamelog' or reference element not found.");
    }
}

// Call the function after 5 seconds to ensure UI is ready
setInterval(modifyGamelogAppearance, 5000);

function modifyServerDivAppearance() {
    let $ = parent.$;
    let otherDiv = $('#bottomleftcorner2 > div.clickable');

    if (otherDiv.length) {
        // Modify the appearance of the other div
        otherDiv.css({
            background: 'black',
            border: 'solid gray',
            borderWidth: '4px 4px',
            width: '272px', // Adjust width as needed
            height: '25px', // Adjust height as needed
            lineHeight: '27px',
            fontSize: '20px', // Adjust font size as needed
            color: '#FFFFFF', // Adjust text color as needed
            textAlign: 'center',
            overflow: 'auto', // Add overflow auto to enable scrolling
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Set opacity to 70%
        });
    } else {
        console.log("Element not found.");
    }
}
// Call the function after 30 seconds
setTimeout(modifyServerDivAppearance, 40000);

function modifyChatDivAppearance() {
    let $ = parent.$;
    let otherDiv = $('#bottomleftcorner2 > div:nth-child(3)');

    if (otherDiv.length) {
        // Modify the appearance of the other div
        otherDiv.css({
            background: 'black',
            border: 'solid gray',
            borderWidth: '4px 4px',
            width: '280px', // Adjust width as needed
            height: '159px', // Adjust height as needed
            fontSize: '17px', // Adjust font size as needed
            color: '#FFFFFF', // Adjust text color as needed
            textAlign: 'left',
            overflow: 'auto', // Add overflow auto to enable scrolling
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Set opacity to 70%
        });
    } else {
        console.log("Element not found.");
    }
}
// Call the function after 30 seconds
setTimeout(modifyChatDivAppearance, 40000);

function modifyChatLogDivAppearance() {
    let $ = parent.$;
    let chatLogDiv = $('#chatlog');

    if (chatLogDiv.length) {
        // Modify the font size of the chat log div and disable horizontal scrolling
        chatLogDiv.css({
            fontSize: '18px', // Adjust font size as needed
            overflowX: 'hidden', // Disable horizontal scrolling
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            width: '100%',
        });
    } else {
        console.log("Chat log div element not found.");
    }
}
// Call the function after 30 seconds
setTimeout(modifyChatLogDivAppearance, 40000);

function modifyChatInputDivAppearance() {
    let $ = parent.$;
    let otherDiv = $('#chatinput');

    if (otherDiv.length) {
        // Modify the appearance of the other div
        otherDiv.css({
            userSelect: 'none',
            wordWrap: 'break-word',
            WebkitFontSmoothing: 'subpixel-antialiased',
            position: 'fixed',
            zIndex: 99,
            bottom: '2px',
            left: '7px',
            width: '275px',
            height: '25px',
            fontSize: '24px',
            fontFamily: 'Pixel',
            display: 'inline-block',
            background: '#404040',
            color: 'white',
            border: 'none',
            padding: '1px'
        });
    } else {
        console.log("Element not found.");
    }
}
// Call the function after 30 seconds
setTimeout(modifyChatInputDivAppearance, 40000);

function removeChatWithParty() {
    let $ = parent.$;
    let chatWithPartyDiv = $('#chatwparty');

    if (chatWithPartyDiv.length) {
        // Remove the chat with party div if it exists
        chatWithPartyDiv.remove();
    } else {
        console.log("Chat with party div element not found.");
    }
}

// Call the function after 30 seconds
setTimeout(removeChatWithParty, 40000);
//////////////////////////////////////////////////////////////////////////////////////////
let deaths = 0; // Variable to track the number of deaths
const killTime = new Date(); // Start time to calculate elapsed time

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
                //console.log(data); // Log the death event
                deaths++; // Increment the death count
                killHandler(); // Call the killHandler function
            }
        }
    }
});

function killHandler() {
    const elapsed = (new Date() - killTime) / 1000; // Calculate elapsed time in seconds
    if (elapsed > 0) { // Prevent division by zero
        const deathsPerSec = deaths / elapsed; // Calculate deaths per second
        const dailyKillRate = calculateKillRate(deathsPerSec); // Calculate deaths based on interval

        //add_top_button("kpm", Math.round(dailyKillRate.kpm).toLocaleString() + ' kpm'); // Deaths per minute
        //add_top_button("kph", Math.round(dailyKillRate.kph).toLocaleString() + ' kph'); // Deaths per hour
        add_top_button("kpd", Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd'); // Deaths per day

        // If you don't like the buttons and would rather the old set_message version
        // set_message(Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd');
    } else {
        console.warn("Elapsed time is zero, cannot calculate rates.");
    }
}

// Function to calculate deaths based on the interval
function calculateKillRate(deathsPerSec) {
    let kpm = deathsPerSec * 60; // Convert to deaths per minute
    let kph = kpm * 60; // Convert to deaths per hour
    let kpd = kph * 24; // Convert to deaths per day
    return { kpm, kph, kpd };
}

function updateMonsterButton() {
    let totalMonsters = 0;
    let poisonedMonsters = 0;

    for (const id in parent.entities) {
        const entity = parent.entities[id];
        if (entity.type === "monster" && entity.target === "CrownPriest") {
            totalMonsters++;
            if (entity.s && entity.s.poisoned) {
                poisonedMonsters++;
            }
        }
    }

    add_top_button("mon_status", `${totalMonsters} | ${poisonedMonsters} poisoned`);
}

// Call this function periodically to update the button
setInterval(updateMonsterButton, 250);
//////////////////////////////////////////////////////////////////////////////
let lastGoldCheck = character.gold;  // Store the last known gold value
let totalGoldAcquired = 0;           // Track the total gold acquired since the script started

// Function to check for gold increase and update the total gold acquired
function trackGoldAcquisition() {
    let currentGold = character.gold;

    // If current gold is greater than the last check, we've gained gold
    if (currentGold > lastGoldCheck) {
        let goldGained = currentGold - lastGoldCheck;
        totalGoldAcquired += goldGained; // Add the new gold gain to the total
    }

    // Update the last gold check value
    lastGoldCheck = currentGold;

    // Display the total gold acquired since code start
    //set_message(`Gold Acquired: ${totalGoldAcquired.toLocaleString()}`);
    set_message(totalGoldAcquired.toLocaleString(), "gold");
}

// Call the function periodically to check for gold changes
setInterval(trackGoldAcquisition, 1000);  // Check every second	
//////////////////////////////////////////////////////////////////////////////
function swapDivs() {
    let $ = parent.$;
    let skbar = $('#skillbar');
    let iframelist = $('#iframelist');
    $('#movebottomrighthere').remove();
    $('#skillbar').remove();
    $('#chatwparty').remove();
    //$('#chatinput').remove();
    $('#bottomleftcorner2').children().first().before(`<div id="movebottomrighthere" style="display: flex; flex-direction: row; align-items: flex-end; margin-top: -20px;"></div>`);
    $('#movebottomrighthere').append(skbar);
    //$('#movebottomrighthere').append(iframelist);
}

swapDivs();
/////////////////////////////////////////////////////////////////////////////////////////////////
if (parent.party_style_prepared) {
    parent.$('#style-party-frames').remove();
}

let css = `
        .party-container {
            position: absolute;
            top: 55px;
            left: -5%;
            width: 1000px; 
            height: 300px;
            transform: translate(0%, 0);
			fontFamily: 'pixel';
        }
    `;
//width normal is 480px, translate 8% normal
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name', 'xp', 'level', 'share', 'cc'];
const partyFrameWidth = 80; // Set the desired width for the party frames

function updatePartyData() {
    let myInfo = Object.fromEntries(Object.entries(character).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
    myInfo.lastSeen = Date.now();
    set(character.name + '_newparty_info', myInfo);
}

setInterval(updatePartyData, 200);

function getIFramedCharacter(name) {
    for (const iframe of top.$('iframe')) {
        const char = iframe.contentWindow.character;
        if (!char) continue; // Character isn't loaded yet
        if (char.name == name) return char;
    }
    return null;
}

let show_party_frame_property = {
    img: true,
    hp: true,
    mp: true,
    xp: true,
    cc: true,
    ping: true,
    share: true
};

function get_toggle_text(key) {
    return key.toUpperCase() + (show_party_frame_property[key] ? '✔️' : '❌');
}

function update_toggle_text(key) {
    const toggle = parent.document.getElementById('party-props-toggles-' + key);
    toggle.textContent = get_toggle_text(key);
}

function addPartyFramePropertiesToggles() {
    if (parent.document.getElementById('party-props-toggles')) {
        return;
    }

    const toggles = parent.document.createElement('div');
    toggles.id = 'party-props-toggles';
    toggles.classList.add('hidden');
    toggles.style = `
    display: flex; 
    flex-wrap: wrap;
    width: 100%;
    max-width: 480px;
    background-color: black;
    margin-top: 2px;
`;

    function create_toggle(key) {
        const toggle = parent.document.createElement('button');
        toggle.id = 'party-props-toggles-' + key;
        toggle.setAttribute('data-key', key);
        toggle.style = `
        border: 1px #ccc solid; 
        background-color: #000; 
        color: #ccc;
        width: 20%;
        margin: 0px;
		font-size: 9px;
        padding: 5px;
		cursor: pointer;
    `;
        toggle.setAttribute(
            'onclick',
            `parent.code_eval(show_party_frame_property['${key}'] = !show_party_frame_property['${key}']; update_toggle_text('${key}'));`
        );
        toggle.appendChild(parent.document.createTextNode(get_toggle_text(key)));
        return toggle;
    }

    for (let key of ['img', 'hp', 'mp', 'xp', 'share', 'cc']) {
        toggles.appendChild(create_toggle(key));
    }

    //let party = parent.document.getElementById('newparty');
    //let party_parent = party.parentNode;
    //party_parent.append(toggles);

    const rightBottomMenu = parent.document.getElementById("bottomrightcorner");
    const gameLogUi = parent.document.getElementById("gamelog");
    //rightBottomMenu.insertBefore(toggles, gameLogUi);
    // reactivate if you want toggle buttons ^^^^
}

function updatePartyFrames() {
    let $ = parent.$;
    let partyFrame = $('#newparty');
    partyFrame.addClass('party-container');

    if (partyFrame) {
        addPartyFramePropertiesToggles();

        for (let x = 0; x < partyFrame.children().length; x++) {
            let party_member_name = Object.keys(parent.party)[x];
            let info = get(party_member_name + '_newparty_info');
            if (!info || Date.now() - info.lastSeen > 1000) {
                let iframed_party_member = getIFramedCharacter(party_member_name);
                if (iframed_party_member) {
                    info = Object.fromEntries(Object.entries(iframed_party_member).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
                } else {
                    let party_member = get_player(party_member_name);
                    if (party_member) {
                        info = Object.fromEntries(Object.entries(party_member).filter(current => { return includeThese.includes(current[0]); }));
                    } else {
                        info = { name: party_member_name };
                    }
                }
            }

            let infoHTML = `<div style="width: ${partyFrameWidth}px; height: 20px; margin-top: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${info.name}</div>`;

            info.max_cc = 200;

            let hpWidth = 0;
            let mpWidth = 0;
            let hp = '??';
            let mp = '??';
            if (info.hp !== undefined) {
                hpWidth = info.hp / info.max_hp * 100;
                mpWidth = info.mp / info.max_mp * 100;
                hp = info.hp;
                mp = info.mp;
            }

            let xpWidth = 0;
            let xp = '??';
            if (info.xp !== undefined) {
                let lvl = info.level;
                let max_xp = G.levels[lvl];
                xpWidth = info.xp / max_xp * 100;
                xp = xpWidth.toFixed(2) + '%';

                //const billion = 1_000_000_000;
                //xp = (info.xp / billion).toFixed(1) + 'b/' + (max_xp / billion).toFixed(0) + 'b';
            }

            let ccWidth = 0;
            let cc = '??';
            if (info.cc !== undefined) {
                ccWidth = info.cc / info.max_cc * 100;
                cc = info.cc.toFixed(2);
            }

            let pingWidth = 0;
            let ping = '??';
            if (character.ping !== undefined) {
                pingWidth = -10;
                ping = character.ping.toFixed(0);
            }

            let shareWidth = 0;
            let share = '??';
            if (parent.party[party_member_name] && parent.party[party_member_name].share !== undefined) {
                shareWidth = parent.party[party_member_name].share * 100;
                share = (parent.party[party_member_name].share * 100).toFixed(2) + '%'; // Display share percentage with % sign
            }

            let data = {
                hp: hp,
                hpWidth: hpWidth,
                hpColor: 'red',
                mp: mp,
                mpWidth: mpWidth,
                mpColor: 'blue',
                xp: xp,
                xpWidth: xpWidth,
                xpColor: 'green',
                cc: cc,
                ccWidth: ccWidth,
                ccColor: 'grey',
                ping: ping,
                pingWidth: pingWidth,
                pingColor: 'black',
                share: share,
                shareWidth: shareWidth * 3,
                shareColor: 'teal',
            };

            for (let key of ['hp', 'mp', 'xp', 'share']) {
                const text = key.toUpperCase();
                const value = data[key];
                const width = data[key + 'Width'];
                const color = data[key + 'Color'];
                if (show_party_frame_property[key]) {
                    infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 17px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">${text}: ${value}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${color}; width: ${width}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;
                }
            }

            let party_member_frame = partyFrame.find(partyFrame.children()[x]);
            party_member_frame.children().first().css('display', show_party_frame_property['img'] ? 'inherit' : 'none');
            party_member_frame.children().last().html(`<div style="font-size: 22px;" onclick='pcs(event); party_click("${party_member_name}\");'>${infoHTML}</div>`);
        }
    }
}

parent.$('#party-props-toggles').remove();

setInterval(updatePartyFrames, 250);
///////////////////////////////////////////////////////////////////////////////////////
const ALDATA_KEY = "******************";

function updateTrackerData() {
    parent.socket.once("tracker", (data) => {
        const url = `https://aldata.earthiverse.ca/achievements/${character.id}/${ALDATA_KEY}`;
        const settings = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ max: data.max, monsters: data.monsters }),
        };
        // if response.status == 200, it was successfully updated
        fetch(url, settings).then((response) => console.log(response.status));
    });
}
parent.socket.emit("tracker");
function hideTracker() {
    parent.hide_modal()
}
setTimeout(hideTracker, 1000);
// Run the updateTrackerData function every minute (60000 milliseconds)
setInterval(updateTrackerData, 1000 * 60 * 10);

function modify_parent_function() {
    const change_parent_function = function () {
        this.render_tracker = function () {
            var a = "";
            a += "<div style='font-size: 32px'>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerm\").show();'>Monsters</div>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackere\").show();'>Exchanges and Quests</div>";
            a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerx\").show();'>Stats</div>";
            a += "</div>";

            // Render monsters
            a += "<div class='trackers trackerm'>";
            object_sort(G.monsters, "hpsort").forEach(function (b) {
                if ((!b[1].stationary && !b[1].cute || b[1].achievements) && !b[1].unlist) {
                    var c = (tracker.monsters[b[0]] || 0) + (tracker.monsters_diff[b[0]] || 0), d = "#50ADDD";
                    let borderColor = "#9F9FB0";

                    tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] > c && (c = tracker.max.monsters[b[0]][0], d = "#DCC343");
                    if ((tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] && tracker.max.monsters[b[0]][0]) && (b[1] && b[1].achievements)) {
                        if (tracker.max.monsters[b[0]][0] >= b[1].achievements[b[1].achievements.length - 1][0]) {
                            //borderColor = "#22c725";
                        }
                    }

                    a += "<div style='background-color:#575983; border: 2px solid" + borderColor + ";position: relative; display: inline-block; margin: 2px;'" +
                        "class='clickable' onclick='pcs(event); render_monster_info(\"" + b[0] + "\")'>";

                    a = 1 > (G.monsters[b[0]].size || 1) ? a + sprite(b[1].skin || b[0], { scale: 1 }) : a + sprite(b[1].skin || b[0], { scale: 1.5 });
                    c && (a += "<div style='background-color:#575983; border: 2px solid " + borderColor + "; position: absolute; top: -2px; left: -2px; color:" + d + "; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(c) + "</div>");
                    tracker.drops && tracker.drops[b[0]] && tracker.drops[b[0]].length && (a += "<div style='background-color:#FD79B0; border: 2px solid " + borderColor + "; position: absolute; bottom: -2px; right: -2px; display: inline-block; padding: 1px 1px 1px 1px; height: 2px; width: 2px'></div>");
                    a += "</div>";
                }
            });
            a += "</div>";

            // Render exchanges and quests
            a += "<div class='trackers trackere hidden' style='margin-top: 3px'>";
            object_sort(G.items).forEach(function (b) {
                if (b[1].e && !b[1].ignore) {
                    var c = [[b[0], b[0], void 0]];
                    if (b[1].upgrade || b[1].compound) {
                        c = [];
                        for (var d = 0; 13 > d; d++)
                            G.drops[b[0] + d] && c.push([b[0], b[0] + d, d]);
                    }

                    c.forEach(function (b) {
                        a += "<div style='margin-right: 3px; margin-bottom: 3px; display: inline-block; position: relative;'";
                        a = G.drops[b[1]] ? a + (" class='clickable' onclick='pcs(event); render_exchange_info(\"" + b[1] + '",' + (tracker.exchanges[b[1]] || 0) + ")'>") : a + ">";
                        a += item_container({ skin: G.items[b[0]].skin }, { name: b[0], level: b[2] });
                        tracker.exchanges[b[1]] && (a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#ED901C; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(tracker.exchanges[b[1]]) + "</div>");
                        a += "</div>";
                    });
                }
            });
            a += "</div>";

            // Render achievements
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

                        if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0, monsters: [] };
                        achievements[reward].value += 0;
                        achievements[reward].maxvalue += amount;
                        achievements[reward].monsters.push({ mtype, needed, amount });
                    }
                    else {
                        if (type !== "stat") continue;
                        if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0, monsters: [] };
                        achievements[reward].value += amount;
                        achievements[reward].maxvalue += amount;
                        achievements[reward].monsters.push({ mtype, needed, amount });
                    }
                }
            }

            // Sort achievements alphabetically
            const sortedAchievements = Object.entries(achievements)
                .sort(([a], [b]) => a.localeCompare(b))
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});

            a += "<div class='trackers trackerx hidden' style='margin-top: 3px'>";
            a += "<div style='font-size: 28px; display: flex; flex-wrap: wrap; justify-content: space-evenly;'>";

            for (const ac in sortedAchievements) {
                const achievement = sortedAchievements[ac];
                const isCompleted = achievement.value >= achievement.maxvalue;

                a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; width: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2px; padding: 10px; text-align: center; position: relative;' onclick='toggleDropdown(\"" + ac + "\")'>";
                a += `${ac}: ${achievement.value.toLocaleString()} of ${achievement.maxvalue.toLocaleString()}`;
                a += "<div id='dropdown-" + ac + "' class='dropdown-content' style='display: none; background-color:#000000; border: 2px solid #9F9FB0; width: 550px; margin-top: 5px; padding: 5px; position: absolute; z-index: 9999; max-height: 500px; overflow-y: auto;'>";

                // Sort monsters by needed value, then alphabetically by monster name
                achievement.monsters.sort((a, b) => {
                    if (a.needed !== b.needed) {
                        return a.needed - b.needed;
                    }
                    return a.mtype.localeCompare(b.mtype);
                }).forEach(monster => {
                    const isCompleted = tracker.max.monsters[monster.mtype] && tracker.max.monsters[monster.mtype][0] >= monster.needed;
                    const fontColor = isCompleted ? 'green' : 'white'; // Font color based on completion status

                    a += `<div style='color: ${fontColor};'>Monster: ${monster.mtype} | Needed: ${monster.needed.toLocaleString()} | Amount: ${monster.amount.toLocaleString()}</div>`;
                });

                a += "</div>";
                a += "</div>";
            }

            a += "</div>";
            a += "</div>";

            show_modal(a, {
                wwidth: 578,
                hideinbackground: !0
            });

            // Function to toggle dropdown visibility
            window.toggleDropdown = function (achievement) {
                const dropdown = document.getElementById('dropdown-' + achievement);
                dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
            }
        }

        this.render_drop = function (a, b, c) {
            var d = "";
            if ("open" == a[1]) {
                var e = 0;
                G.drops[a[2]].forEach(function (a) {
                    e += a[0];
                });
                G.drops[a[2]].forEach(function (g) {
                    d += render_drop(g, b * a[0] / e, c);
                });
                return d;
            }
            d += "<div style='position: relative; white-space: nowrap;'>";
            var f = "", g = void 0;
            G.items[a[1]] ? (f = G.items[a[1]].skin, g = { name: a[1], q: a[2], data: a[3] }) : "empty" == a[1] ? d += "<div style='z-index: 1; background-color:#575983; border: 200px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#C5C7E0; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>ZILCH</div>" : "shells" == a[1] ? (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#8DE33B; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>", f = "shells") : "gold" == a[1] && (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:gold; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>", f = "gold");
            "cx" == a[1] ? d += cx_sprite(a[2], { mright: 4 }) : "cxbundle" == a[1] ? G.cosmetics.bundle[a[2]].forEach(function (a) {
                d += cx_sprite(a, { mright: 4 });
            }) : d += "<span class='clickable' onclick='pcs(event); render_item_info(\"" + a[1] + '",0,"' + (g && g.data || "") + "\")'>" + item_container({ skin: f }, g) + "</span>";
            d = 1 <= round(a[0] * b) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>" + to_pretty_num(round(a[0] * b)) + " / 1</div>") : 1.1 <= 1 / (a[0] * b) && 10 > 1 / (a[0] * b) && 10 * parseInt(1 / (a[0] * b)) != parseInt(10 / (a[0] * b)) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>10 / " + to_pretty_num(round(10 / (a[0] * b))) + "</div>") : d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>1 / " + to_pretty_num(round(1 / (a[0] * b))) + "</div>");
            return d += "</div>";
        }
    }
    // Eval the function string to have to defined in parent scope
    const full_function_text = change_parent_function.toString();
    parent.smart_eval(full_function_text.slice(full_function_text.indexOf("{") + 1, full_function_text.lastIndexOf("}")));
}
modify_parent_function();
