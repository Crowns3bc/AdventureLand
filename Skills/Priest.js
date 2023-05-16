const [centerX, centerY] = calculateCenterPoint(home);
async function SkillLoop() {
	let delay = 25;
	let dead = character.rip;
	let disabled = (parent.is_disabled(character) == undefined);
	try {
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


function calculateCenterPoint(location) {
  const corners = locations[location];
  if (!corners || corners.length === 0) {
    throw new Error(`Invalid or missing corners for location: ${location}`);
  }

  let sumX = 0;
  let sumY = 0;
  const numCorners = corners.length;

  corners.forEach((corner) => {
    sumX += corner.x;
    sumY += corner.y;
  });

  const centerX = sumX / numCorners;
  const centerY = sumY / numCorners;

  return [centerX, centerY];
}


function get_nearest_monster_v2(args)
{
    var min_d=999999,target=null;
    var min_hp = 999999999;
    var max_hp = 0;

    if(!args) args={};
    if(args && args.target && args.target.name) args.target=args.target.name;
    if(args && args.type=="monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead");
    if(args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'");

    for(id in parent.entities)
    {
        var current=parent.entities[id];
        if(current.type!="monster" || !current.visible || current.dead) continue;
        if(args.type && current.mtype!=args.type) continue;
        if (args.min_level !== undefined && current.level < args.min_level) continue;
        if (args.max_level !== undefined && current.level > args.max_level) continue;
        if(args.target && current.target!=args.target) continue;
        if(args.no_target && current.target && current.target!=character.name) continue;
        if (args.cursed && !current.s.cursed) continue;
        var c_dist;
        if (args.point_for_distance_check) {
            c_dist = Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y);
        } else {
            c_dist = parent.distance(character,current);
        }
        if (args.max_distance !== undefined && c_dist > args.max_distance) continue;
        if (args.check_min_hp) {
            var c_hp = current.hp;
            if (c_hp < min_hp) min_hp = c_hp, target = current;
            continue;
        } else if (args.check_max_hp) {
            var c_hp = current.hp;
            if (c_hp > max_hp) max_hp = c_hp, target = current;
            continue;
        }
        if(c_dist<min_d) min_d=c_dist,target=current;
    }
    return target;
}
