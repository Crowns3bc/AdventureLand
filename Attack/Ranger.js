function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms
}

async function attackLoop() {
    let delay = 5;
    try {
        let nearest = getNearestMonster({target: ["CrownPriest", "CrownTown"]});
        if (can_attack(nearest)) {
			var arr = Object.values(parent.entities)
                .filter(e => e.type == "monster")
                .filter(e => e.target)
                .filter((a)=> a.target === "CrownPriest" || 
			      a.target === "CrownTown")
 				  .map(e => e.id);
            if( arr.length > 1 && arr.length < 4 ) use("3shot",arr);
            if( arr.length > 4 ) use("5shot",arr);
            await attack(nearest)
            delay = ms_to_next_skill('attack');
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(attackLoop, delay)
}
attackLoop()

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
