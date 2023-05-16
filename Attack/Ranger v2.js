function distanceToPointComparator(point) {
    return function(a, b) {
        let a_dist = Math.hypot(a.x - point[0], a.y - point[1]);
        let b_dist = Math.hypot(b.x - point[0], b.y - point[1]);

        if (a_dist < b_dist) return -1;
        if (b_dist > b_dist) return 1;
        return 0;
    }
}


function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) + 15
    return ms < 0 ? 0 : ms
}
const [centerX, centerY] = calculateCenterPoint(home);
let farmDistanceComparator = distanceToPointComparator([centerX, centerY]);
async function attackLoop() {
    let Weapon, Gloves, Chest, delay;
    Weapon = character.slots.mainhand?.name;
    Gloves = character.slots.gloves?.name;
    Chest = character.slots.chest?.name;
    delay = 1;
    try {
        for (let x in parent.entities) {
            const entity = parent.entities[x];

            if (["bgoo", "rgoo"].includes(entity.mtype) && is_in_range(entity)) {
                if (!is_on_cooldown("huntersmark") && !is_on_cooldown("supershot")) {
                    await use("huntersmark", entity);
                    await use("supershot", entity);
                }
                await attack(entity);
                delay = ms_to_next_skill("attack");
            }
        }

        let monsterIds = Object.values(parent.entities)
            .filter((e) => e.type === "monster")
            .filter((e) => e.target)
            .filter((a) => a.target === "CrownPriest" || a.target === "CrownMerch")
            .sort(farmDistanceComparator)
            .map((e) => e.id);

        const nearest = getNearestMonster({ target: ["CrownPriest"] });
        if (is_in_range(nearest)) {
            if (monsterIds.length === 1) {
                if (!is_on_cooldown("huntersmark")) { 
                    await use("huntersmark", monsterIds);
                }
                if (!is_on_cooldown("supershot")) {
                    await use("supershot", monsterIds);
                }
                if (Weapon !== "bowofthedead") {
                     equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "supermittens") {
                     equip(locate_item("supermittens"));
                }
                if (Chest !== "coat") {  
                     equip(locate_item("coat"));
                }
                await attack(nearest);
                delay = ms_to_next_skill("attack");
            }
           else if (monsterIds.length === 2 || monsterIds.length === 3) {
                if (Weapon !== "bowofthedead") {
                     equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "supermittens") {
                     equip(locate_item("supermittens"));
                }
                if (Chest !== "tshirt9") {
                     equip(locate_item("tshirt9"));
                }
                await use_skill("3shot", monsterIds);
                delay = ms_to_next_skill("attack");
            } else if (mobTargets_inRange(home, 40, "CrownPriest", [centerX, centerY]) <= 3) {
                if (Weapon !== "bowofthedead") {
                     equip(locate_item("bowofthedead"));
                }
                if (Gloves !== "mpxgloves") { 
                     equip(locate_item("mpxgloves"));
                }
                if (Chest !== "tshirt9") {
                     equip(locate_item("tshirt9"));
                }
                await use_skill("5shot", monsterIds);
                delay = ms_to_next_skill("attack");
            } else {
                if (Weapon !== "pouchbow") {
                     equip(locate_item("pouchbow"));
                }
                if (Gloves !== "mpxgloves") { 
                     equip(locate_item("mpxgloves"));
                }
                if (Chest !== "tshirt9") {
                     equip(locate_item("tshirt9"));
                }
                await use_skill("5shot", monsterIds);
                delay = ms_to_next_skill("attack");
            }
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(attackLoop, delay);
}

attackLoop();
//////////////////////////////////////////////////////////////////////////////////////////////////
function mobTargets_inRange(mtype, radius, mobs_target, point) {
	if (!point) point = [character.x, character.y];
	let count = 0;
	for (let id in parent.entities) {
	  let entity = parent.entities[id];
	  if (!entity || entity.type !== 'monster' || entity.dead || !entity.visible) continue;
	  if (entity.mtype !== mtype) continue;
	  if (entity.target !== mobs_target) continue;
	  if (Math.hypot(point[0] - entity.x, point[1] - entity.y) <= radius) {
		  ++count;
	  }
	}
	return count;
}
//////////////////////////////////////////
function calculateCenterPoint(location) {
  const corners = locations[location];
  if (!corners || corners.length === 0) {
    throw new Error(`Invalid or missing corners for location: ${location}`);
  }

  let sumX = 0;
  let sumY = 0;
  const numCorners = corners.length;

  corners.forEach((corner) => {
    sumX += corner.x;
    sumY += corner.y;
  });

  const centerX = sumX / numCorners;
  const centerY = sumY / numCorners;

  return [centerX, centerY];
}
