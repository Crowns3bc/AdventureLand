let scythe = 0;
let eTime = 0;
let basher = 0;
let tank = get_entity("CrownPriest");
async function skillLoop() {
    let delay = 15;
    try {
        const Mainhand = character.slots.mainhand?.name;
        const aoe = character.mp >= character.mp_cost * 2 + G.skills.cleave.mp + 320;
        const cc = character.cc < 135;
        const stMaps = ["level2w", "winter_cove", "arena", ""];
        const aoeMaps = ["halloween", "desertland", "goobrawl", "spookytown", "tunnel", "main", "", "level2n", "cave"];

        if (character.ctype === "warrior") {
            if (tank && tank.hp < tank.max_hp * 0.5) {
                handleStomp(Mainhand, stMaps, aoeMaps);
            }
            handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps);
            handleWarriorSkills();
        }

        if (character.ctype === 'paladin') {
            handlePaladinSkills();
        }

        if (character.ctype === "mage") {
            handleMageSkills();
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(skillLoop, delay);
}

async function handleStomp(Mainhand, stMaps, aoeMaps) {
    if (!is_on_cooldown("stomp")) {
        if (Mainhand !== "basher" && performance.now() - basher > 200) {
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
    if (stMaps.includes(character.map) && currentTime - eTime > 100) {
        eTime = currentTime;
        stSet();
    } else if (aoeMaps.includes(character.map) && currentTime - eTime > 100) {
        eTime = currentTime;
        aoeSet();
    }
}

function handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps) {
    if (!smart.moving && cc && aoe && !is_on_cooldown("cleave")) {
        const monstersInRange = Object.values(parent.entities)
            .filter(entity => entity.type === "monster" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.cleave.range);

        const mapsToInclude = ["desertland", "goobrawl", "main", "level2w", "cave", "halloween", "spookytown", "tunnel", "winterland", "level2n"];
        if (monstersInRange.length >= 1 && mapsToInclude.includes(character.map) && tank) {
            if (Mainhand !== "scythe" && performance.now() - scythe > 200) {
                scythe = performance.now();
                scytheSet();
            }
            use_skill("cleave");
        }
    } else {
        handleWeaponSwap(stMaps, aoeMaps);
    }
}

async function handleWarriorSkills() {
    if (!is_on_cooldown("warcry") && character.s.darkblessing) {
        await use_skill("warcry");
    }

    const crabsInRange = Object.values(parent.entities)
        .filter(entity => entity.mtype === "crabx" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedCrabs = crabsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && crabsInRange.length >= 5 && untargetedCrabs.length === 5 && tank) {
        await use_skill("agitate");
    }

    const mobTypes = ["fireroamer"];
    const mobsInRange = Object.values(parent.entities)
        .filter(entity => mobTypes.includes(entity.mtype) && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedMobs = mobsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && mobsInRange.length >= 3 && untargetedMobs.length >= 3 && !smart.moving && tank) {
        await use_skill("agitate");
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
    let nearest = getNearestMonster({ target: ["CrownPriest"], cursed: true });
    if (!nearest) nearest = getNearestMonster({ target: ["CrownPriest"] });

    if (!is_on_cooldown("smash") && character.mp > 800 && is_in_range(nearest)) {
        await use_skill("smash", nearest);
    }

    let prio = get_nearest_monster_v2({ target: "CrownPriest" });
    if (prio && prio.hp < 2000 && character.mp > 460 && !is_on_cooldown("purify")) {
        use_skill("purify", prio);
    }
}

async function handleMageSkills() {
    const c1 = get_player("CrownsAnal");
    const c2 = get_player("CrownPriest");

    if (c1 && c1.mp < 450 && character.mp > 2700) {
        await use_skill("energize", 'CrownsAnal');
    }

    if (c2 && c2.mp < 4000 && character.mp > 2700) {
        await use_skill("energize", 'CrownPriest');
    }

    let nearest = get_nearest_monster({ target: "CrownPriest" });
    if (nearest && character.mp > 6000) {
        await use_skill("zapperzap", nearest);
    }

    const targets = [];
    const maxMana = 3000;

    for (let id in parent.entities) {
        if (parent.entities[id].mtype == home && is_in_range(parent.entities[id], "cburst")) {
            targets.push([parent.entities[id], 2050]);
        }
    }

    const totalManaRequired = targets.length * 2050;

    if (character.mp > totalManaRequired && character.mp - totalManaRequired >= maxMana) {
        if (targets.some(target => target[0].hp < 1000)) {
            // await use_skill("cburst", targets);
        }
    }
}

skillLoop();
