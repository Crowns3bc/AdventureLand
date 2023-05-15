function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms
}

async function attackLoop() {
    let delay = 1;
    try {
        let nearest = getNearestMonster({target: ["CrownPriest"], cursed: true});
		if (!nearest) nearest = getNearestMonster({target: ["CrownPriest"]});
        if (is_in_range(nearest)) {
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
        if (args.cursed && !entity.s.cursed) {
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
