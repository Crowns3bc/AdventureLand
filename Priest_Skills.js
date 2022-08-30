function skills(){
	if(can_use("zapperzap")) {
  for(let x in parent.entities) {
    let entity = parent.entities[x];
    if(entity.mtype == "fireroamer" && entity.target == undefined) {
		if (!is_on_cooldown("zapperzap")) {
      use_skill("zapperzap", entity);
      break;
			}
		}
	}
}
	if(character.name == "CrownPriest")
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
		var c4 = get_player("hermi0ne");
	 if(c1 && c1.hp < character.max_hp * 0.45 || 
	   (c2 && c2.hp < character.max_hp * 0.45) || 
	   (c3 && c3.hp < character.max_hp * 0.45) || 
	   (c4 && c4.hp < character.max_hp * 0.45)){
		if (!is_on_cooldown("partyheal")) {
		use_skill("partyheal");
		  }
	}
	if (!is_on_cooldown("darkblessing")) {
	use_skill("darkblessing");
	}
	if(character.mp > character.max_mp * 0.7){
		use_skill("zapperzap");
	  }
}
