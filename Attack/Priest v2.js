function ms_to_next_skill(skill) {
    const next_skill = parent.next_skill[skill]
    if (next_skill == undefined) return 0
    const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings) + 15
    return ms < 0 ? 0 : ms
}

var monster_targets = ["plantoid", "wabbit"];
async function attackLoop() {
    let delay = 1;
    try {
        if (character.hp < character.max_hp - character.heal) {
            await heal(character);
            delay = ms_to_next_skill('attack');
        } else if (character.party) {
            for (let char_name in get_party()) {
                if (character.name === char_name) continue;
                if (char_name.hp < char_name.max_hp - 2500) {
                    await heal(char_name);
                    delay = ms_to_next_skill('attack');
                    break;
                }
            }
        } else {
            var target = find_viable_targets()[0];
            if (is_in_range(target)) {
                await attack(target);
                delay = ms_to_next_skill('attack');
            }
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(attackLoop, delay)
}
attackLoop();
