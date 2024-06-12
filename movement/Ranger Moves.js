let harpyDeath = parseInt(localStorage.getItem('harpyDeath')) || 0;
let skeletorDeath = parseInt(localStorage.getItem('skeletorDeath')) || 0;

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
    }
});

const locations = {
    fireroamer: [{ x: 222, y: -827 }],
    bigbird: [{ x: 1343, y: 248 }],
    plantoid: [{ x: -840, y: -340 }],
    mole: [{ x: 14, y: -1072 }],
    ent: [{ x: -420, y: -1960 }],
    wolf: [{ x: 400, y: -2918 }],
    oneeye: [{ x: -500, y: 100 }],
    xscorpion: [{ x: -495, y: 685 }],
    gscorpion: [{ x: 390, y: -1425 }],
    rat: [{ x: 6, y: 430 }],
    boar: [{ x: 17, y: -1107 }],
    prat: [{ x: 6, y: 430 }],
    stoneworm: [{ x: 830, y: 7 }],
    mechagnome: [{ x: 0, y: 0 }],
    crab: [{ x: -11840, y: -37 }],
    wolfie: [{ x: 113, y: -2014 }],
    mummy: [{ x: 256, y: -1417 }],
    cgoo: [{ x: -221, y: -274 }],
    bat: [{ x: 1200, y: -10 }],
    poisio: [{ x: -121, y: 1360 }],
    spider: [{ x: 1247, y: -91 }],
    iceroamer: [{ x: 823, y: -45 }],
    pppompom: [{ x: 292, y: -189 }],
    ghost: [{ x: -405, y: -1642 }],
	pinkgoblin: [{ x: 366, y: 377 }],
	bscorpion: [{ x: -616, y: -1279 }],
	boar: [{ x: 19, y: -1109 }],
	bbpompom: [{ x: -82, y: -949 }],
};

const home = 'fireroamer';
const mobMap = 'desertland';
const destination = {
    map: mobMap,
    x: locations[home][0].x,
    y: locations[home][0].y
};

let angle = 0;
const speed = 1.5315;
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
			//game_log("Event Time");
        } else if (harpyActive || skeletorActive) {
            //handleBosses();
			//game_log("Boss Time");
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
			//game_log("Home Time");
        } else {
            walkInCircle();
			//game_log("Circle Time");
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
        dpsSet();
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
        const radius = 45;

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
    draw_circle(center.x, center.y, 30, 3, 0xFF00FB); // warr path
    draw_circle(center.x, center.y, 20, 3, 0xFFFFFF); //priest path
    draw_circle(center.x, center.y, 1, 3, 0x00FF00); // center point
    draw_circle(center.x, center.y, 40, 3, 0x00FF00); //kill zone

    draw_line(topLeftX, topLeftY, bottomRightX, topLeftY, 2, 0xFF0000);
    draw_line(bottomRightX, topLeftY, bottomRightX, bottomRightY, 2, 0xFF0000);
    draw_line(bottomRightX, bottomRightY, topLeftX, bottomRightY, 2, 0xFF0000);
    draw_line(topLeftX, bottomRightY, topLeftX, topLeftY, 2, 0xFF0000);
    draw_circle(centerX, centerY, 1, 2, 0x00FF00);
	draw_circle(character.x, character.y, G.skills.zapperzap.range, 2, 0x00C7FF);
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
            luckSet();
        } else if (harpy.hp > 50000 && character.cc < 100) {
            dpsSet();
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
            //maxLuckSet();
        } else if (skele.hp > 50000 && character.cc < 100) {
            dpsSet();
        }
    }
}

eventer();
