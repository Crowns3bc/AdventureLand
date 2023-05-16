const [centerX, centerY] = calculateCenterPoint(home);
async function SkillLoop() {
	let delay = 25;
	let dead = character.rip;
	let disabled = (parent.is_disabled(character) == undefined);
	try {
		//await zapThings();
		const zapperMobs = [home];
		const entities = Object.values(parent.entities).filter(entity => (
			entity && !entity.target) && zapperMobs.includes(entity.mtype)
		);
		const ready = (
			!is_on_cooldown("zapperzap") &&
			character.mp > G?.skills?.zapperzap?.mp + 3000 &&
			character.cc < 125
		);
		const zapperNeeded = entities.some(entity => is_in_range(entity, "zapperzap"));
		if (!smart.moving && ready && zapperNeeded) {
			if (character.slots.ring2?.name !== 'zapper') {
				equip(locate_item("zapper"));
			}
			for (const entity of entities) {
				if (is_in_range(entity, "zapperzap")) {
					await use_skill("zapperzap", entity);
				}
			}
			if (character.slots.ring2?.name !== 'ringofluck') {
				equip(locate_item("ringofluck"));
			}
		}
		if (!dead || disabled) {
			let target = null;
			if (character.map === 'desertland') {
				target = get_nearest_monster_v2({ target: 'CrownPriest', check_max_hp: true, max_distance: 35, point_for_distance_check: [centerX, centerY] });
				if (target.hp / target.max_hp < 0.33) {
					target = null;
				}
			} else {
				target = get_targeted_monster();
			}

			if (target && !is_on_cooldown("curse")) {
				use_skill("curse", target);
			}
		}
		if (character.party) {
			for (let char_name in get_party()) {
				if (character.name == char_name) continue;
				let monster = get_nearest_monster({ target: char_name });
				if (monster) {
					if (!is_on_cooldown("absorb")) {
						use_skill("absorb", char_name);
					}
				}
			}
		}
		if (character.party) {
			for (let char_name in get_party()) {
				if (char_name === character.name) continue; // skip self
				if (char_name.hp < char_name.max_hp * 0.55) {
					if (!is_on_cooldown("partyheal")) {
						await use_skill("partyheal");
					}
				}
			}
		}
		if (character.hp < character.max_hp * .5) {
			await use_skill("partyheal")
		}
		if (!dead || disabled) {
			if (!is_on_cooldown("darkblessing") && character.s.warcry) {
				use_skill("darkblessing");
			}
		}
	} catch (e) {
		console.error(e)
	}
	setTimeout(SkillLoop, delay)
}
SkillLoop();
