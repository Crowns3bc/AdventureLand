function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) + 15
    return ms < 0 ? 0 : ms
}
async function attackLoop() {
    let Weapon, Gloves, Chest, delay;
    Weapon = character.slots.mainhand?.name;
    Gloves = character.slots.gloves?.name;
    Chest = character.slots.chest?.name;
    delay = 1;

    try {
        for (let x in parent.entities) {
            const entity = parent.entities[x];

            if (["bgoo", "rgoo"].includes(entity.mtype) && is_in_range(entity)) {
                if (!is_on_cooldown("huntersmark") && !is_on_cooldown("supershot")) {
                    await use("huntersmark", entity);
                    await use("supershot", entity);
                }
                await attack(entity);
                delay = ms_to_next_skill("attack");
            }
        }

        const monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster")
            .filter((e) => e.target)
            .filter((a) => a.target === "CrownPriest" || a.target === "CrownMerch")
            .map((e) => e.id);

        const nearest = getNearestMonster({ target: ["CrownPriest", "CrownMerch"] });
        if (is_in_range(nearest)) {
            if (monsterIds.length === 1) {
            	if (!is_on_cooldown("huntersmark")) { 
					await use("huntersmark", monsterIds);
				}
				if (!is_on_cooldown("supershot")) {
                    await use("supershot", monsterIds);
                }
                if (Chest !== "coat") {  
					 equip(locate_item("coat"));
				}
				if (Weapon !== "bowofthedead") {
                     equip(locate_item("bowofthedead"));
                }
                await attack(nearest);
                delay = ms_to_next_skill("attack");
            }
            if (monsterIds.length === 2 || monsterIds.length === 3) {
                if (Weapon !== "bowofthedead") {
					 equip(locate_item("bowofthedead"));
				}
				if (Gloves !== "supermittens") {
					 equip(locate_item("supermittens"));
				}
				if (Chest !== "tshirt9") {
                     equip(locate_item("tshirt9"));
                }
                await use_skill("3shot", monsterIds);
                delay = ms_to_next_skill("attack");
            }
            if (monsterIds.length >= 4) {
                if (Gloves !== "mpxgloves") { 
					 equip(locate_item("mpxgloves"));
				}
				if (Weapon !== "pouchbow") {
					 equip(locate_item("pouchbow"));
				}
				if (Chest !== "tshirt9") {
					 equip(locate_item("tshirt9"));
                }
                await use_skill("5shot", monsterIds);
                delay = ms_to_next_skill("attack");
            }
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(attackLoop, delay);
}

attackLoop();
