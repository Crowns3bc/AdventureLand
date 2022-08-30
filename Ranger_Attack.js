function farm() {
	 let target = get_nearest_monster({target:"CrownPriest"});
}
        if(target){
    if(can_attack(target)){
    switch(parent.character.ctype ) {
        case "ranger":
             var arr = Object.values(parent.entities)
                .filter(e => e.type == "monster")
                .filter(e => e.target)
                .filter((a)=>a.target=== "CrownPriest")
 		.map(e => e.id);
            if( arr.length > 1 && arr.length < 4 ) use("3shot",arr);
            if( arr.length > 4 ) use("5shot",arr);
            break;
        }
      attack(target);
  }
}
