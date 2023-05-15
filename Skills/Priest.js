async function SkillLoop() {
	let delay = 25;
	let dead = character.rip;
	let disabled = (parent.is_disabled(character) == undefined);
	try {
		await zapThings();
		if (!dead || disabled) {
			const target = get_targeted_monster();
				if (!is_on_cooldown("curse")) {
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
			if (!is_on_cooldown("darkblessing")) {
				use_skill("darkblessing");
			}
		}
	} catch (e) {
		console.error(e)
	}
	setTimeout(SkillLoop, delay)
}
SkillLoop();

async function zapThings() {
  const zapperMobs = ["plantoid", "wabbit"];
  // this list will contain entities without a target that is in range of zapperzap
  const entitiesWithoutTarget = Object.values(parent.entities).filter(
    (entity) =>
      entity &&
      !entity.target &&
      zapperMobs.includes(entity.mtype) &&
      is_in_range(entity, "zapperzap")
  );

  // There are no targets to zap, lets equip the ring
  if (entitiesWithoutTarget.length === 0) {
    if (character.slots.ring2?.name !== "ringofluck") {
      await equip(locate_item("ringofluck"));  
    }

    // no reason to run the rest of this code
    return;
  }

  const ready =
    !is_on_cooldown("zapperzap") &&
    character.mp > G?.skills?.zapperzap?.mp + 3000 &&
    character.cc < 125;

  // only equip and use the zapper if it is ready
  if (!smart.moving && ready) {
    if (character.slots.ring2?.name !== "zapper") {
      await equip(locate_item("zapper"));
    }

    // Set the target to the first target that is in range of the zapperzap
    const target = entitiesWithoutTarget[0];

    await use_skill("zapperzap", target);
		//reduce_cooldown("zapperzap", Math.min(...parent.pings.slice(parent.pings.length - 5)));
  }
}
