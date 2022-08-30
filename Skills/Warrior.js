function skills(){
	if(can_use("zapperzap")) {
  for(let x in parent.entities) {
    let entity = parent.entities[x];
    if(entity.mtype == "plantoid" && entity.target == undefined) {
      use_skill("zapperzap", entity);
      break;
    }
  }
}
if (character.party){
  for (let char_name in get_party()) {
if (character.name == char_name) continue;
      let monster = get_nearest_monster({target: char_name});
      if (monster) {
          if (can_use("taunt")) {
              use_skill("taunt", monster);
            }
         }
      }
	 if (can_use("hardshell")) {
          use_skill("hardshell");
      }
  }
	 if (can_use("warcry")) {
          use_skill("warcry");
	 } 
}
