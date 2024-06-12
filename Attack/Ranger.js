function lowest_health_partymember() {
    let party_mems = Object.keys(parent.party).filter(e => parent.entities[e
    ] && !parent.entities[e
    ].rip);
    let the_party = []

    for (key of party_mems)
        the_party.push(parent.entities[key
        ])
    the_party.push(character)
    //Populate health percentages
    let res = the_party.sort(function (a, b) {
        let a_rat = a.hp / a.max_hp
        let b_rat = b.hp / b.max_hp
        return a_rat - b_rat;
    })
    return res[
        0
    ]
}
////////////////////////////////////////////
function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms
}

// Main function for the attack loop
async function attackLoop() {
    let delay = 1; // Initial delay
    const X = locations[home][0].x; // X coordinate of home location
    const Y = locations[home][0].y; // Y coordinate of home location
    let home2 = ["ent", "fireroamer"];
    let weaponSwap = 0;
    try {
        // Define the list of target names and blacklist of monster names
        const targetNames = ["CrownTown", "CrownPriest", "earthWar", "earthPri", "Mommy", "Atlus", "DoubleG", "FatherRob"];
        const blacklistTargets = ["bat"]; // I didnt even end up using this cause it wasnt working

        // Filter and map the monster IDs based on type and target name
        let monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster" && e.target && targetNames.includes(e.target) && !blacklistTargets.includes(e.id))
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
            for (let i = 0; i < targetNames.length; i++) {
                prio = get_nearest_monster_v2({
                    target: targetNames[i],
                    //type: "nerfedmummy",
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
        let heal_target = lowest_health_partymember();
        if (heal_target.hp / heal_target.max_hp < 0.4) {
            if (performance.now() - weaponSwap > 250) {
                healSet();
                weaponSwap = performance.now();
            }
            await attack(heal_target);
            game_log("Healing " + heal_target.name, "green");
            delay = ms_to_next_skill('attack');
        } else
            // Check the number of monsters in the vicinity
            if (monsterIds.length && is_in_range(prio)) {
                if (monsterIds.length === 1) {
                    if (prio != null) {
                        singleSet(); // Equip the set for a single monster
                        await attack(prio); // Attack the target
                        //await use_skill("piercingshot",prio);
                        delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
                    }
                }
                else if (monsterIds.length === 2 || monsterIds.length === 3) {
                    deadSet(); // Equip the set for two or three monsters
                    await use_skill("5shot", monsterIds); // Use the 3-shot skill
                    delay = ms_to_next_skill("attack"); // Set delay until the next attack skill
                } else if (mobTargets_inRange(home, 40, ['CrownTown', 'CrownPriest'], [X, Y]) <= 3) {
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
        console.log(e);
    }
    // Call the attack loop function recursively with the updated delay
    setTimeout(attackLoop, delay);
}

// Start the attack loop
attackLoop();

function get_nearest_monster_v2(args = {}) {
    let min_d = Infinity, target = null;

    for (let id in parent.entities) {
        let current = parent.entities[id];
        if (current.type !== "monster" || !current.visible || current.dead) continue;
        if (args.type && current.mtype !== args.type) continue;
        if (args.min_level !== undefined && current.level < args.min_level) continue;
        if (args.max_level !== undefined && current.level > args.max_level) continue;
        if (args.target && !args.target.includes(current.target)) continue;
        if (args.no_target && current.target && current.target !== character.name) continue;
        if (args.cursed && !current.s.cursed) continue;

        let c_dist = args.point_for_distance_check
            ? Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y)
            : parent.distance(character, current);

        if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

        if (args.check_min_hp && current.hp < min_d) {
            min_d = current.hp;
            target = current;
        } else if (args.check_max_hp && current.hp > min_d) {
            min_d = current.hp;
            target = current;
        } else if (!args.check_min_hp && !args.check_max_hp && c_dist < min_d) {
            min_d = c_dist;
            target = current;
        }
    }
    return target;
}
