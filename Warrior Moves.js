let harpyDeath = parseInt(localStorage.getItem('harpyDeath')) || 0;
let skeletorDeath = parseInt(localStorage.getItem('skeletorDeath')) || 0;

game.on('death', data => {
    if (parent.entities[data.id]) {
        const mob = parent.entities[data.id];
        const mobType = mob.mtype;
        if (mobType === 'rharpy') {
            harpyDeath = Date.now();
            localStorage.setItem('harpyDeath', harpyDeath);
            console.log(`The mob "${mobType}" has died.`);
        }
        if (mobType === 'skeletor') {
            skeletorDeath = Date.now();
            localStorage.setItem('skeletorDeath', skeletorDeath);
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
    gscorpion: [{ x: 415, y: -1428 }],
    rat: [{ x: 6, y: 430 }],
    boar: [{ x: 17, y: -1107 }],
    prat: [{ x: 6, y: 430 }],
    stoneworm: [{ x: 830, y: 7 }],
    mechagnome: [{ x: 0, y: 0 }],
    crab: [{ x: -11840, y: -37 }],
    wolfie: [{ x: 113, y: -2014 }],
    mummy: [{ x: 256, y: -1417 }],
    cgoo: [{ x: -221, y: -274 }],
    bat: [{ x: 1200, y: -765 }],
    poisio: [{ x: -121, y: 1360 }],
    spider: [{ x: 1247, y: -91 }],
    iceroamer: [{ x: 823, y: -45 }],
    pppompom: [{ x: 292, y: -189 }],
    ghost: [{ x: -405, y: -1642 }],
	pinkgoblin: [{ x: 366, y: 377 }],
	bscorpion: [{ x: -408, y: -1241 }],
};

const home = 'fireroamer';
const mobMap = 'desertland';
const destination = {
    map: mobMap,
    x: locations[home][0].x,
    y: locations[home][0].y
};

let angle = 0;
const speed = 2;
let events = false;

const boundaryOur = Object.values(G.maps[mobMap].monsters).find(e => e.type === home).boundary;
const [topLeftX, topLeftY, bottomRightX, bottomRightY] = boundaryOur;
const centerX = (topLeftX + bottomRightX) / 2;
const centerY = (topLeftY + bottomRightY) / 2;

async function eventer() {
    const delay = 100;

    try {
        if (events) {
            handleEvents();
        } else if (!get_nearest_monster({ type: home })) {
            handleHome();
        } else {
            walkInCircle();
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(eventer, delay);
}

function handleEvents() {
    if (parent?.S?.holidayseason && !character?.s?.holidayspirit) {
        if (!smart.moving) {
            smart_move({ to: "town" }, () => {
                parent.socket.emit("interaction", { type: "newyear_tree" });
            });
        }
    } else {
		// Handle standard events
		/*
        handleSpecificEvent('dragold', 'cave', 1180, -810, 500000, 900);
        handleSpecificEvent('snowman', 'winterland', 1200, -900, 50);
        handleSpecificEventWithJoin('goobrawl', 'goobrawl', 52, -169, 50000);
        handleSpecificEventWithJoin('crabxx', 'main', -986, 1785, 100000);
        handleSpecificEventWithJoin('franky', 'level2w', 33, 38, 1000000);
        handleSpecificEventWithJoin('icegolem', 'winterland', 830, 420, 50000);
		*/
    }
	// Handle custom events
	handleHarpyEvent();
    handleSkeletorEvent();
}

function handleSpecificEvent(eventType, mapName, x, y, hpThreshold, skillMs = 0) {
    if (parent?.S?.[eventType]?.live) {
        if (character.map !== mapName && !smart.moving) {
            smart_move({ x, y, map: mapName });
        }

        const monster = get_nearest_monster({ type: eventType });
        if (monster) {
            if (monster.hp > hpThreshold) {
                if (character.cc < 100) {
                    dpsSet();
                    //game_log("set 1");
                }
            } else if (character.cc < 100) {
                luckSet();
                //game_log("set 2");
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
                    //game_log("set 3");
                }
            } else if (character.cc < 100) {
                luckSet();
                //game_log("set 4");
            }
        }
    }
}

function handleHome() {
    if (character.cc < 100) {
        homeSet();
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
	//draw_circle(character.x,character.y,G.skills.agitate.range,3)
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

eventer();
