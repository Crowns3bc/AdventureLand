function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) + 15
    return ms < 0 ? 0 : ms
}

// Define coordinates for various locations
const locations = {
    fireroamer: [{ x: 222, y: -827 }],
};
// Define the home location
const home = 'fireroamer';

// Main function for the attack loop
async function attackLoop() {
    let delay = 1; // Initial delay
    const X = locations[home][0].x; // X coordinate of home location
    const Y = locations[home][0].y; // Y coordinate of home location

    try {
        // Define the list of target names and blacklist of monster names
        const targetNames = ["CrownPriest", "CrownTown", "earthWar", "earthPri", "Mommy", "Atlus"];
        //const blacklistTargets = ["nerfedmummy", "bat"]; // I didnt even end up using this cause it wasnt working

        // Filter and map the monster IDs based on type and target name
        let monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster" && e.target && targetNames.includes(e.target))
            .map((e) => e.id);
        let prio = null;

        // Find the nearest monster with specified target names and cursed status
        for (let i = 0; i < targetNames.length; i++) {
            prio = get_nearest_monster_v2({
                target: targetNames[i],
                cursed: true,
            });
            if (prio) break; // Stop searching if a priority target is found
        }
        if (!prio) {
            prio = get_nearest_monster_v2({
                cursed: true,
            });
        }
		
		if (!prio) {
		for (let i = 0; i < targetNames.length; i++) {
            prio = get_nearest_monster_v2({
                target: targetNames[i],
            });
            if (prio) break; // Stop searching if a priority target is found
        	}
		}

        // If a priority monster is found and is in range, apply skills
        if (prio && is_in_range(prio)) {
            change_target(prio);
            if (!is_on_cooldown("huntersmark") && character.mp > 700) {
                await use_skill("huntersmark", prio);
            }
            if (!is_on_cooldown("supershot") && character.mp > 1200) {
                await use_skill("supershot", prio);
            }
        }
        // Check the number of monsters in the vicinity
        if (monsterIds.length) {
            if (monsterIds.length === 1) {
				if (prio != null) {
                singleSet(); // Equip the set for a single monster
                await attack(prio); // Attack the target
                delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
				}
            }
            else if (monsterIds.length === 2 || monsterIds.length === 3) {
                deadSet(); // Equip the set for two or three monsters
                await use_skill("3shot", monsterIds); // Use the 3-shot skill
                delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
            } else if (mobTargets_inRange(home, 45, ['CrownPriest', 'CrownTown'], [X, Y]) <= 3) {
                deadSet(); // Equip the set for five or fewer monsters within the location
                await use_skill("5shot", monsterIds); // Use the 5-shot skill
                delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
            } else {
                boomSet(); // Equip the set for more than five monsters within the location
                await use_skill("5shot", monsterIds); // Use the 5-shot skill
                delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
            }
        }
    } catch (e) {
        console.error(e);
    }
    // Call the attack loop function recursively with the updated delay
    setTimeout(attackLoop, delay);
}

// Start the attack loop
attackLoop();
////////////////////////////////////////////////////////////////////////////////////////////////
function mobTargets_inRange(mtypes, radius, mobs_target, point) {
    // If point is not provided, default to character's current position
    if (!point) point = [character.x, character.y];

    let count = 0;

    // Loop through all entities in the game
    for (let id in parent.entities) {
        let entity = parent.entities[id];

        // Skip entities that are not monsters or are not visible
        if (!entity || entity.type !== 'monster' || entity.dead || !entity.visible) continue;

        // Check if the monster type is included in the provided list of monster types
        if (!mtypes.includes(entity.mtype)) continue;

        // Check if the monster's target is included in the provided list of target names
        if (!mobs_target.includes(entity.target)) continue;

        // Calculate the distance between the monster and the provided point
        if (Math.hypot(point[0] - entity.x, point[1] - entity.y) <= radius) {
            // If the distance is within the specified radius, increment the count
            ++count;
        }
    }

    // Return the total count of monsters within the specified radius and meeting the criteria
    return count;
}
////////////////////////////////////////////////////////////////////////////////////////////////
function singleSet() {
    equipIfNeeded("bowofthedead", "mainhand", 11, "l");
    equipIfNeeded("coat", "chest", 10, "l");
}
function deadSet() {
    equipIfNeeded("bowofthedead", "mainhand", 11, "l");
    equipIfNeeded("tshirt9", "chest", 7, "l");
}

function boomSet() {
    equipIfNeeded("pouchbow", "mainhand", 11, "l");
    equipIfNeeded("tshirt9", "chest", 7, "l");
}
////////////////////////////////////////////////////////////////////////////////////////////////
async function equipIfNeeded(itemName, slotName, level, l) {
    let name = null;

    // Check if itemName is an object, if so, extract item properties
    if (typeof itemName === 'object') {
        name = itemName.name;
        level = itemName.level;
        l = itemName.l;
    } else {
        name = itemName;
    }

    if (character.slots[slotName] != null) {
        let slotItem = character.slots[slotName];
        if (slotItem.name === name && slotItem.level === level && slotItem.l === l) {
            return;
        }
    }

    // Iterate over character items
    for (let i = 0; i < character.items.length; i++) {
        const item = character.items[i];
        // Check if item matches the specified criteria
        if (item != null && item.name === name && item.level === level && item.l === l) {
            // Equip the item to the specified slot
            return equip(i, slotName); // Exit the function once the item is equipped, can await if needed
        }
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////
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
        if (args.target && current.target != args.target) continue;
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
            var c_hp = current.hp;
            if (c_hp < min_hp) min_hp = c_hp, target = current; // Update target based on minimum HP
            continue;
        } else if (args.check_max_hp) {
            var c_hp = current.hp;
            if (c_hp > max_hp) max_hp = c_hp, target = current; // Update target based on maximum HP
            continue;
        }
        if (c_dist < min_d) min_d = c_dist, target = current;
    }
    return target;
}
