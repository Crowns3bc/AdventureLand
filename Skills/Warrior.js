let bataxe_time = 0;
let offhand = 0;
let equip_mainhand = 0;
let equip_offhand = 0;
let unequip_offhand = 0;
let equipTime = 500;

async function skillLoop() {
    let Mainhand, Offhand, delay;
    Mainhand = character.slots.mainhand?.name;
    Offhand = character.slots.offhand?.name;
    delay = 15;
    let aoe = character.mp >= character.mp_cost * 2 + G.skills.cleave.mp + 320;
	let cc = character.cc < 135;
    try {
        const zapperMobs = ["ent", "bgoo", "rgoo"];

        // Filter entities for zapper skill
        const entities = Object.values(parent.entities).filter(
            entity => entity && !entity.target && zapperMobs.includes(entity.mtype)
        );

        // Check if zapper skill is ready
        const ready = (
            !is_on_cooldown("zapperzap") &&
            character.mp > G?.skills?.zapperzap?.mp + 250 &&
            character.cc < 125
        );

        // Check if zapper skill is needed
        const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));

        // Use zapper skill if conditions are met
        if (!smart.moving && ready && zapperNeeded) {
            equipIfNeeded("zapper", "ring2", 0, "l");
            for (const entity of entities) {
                if (is_in_range(entity, "zapperzap")) {
                    await use_skill("zapperzap", entity);
                }
            }
            equipIfNeeded("suckerpunch", "ring2", 1, "s");
        }
        if (character.ctype === 'warrior' && !smart.moving) {
            if (cc && aoe && !is_on_cooldown("cleave")) {
                const monstersInRange = Object.values(parent.entities)
                    .filter((entity) => {
                        if (entity.mtype === home ||
                            (entity.visible && !entity.dead)) {
                            const dist = distance(character, entity);
                            //console.log(`Entity ${entity.id}: Distance - ${dist}, Range - ${G.skills.cleave.range}`);
                            return dist <= G.skills.cleave.range;
                        }
                        return false;
                    });

                const untargetedMonsters = monstersInRange.filter((monster) => !monster.target);
                const mapsToInclude = ["desertland", "level2w", "goobrawl", "main"];
                if (monstersInRange.length >= 2 && untargetedMonsters.length === 0 && mapsToInclude.includes(character.map)) {
                    //console.log(monstersInRange);
                    if (character.slots.offhand && performance.now() - unequip_offhand > 500) {
                        unequip_offhand = performance.now();
                        unequip("offhand");
                    }

                    if (Mainhand !== "scythe" && performance.now() - bataxe_time > 500) {
                        bataxe_time = performance.now();
                        equip(locate_item("scythe"));
                        use_skill("cleave");
                    }
                        use_skill("cleave");
                }
            } else if (character.map !== "winterland") {
                if (Mainhand !== "vhammer" && performance.now() - equip_mainhand > 500) {
                    equip_mainhand = performance.now();
                    equipIfNeeded("vhammer", "mainhand", 9, "s")
                }
                if (Offhand !== "vhammer" && performance.now() - equip_offhand > 500) {
                    equip_offhand = performance.now();
                    equipIfNeeded("vhammer", "offhand", 9, "l")
                }
            }
            if (character.ctype == 'warrior') {
                if (!is_on_cooldown("warcry") && character.s.darkblessing) {
                    await use_skill("warcry");
                }
                const crabsInRange = Object.values(parent.entities)
                    .filter((entity) =>
                        entity.mtype === "crabx" &&
                        entity.visible &&
                        !entity.dead &&
                        distance(character, entity) <= G.skills.agitate.range
                    );
                const untargetedMonsters = crabsInRange.filter((monster) => !monster.target);
                if (!is_on_cooldown("agitate") && crabsInRange.length >= 5 && untargetedMonsters.length === 5) {
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

                    // Check if the entity is a monster of type "ent" and not targeting "CrownTown"
                    if (
                        current.mtype === "ent" &&
                        current.target !== character.name && // Check if the monster is not targeting yourself ("CrownTown")
                        current.target !== "CrownTown" && // Check if the monster is not targeting "CrownTown"
                        !current.dead
                    ) {
                        // Check if the "taunt" skill is not on cooldown
                        if (!is_on_cooldown("taunt")) {
                            // Use "taunt" on the monster
                            //use_skill("taunt", current.id);
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(skillLoop, delay);
}

skillLoop();
