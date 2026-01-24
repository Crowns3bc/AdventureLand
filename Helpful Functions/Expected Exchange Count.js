/**
 * Calculates expected items from exchanging/opening containers
 * @param {string} dropName - Container name (e.g., "basketofeggs", "gem0")
 * @param {number} count - Number of containers to open
 * @param {boolean} display - Whether to show results (default: true)
 * @returns {Object} Expected items by name, or null if container doesn't exist
 * 
 * @example exchangeCount("basketofeggs", 30000);
 * @example exchangeCount("mistletoe", 1000, false); // Returns without displaying
 */
function exchangeCount(dropName, count, display = true) {
	if (!G.drops[dropName]) return null;

	const exchangeRate = G.items[dropName]?.e ?? 1;
	const effectiveCount = count / exchangeRate;

	const results = new Map();
	const stack = [{ name: dropName, amount: effectiveCount }];

	while (stack.length) {
		const { name, amount } = stack.pop();
		const drops = G.drops[name];
		if (!drops?.length) continue;

		const totalWeight = drops.reduce((sum, [w]) => sum + w, 0);

		for (const [weight, itemOrType, maybeSubDrop] of drops) {
			const expected = amount * (weight / totalWeight);
			if (itemOrType === "open") {
				stack.push({ name: maybeSubDrop, amount: expected });
			} else {
				results.set(itemOrType, (results.get(itemOrType) ?? 0) + expected);
			}
		}
	}

	const sorted = Object.fromEntries(
		[...results.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => [k, v < 1 ? Number(v.toFixed(2)) : Math.round(v)])
	);

	if (display) show_json(sorted);
	return sorted;
}
