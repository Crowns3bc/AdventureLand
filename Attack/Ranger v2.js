function ms_to_next_skill(skill) {
    // Get the next skill's information from the parent object
    const next_skill = parent.next_skill[skill];

    // Check if the next skill is undefined (not available)
    if (next_skill == undefined) return 0;

    // Calculate the time remaining in milliseconds until the next skill can be used
    const ms = next_skill.getTime() - Date.now() - Math.min(...parent.pings);

    // If the time remaining is negative, return 0 to indicate that the skill is ready
    return ms < 0 ? 0 : ms;
}

let mainhandTimestamp = 0;

async function attackLoop() {
    let Weapon, Gloves, Chest, delay;
    Weapon = character.slots.mainhand?.name; // Get the name of the equipped weapon in the mainhand slot
    Gloves = character.slots.gloves?.name; // Get the name of the equipped gloves
    Chest = character.slots.chest?.name; // Get the name of the equipped chest armor
    delay = 1; // Default delay between attacks

    const X = locations[home][0].x; // Get the x-coordinate of the home location
    const Y = locations[home][0].y; // Get the y-coordinate of the home location

    const multiMobDistanceToPoint = multiMobDistanceToPoint([X, Y]); // Calculate the distance to multiple mobs from a point

    try {
        let monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster") // Filter entities to get only monsters
            .filter((e) => e.target) // Filter entities to get only monsters with a target
            .filter((a) => a.target === "CrownPriest") // Filter entities to get only monsters targeting "CrownPriest"
            .sort(entsThenRoamersThenDistanceComparator) // Sort the filtered monsters based on priority
            .map((e) => e.id); // Get the IDs of the filtered monsters

        let prio = get_nearest_monster_v2({
            target: "CrownPriest",
            cursed: true,
        }); // Get the nearest monster targeting "CrownPriest" that is cursed

        if (prio && is_in_range(prio)) {
            change_target(prio); // Change the target to the highest priority monster
            if (!is_on_cooldown("huntersmark") && character.mp > 700 && prio.hp / prio.max_hp > 0.5) {
                use_skill("huntersmark", prio); // Use the "huntersmark" skill on the priority monster
            }
        }

        const nearest = getNearestMonster({ target: ["CrownPriest"] }); // Get the nearest monster targeting "CrownPriest"
        /* This doesnt work right 
        const pal = get_entity("CrownPal"); // Get the entity object of "CrownPal"

        if (pal.hp < pal.max_hp * 0.45) {
            if (Weapon !== 'cupid' && Date.now() - mainhandTimestamp > 100) {
                mainhandTimestamp = Date.now();
                equip(locate_item("cupid")); // Equip the "cupid" weapon if not already equipped
                console.log("equip Cupid");
            }
            await attack(pal); // Attack the "CrownPriest" target
            delay = ms_to_next_skill("attack"); // Update the delay based on the time until the next attack
        } else */
        if (is_in_range(nearest)) {
            if (monsterIds.length === 0) {
                // do nothing
            } else if (monsterIds.length === 1) {
                if (Weapon !== "bowofthedead" && Date.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = Date.now();
                    equip(locate_item("bowofthedead")); // Equip the "bowofthedead" weapon if not already equipped
                }
                if (Gloves !== "supermittens") {
                    equip(locate_item("supermittens")); // Equip the "supermittens" gloves if not already equipped
                }
                if (Chest !== "coat") {
                    equip(locate_item("coat")); // Equip the "coat" chest armor if not already equipped
                }
                await attack(nearest); // Attack the nearest monster targeting "CrownPriest"
                delay = ms_to_next_skill("attack"); // Update the delay based on the time until the next attack
            } else if (monsterIds.length === 2 || monsterIds.length === 3) {
                if (Weapon !== "bowofthedead" && Date.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = Date.now();
                    console.log(`Equipping DeadBow to 3shot`);
                    equip(locate_item("bowofthedead")); // Equip the "bowofthedead" weapon if not already equipped
                }
                if (Gloves !== "supermittens") {
                    console.log(`Equipping mpx to 3shot with DeadBow`);
                    equip(locate_item("supermittens")); // Equip the "supermittens" gloves if not already equipped
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9")); // Equip the "tshirt9" chest armor if not already equipped
                }
                await use_skill("3shot", monsterIds); // Use the "3shot" skill on the filtered monster IDs
                delay = ms_to_next_skill("attack"); // Update the delay based on the time until the next attack
            } else if (mobTargets_inRange(home, 40, 'CrownPriest', [X, Y]) <= 3) {
                if (Weapon !== "bowofthedead" && Date.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = Date.now();
                    console.log(`Equipping DeadBow to 5shot`);
                    equip(locate_item("bowofthedead")); // Equip the "bowofthedead" weapon if not already equipped
                }
                if (Gloves !== "mpxgloves") {
                    console.log(`Equipping mpx to 5shot with DeadBow`);
                    equip(locate_item("mpxgloves")); // Equip the "mpxgloves" gloves if not already equipped
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9")); // Equip the "tshirt9" chest armor if not already equipped
                }
                await use_skill("5shot", monsterIds); // Use the "5shot" skill on the filtered monster IDs
                delay = ms_to_next_skill("attack"); // Update the delay based on the time until the next attack
            } else if (mobTargets_inRange(home, 40, 'CrownPriest', [X, Y]) > 3) {
                if (Weapon !== "pouchbow" && Date.now() - mainhandTimestamp > 100) {
                    mainhandTimestamp = Date.now();
                    equip(locate_item("pouchbow")); // Equip the "pouchbow" weapon if not already equipped
                }
                if (Gloves !== "mpxgloves") {
                    equip(locate_item("mpxgloves")); // Equip the "mpxgloves" gloves if not already equipped
                }
                if (Chest !== "tshirt9") {
                    equip(locate_item("tshirt9")); // Equip the "tshirt9" chest armor if not already equipped
                }
                if (!is_on_cooldown("supershot") && character.mp > 1200) {
                    await use_skill("supershot", prio); // Use the "supershot" skill on the priority monster if not on cooldown and enough mana
                }
                await use_skill("5shot", monsterIds); // Use the "5shot" skill on the filtered monster IDs
                delay = ms_to_next_skill("attack"); // Update the delay based on the time until the next attack
            }
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(attackLoop, delay); // Call the attackLoop function again after the specified delay
}

attackLoop(); // Start the attack loop


let home2 = ['fireroamer', 'ent'];

function multiMobDistanceToPoint(point) {
    // This function is returned as a callback for sorting purposes
    return function (a, b) {
        // Compare the types of the mobs
        if (a.mtype !== b.mtype) {
            // If the types are different, prioritize 'ent' over 'fireroamer'
            if (a.mtype === 'ent') return -1;
            return 1;
        }

        // Calculate the distances from the mobs to the specified point
        let a_dist = Math.hypot(a.x - point[0], a.y - point[1]);
        let b_dist = Math.hypot(b.x - point[0], b.y - point[1]);

        // Compare the distances and return the appropriate value for sorting
        if (a_dist < b_dist) return -1;
        if (a_dist > b_dist) return 1;
        return 0;
    }
}


function mobTargets_inRange(mtypes, radius, mobs_target, point) {
    // If point is not provided, use character's current coordinates
    if (!point) point = [character.x, character.y];

    let count = 0;

    // Iterate through all entities in the game
    for (let id in parent.entities) {
        let entity = parent.entities[id];

        // Skip if the entity is invalid or not a monster or is dead or not visible
        if (!entity || entity.type !== 'monster' || entity.dead || !entity.visible) continue;

        // Check if the entity's mtype is included in the mtypes array
        if (!mtypes.includes(entity.mtype)) continue;

        // Check if the entity's target is included in the mobs_target array
        if (!mobs_target.includes(entity.target)) continue;

        // Calculate the distance between the entity and the point
        if (Math.hypot(point[0] - entity.x, point[1] - entity.y) <= radius) {
            ++count; // Increment the count if the entity is within the specified radius
        }
    }

    return count;
}


function getNearestMonster(args) {
    // Iterate through all entities in the game
    for (const id in parent.entities) {
        const entity = parent.entities[id];

        // Check if the entity is a monster and not dead
        if (entity.type !== 'monster' || entity.dead) {
            continue; // Skip to the next iteration if it's not a valid monster
        }

        // Check if the monster is cursed (if args.cursed is true)
        if (args.cursed && (!entity.s || !entity.s.cursed)) {
            continue; // Skip to the next iteration if the monster is not cursed
        }

        // Check if a target is specified
        if (args.target) {
            if (Array.isArray(args.target)) {
                // Check if the entity's target is included in the specified targets array
                if (!args.target.includes(entity.target)) {
                    continue; // Skip to the next iteration if the target doesn't match
                }
            } else {
                // Check if the entity's target matches the specified target
                if (entity.target !== args.target) {
                    continue; // Skip to the next iteration if the target doesn't match
                }
            }
        }

        // Return the nearest valid monster that satisfies all conditions
        return entity;
    }
}

//Additions to get_nearest_monster()
function get_nearest_monster_v2(args) {
    var min_d = 999999, target = null; // Initialize minimum distance and target variables
    var min_hp = 999999999; // Initialize minimum HP variable
    var max_hp = 0; // Initialize maximum HP variable

    if (!args) args = {}; // If args is not provided, initialize it as an empty object
    if (args && args.target && args.target.name) args.target = args.target.name; // Extract the name property from the target object if provided
    if (args && args.type == "monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead"); // Display a warning message if the type property is used instead of mtype
    if (args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'"); // Display a warning message if the mtype property is used instead of type

    for (id in parent.entities) {
        var current = parent.entities[id]; // Get the current entity

        // Skip if the current entity is not a visible monster or is dead
        if (current.type != "monster" || !current.visible || current.dead) continue;

        // Check if the current entity's mtype matches the specified type
        if (args.type && current.mtype != args.type) continue;

        // Check if the current entity's level is within the specified range
        if (args.min_level !== undefined && current.level < args.min_level) continue;
        if (args.max_level !== undefined && current.level > args.max_level) continue;

        // Check if the current entity's target matches the specified target
        if (args.target && current.target != args.target) continue;

        // Check if the current entity has no target or if its target is not the character's name
        if (args.no_target && current.target && current.target != character.name) continue;

        // Check if the current entity is cursed (if specified)
        if (args.cursed && !current.s.cursed) continue;

        var c_dist;
        // Calculate the distance between the current entity and the specified point or character
        if (args.point_for_distance_check) {
            c_dist = Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y);
        } else {
            c_dist = parent.distance(character, current);
        }

        // Check if the current entity is beyond the specified maximum distance
        if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

        if (args.check_min_hp) {
            var c_hp = current.hp;
            // Update the minimum HP and target if the current entity has lower HP
            if (c_hp < min_hp) min_hp = c_hp, target = current;
            continue;
        } else if (args.check_max_hp) {
            var c_hp = current.hp;
            // Update the maximum HP and target if the current entity has higher HP
            if (c_hp > max_hp) max_hp = c_hp, target = current;
            continue;
        }

        // Update the minimum distance and target if the current entity is closer
        if (c_dist < min_d) min_d = c_dist, target = current;
    }

    return target; // Return the nearest monster target
}
