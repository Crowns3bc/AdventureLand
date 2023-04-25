async function SkillLoop() {
	let delay = 25;
	let dead = character.rip;
	let disabled = (parent.is_disabled(character) == undefined);
	try {
		for (let x in parent.entities) {
			let entity = parent.entities[x];
			let ready = !is_on_cooldown("zapperzap") && character.mp > G?.skills?.zapperzap?.mp + 3000 && is_in_range(entity, "zapperzap") && character.cc < 125 && character.targets < 100;
			if (entity.mtype === "fireroamer" && entity.target == undefined ||
				(entity.mtype === "wabbit" && entity.target == undefined)) {
				if (!smart.moving) {
					if (ready) {
						if (character.slots.ring2?.name !== 'zapper') {
							await fixPromise(equip(locate_item("zapper")))
						}
						await use_skill("zapperzap", entity);
						if (character.slots.ring2?.name !== 'resistancering') {
							await fixPromise(equip(locate_item("resistancering")))
						}
					}
				}
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
		if (character.hp < character.max_hp * .55) {
			await use_skill("partyheal");
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
		if (!dead || disabled) {
			if (!is_on_cooldown("darkblessing")) {
				use_skill("darkblessing");
			}
		}
		if (!dead || disabled) {
			if (!home.hasOwnProperty("immune") && home) {
				if (!is_on_cooldown("curse")) {
					use_skill("curse", home);
				}
			}
		}
	} catch (e) {
		console.error(e)
	}
	setTimeout(SkillLoop, delay)
}
SkillLoop();
