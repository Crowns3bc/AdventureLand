//Farmers
setInterval(function () {
	if (character.s.mluck == undefined || character.s.mluck.f != "CrownMerch") {
		send_cm("CrownMerch", {
			message: "location",
			x: character.x,
			y: character.y,
			map: character.map
		});
	}
}, 1000);

//Merchant
function on_cm(name, data) {
  if(name == "CrownsAnal" || name == "CrownPriest" || name == "CrownTown"|| name == "CrownMage"|| name == "CrownSpam" || name == "CrownPal" && data.message === "location") {
    // If message is from "fighter" and contains "location" data, smart move to the location
    if (!smart.moving) {
      smart_move({ x: data.x, y: data.y, map: data.map });
		game_log("Smart moving to " + name);
    }
  }
}
