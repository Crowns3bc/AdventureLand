function item_quantity(name) { 
    for (var i = 0; i < 42; i++) {
        if (character.items[i] && character.items[i].name == name)
            return character.items[i].q;
    }
    return 0;
}

function refill_pots(){
    var potAmount = 10;
    if (item_quantity("hpot1") < potAmount){
    send_cm("CrownsAnal", "HP")
	}
    if (item_quantity("mpot1") < potAmount){
    send_cm("CrownsAnal", "MP")
	}
}


function on_cm(name, data) {
    if(name == "CrownPriest") {
      if(data == "HP") {
        send_item("CrownPriest",2,100)
        }
    }
    if(name == "CrownPriest") {
        if(data == "MP") {
            send_item("CrownPriest",3,100)
		}
	}
	    if(name == "CrownTown") {
      if(data == "HP") {
        send_item("CrownTown",2,100)
        }
    }
    if(name == "CrownTown") {
        if(data == "MP") {
            send_item("CrownTown",3,100)
		}
	}
}
