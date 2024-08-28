let scythe = 0;
let eTime = 0;
let basher = 0;
async function skillLoop() {
    let delay = 40;
    try {
        let zap = true;
        const dead = character.rip;
        const Mainhand = character.slots.mainhand?.name;
        const aoe = character.mp >= character.mp_cost * 2 + G.skills.cleave.mp + 320;
        const cc = character.cc < 135;
        const zapperMobs = ["gscorpion"];
        const stMaps = ["", "winter_cove", "arena", "",];
        const aoeMaps = ["halloween", "goobrawl", "spookytown", "tunnel", "main", "winterland", "cave", "level2n", "level2w", "desertland"];
        let tank = get_entity("CrownPriest");
        if (character.ctype === "warrior") {
            if (tank && tank.hp < tank.max_hp * 0.5) {
                handleStomp(Mainhand, stMaps, aoeMaps, tank);
            }
            if (character.name === "CrownTown") {
                handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps, tank);
                handleWarriorSkills(tank);
            }
        }


        if (!dead && zap && character.ctype === "paladin") {
            // Filter entities for zapper skill
            const entities = Object.values(parent.entities).filter(
                entity => entity && !entity.target && zapperMobs.includes(entity.mtype)
            );

            // Check if zapper skill is ready
            const ready = (
                !is_on_cooldown("zapperzap") &&
                character.mp > G?.skills?.zapperzap?.mp + 400 &&
                character.cc < 175
            );

            // Check if zapper skill is needed
            const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));
            //game_log("zapperNeeded");
            // Use zapper skill if conditions are met
            if (!smart.moving && ready && zapperNeeded) {
                equipIfNeeded("zapper", "ring2", 1, "l");
                //game_log("Equip Zapper");
                for (const entity of entities) {
                    if (is_in_range(entity, "zapperzap")) {
                        await use_skill("zapperzap", entity);
                        //game_log("Use Zapper");
                    }
                }
                equipIfNeeded("suckerpunch", "ring2", 1, "l");
                //game_log("Equip Luck Ring");
            }
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

async function handleStomp(Mainhand, stMaps, aoeMaps, tank) {
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

async function handleCleave(Mainhand, aoe, cc, stMaps, aoeMaps, tank) {
    //console.log(`handleCleave called with: Mainhand=${Mainhand}, aoe=${aoe}, cc=${cc}, map=${character.map}`);

    if (!smart.moving && cc && aoe && !is_on_cooldown("cleave")) {
        const monstersInRange = Object.values(parent.entities)
            .filter(entity => entity.type === "monster" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.cleave.range);
        const untargetedMonsters = monstersInRange.filter((monster) => !monster.target);
        const mapsToInclude = ["desertland", "goobrawl", "main", "level2w", "cave", "halloween", "spookytown", "tunnel", "winterland", "level2n"];
        //console.log(`Monsters in range: ${monstersInRange.length}, map included: ${mapsToInclude.includes(character.map)}`);

        if (monstersInRange.length >= 1 /*&& untargetedMonsters.length === 0*/ && mapsToInclude.includes(character.map) && tank) {
            if (Mainhand !== "scythe" && performance.now() - scythe > 200) {
                scythe = performance.now();
                await scytheSet();
            }
            await use_skill("cleave");
            //console.log("Using CLEAVE");
        } else {
            //console.log(`Conditions not met for CLEAVE: Monsters in range: ${monstersInRange.length}, map: ${character.map}, tank: ${tank ? 'present' : 'absent'}`);
        }
    } else {
        handleWeaponSwap(stMaps, aoeMaps);
    }
}

async function handleWarriorSkills(tank) {
    if (!is_on_cooldown("warcry") && character.s.darkblessing) {
        await use_skill("warcry");
    }

    const crabsInRange = Object.values(parent.entities)
        .filter(entity => entity.mtype === "crabx" && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedCrabs = crabsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && crabsInRange.length >= 5 && untargetedCrabs.length === 5 && tank) {
        await use_skill("agitate");
    }

    const mobTypes = ["fireroamer", "plantoid"];
    const mobsInRange = Object.values(parent.entities)
        .filter(entity => mobTypes.includes(entity.mtype) && entity.visible && !entity.dead && distance(character, entity) <= G.skills.agitate.range);
    const untargetedMobs = mobsInRange.filter(monster => !monster.target);

    if (!is_on_cooldown("agitate") && mobsInRange.length >= 3 && untargetedMobs.length >= 3 && !smart.moving && tank) {
        let porc = get_nearest_monster({ type: "porcupine" });
        if (!is_in_range(porc, "agitate")) {
            //await use_skill("agitate");
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
skillLoop();
