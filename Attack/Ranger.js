function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - performance.now() - Math.min(...parent.pings) + 15
    return ms < 0 ? 0 : ms
}

let mainhandTimestamp = 0;
async function attackLoop() {
    let Weapon, Gloves, Chest, delay;
    Weapon = character.slots.mainhand?.name;
    Gloves = character.slots.gloves?.name;
    Chest = character.slots.chest?.name;
    delay = 1;
    const X = locations[home][0].x;
    const Y = locations[home][0].y;
    const mobOrder = mobOrder_pointComparator([X, Y]);
    let home2 = ['fireroamer', 'ent'];
    try {
        let monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster")
            .filter((e) => e.target)
            .filter((a) => a.target === "CrownPriest" ||
                a.target === "CrownTown" ||
                a.target === "earthWar" ||
                a.target === "earthPri" ||
                a.target === "Mommy" ||
                a.target === "Atlus")
            //.sort(farmDistanceComparator)
            .sort(mobOrder)
            .map((e) => e.id);
        let prio = get_nearest_monster_v2({
            target: "CrownPriest",
            cursed: true,
        });

        if (prio && is_in_range(prio)) {
            change_target(prio);
            if (!is_on_cooldown("huntersmark") && character.mp > 700 /*&& prio.hp > prio.max_hp * 0.3*/) {
                await use_skill("huntersmark", prio);
            }
            if (!is_on_cooldown("supershot") && character.mp > 1200) {
                await use_skill("supershot", prio);
            }
        }
        const nearest = getNearestMonster({ target: ["CrownPriest", "CrownTown", "earthWar", "earthPri", "Mommy", "Atlus"] });
		/*const pal = get_entity("CrownPriest");
		if (pal && pal.hp < pal.max_hp * .45) {
			if(Weapon !== 'cupid' && performance.now() - mainhandTimestamp > 100) {
				mainhandTimestamp = performance.now();
				equip(locate_item("cupid"));
				console.log("equip Cupid");
			}
			await attack(pal);
			//console.log("heal Pal")
			delay = ms_to_next_skill("attack");
		} else */if (is_in_range(nearest)) {
            if (monsterIds.length === 0) {
                // do nothing
            } else if (monsterIds.length === 1) {
                if (Weapon !== "bowofthedead" && performance.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = performance.now();
                    equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "supermittens") {
                    equip(locate_item("supermittens"));
                }
                if (Chest !== "coat") {
                    equip(locate_item("coat"));
                }
                await attack(nearest);
                delay = ms_to_next_skill("attack");
            }
            else if (monsterIds.length === 2 || monsterIds.length === 3) {
                if (Weapon !== "bowofthedead" && performance.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = performance.now();
                    console.log(`Equipping DeadBow to 3shot`)
                    equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "supermittens") {
                    console.log(`Equipping mpx to 3shot with DeadBow`)
                    equip(locate_item("supermittens"));
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9"));
                }
                await use_skill("3shot", monsterIds);
                delay = ms_to_next_skill("attack");
            } else if (mobTargets_inRange(home2, 40, 'CrownPriest', [X, Y]) <= 3) {
                if (Weapon !== "bowofthedead" && performance.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = performance.now();
                    console.log(`Equipping DeadBow to 5shot`)
                    equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "mpxgloves") {
                    console.log(`Equipping mpx to 5shot with DeadBow`)
                    equip(locate_item("mpxgloves"));
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9"));
                }
                await use_skill("5shot", monsterIds);
                delay = ms_to_next_skill("attack");
            } else if (mobTargets_inRange(home2, 40, 'CrownPriest', [X, Y]) > 3) {
                if (Weapon !== "pouchbow" && performance.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = performance.now();
                    console.log(`Equipping Pouchbow to 5shot`)
                    equip(locate_item("pouchbow"));
                }
                if (Gloves !== "mpxgloves") {
                    console.log(`Equipping mpx to 5shot with Pouchbow`)
                    equip(locate_item("mpxgloves"));
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9"));
                }/*
                if (!is_on_cooldown("supershot") && character.mp > 1200) {
                    await use_skill("supershot", prio);
                }*/
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
