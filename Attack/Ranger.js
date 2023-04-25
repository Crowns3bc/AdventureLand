function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms
}

async function attackLoop() {
    let delay = 1;
    try {
        let nearest = getNearestMonster({ target: ["CrownPriest", "CrownMerch"] });
        for (let x in parent.entities) {
            let entity = parent.entities[x];
            if (entity.mtype == "" ||
                (entity.mtype == "pinkgoo" ||
                    (entity.mtype == "bgoo" ||
                        (entity.mtype == "rgoo")))) {
                if (is_in_range(entity)) {
                    if (!is_on_cooldown("huntersmark")) {
                        use("huntersmark", entity);
                    }
                    if (!is_on_cooldown("supershot")) {
                        use("supershot", entity);
                    }
                    await attack(entity)
                    delay = ms_to_next_skill('attack') - 220;
                }
            }
        }
        if (is_in_range(nearest)) {
            var arr = Object.values(parent.entities)
                .filter(e => e.type == "monster")
                .filter(e => e.target)
                .filter((a) => a.target === "CrownPriest" ||
                    a.target === "CrownMerch")
                .map(e => e.id);
            if (!is_on_cooldown("huntersmark") && arr.length == 1) {
                use("huntersmark", arr);
            }
            if (!is_on_cooldown("supershot") && arr.length == 1) {
                use("supershot", arr);
            }
            if (arr.length <= 3 && character.slots.mainhand?.name !== 'bowofthedead') {
                equip(locate_item("bowofthedead"));
            }
            if (arr.length > 1 && arr.length < 4) {
                use_skill("3shot", arr);
                delay = ms_to_next_skill('attack');
            }
            if (arr.length >= 4 && character.slots.mainhand?.name !== 'pouchbow') {
                equip(locate_item("pouchbow"));
            }
            if (arr.length >= 4) {
                use_skill("5shot", arr);
                delay = ms_to_next_skill('attack');
            }
            if (arr.length == 1 && character.slots.chest?.name !== 'coat') {
                equip(locate_item("coat"));
            }
            if (arr.length <= 3 && character.slots.gloves?.name !== 'supermittens') {
                equip(locate_item("supermittens"));
            }
            if (arr.length >= 2 && character.slots.chest?.name !== 'tshirt9') {
                equip(locate_item("tshirt9"));
            }
            if (arr.length >= 4 && character.slots.gloves?.name !== 'mpxgloves') {
                equip(locate_item("mpxgloves"));
            }
            await attack(nearest);
            delay = ms_to_next_skill('attack');
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(attackLoop, delay)
}
attackLoop();

function getNearestMonster(args) {
    for (const id in parent.entities) {
        const entity = parent.entities[id];
        if (entity.type !== 'monster' || entity.dead) {
            continue;
        }
        if (args.target) {
            if (Array.isArray(args.target)) {
                if (!args.target.includes(entity.target)) {
                    continue;
                }
            } else {
                if (entity.target !== args.target) {
                    continue;
                }
            }
        }
        return entity;
    }
}
