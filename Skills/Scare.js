function scare() {
    const slot = character.items.findIndex(i => i && i.name === "jacko")
    const orb = character.items.findIndex(i => !i)
     let mobnum = 0
    for( id in parent.entities) {
        var current = parent.entities[id];
        if(current.type == "monster"  && current.target == character.name) mobnum ++;
    }
      if( mobnum > 0) {
          if(!is_on_cooldown("scare")) {
              equip(slot)
              use("scare")
              equip(slot)
        }
    }
}
