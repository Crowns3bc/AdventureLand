function skills(){
	var c1 = get_player("CrownPriest");
	if(can_use("curse")) {
  for(let x in parent.entities) {
    let entity = parent.entities[x];
    if(entity.mtype == "fireroamer" && entity.target == undefined) {
      use_skill("curse", entity);
      break;
      }
    }
  }
	if (!can_use("darkblessing")) return;
	use_skill("darkblessing");
	
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
}