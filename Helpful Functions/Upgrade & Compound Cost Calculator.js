/**
 * ADVENTURE LAND UPGRADE & COMPOUND COST CALCULATOR V2
 * 
 * Functions:
 *   upgradeCost(itemName, itemValue, targetLevel = 12, luckySlot = false, display = true)
 *     - Calculates upgrade cost from +0 to the target level.
 *     - Finds the globally optimal path considering all scroll/offering/primstack combinations.
 * 
 *   compoundCost(itemName, itemValue, targetLevel = 7, optimizeItem = false, display = true)
 *     - Calculates compound cost from +0 to the target level.
 *     - Lucky Slot cannot be used for compounds.
 *     - Compounds cannot be primstacked.
 * 
 * Parameters:
 *   - itemName: Name of the item (e.g. "hpamulet", "bataxe")
 *   - itemValue: Gold value of a +0 item
 *   - targetLevel: Desired upgrade/compound level
 *   - luckySlot: (upgrade only) true to use Lucky Slot, false to ignore
 *   - optimizeItem: (compounds only) true to minimize items used, false to minimize gold cost
 *   - display: true to show results, false to only return
 * 
 * Examples:
 *   // UPGRADES
 *   upgradeCost("bataxe", 1000000)                      // +0 to +12, no Lucky Slot, show results
 *   upgradeCost("bataxe", 1000000, 8)                   // +0 to +8, no Lucky Slot, show results
 *   upgradeCost("bataxe", 1000000, 12, true)            // +0 to +12, WITH Lucky Slot, show results
 *   upgradeCost("bataxe", 1000000, 12, false, false)    // +0 to +12, no Lucky Slot, return only (no display)
 * 
 *   // COMPOUNDS
 *   compoundCost("hpamulet", 3200)                      // +0 to +7, minimize cost, show results
 *   compoundCost("hpamulet", 3200, 5)                   // +0 to +5, minimize cost, show results
 *   compoundCost("hpamulet", 3200, 5, true)             // +0 to +5, minimize items used, show results
 *   compoundCost("hpamulet", 3200, 7, false, false)     // +0 to +7, minimize cost, return only (no display)
 * 
 * Notes:
 *   - Does NOT account for failstacking, random grace bonuses, or server-side ugrace/ograce.
 */

const COSTS = {
	scroll: [G.items.scroll0.g, G.items.scroll1.g, G.items.scroll2.g, G.items.scroll3.g, Infinity],
	cscroll: [G.items.cscroll0.g, G.items.cscroll1.g, G.items.cscroll2.g, G.items.cscroll3.g, Infinity],
	offering: [0, 2500000, G.items.offering.g, Infinity]
};

const MANUAL_IGRADE = { lostearring: 2 };

const UPGRADES = {
	0: { 1: .9999999, 2: .98, 3: .95, 4: .7, 5: .6, 6: .4, 7: .25, 8: .15, 9: .07, 10: .024, 11: .14, 12: .11 },
	1: { 1: .99998, 2: .97, 3: .94, 4: .68, 5: .58, 6: .38, 7: .24, 8: .14, 9: .066, 10: .018, 11: .13, 12: .1 },
	2: { 1: .97, 2: .94, 3: .92, 4: .64, 5: .52, 6: .32, 7: .232, 8: .13, 9: .062, 10: .015, 11: .12, 12: .09 }
};

const COMPOUNDS = {
	0: { 1: .99, 2: .75, 3: .4, 4: .25, 5: .2, 6: .1, 7: .08, 8: .05, 9: .05, 10: .05 },
	1: { 1: .9, 2: .7, 3: .4, 4: .2, 5: .15, 6: .08, 7: .05, 8: .05, 9: .05, 10: .03 },
	2: { 1: .8, 2: .6, 3: .32, 4: .16, 5: .1, 6: .05, 7: .03, 8: .03, 9: .03, 10: .02 }
};

const UPGRADE_SCROLLS = [G.items.scroll0, G.items.scroll1, G.items.scroll2, G.items.scroll3, G.items.scroll4];
const COMPOUND_SCROLLS = [G.items.cscroll0, G.items.cscroll1, G.items.cscroll2, G.items.cscroll3, G.items.cscroll4];
const OFFERINGS = [null, G.items.offeringp, G.items.offering, G.items.offeringx];

const SCROLL_NAMES = {
	upgrade: ["scroll0", "scroll1", "scroll2", "scroll3", "scroll4"],
	compound: ["cscroll0", "cscroll1", "cscroll2", "cscroll3", "cscroll4"]
};
const OFFERING_NAMES = ["none", "offeringp", "offering", "offeringx"];

const gradeCache = {};
const getZeroGrade = n => gradeCache[n] ?? (gradeCache[n] = item_grade({ name: n, level: 0 }));
const fmtGold = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const getUpgradeChance = (item, scroll_def, offering_def) => {
	let grace = item.grace || 0, new_grace = grace;
	const zero_grade = getZeroGrade(item.name), grade = item_grade(item);
	if (grade > scroll_def.grade) return { chance: 0, new_grace: 0 };

	const new_level = (item.level || 0) + 1;
	let probability = UPGRADES[zero_grade][new_level], oprobability = probability;
	const igrace = !zero_grade ? 1 : zero_grade === 1 ? -1 : -2;

	grace = Math.max(0, Math.min(new_level + 1, grace + igrace));
	grace = (probability * grace) / new_level + grace / 1000;

	let high = false;
	if (scroll_def.grade > grade && new_level <= 10) {
		probability = probability * 1.2 + 0.01;
		high = true;
		new_grace += 0.4;
	}

	if (offering_def) {
		let increase = 0.4;
		const diff = offering_def.grade - grade;
		if (diff > 1) probability = probability * 1.7 + grace * 4, high = true, increase = 3;
		else if (diff > 0) probability = probability * 1.5 + grace * 1.2, high = true, increase = 1;
		else if (diff === 0) probability = probability * 1.4 + grace;
		else if (diff === -1) probability = probability * 1.15 + grace / 3.2, increase = 0.2;
		else probability = probability * 1.08 + grace / 4, increase = 0.1;
		new_grace += increase;
	} else {
		grace = Math.max(0, grace / 4.8 - 0.4 / ((new_level - 0.999) ** 2));
		probability += grace;
	}

	probability = Math.min(probability, high ? Math.min(oprobability + 0.36, oprobability * 3) : Math.min(oprobability + 0.24, oprobability * 2));
	return { chance: Math.min(probability, 1), new_grace };
};

const getCompoundChance = (item, scroll_def, offering_def) => {
	let grace = item.grace || 0, new_grace = grace;
	const zero_grade = getZeroGrade(item.name), grade = item_grade(item);
	if (!scroll_def || grade > scroll_def.grade) return { chance: 0, new_grace: 0 };

	const new_level = (item.level || 0) + 1;
	let igrade = MANUAL_IGRADE[item.name] ?? zero_grade;
	if (item.level >= 3 && !(item.name in MANUAL_IGRADE)) {
		igrade = calculate_item_grade({ ...item }, { name: item.name, level: item.level - 2 });
	}

	let probability = COMPOUNDS[igrade][new_level], oprobability = probability;
	let high = 0, grace_bonus = 0;

	if (scroll_def.grade > grade) {
		probability = probability * 1.1 + 0.001;
		grace_bonus += 0.4;
		high = scroll_def.grade - grade;
	}

	if (offering_def) {
		let increase = 0.5;
		grace = 0.027 * (grace * 3 + 0.5);
		const diff = offering_def.grade - grade;

		if (diff > 1) probability = probability * 1.64 + grace * 2, high = 1, increase = 3;
		else if (diff > 0) probability = probability * 1.48 + grace, high = 1, increase = 1;
		else if (diff === 0) probability = probability * 1.36 + Math.min(30 * 0.027, grace);
		else if (diff === -1) probability = probability * 1.15 + Math.min(25 * 0.019, grace) / Math.max(item.level - 2, 1), increase = 0.2;
		else probability = probability * 1.08 + Math.min(15 * 0.015, grace) / Math.max(item.level - 1, 1), increase = 0.1;

		new_grace = grace * 3;
		grace_bonus += increase;
	} else {
		grace = 0.007 * (grace * 3);
		probability += Math.min(25 * 0.007, grace) / Math.max(item.level - 1, 1);
		new_grace = item.grace || 0;
	}

	new_grace = new_grace / 6.4 + grace_bonus;
	probability = Math.min(probability, Math.min(oprobability * (3 + ((high && high * 0.6) || 0)), oprobability + 0.2 + ((high && high * 0.05) || 0)));
	return { chance: Math.min(probability, 1), new_grace };
};

const calculateUpgrade = (itemName, itemValue, opts = {}) => {
	const { targetLevel = 12, luckySlot = false, startLevel = 0, startGrace = 0 } = opts;
	const dp = Array(13).fill(0).map(() => Array(140).fill(null));
	const pq = new MinHeap();

	dp[startLevel][startGrace * 10] = [itemValue, "init", -1, -1, 0];
	pq.push([itemValue, startLevel, startGrace * 10]);

	while (pq.size()) {
		const [totalCost, lvl, grace] = pq.pop();
		if (dp[lvl][grace] && dp[lvl][grace][0] < totalCost) continue;

		const realGrace = grace / 10;
		const item = { name: itemName, level: lvl, grace: realGrace };
		const grade = item_grade(item);

		if (realGrace < 13) {
			const newGrace = Math.min(realGrace + 0.5, 13);
			const primCost = COSTS.offering[1];
			const newTotalCost = totalCost + primCost;
			const idx = Math.round(newGrace * 10);
			if (!dp[lvl][idx] || newTotalCost < dp[lvl][idx][0]) {
				dp[lvl][idx] = [newTotalCost, "prim", lvl, grace, 0];
				pq.push([newTotalCost, lvl, idx]);
			}
		}

		if (lvl < targetLevel) {
			for (let s = grade; s <= Math.min(grade + 1, 4); s++) {
				for (let o = 0; o < 4; o++) {
					const { chance, new_grace } = getUpgradeChance(item, UPGRADE_SCROLLS[s], OFFERINGS[o]);
					if (!chance) continue;

					let finalChance = chance;
					if (luckySlot) finalChance = 0.6 * Math.min(1, (chance + 0.012) / 0.975) + 0.4 * chance;

					const attemptCost = totalCost + COSTS.scroll[s] + COSTS.offering[o];
					const expectedCost = attemptCost / finalChance;
					const newLvl = lvl + 1;
					const idx = Math.round(new_grace * 10);

					if (!dp[newLvl][idx] || expectedCost < dp[newLvl][idx][0]) {
						dp[newLvl][idx] = [expectedCost, `${s},${o}`, lvl, grace];
						pq.push([expectedCost, newLvl, idx]);
					}
				}
			}
		}
	}

	return dp;
};

const calculateCompoundPath = (itemValue, itemName, startLevel, targetLevel, optimizeItem) => {
	const path = [];
	let item = { name: itemName, level: startLevel, grace: 0 };
	let cumCost = 0, curCost = itemValue, itemsNeeded = 1;

	for (let lvl = startLevel; lvl < targetLevel; lvl++) {
		let best = null;
		const grade = item_grade(item);

		for (let i = grade; i <= Math.min(grade + 1, 4); i++) {
			for (let j = 0; j < 4; j++) {
				const stepCost = curCost * 3 + COSTS.cscroll[i] + COSTS.offering[j];
				const { chance, new_grace } = getCompoundChance(item, COMPOUND_SCROLLS[i], OFFERINGS[j]);
				if (!chance) continue;

				const expCost = stepCost / chance;
				const better = !best || (optimizeItem ? (chance > best.chance + 0.0001 || (Math.abs(chance - best.chance) < 0.0001 && expCost < best.expCost)) : expCost < best.expCost);

				if (better) best = { expCost, stepCost, chance, grace: new_grace, scroll: i, offering: j };
			}
		}

		if (!best) break;
		itemsNeeded *= 3 / best.chance;
		cumCost += best.expCost;

		path.push({
			from_level: lvl, to_level: lvl + 1, scroll: best.scroll, offering: best.offering,
			chance: best.chance, expected_attempts: 1 / best.chance, step_cost: best.stepCost,
			expected_cost: cumCost, grace_after: best.grace
		});

		item = { name: itemName, level: lvl + 1, grace: best.grace };
		curCost = best.expCost;
	}

	return { path, total_expected_cost: cumCost, total_items_needed: itemsNeeded, final_level: item.level, final_grace: item.grace };
};

function upgradeCost(itemName, itemValue, targetLevel = 12, luckySlot = false, display = true) {
	if (!G.items[itemName]) return null;

	const dp = calculateUpgrade(itemName, itemValue, { targetLevel, luckySlot });

	const allPaths = {};
	for (let lvl = 1; lvl <= targetLevel; lvl++) {
		let minCost = Infinity, minIdx = -1;
		for (let g = 0; g < 140; g++) {
			if (dp[lvl][g] && dp[lvl][g][0] < minCost) {
				minCost = dp[lvl][g][0];
				minIdx = g;
			}
		}

		if (minIdx === -1) continue;

		const simplePath = [];
		let cl = lvl, cg = minIdx;
		while (cl > 0 || cg !== 0) {
			const [, action, pl, pg] = dp[cl][cg];
			if (action !== "init" && action !== "prim") {
				const [s, o] = action.split(',').map(Number);
				simplePath.unshift([SCROLL_NAMES.upgrade[s], o === 0 ? null : OFFERING_NAMES[o]]);
			}
			cl = pl;
			cg = pg;
		}

		allPaths[lvl] = simplePath;
	}

	//console.log("Optimal paths to each level:", allPaths);

	let minCost = Infinity, minIdx = -1;
	for (let g = 0; g < 140; g++) {
		if (dp[targetLevel][g] && dp[targetLevel][g][0] < minCost) {
			minCost = dp[targetLevel][g][0];
			minIdx = g;
		}
	}

	if (minIdx === -1) return null;

	const path = [];
	let cl = targetLevel, cg = minIdx;
	while (cl > 0 || cg !== 0) {
		const [totalCostAtLevel, action, pl, pg] = dp[cl][cg];
		if (action !== "init" && action !== "prim") {
			const [s, o] = action.split(',').map(Number);

			let primstacks = 0, tl = pl, tg = pg;
			while (tl >= 0 && tg >= 0 && dp[tl][tg]) {
				const [, act, ppl, ppg] = dp[tl][tg];
				if (act === "prim") {
					primstacks++;
					tl = ppl;
					tg = ppg;
				} else break;
			}

			const item = { name: itemName, level: pl, grace: pg / 10 };
			const { chance } = getUpgradeChance(item, UPGRADE_SCROLLS[s], OFFERINGS[o]);
			let finalChance = chance;
			if (luckySlot) finalChance = 0.6 * Math.min(1, (chance + 0.012) / 0.975) + 0.4 * chance;

			const prevTotalCost = dp[pl][pg][0];
			const attemptCost = prevTotalCost + COSTS.scroll[s] + COSTS.offering[o];

			path.unshift({
				from_level: pl, to_level: cl, scroll: s, offering: o, primstacks: primstacks,
				chance: finalChance, expected_attempts: 1 / finalChance, step_cost: attemptCost,
				expected_cost: totalCostAtLevel, grace_after: cg / 10
			});
		}
		cl = pl;
		cg = pg;
	}

	const output = {
		item: itemName, base_item_value: fmtGold(itemValue), from_level: 0, to_level: targetLevel,
		total_expected_cost: fmtGold(minCost), total_items_needed: Math.ceil(path.reduce((p, s) => p * (s.chance >= 0.999999 ? 1 : s.expected_attempts), 1)),
		upgrade_steps: path.map(s => ({
			upgrade: `+${s.from_level} → +${s.to_level}`, scroll: SCROLL_NAMES.upgrade[s.scroll],
			offering: OFFERING_NAMES[s.offering], primstacks: s.primstacks,
			success_chance: `${(s.chance * 100).toFixed(2)}%`, expected_attempts: (s.chance >= 0.999999 ? 1 : s.expected_attempts).toFixed(2),
			cost_per_attempt: fmtGold(s.step_cost), expected_cost: fmtGold(s.expected_cost)
		})),
		//all_level_paths: allPaths
	};

	if (display) show_json(output);
	return output;
}

function compoundCost(itemName, itemValue, targetLevel = 7, optimizeItem = false, display = true) {
	if (!G.items[itemName]) return null;

	const result = calculateCompoundPath(itemValue, itemName, 0, targetLevel, optimizeItem);
	const output = {
		item: itemName, base_item_value: fmtGold(itemValue), from_level: 0, to_level: targetLevel,
		total_expected_cost: fmtGold(result.total_expected_cost), total_items_needed: Math.ceil(result.total_items_needed),
		compound_steps: result.path.map(s => ({
			compound: `+${s.from_level} → +${s.to_level}`, scroll: SCROLL_NAMES.compound[s.scroll],
			offering: OFFERING_NAMES[s.offering], success_chance: `${(s.chance * 100).toFixed(2)}%`,
			expected_attempts: s.expected_attempts.toFixed(2), cost_per_attempt: fmtGold(s.step_cost),
			expected_cost: fmtGold(s.expected_cost)
		}))
	};

	if (display) show_json(output);
	return output;
}

class MinHeap {
	constructor() { this.h = []; }
	push(v) {
		this.h.push(v);
		let i = this.h.length - 1;
		while (i > 0) {
			const p = (i - 1) >> 1;
			if (this.h[p][0] <= this.h[i][0]) break;
			[this.h[p], this.h[i]] = [this.h[i], this.h[p]];
			i = p;
		}
	}
	pop() {
		if (!this.h.length) return null;
		const r = this.h[0], e = this.h.pop();
		if (this.h.length) {
			this.h[0] = e;
			let i = 0;
			while (true) {
				const l = 2 * i + 1, ri = 2 * i + 2;
				let s = i;
				if (l < this.h.length && this.h[l][0] < this.h[s][0]) s = l;
				if (ri < this.h.length && this.h[ri][0] < this.h[s][0]) s = ri;
				if (s === i) break;
				[this.h[i], this.h[s]] = [this.h[s], this.h[i]];
				i = s;
			}
		}
		return r;
	}
	size() { return this.h.length; }
}
