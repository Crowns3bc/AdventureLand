async function SkillLoop() {
    const X = locations[home][0].x;
    const Y = locations[home][0].y;
    const delay = 40;
    const dead = character.rip;
    const disabled = parent.is_disabled(character) === undefined;
    const targetNames = ["CrownTown", "CrownPriest"];
    const mapsToExclude = ["level2n", "level2w", ""];
    const eventMaps = ["goobrawl", "level2w", "main", "winterland", "cave", "halloween"];
	const eventMobs = ["rgoo", "bgoo", "snowman", "icegolem", "franky", "grinch", "dragold", "wabbit"];
    const zapperMobs = [home, "rgoo", "bgoo", "skeletor", "crabxx", "phoenix", "mvampire", "rharpy"];

    try {
        if (character.ctype === "priest") {
            await handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps, zapperMobs);
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(SkillLoop, delay);
}

SkillLoop();

async function handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps, zapperMobs) {
	if (!dead || disabled) {
		//handleZapper(zapperMobs); // this is broken like always...
		handleCursing(X, Y, targetNames);
		handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps);
		handlePartyHeal(dead);
		handleDarkBlessing(dead);
	}
}

// im just actually retarded and dont know what im doing
/*
	if (there are mobs to zap) {
 		equip(zapper) && zap each one until theres no more
   	}  
    	if (there are no more mobs to zap) {
    		equip(luckring);
      }
*/
// thats too hard for me to do apparently so idk what else to do
/*
async function handleZapper(zapperMobs) {
    const entities = Object.values(parent.entities).filter(entity => entity && !entity.target && zapperMobs.includes(entity.mtype));
    const zapperReady = !is_on_cooldown("zapperzap") && character.mp > G?.skills?.zapperzap?.mp + 3250 && character.cc < 175;
    const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));

    if (!smart.moving && zapperReady && zapperNeeded) {
        equipIfNeeded("zapper", "ring2", 2, "l");
        for (const entity of entities) {
            if (is_in_range(entity, "zapperzap")) {
                use_skill("zapperzap", entity);
            }
        }
        equipIfNeeded("ringofluck", "ring2", 1, "s");
    }
}
*/

async function handleCursing(X, Y, targetNames) {
    let target = get_nearest_monster_v2({ type: 'rharpy' }) || get_nearest_monster_v2({ type: 'skeletor' });

    for (const name of targetNames) {
        if (!target) {
            target = get_nearest_monster_v2({
                target: name,
                check_max_hp: true,
                max_distance: 50,
                point_for_distance_check: [X, Y],
            });
            if (target) break;
        }
    }

    if (!target) target = get_targeted_monster();

    if (target && target.hp >= target.max_hp * 0.7 && !target.immune && !is_on_cooldown("curse")) {
        await use_skill("curse", target);
    }
}

async function handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps) {
    if (character.party) {
        for (let char_name in get_party()) {
            if (character.name == char_name) continue;
            let monster = get_nearest_monster({ type: home, target: char_name });
            if (monster) {
                if (!is_on_cooldown("absorb") && !mapsToExclude.includes(character.map)) {
                    await use_skill("absorb", char_name);
                    game_log("absorbing " + char_name, "#FFA600");
                }
            }
        }
    }

    if (eventMaps.includes(character.map)) {
        const entities = Object.values(parent.entities).filter(
            entity => entity && eventMobs.includes(entity.mtype) && entity.target && entity.target !== character.name
        );
        for (const entity of entities) {
            if (!is_on_cooldown("absorb") && character.mp > 4500) {
                await use_skill("absorb", entity.target);
            }
        }
    }
}

async function handlePartyHeal(dead) {
    for (let char_name of parent.party_list) {
        let allies = get_entity(char_name);
        if (allies && allies.hp < allies.max_hp * 0.55 && !allies.rip) {
            if (!is_on_cooldown("partyheal") && character.mp > 2000) {
                await use_skill("partyheal");
            }
        }
    }
}

async function handleDarkBlessing(dead) {
    if (!dead && !character.s.darkblessing) {
        if (!is_on_cooldown("darkblessing")) {
            await use_skill("darkblessing");
        }
    }
}

async function handlePaladinSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMaps) {
	const zapperMobs = ["home"];
	const entities = Object.values(parent.entities).filter(entity => entity && !entity.target && zapperMobs.includes(entity.mtype));
	const zapperReady = !is_on_cooldown("zapperzap") && character.mp > G?.skills?.zapperzap?.mp + 1250 && character.cc < 125;
	const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));

	if (!smart.moving && zapperReady && zapperNeeded) {
		equipIfNeeded("zapper", "ring2");
		for (const entity of entities) {
			if (is_in_range(entity, "zapperzap")) {
				await use_skill("zapperzap", entity);
			}
		}
	}

	const nearest = getNearestMonster({ target: ["CrownPal"], cursed: true }) || getNearestMonster({ target: ["CrownPal"] });
	if (nearest && character.mp > 2500 && !is_on_cooldown("smash")) {
		await use_skill("smash", nearest);
	}

	const prio = get_nearest_monster_v2({ target: "CrownPal" });
	if (prio && prio.hp < 2000 && character.mp > 360 && !is_on_cooldown("purify")) {
		use_skill("purify", prio);
	}

	if (character.hp < character.max_hp - 800 && character.mp > 30 && !is_on_cooldown("selfheal")) {
		await use_skill("selfheal");
	}
}

SkillLoop();
///////////////////////////////////////////////////////////////////////////////////
async function equipIfNeeded(itemName, slotName, level, l) {
	let name = null;

	if (typeof itemName === 'object') {
		name = itemName.name;
		level = itemName.level;
		l = itemName.l;
	} else {
		name = itemName;
	}

	for (var i = 0; i < character.items.length; ++i) {
		const item = character.items[i];
		if (item != null) {
			item.slot = i;
			if (item.name === name && item.level === level && item.l === l) {
				if (character.slots[slotName]?.name !== itemName) {
					await equip(i, slotName);
				}
				return;
			}
		}
	}
}

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
