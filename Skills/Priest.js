async function SkillLoop() {
	const X = locations[home][0].x;
	const Y = locations[home][0].y;
	const delay = 40;
	const dead = character.rip;
	const disabled = parent.is_disabled(character) === undefined;
	const targetNames = ["CrownTown",  "CrownPriest"];
	const mapsToExclude = ["level2n", "level2w", ""];
	const eventMaps = ["goobrawl", "level2w", "main", "winterland", "cave", "halloween"];
	const eventMobs = ["rgoo", "bgoo", "snowman", "icegolem", "franky", "grinch", "dragold", "wabbit"];
	const zapperMobs = [home, "rgoo", "bgoo", "skeletor", "crabxx", "phoenix", "mvampire", "rharpy", "stompy"];
	let zap = true;

	try {
		if (character.ctype === "priest") {
			handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps, zapperMobs);
			if (!dead && zap) {
				// Filter entities for zapper skill
				const entities = Object.values(parent.entities).filter(
					entity => entity && !entity.target && zapperMobs.includes(entity.mtype)
				);

				// Check if zapper skill is ready
				const ready = (
					!is_on_cooldown("zapperzap") &&
					character.mp > G?.skills?.zapperzap?.mp + 3250 &&
					character.cc < 175
				);

				// Check if zapper skill is needed
				const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));
				//game_log("zapperNeeded");
				// Use zapper skill if conditions are met
				if (!smart.moving && ready && zapperNeeded) {
					equipIfNeeded("zapper", "ring2", 2, "l");
					//game_log("Equip Zapper");
					for (const entity of entities) {
						if (is_in_range(entity, "zapperzap")) {
							await use_skill("zapperzap", entity);
							//game_log("Use Zapper");
						}
					}
					equipIfNeeded("ringofluck", "ring2", 1, "s");
					//game_log("Equip Luck Ring");
				}
			}
		}
	} catch (e) {
		console.error(e);
	}
	setTimeout(SkillLoop, delay);
}

SkillLoop();

async function handlePriestSkills(X, Y, dead, disabled, targetNames, mapsToExclude, eventMobs, eventMaps) {
	if (!dead && disabled) {
		handleCursing(X, Y, targetNames);
		handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps);
		handlePartyHeal(dead);
		handleDarkBlessing(dead);
	} else {
		console.log("Dead or disabled, skipping handlePriestSkills");
	}
}

async function handleCursing(X, Y, targetNames) {
	let ctargetTypes = ["rgoo", "bgoo", "skeletor", "crabxx", "phoenix", "mvampire", "rharpy", "stompy"];
	let ctarget = null;

	// Find the nearest monster of any type in the ctargetTypes array
	for (let i = 0; i < ctargetTypes.length; i++) {
		ctarget = get_nearest_monster_v2({
			type: ctargetTypes[i],
		});
		if (ctarget && !is_on_cooldown("curse")) {
			await use_skill("curse", ctarget);
			return;
		}
	}

	// If no target found with the initial search, try to find one based on the specific conditions
	if (!ctarget) {
		for (const name of targetNames) {
			ctarget = get_nearest_monster_v2({
				target: "CrownTown",
				check_min_hp: true,
				type: "ent",
				//target: "CrownPriest",
				//check_max_hp: true,
				//max_distance: 75,
				//point_for_distance_check: [X, Y],
			});
			if (ctarget) break;
		}
	}

	// If still no target found, try to get the targeted monster
	if (!ctarget) ctarget = get_targeted_monster();

	// If a valid target is found, and conditions are met, use the curse skill
	if (ctarget && ctarget.hp >= ctarget.max_hp * 0.01 && !ctarget.immune && !is_on_cooldown("curse")) {
		//if (ctarget && ctarget.hp >= ctarget.max_hp * 0.8 && !ctarget.immune && !is_on_cooldown("curse")) {
		await use_skill("curse", ctarget);
	}
}

async function handleAbsorb(dead, mapsToExclude, eventMobs, eventMaps) {
	if (character.party) {
		for (let char_name in get_party()) {
			if (character.name == char_name) continue;
			let monster = get_nearest_monster({ type: home, target: "CrownsAnal" }); // target: char_name
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
		if (allies && allies.hp < allies.max_hp * 0.65 && !allies.rip) {
			if (!is_on_cooldown("partyheal") && character.mp > 2000) {
				await use_skill("partyheal");
			}
		}
	}
}

async function handleDarkBlessing(dead) {
	let isHome = get_nearest_monster({type: home});
	if (!dead && !character.s.darkblessing && isHome) {
		if (!is_on_cooldown("darkblessing")) {
			await use_skill("darkblessing");
		}
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
