/**
 * Calculates expected item drops from farming a monster
 * @param {string} monsterName - Monster name (e.g., "bee", "snake")
 * @param {string} mapName - Map name (e.g., "main", "level2w") or null
 * @param {number} luckm - Luck multiplier (1 = no luck, 2.5 = 250% luck)
 * @param {number} kpd - Kills per day (or any time period)
 * @param {boolean} display - Whether to show results (default: true)
 * @returns {Object} Expected drops by item name
 * 
 * @example expectedDrops("bee", "main", 1.2, 10000);
 */
function expectedDrops(monsterName, mapName, luckm, kpd, display = true) {
	if (!G.monsters[monsterName]) return null;

	const results = {};
	const monsterHP = G.monsters[monsterName].hp;
	const hpFactor = monsterHP / 1000;

	const processDrops = (drops, multiplier = 1) => {
		if (!drops) return;
		drops.forEach(drop => {
			const item = drop[1] === "open" ? drop[2] : drop[1];
			const adjustedRate = Math.min(drop[0] * luckm * multiplier, 1);
			const expected = kpd * adjustedRate;
			results[item] = (results[item] || 0) + (expected < 1 ? Number(expected.toFixed(2)) : Math.round(expected));
		});
	};

	processDrops(G.drops.monsters[monsterName]);
	processDrops(parent.tracker.global, hpFactor);
	if (mapName && parent.tracker.maps[mapName]) {
		processDrops(parent.tracker.maps[mapName], hpFactor);
	}

	if (display) show_json(results);
	return results;
}
