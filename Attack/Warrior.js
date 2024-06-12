function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill];
    if (next_skill === undefined) return 0;
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms;
}
const targetNames = ["CrownPriest", "CrownTown"];

async function attackLoop() {
    let delay = 1;  // Default delay to 1 second
    try {
        let nearest = null;

        // Find the nearest monster based on the targetNames
        for (let i = 0; i < targetNames.length; i++) {
            nearest = get_nearest_monster_v2({
                target: targetNames[i],
                cursed: true,
            });
            if (nearest) break;
        }
        if (!nearest) {
            for (let i = 0; i < targetNames.length; i++) {
                nearest = get_nearest_monster_v2({
                    target: targetNames[i],
                });
                if (nearest) break;
            }
        }

        // If a monster is found and is in range, execute the attack
        if (nearest && is_in_range(nearest)) {
            await attack(nearest);  // Perform the attack
            delay = ms_to_next_skill('attack');  // Get delay until next attack
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(attackLoop, delay);
}

attackLoop();
////////////////////////////////////////////////////////////////////////
function get_nearest_monster_v2(args = {}) {
    let min_d = 999999, target = null;
    let min_hp = 999999999; // Track the minimum HP of monsters encountered
    let max_hp = 0; // Track the maximum HP of monsters encountered

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_level !== undefined && current.level < args.min_level) continue; // Filter monsters based on minimum level
        if (args.max_level !== undefined && current.level > args.max_level) continue; // Filter monsters based on maximum level
        if (args.target && !args.target.includes(current.target)) continue; // Check if current target is in the array of targets
        if (args.no_target && current.target && current.target != character.name) continue;
        if (args.cursed && !current.s.cursed) continue; // Filter monsters based on curse status
        let c_dist;
        if (args.point_for_distance_check) {
            c_dist = Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y); // Calculate distance from a specified point
        } else {
            c_dist = parent.distance(character, current);
        }
        if (args.max_distance !== undefined && c_dist > args.max_distance) continue; // Filter monsters based on maximum distance
        if (args.check_min_hp) {
            let c_hp = current.hp;
            if (c_hp < min_hp) min_hp = c_hp, target = current; // Update target based on minimum HP
            continue;
        } else if (args.check_max_hp) {
            let c_hp = current.hp;
            if (c_hp > max_hp) max_hp = c_hp, target = current; // Update target based on maximum HP
            continue;
        }
        if (c_dist < min_d) min_d = c_dist, target = current;
    }
    return target;
}
