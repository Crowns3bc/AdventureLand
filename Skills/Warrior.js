let bataxe_timestamp = 0;
let offhand_timestamp = 0;
async function skillLoop() {
	let Mainhand, Offhand, delay;
	Mainhand = character.slots.mainhand?.name;
	Offhand = character.slots.offhand?.name;
	delay = 20;
	let aoe = character.mp >= 65 * 4 + G.skills.cleave.mp + 320
	try {
		if (character.cc < 125 && aoe && !is_on_cooldown("cleave") && mobTargets_inRange(home, G.skills.cleave.range, "CrownPriest") >= 4) {

			if (character.slots.offhand && Date.now() - offhand_timestamp > 200) {
				offhand_timestamp = Date.now();
				unequip("offhand");
			}
			if (Mainhand !== "bataxe" && Date.now() - bataxe_timestamp > 200) {
				bataxe_timestamp = Date.now();
				equip(locate_item("bataxe"));
				use_skill("cleave");
			}
			if (Mainhand === "bataxe" && Date.now() - bataxe_timestamp > 200) {
				bataxe_timestamp = Date.now();
				use_skill("cleave");
			}
		} else {
			if (Mainhand !== "vhammer") {
				equip(locate_item("vhammer"), "mainhand");
			}
			if (Offhand !== "ololipop") {
				await equip(locate_item("ololipop"), "offhand");
			}
		}
		if (character.ctype == 'warrior') {
			if (!is_on_cooldown("warcry")) {
				await use_skill("warcry");
			}
			if (!is_on_cooldown("charge")) {
				await use_skill("charge");
			}
		}
	} catch (e) {
		console.error(e)
	}
	setTimeout(skillLoop, delay)
}
skillLoop()


function mobTargets_inRange(mtype, radius, mobs_target) {
	let count = 0;
	for (let id in parent.entities) {
		let entity = parent.entities[id];
		if (!entity || entity.type !== 'monster' || entity.dead || !entity.visible) continue;
		if (entity.mtype !== mtype) continue;
		if (entity.target !== mobs_target) continue;
		if (distance(character, entity) <= radius) {
			++count;
		}
	}
	return count;
}
