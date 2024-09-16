pause();
// Define constants for character names
const chars = {
    //MAGE: "CrownMage",
    MERCHANT: "CrownMerch",
    PALADIN: "CrownPal",
    //PRIEST: "CrownPriest",
    WARRIOR: "CrownTown",
};

// Define starting levels
const codeSlots = {
    //MAGE: 28,
    MERCHANT: 95,
    PALADIN: 18,
    //PRIEST: 3,
    WARRIOR: 2,
};

let startChar = true;
let circleMoves = true;

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
    bigbird: [{ x: 1343, y: 248 }],
    boar: [{ x: 19, y: -1109 }],
    bscorpion: [{ x: -616, y: -1279 }],
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
    oneeye: [{ x: -168, y: 142 }],
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
const speed = 1.5315; // normal 1.5315;
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

const boundaryOur = Object.values(G.maps[mobMap].monsters).find(e => e.type === home).boundary;
const [topLeftX, topLeftY, bottomRightX, bottomRightY] = boundaryOur;
const centerX = (topLeftX + bottomRightX) / 2;
const centerY = (topLeftY + bottomRightY) / 2;

async function eventer() {
    const delay = 100;
    try {
        if (events) {
            //handleEvents();
            //game_log("Event Time");
        } else if (stompyActive || skeletorActive) {
            //handleBosses();
            //game_log("Boss Time");
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
            //game_log("Home Time");
        } else {
            //walkInCircle();
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
    try {
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
    if (harpyActive) {
        handleHarpyEvent();
    }
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
function walkInCircle() {
    if (!smart.moving) {
        const center = locations[home][0];
        const radius = 45; //normal 45

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

    draw_circle(center.x, center.y, radius, 3, 0xE8FF00); // ranger path
    draw_circle(center.x, center.y, 25, 3, 0xFF00FB); // warr path
    draw_circle(center.x, center.y, 35, 3, 0xFFFFFF); //priest path
    draw_circle(center.x, center.y, 1, 3, 0x00FF00); // center point
    draw_circle(center.x, center.y, 55, 3, 0x00FF00); //kill zone

    //draw_line(topLeftX, topLeftY, bottomRightX, topLeftY, 2, 0xFF0000);
    //draw_line(bottomRightX, topLeftY, bottomRightX, bottomRightY, 2, 0xFF0000);
    //draw_line(bottomRightX, bottomRightY, topLeftX, bottomRightY, 2, 0xFF0000);
    //draw_line(topLeftX, bottomRightY, topLeftX, topLeftY, 2, 0xFF0000);
    draw_circle(centerX, centerY, 1, 2, 0x00FF00);
    draw_circle(character.x, character.y, G.skills.zapperzap.range, 2, 0x00C7FF);

    draw_circle(character.x, character.y, character.range, 2, 0xE8FF00)
    //draw_all_boxes_on_map();
    //draw_circle(264,-804,2,2,0x00FF00)
    draw_circle(character.x, character.y, 600, 2, 0x000000)
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

const equipmentSets = {
    dps: [
        //{ itemName: "orbofdex", slot: "orb", level: 5, l: "l" },
        { itemName: "pants", slot: "pants", level: 13, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "l" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "s" },
    ],
    wabbit: [
        // { itemName: "orbofdex", slot: "orb", level: 5, l: "l" },
        { itemName: "pants", slot: "pants", level: 13, l: "l" },
        { itemName: "coat", slot: "chest", level: 13, l: "l" },
        { itemName: "suckerpunch", slot: "ring1", level: 1, l: "l" },
        { itemName: "suckerpunch", slot: "ring2", level: 1, l: "s" },
        { itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
    ],
    luck: [
        //{ itemName: "rabbitsfoot", slot: "orb", level: 2, l: "l" },
        { itemName: "ringofluck", slot: "ring2", level: 0, l: "l" },
        { itemName: "ringofluck", slot: "ring1", level: 0, l: "s" }
    ],
    single: [
        { itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
        //{ itemName: "coat", slot: "chest", level: 13, l: "l" }
    ],
    dead: [
        { itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
        //{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" }
    ],
    boom: [
        { itemName: "pouchbow", slot: "mainhand", level: 11, l: "l" },
        //{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" }
    ],
    heal: [
        { itemName: "cupid", slot: "mainhand", level: 8, l: "l" },
    ],
    xp: [
        { itemName: "talkingskull", slot: "orb", level: 4, l: "l" },
        { itemName: "tshirt3", slot: "chest", level: 7, l: "l" },
    ],
    stealth: [
        { itemName: "stealthcape", slot: "cape", level: 0, l: "l" },
    ],
    cape: [
        { itemName: "gcape", slot: "cape", level: 9, l: "l" },
    ],
    orb: [
        { itemName: "orbofdex", slot: "orb", level: 5, l: "l" },
        { itemName: "tshirt9", slot: "chest", level: 7, l: "l" },
    ]
};
//////////////////////////////////////////////////////////////////
let lastSwitchTime = 0; // Timestamp of the last switch
const switchCooldown = 750; // Cooldown period in milliseconds (0.75 seconds)
let state = "attacking"; // Default state

async function attackLoop() {
    let delay = null; // Initial delay
    const X = locations[home][0].x; // X coordinate of home location
    const Y = locations[home][0].y; // Y coordinate of home location
    const rangeThreshold = 55; // Range threshold for counting monsters
    //const targetNames = ["CrownPriest", "CrownTown"];
    const targetNames = ["Miau", "Atlus", "Mommy", "DoubleG", "SingleG", "Scoliosis"];

    // Set heal threshold based on healer presence
    let healThreshold = 0.4;
    const healer = get_entity("Mommy"); // Check if healer is present

    if (!healer || healer.rip) {
        healThreshold = .9; // Increase threshold if healer is not around
    }

    try {
        // Count monsters within range and out of range
        let sortedByHP = Object.values(parent.entities)
            .filter(e => e.type === "monster" && e.target && targetNames.includes(e.target))
            .sort((a, b) => b.hp - a.hp);

        let monstersInRangeList = sortedByHP.filter(e => Math.hypot(e.x - X, e.y - Y) <= rangeThreshold);
        let monstersOutOfRangeList = sortedByHP.filter(e => Math.hypot(e.x - X, e.y - Y) > rangeThreshold);

        // Determine the state based on healing needs
        let heal_target = lowest_health_partymember();

        if (heal_target && heal_target.hp < heal_target.max_hp * healThreshold) {
            state = "healing";  // Set to healing if someone is below the heal threshold
        } else {
            state = "attacking";  // Otherwise, focus on attacking
        }

        // Switch behavior based on the current state
        switch (state) {
            case "healing":
                if (performance.now() - lastSwitchTime > switchCooldown) {
                    equipSet('heal');  // Switch to healing set
                    lastSwitchTime = performance.now();
                }
                game_log("Attempting to heal: " + heal_target.name, "#ac1414");
                await attack(heal_target); // Heal the target
                delay = ms_to_next_skill('attack');
                break;

            case "attacking":
                if (sortedByHP.length) {
                    let highestHPMonster = sortedByHP[0];
                    if (highestHPMonster) {
                        change_target(highestHPMonster);
                        if (!is_on_cooldown("huntersmark")) {
                            await use_skill("huntersmark", highestHPMonster.id);
                        }
                        if (!is_on_cooldown("supershot")) {
                            await use_skill("supershot", highestHPMonster.id);
                        }
                    }

                    if (monstersInRangeList.length >= 4) {
                        if (performance.now() - lastSwitchTime > switchCooldown) {
                            //equipSet('boom');
                            equipSet('dead');
                            lastSwitchTime = performance.now();
                        }
                        await use_skill("5shot", monstersInRangeList.slice(0, 5).map(e => e.id)); // Use the 5-shot skill
                        delay = ms_to_next_skill("attack");
                    } else if (monstersOutOfRangeList.length >= 4) {
                        if (performance.now() - lastSwitchTime > switchCooldown) {
                            equipSet('dead');
                            lastSwitchTime = performance.now();
                        }
                        await use_skill("5shot", monstersOutOfRangeList.slice(0, 5).map(e => e.id)); // Use the 5-shot skill
                        delay = ms_to_next_skill("attack");
                    } else if (sortedByHP.length >= 2) {
                        let targets = sortedByHP.slice(0, 3).map(e => e.id); // Top 3 monsters overall
                        if (performance.now() - lastSwitchTime > switchCooldown) {
                            equipSet('dead');
                            lastSwitchTime = performance.now();
                        }
                        await use_skill("3shot", targets); // Use the 3-shot skill
                        delay = ms_to_next_skill("attack");
                    } else if (sortedByHP.length === 1) {
                        let target = sortedByHP[0].id; // Single monster overall
                        if (performance.now() - lastSwitchTime > switchCooldown) {
                            equipSet('single');
                            lastSwitchTime = performance.now();
                        }
                        await attack(target); // Use the attack skill
                        delay = ms_to_next_skill("attack");
                    }
                }
                break;

            default:
                console.error("Unknown state: " + state);
                break;
        }
    } catch (e) {
        //console.error(e);
    }

    setTimeout(attackLoop, delay); // Recursive call with the updated delay
}

// Start the attack loop
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
            break; // Assuming you only want to send the message once if any of the items is found
        }
    }
}
setInterval(rareItemPickup, 1000);

function sendUpdates() {
    parent.socket.emit("send_updates", {})
}
setInterval(sendUpdates, 20000);

function pingButton() {
    add_top_button("Ping", character.ping.toFixed(0));
}
setInterval(pingButton, 1000);

function topButtons() {
    add_top_button("Stop", "🔄", () => {
        stop_character("CrownMerch");
        startChar = false;
    });
    add_top_button("MLuck", "ML", () => {
        send_cm("CrownMerch", {
            message: "location",
            x: character.x,
            y: character.y,
            map: character.map
        });
    });
    add_top_button("Return", "R&M", () => {
        send_cm(["CrownPriest", "CrownMage", "CrownTown"], {
            message: "location",
            x: character.x,
            y: character.y,
            map: character.map
        });
    });
    add_top_button("Pause", "PP", () => {
        parent.no_html = true
        parent.no_graphics = true
        pause();
        startChar = true;
    });
    add_top_button("Pause2", "⏸️", () => {
        pause();
        startChar = true;
    });
}
topButtons();

function send_merchant() {
    try {
        const merchant = get_player("CrownMerch");
        if (merchant && distance(character, merchant) <= 250) {
            for (let i = 37; i < 41; i++) {
                const item = character.items[i];
                if (item && item.q > 0) { // Check if item exists and has quantity
                    send_item('CrownMerch', i, item.q); // Send item with its actual quantity
                }
            }
        }
    } catch (e) {
        console.error("Error in send_merchant function:", e);
    }
}

// Adjusted interval for efficiency
setInterval(send_merchant, 2000); // Increased interval to 2 seconds

// Define constants
const lootMuleName = "CrownMerch";
const goldThreshold = 11 * 1000000;
const minGoldTransfer = 10 * 1000000;
const itemsToExclude = [
    "hpot1", "mpot1", "luckbooster", "goldbooster", "xpbooster", "pumpkinspice",
    "xptome", "orbofdex", "orbofstr", "strbelt", "intbelt", "dexbelt", "cscroll0",
    "cscroll1", "greenbomb", "xshot"
];

// Function to transfer gold
function transferGold(lootMule) {
    if (character.gold > goldThreshold) {
        const goldToSend = Math.floor((character.gold - minGoldTransfer) / 1000000) * 1000000;
        send_gold(lootMule.id, goldToSend);
    }
}

// Function to send items to the loot mule
function sendItems(lootMule) {
    character.items.forEach((item, index) => {
        if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
            send_item(lootMule.id, index, item.q ?? 1);
        }
    });
}

// Main function to manage loot
function manageLoot() {
    const lootMule = get_player(lootMuleName);

    if (!lootMule) {
        lootTransfer = false;
        return;
    }

    transferGold(lootMule);
    sendItems(lootMule);
}

// Run manageLoot every second
setInterval(manageLoot, 1000);

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

let lastSwapTime = 0;
const swapCooldown = 500; // 500ms cooldown between swaps
let capeSwapTime = 0;

async function itemSwap() {
    const delay = 25;
    const hpThreshold = 25000;
    const now = Date.now();

    try {
        // Check if any monster is below hpThreshold
        const monstersBelowThreshold = Object.values(parent.entities).some(entity =>
            entity.mtype === home && entity.hp < hpThreshold
        );

        // Only allow swap if enough time has passed since the last swap
        if (now - lastSwapTime > swapCooldown) {
            // Equip xpSet if any monster is below hpThreshold
            if (monstersBelowThreshold && character.slots?.orb?.name !== "talkingskull") {
                equipSet('xp');
                lastSwapTime = now; // Update last swap time
            }
            // Equip orbSet if no monster is below hpThreshold
            else if (character.slots?.orb?.name !== "orbofdex") {
                equipSet('orb');
                lastSwapTime = now; // Update last swap time
            }
        }

        // Cape Swap
        if (now - capeSwapTime > swapCooldown) {
            // Equip stealthSet if enough chests are present
            if (getNumChests() >= 7 && character.slots?.cape?.name !== "stealthcape") {
                equipSet('stealth');
                //console.log("Equipping Stealth Cape");
                game_log("Equipping Stealth Cape", "white");
                capeSwapTime = now; // Update last swap time
            }
            // Equip capeSet if not already equipped
            else if (character.slots?.cape?.name !== "gcape") {
                equipSet('cape');
                game_log("Equipping Normal Cape", "white");
                capeSwapTime = now; // Update last swap time
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(itemSwap, delay);
}

itemSwap();

character.on("loot", function (data) {
    console.log(character.slots?.cape?.name, data);
});

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


function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill];
    if (next_skill == undefined) return 0;
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

let group = ["Mommy", "CrownsAnal", "CrownTown", "CrownPriest", "CrownMerch", "CrownMage"];

function partyMaker() {
    let partyLead = get_entity(group[0]); // The first character in the group is the leader
    let currentParty = character.party; // Get the current party details
    let healer = get_entity("Mommy");
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
            fontFamily: 'pixel'
        });
        let gamelog_tab = $('<div class="gamelog-tab enableclicks" />').css({
            height: '100%',
            width: 'calc(100% / 6)',
            textAlign: 'center',
            lineHeight: '24px',
            cursor: 'default'
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
//////////////////////////////////////////////////////////////////////////////////////////
var till_level = 0; // Kills till level = 0, XP till level = 1
setInterval(function () {
    updateGUI();
}, 1000 / 4);
function initGUI() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    $('#xpui').css({
        fontSize: '28px',
        width: "100%",
        borderWidth: '422px 422px',
        margin: '0px 0',
    });
    brc.find('.xpsui').css({
        background: 'url("https://i.imgur.com/zCb8PGK.png")',
        backgroundSize: 'cover',
        width: "96.5%",
        //borderWidth: '4px 4px',
        //height: "30px",
    });
}
var last_target = null;
if (till_level === 0)
    function updateGUI() {
        let $ = parent.$;
        let xp_percent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
        let xp_string = `LV${character.level} ${xp_percent}%`;
        if (parent.ctarget && parent.ctarget.type == 'monster') {
            last_target = parent.ctarget.mtype;
        }
        if (last_target) {
            //let xp_missing = parent.G.levels[character.level] - character.xp;
            //let monster_xp = parent.G.monsters[last_target].xp;
            //let party_modifier = character.party ? 1.5 / parent.party_list.length : 1;
            //let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
            //xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
        }
        $('#xpui').html(xp_string);
        $('#goldui').html(ncomma(character.gold) + " GOLD");
    } else if (till_level === 1)
    function updateGUI() {
        let $ = parent.$;
        let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
        let xp_missing = ncomma(G.levels[character.level] - character.xp);
        let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
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
        //position: 'relative',
        fontSize: '25px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: "100%",
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
        //position: 'relative',
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
/////////////////////////////////////////////////////////////////////////////////
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
        //all damageTypes are ["Base", "Blast", "Burn",  "HPS", "MPS", "DPS"];
        const damageTypes = ["Base", "Blast", "HPS", "DPS"];
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

        let elapsedTime = getElapsedTime();

        let listString = `<div>👑 Elapsed Time: ${elapsedTime} 👑</div>`;
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
////////////////////////////////////////////////////////////////////////////
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
            background: 'rgba(0,0,0,0.7)',
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
                console.log(data); // Log the death event
                Deaths++; // Increment the death count
                killHandler(); // Call the killHandler function
            }
        }
    }
});
function killHandler() {
    let elapsed = (new Date() - StartTime) / 1000; // Calculate elapsed time in seconds
    let DeathsPerSec = Deaths / elapsed; // Calculate deaths per second
    let dailyKillRate = Math.round(DeathsPerSec * 60); // Calculate deaths per day
    add_top_button("kpm", Math.round(dailyKillRate).toLocaleString() + ' kpm');
    add_top_button("kph", Math.round(dailyKillRate * 60).toLocaleString() + ' kph');
    add_top_button("kpd", Math.round(dailyKillRate * 60 * 24).toLocaleString() + ' kpd');
}
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
        }
    `;
//width normal is 480px, translate 8% normal
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name', 'cc', 'xp', 'level', 'share'];
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
    cc: false,
    ping: false,
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
	display: block;
	width: 280px;
	background-color: black;
	margin-top: 0px;
	`;

    function create_toggle(key) {
        const toggle = parent.document.createElement('button');
        toggle.id = 'party-props-toggles-' + key;
        toggle.setAttribute('data-key', key);
        toggle.style =
            "border: 2px #ccc solid; background-color: #000; color: #ccc";
        toggle.setAttribute(
            'onclick',
            "parent.code_eval(\`show_party_frame_property['" + key + "'] = !show_party_frame_property['" + key + "']; update_toggle_text('" + key + "')\`);"
        );
        toggle.appendChild(parent.document.createTextNode(get_toggle_text(key)));
        return toggle;
    }

    for (let key of ['img', 'hp', 'mp', 'xp', 'cc', 'share']) {
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
                share = (parent.party[party_member_name].share * 100).toFixed(0) + '%'; // Display share percentage with % sign
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
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">${text}: ${value}</div>
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
const ALDATA_KEY = "**********";

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
// Run the updateTrackerData function every minute (60000 milliseconds)
setInterval(updateTrackerData, 1000 * 60 * 10);
