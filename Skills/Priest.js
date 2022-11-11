async function SkillLoop() {
    let delay = 100;
    try { 
	if(parent.is_disabled(character) == undefined){
	if(!character.rip){
	var home = get_nearest_monster({type: 'plantoid'});
		
  for(let x in parent.entities) {
    let entity = parent.entities[x];
    if(entity.mtype == "plantoid" && entity.target == undefined){
	if(!is_on_cooldown("zapperzap")) {
		if (character.cc <= 65){
		if(character.mp > character.max_mp * 0.4){
		if(character.fear < 5){
		equip(7); //location in inventory of zapper
      		use_skill("zapperzap", entity);
		equip(7);
             	        }
    		    }
             	}
            }
        }
    }
	    if  (character.party){
        for (let char_name in get_party()) {
	if (character.name == char_name) continue;
            let monster = get_nearest_monster({target: char_name});
            if (monster) {
                if (!is_on_cooldown("absorb")) {
                    use_skill("absorb", char_name);
                }
            }
        }
    }
	var c1 = get_player("CrownPriest");
	var c2 = get_player("CrownsAnal");
	var c3 = get_player("CrownTown");
	 if(c1 && c1.hp < c1.max_hp * 0.45 || 
	   (c2 && c2.hp < c2.max_hp * 0.45) || 
	   (c3 && c3.hp < c3.max_hp * 0.45) || 
	   (c4 && c4.hp < c4.max_hp * 0.45)){
		if (!is_on_cooldown("partyheal")) {
			use_skill("partyheal");
		}
	}
	if (!is_on_cooldown("darkblessing")) {
	    use_skill("darkblessing");
	        }
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
SkillLoop()
