/**
 * ADVENTURE LAND UPGRADE & COMPOUND COST CALCULATOR
 * 
 * Functions:
 *   upgradeCost(itemName, itemValue, targetLevel = 12, useLuckySlot = false, optimizeItems = false)
 *     - Calculates upgrade cost from +0 to the target level.
 *     - Can use Lucky Slot and optimize for minimum items or cost.
 * 
 *   compoundCost(itemName, itemValue, targetLevel = 7, optimizeItems = false)
 *     - Calculates compound cost from +0 to the target level.
 *     - Lucky Slot cannot be used for compounds.
 *     - Compounds cannot be primstacked
 * 
 * Parameters:
 *   - itemName: Name of the item (e.g. "hpamulet", "bataxe")
 *   - itemValue: Gold value of a +0 item
 *   - targetLevel: Desired upgrade/compound level
 *   - useLuckySlot: (upgrade only) true to use Lucky Slot, false or omit to ignore
 *   - optimizeItems: true to minimize items used, false to minimize gold cost
 * 
 * Examples:
 *   upgradeCost("bataxe", 1000000)                 // Upgrade to +12, no Lucky Slot, minimize cost
 *   upgradeCost("bataxe", 1000000, 12, true)       // Upgrade to +12 with Lucky Slot, minimize cost
 *   upgradeCost("bataxe", 1000000, 12, true, true) // Upgrade to +12 with Lucky Slot, minimize items
 * 
 *   compoundCost("hpamulet", 3200, 5)              // Compound to +5, default cost-efficient path
 *   compoundCost("hpamulet", 3200, 5, true)        // Compound to +5, minimize items
 * 
 * Notes:
 *   - This calculates the most cost-efficient path using scrolls, offerings, and primstacks.
 *   - Does NOT account for failstacking, random grace bonuses, or server-side ugrace/ograce.
 *   - Minimizing items used basically uses the most expensive pathing available
 *   
 *   - This is my edited version of Earthverse's Calculator. https://github.com/earthiverse/ALData/blob/main/source/upgrade.ts
 */

const COSTS = {
	scroll: [G.items.scroll0.g, G.items.scroll1.g, G.items.scroll2.g, G.items.scroll3.g, 5000000000],
	cscroll: [G.items.cscroll0.g, G.items.cscroll1.g, G.items.cscroll2.g, G.items.cscroll3.g, 15000000000],
	offering: [0, 2500000, G.items.offering.g, 500000000] // Can change the price of offering[1] (offeringp) depending on the current market price
}

const MANUAL_IGRADE = {
	lostearring: 2,
};

const UPGRADE_SCROLLS = [
	G.items.scroll0, G.items.scroll1, G.items.scroll2, G.items.scroll3, G.items.scroll4
]

const COMPOUND_SCROLLS = [
	G.items.cscroll0, G.items.cscroll1, G.items.cscroll2, G.items.cscroll3, G.items.cscroll4
]

const SCROLL_NAMES = {
	upgrade: ["scroll0", "scroll1", "scroll2", "scroll3", "scroll4"],
	compound: ["cscroll0", "cscroll1", "cscroll2", "cscroll3", "cscroll4"]
}

const OFFERINGS = [null, G.items.offeringp, G.items.offering, G.items.offeringx]

const OFFERING_NAMES = ["none", "offeringp", "offering", "offeringx"]

const COMPOUNDS = {
	0: { 1: 0.99, 2: 0.75, 3: 0.4, 4: 0.25, 5: 0.2, 6: 0.1, 7: 0.08, 8: 0.05, 9: 0.05, 10: 0.05 },
	1: { 1: 0.9, 2: 0.7, 3: 0.4, 4: 0.2, 5: 0.15, 6: 0.08, 7: 0.05, 8: 0.05, 9: 0.05, 10: 0.03 },
	2: { 1: 0.8, 2: 0.6, 3: 0.32, 4: 0.16, 5: 0.1, 6: 0.05, 7: 0.03, 8: 0.03, 9: 0.03, 10: 0.02 },
}

const UPGRADES = {
	0: { 1: 0.9999999, 2: 0.98, 3: 0.95, 4: 0.7, 5: 0.6, 6: 0.4, 7: 0.25, 8: 0.15, 9: 0.07, 10: 0.024, 11: 0.14, 12: 0.11 },
	1: { 1: 0.99998, 2: 0.97, 3: 0.94, 4: 0.68, 5: 0.58, 6: 0.38, 7: 0.24, 8: 0.14, 9: 0.066, 10: 0.018, 11: 0.13, 12: 0.1 },
	2: { 1: 0.97, 2: 0.94, 3: 0.92, 4: 0.64, 5: 0.52, 6: 0.32, 7: 0.232, 8: 0.13, 9: 0.062, 10: 0.015, 11: 0.12, 12: 0.09 },
}

const ZERO_GRADE_CACHE = {}

function getZeroGrade(item_name) {
	if (ZERO_GRADE_CACHE[item_name] !== undefined) {
		return ZERO_GRADE_CACHE[item_name]
	}
	ZERO_GRADE_CACHE[item_name] = item_grade({ name: item_name, level: 0 })
	return ZERO_GRADE_CACHE[item_name]
}

function getUpgradeChance(item, scroll_def, offering_def) {
	let grace = item.grace || 0
	let new_grace = item.grace || 0
	const zero_grade = getZeroGrade(item.name)
	const grade = item_grade(item)

	if (grade > scroll_def.grade) {
		return { chance: 0, new_grace: 0 }
	}

	let probability = 1
	let oprobability = 1
	let high = false
	const new_level = (item.level || 0) + 1
	oprobability = probability = UPGRADES[zero_grade][new_level]

	let igrace
	if (!zero_grade) {
		igrace = 1
	} else if (zero_grade == 1) {
		igrace = -1
	} else if (zero_grade == 2) {
		igrace = -2
	}

	grace = Math.max(0, Math.min(new_level + 1, (item.grace || 0) + igrace))
	grace = (probability * grace) / new_level + grace / 1000.0

	if (scroll_def.grade > grade && new_level <= 10) {
		probability = probability * 1.2 + 0.01
		high = true
		new_grace = new_grace + 0.4
	}

	if (offering_def) {
		let increase = 0.4

		if (offering_def.grade > grade + 1) {
			probability = probability * 1.7 + grace * 4
			high = true
			increase = 3
		} else if (offering_def.grade > grade) {
			probability = probability * 1.5 + grace * 1.2
			high = true
			increase = 1
		} else if (offering_def.grade == grade) {
			probability = probability * 1.4 + grace
		} else if (offering_def.grade == grade - 1) {
			probability = probability * 1.15 + grace / 3.2
			increase = 0.2
		} else {
			probability = probability * 1.08 + grace / 4
			increase = 0.1
		}
		new_grace = new_grace + increase
	} else {
		grace = Math.max(0, grace / 4.8 - 0.4 / ((new_level - 0.999) * (new_level - 0.999)))
		probability += grace
	}

	if (high) {
		probability = Math.min(probability, Math.min(oprobability + 0.36, oprobability * 3))
	} else {
		probability = Math.min(probability, Math.min(oprobability + 0.24, oprobability * 2))
	}

	return { chance: Math.min(probability, 1), new_grace }
}

function getCompoundChance(item, scroll_def, offering_def) {
	let grace = item.grace || 0
	let new_grace = item.grace || 0
	const zero_grade = getZeroGrade(item.name)
	const grade = item_grade(item)

	if (scroll_def == null || grade > scroll_def.grade) {
		return { chance: 0, new_grace: 0 }
	}

	let probability = 1
	let oprobability = 1
	let high = 0
	let grace_bonus = 0
	const new_level = (item.level || 0) + 1
	let igrade = MANUAL_IGRADE[item.name] ?? zero_grade;

	if (item.level >= 3 && !(item.name in MANUAL_IGRADE)) {
		igrade = calculate_item_grade({ ...item }, { name: item.name, level: item.level - 2 });
	}

	oprobability = probability = COMPOUNDS[igrade][new_level]

	if (scroll_def.grade > grade) {
		probability = probability * 1.1 + 0.001
		grace_bonus += 0.4
		high = scroll_def.grade - grade
	}

	if (offering_def) {
		let increase = 0.5
		grace = 0.027 * ((item.grace || 0) * 3 + 0.5)

		if (offering_def.grade > grade + 1) {
			probability = probability * 1.64 + grace * 2
			high = 1
			increase = 3
		} else if (offering_def.grade > grade) {
			probability = probability * 1.48 + grace
			high = 1
			increase = 1
		} else if (offering_def.grade == grade) {
			probability = probability * 1.36 + Math.min(30 * 0.027, grace)
		} else if (offering_def.grade == grade - 1) {
			probability = probability * 1.15 + Math.min(25 * 0.019, grace) / Math.max(item.level - 2, 1)
			increase = 0.2
		} else {
			probability = probability * 1.08 + Math.min(15 * 0.015, grace) / Math.max(item.level - 1, 1)
			increase = 0.1
		}

		new_grace = (item.grace || 0) * 3
		grace_bonus += increase
	} else {
		grace = 0.007 * ((item.grace || 0) * 3)
		probability = probability + Math.min(25 * 0.007, grace) / Math.max(item.level - 1, 1)
		new_grace = item.grace || 0
	}

	new_grace = new_grace / 6.4 + grace_bonus
	probability = Math.min(
		probability,
		Math.min(oprobability * (3 + ((high && high * 0.6) || 0)), oprobability + 0.2 + ((high && high * 0.05) || 0)),
	)

	return { chance: Math.min(probability, 1), new_grace }
}

function calculate_best_upgrade_step(starting_cost, item, optimize_item, lucky_slot, stacking) {
	if (lucky_slot === undefined) lucky_slot = false
	if (stacking === undefined) stacking = true

	const scrolls = UPGRADE_SCROLLS
	const offerings = OFFERINGS

	const grade = item_grade(item)
	let best = null

	for (let i = grade; i <= Math.min(grade + 1, 4); i++) {
		for (let j = 0; j < 4; j++) {
			const max_stacks = stacking ? Math.max(0, Math.ceil((item.level + 2 - (item.grace || 0)) / 0.5)) + 1 : 1
			for (let k = 0; k < max_stacks; k++) {
				const current_cost = starting_cost + COSTS.scroll[i] + COSTS.offering[j] + COSTS.offering[1] * k
				const new_item = {
					grace: (item.grace || 0) + 0.5 * k,
					name: item.name,
					level: item.level,
				}

				let result = getUpgradeChance(new_item, scrolls[i], offerings[j])
				let result_chance = result.chance
				let new_grace = result.new_grace

				if (lucky_slot) {
					result_chance = 0.6 * Math.min(1, (result_chance + 0.012) / 0.975) + 0.4 * result_chance
				}

				const expected_cost = current_cost / result_chance

				let is_better = false
				if (!best) {
					is_better = true
				} else if (optimize_item) {
					if (result_chance > best.chance + 0.0001) {
						is_better = true
					} else if (Math.abs(result_chance - best.chance) < 0.0001 && expected_cost < best.expected_cost) {
						is_better = true
					}
				} else {
					if (expected_cost < best.expected_cost) {
						is_better = true
					}
				}

				if (is_better) {
					best = {
						expected_cost: expected_cost,
						chance: result_chance,
						grace: new_grace,
						config: [i, j, k],
						scroll_idx: i,
						offering_idx: j,
						primstacks: k,
						actual_cost: current_cost
					}
				}
			}
		}
	}

	return best
}

function calculate_best_compound_step(starting_cost, item, optimize_item) {
	const cscrolls = COMPOUND_SCROLLS
	const offerings = OFFERINGS

	const grade = item_grade(item)
	let best = null

	for (let i = grade; i <= Math.min(grade + 1, 4); i++) {
		for (let j = 0; j < 4; j++) {
			const current_cost = starting_cost * 3 + COSTS.cscroll[i] + COSTS.offering[j]
			const result = getCompoundChance(item, cscrolls[i], offerings[j])
			if (!result.chance) continue

			const expected_cost = current_cost / result.chance

			let is_better = false
			if (!best) {
				is_better = true
			} else if (optimize_item) {
				if (result.chance > best.chance + 0.0001) {
					is_better = true
				} else if (
					Math.abs(result.chance - best.chance) < 0.0001 &&
					expected_cost < best.expected_cost
				) {
					is_better = true
				}
			} else {
				if (expected_cost < best.expected_cost) {
					is_better = true
				}
			}

			if (is_better) {
				best = {
					expected_cost,
					actual_cost: current_cost,
					chance: result.chance,
					grace: result.new_grace,
					scroll_idx: i,
					offering_idx: j
				}
			}
		}
	}

	return best
}

function calculate_upgrade_path(item_value, item_name, start_level, target_level, optimize_item, lucky_slot, stacking) {
	if (start_level === undefined) start_level = 0
	if (target_level === undefined) target_level = 8
	if (optimize_item === undefined) optimize_item = false
	if (lucky_slot === undefined) lucky_slot = false
	if (stacking === undefined) stacking = true

	const path = []
	let current_item = { name: item_name, level: start_level, grace: 0 }
	let current_cost = item_value
	let total_expected_cost = 0
	let cumulative_success_chance = 1

	for (let level = start_level; level < target_level; level++) {
		const step = calculate_best_upgrade_step(
			current_cost,
			current_item,
			optimize_item,
			lucky_slot,
			stacking
		)

		if (!step) {
			break
		}

		const expected_attempts = 1 / step.chance
		const step_expected_cost = step.expected_cost

		cumulative_success_chance *= step.chance

		path.push({
			from_level: level,
			to_level: level + 1,
			scroll: step.scroll_idx,
			offering: step.offering_idx,
			primstacks: step.primstacks,
			chance: step.chance,
			expected_attempts: expected_attempts,
			step_cost: step.actual_cost,
			expected_cost: step_expected_cost,
			grace_after: step.grace
		})

		total_expected_cost += step_expected_cost

		current_item = {
			name: item_name,
			level: level + 1,
			grace: step.grace
		}
		current_cost = step.expected_cost
	}

	const total_items_needed = 1 / cumulative_success_chance

	return {
		path: path,
		total_expected_cost: total_expected_cost,
		total_items_needed: total_items_needed,
		final_level: current_item.level,
		final_grace: current_item.grace
	}
}

function calculate_compound_path(item_value, item_name, start_level, target_level, optimize_item) {
	if (start_level === undefined) start_level = 0
	if (target_level === undefined) target_level = 5
	if (optimize_item === undefined) optimize_item = false

	const path = []
	let current_item = { name: item_name, level: start_level, grace: 0 }
	let current_cost = item_value
	let total_expected_cost = 0
	let expected_items_needed = 1

	for (let level = start_level; level < target_level; level++) {
		const step = calculate_best_compound_step(
			current_cost,
			current_item,
			optimize_item
		)

		if (!step) break

		const expected_attempts = 1 / step.chance
		expected_items_needed *= 3 / step.chance
		total_expected_cost += step.expected_cost

		path.push({
			from_level: level,
			to_level: level + 1,
			scroll: step.scroll_idx,
			offering: step.offering_idx,
			chance: step.chance,
			expected_attempts,
			step_cost: step.actual_cost,
			expected_cost: step.expected_cost,
			grace_after: step.grace
		})

		current_item = {
			name: item_name,
			level: level + 1,
			grace: step.grace
		}
		current_cost = step.expected_cost
	}

	return {
		path,
		total_expected_cost,
		total_items_needed: expected_items_needed,
		final_level: current_item.level,
		final_grace: current_item.grace
	}
}

function compare_upgrade_strategies(item_value, item_name, start_level, target_level) {
	if (start_level === undefined) start_level = 0
	if (target_level === undefined) target_level = 8

	const strategies = [
		{ name: "Min Cost (Normal)", opts: [false, false, true] },
		{ name: "Min Cost (Lucky Slot)", opts: [false, true, true] },
		{ name: "Min Items (Normal)", opts: [true, false, true] },
		{ name: "Min Items (Lucky Slot)", opts: [true, true, true] },
	]

	const results = []

	for (const strategy of strategies) {
		const [optimize_item, lucky_slot, stacking] = strategy.opts
		const result = calculate_upgrade_path(
			item_value, item_name, start_level, target_level,
			optimize_item, lucky_slot, stacking
		)

		results.push({
			strategy: strategy.name,
			total_cost: result.total_expected_cost,
			total_items: result.total_items_needed,
			path: result.path,
			final_level: result.final_level
		})
	}
	results.sort((a, b) => a.total_cost - b.total_cost)

	return results
}

function upgradeCost(item_name, item_value, target_level, lucky_slot, optimize_item) {
	if (target_level === undefined) target_level = 12
	if (lucky_slot === undefined) lucky_slot = false
	if (optimize_item === undefined) optimize_item = false

	const start_level = 0

	const result = calculate_upgrade_path(
		item_value,
		item_name,
		start_level,
		target_level,
		optimize_item,
		lucky_slot,
		true
	)

	const scroll_names = SCROLL_NAMES.upgrade
	const offering_names = OFFERING_NAMES

	function formatGold(num) {
		return Math.round(num)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	}

	const output = {
		item: item_name,
		base_item_value: formatGold(item_value),
		from_level: start_level,
		to_level: target_level,
		total_expected_cost: formatGold(result.total_expected_cost),
		total_items_needed: Math.ceil(result.total_items_needed),
		upgrade_steps: result.path.map(step => ({
			upgrade: `+${step.from_level} → +${step.to_level}`,
			scroll: scroll_names[step.scroll],
			offering: offering_names[step.offering],
			primstacks: step.primstacks,
			success_chance: `${(step.chance * 100).toFixed(2)}%`,
			expected_attempts: step.expected_attempts.toFixed(2),
			cost_per_attempt: formatGold(step.step_cost),
			expected_cost: formatGold(step.expected_cost)
		}))
	}

	show_json(output)
	return output
}

function compoundCost(item_name, item_value, target_level, optimize_item) {
	if (target_level === undefined) target_level = 7
	if (optimize_item === undefined) optimize_item = false

	const result = calculate_compound_path(
		item_value,
		item_name,
		0,
		target_level,
		optimize_item
	)

	const cscroll_names = SCROLL_NAMES.compound
	const offering_names = OFFERING_NAMES

	function formatGold(num) {
		return Math.round(num)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	}

	const output = {
		item: item_name,
		base_item_value: formatGold(item_value),
		from_level: 0,
		to_level: target_level,
		total_expected_cost: formatGold(result.total_expected_cost),
		total_items_needed: Math.ceil(result.total_items_needed),
		compound_steps: result.path.map(step => ({
			compound: `+${step.from_level} → +${step.to_level}`,
			scroll: cscroll_names[step.scroll],
			offering: offering_names[step.offering],
			success_chance: `${(step.chance * 100).toFixed(2)}%`,
			expected_attempts: step.expected_attempts.toFixed(2),
			cost_per_attempt: formatGold(step.step_cost),
			expected_cost: formatGold(step.expected_cost)
		}))
	}

	show_json(output)
	return output
}
