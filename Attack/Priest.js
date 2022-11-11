function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings)
    return ms < 0 ? 0 : ms
}

var monster_targets =  ["stompy", "bgoo", "rgoo", "crabxx", "franky", "icegolem"];
async function attackLoop() {
    let delay = 15;
    try { 
		if(parent.is_disabled(character) == undefined){
	if(!character.rip){
			if(character.hp < character.max_hp - character.heal){
				await heal(character);
			}
  var target = find_viable_targets()[0];
	    if(is_in_range(target)){
            await attack(target);
                    delay = ms_to_next_skill('attack');
				        }
			      }
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(attackLoop, delay)
}
attackLoop()

function find_viable_targets() {
    var monsters = Object.values(parent.entities).filter(
        mob => (mob.target == null || // This
            parent.party_list.includes(mob.target) ||
            mob.target == character.name
        ) && // And this
        (mob.type == "monster" &&
            (parent.party_list.includes(mob.target) ||
                mob.target == character.name)
        ) || // Or This
        monster_targets.includes(mob.mtype)
    );
    for (id in monsters) {
        var monster = monsters[id];
        if (parent.party_list.includes(monster.target) || monster.target == character.name) {
            monster.targeting_party = 1;
        } else {
            monster.targeting_party = 0;
        }
    }
    // Order monsters by whether they're attacking us, then by distance.
    monsters.sort(function(current, next) {
        if (current.targeting_party > next.targeting_party) {
            return -1;
        }
        var dist_current = distance(character, current);
        var dist_next = distance(character, next);
        // Else go to the 2nd item
        if (dist_current < dist_next) {
            return -1;
        } else if (dist_current > dist_next) {
            return 1
        } else {
            return 0;
        }
    });
    return monsters;
}
