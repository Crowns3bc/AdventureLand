/**
 * Shows drop rates for a specific monster with luck and mob level
 * @param {string} mobID - Monster ID (e.g., "xmagex", "bee")
 * @param {number} luckm - Luck multiplier (1.0 = no luck, 1.5 = 150% luck)
 * @param {number} mobLevel - Mob level (default: 1, scales drop rates)
 * @param {boolean} display - Whether to show results (default: true)
 * @returns {Object} Drop information with modified rates, or null if mob doesn't exist
 * 
 * @example dropInfo("xmagex", 3.27, 6); // Level 6 xmagex with 3.27 luck
 * @example dropInfo("bee", 1.2); // Level 1 bee with 120% luck
 */
function dropInfo(mobID, luckm, mobLevel = 1, display = true) {
	const dropTable = G.drops.monsters[mobID];
	if (!dropTable) return null;

	function toFraction(decimal) {
		if (decimal <= 0) return "0";
		if (decimal >= 1) return "1/1";
		const denominator = Math.round(1 / decimal);
		return `1/${denominator.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
	}

	const drops = dropTable.map(([baseChance, item]) => {
		const modified = Math.min(baseChance * luckm * mobLevel, 1);
		return {
			item,
			modifiedChance: toFraction(modified),
		};
	});

	const output = {
		mob: mobID,
		luckm,
		mobLevel,
		drops
	};

	if (display) show_json(output);
	return output;
}
