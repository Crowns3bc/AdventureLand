function monsterLevel(mobId, lostXP, start_level = 1) {
	const mob = G.monsters[mobId];
	if (!mob) return game_log("Invalid mob ID");

	const fmt = n => Number(Math.floor(n)).toLocaleString();

	const baseHP = mob.hp;
	const hpGain = Math.floor(baseHP / 2);

	let remainingXP = Math.floor(lostXP / 12);
	let currentHP = baseHP + hpGain * (start_level - 1);
	let level = start_level;
	let gained = 0;

	while (remainingXP > currentHP * 2.4) {
		remainingXP -= currentHP * 2.4;
		remainingXP *= 0.9;

		currentHP += hpGain;
		level++;
		gained++;
	}

	show_json({
		mob: mobId,
		player_lost_xp: fmt(lostXP),
		fed_to_mob: fmt(lostXP / 12),
		start_level: fmt(start_level),
		levels_gained: fmt(gained),
		final_level: fmt(level),
		final_hp: fmt(currentHP),
		leftover_xp: fmt(remainingXP)
	});
}
