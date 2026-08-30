// ============================================================================
// CONFIGURATION
// ============================================================================
const home = 'ent';
const mobMap = 'desertland';
const homeServer = 'USIII';
const allBosses = ['bgoo', 'crabxx', 'dragold', 'franky', 'greenjr', 'grinch', 'icegolem', 'jr', 'mrgreen', 'mrpumpkin', 'phoenix', 'rgoo', 'wabbit'];

const CONFIG = {
	combat: {
		enabled: true,
		targetPriority: ['CrownPriest'],
		alwaysAttack: ['crabx', 'wabbit'],
		attackIfTargeted: [...allBosses, 'phoenix'],
		neverAttack: ['nerfedmummy', 'target_ar500red', 'target_ar900', 'target', 'target_a500', 'target_a750', 'target_r500', 'target_r750'],
		useHuntersMark: true,
		useSupershot: true,
		minTargetsFor5Shot: 4,
		minTargetsFor3Shot: 2,
	},

	movement: {
		enabled: true,
		circleWalk: true,
		circleRadius: 75,
		moveThreshold: 25,
		clumpRadius: 85,
		rangedKiting: {
			enabled: false,
			targets: ['bscorpion'],
			minDistance: 155,
			maxDistance: null,
			rangeBuffer: 20,
			optimalDistance: 170,
			moveThrottle: 100,
			sampleAngles: 90,
			moveDistance: 30,
			prioritizeDistance: true,
			repositionThreshold: 20,
			maxKiteRange: 400,
			debug: false
		}
	},

	equipment: {
		bossHpThresholds: {
			mrpumpkin: 100000,
			mrgreen: 100000,
			crabxx: 100000,
			grinch: 100000,
			dragold: 200000,
			wabbit: 5000,
		},
		mpThresholds: { upper: 1700, lower: 2100 },
		chestThreshold: 12,
		swapCooldown: 500,
		capeSwapEnabled: false,
		coatSwapEnabled: true,
		bossSetSwapEnabled: true,
		xpSetSwapEnabled: false,
		xpMonsters: ['sparkbot', home],
		xpMobHpThreshold: 12000,
		useLicence: false,
		temporal: {
			enabled: true,
			targetMob: 'bscorpion',
			orbName: 'orboftemporal',
			skillName: 'temporalsurge',
			characters: ['CrownPriest', 'CrownsAnal', 'CrownTown'],
			storageKey: 'temporal_surge_rotation'
		}
	},

	potions: {
		autoBuy: true,
		hpThreshold: 400,
		mpThreshold: 500,
		minStock: 1000
	},

	party: {
		autoManage: true,
		groupMembers: ['CrownsAnal', 'CrownTown', 'CrownPriest', 'CrownMerch']
	},

	looting: {
		enabled: true,
		delayMs: 180000,
	},

	selling: {
		enabled: true,
		whitelist: [
			'angelwings', 'candycanesword', 'carrotsword', 'coat1',
			'crabclaw', 'cupid', 'dexring', 'eears', 'eggnog', 'epyjamas', 'eslippers',
			'gloves', 'gloves1', 'helmet', 'helmet1', 'hhelmet', 'harmor', 'hpants',
			'hboots', 'hgloves', 'hotchocolate', 'hpamulet', 'hpbelt', 'iceskates',
			'intring', 'lantern', 'lostearring', 'merry', 'mittens', 'mushroomstaff',
			'ornamentstaff', 'oxhelmet', 'pants', 'pants1', 'pinkie',
			'pstem', 'quiver', 'rednose', 'ringsj', 'santasbelt', 'skullamulet',
			'stramulet', 'dexamulet', 'intamulet', 'shoes1', 'smoke', 'snowball',
			'snowflakes', 'spear', 'strring', 't2bow', 'throwingstars', 'tshirt0',
			'tshirt1', 'tshirt2', 'vitearring', 'vitring', 'warmscarf', 'wbook0',
			'wgloves', 'wcap', 'wattire', 'wbreeches', 'wshoes', 'xmashat',
			'xmasshoes', 'xmassweater', 'xmaspants'
		],
	},

	upgrading: { enabled: false, whitelist: {} },
	combining: {
		enabled: false,
		whitelist: {
			dexamulet: { targetLevel: 3, primling: 3, prim: 4 },
			intamulet: { targetLevel: 3, primling: 3, prim: 4 },
			stramulet: { targetLevel: 3, primling: 3, prim: 4 }
		}
	},

	characterStarter: {
		enabled: false,
		characters: {
			MERCHANT: { name: 'CrownMerch', codeSlot: 4 },
			PRIEST: { name: 'CrownPriest', codeSlot: 3 },
			WARRIOR: { name: 'CrownTown', codeSlot: 2 }
		}
	},

	locationBroadcast: {
		enabled: true,
		targetPlayer: 'CrownMerch',
		checkInterval: 1000,
		lowInventorySlots: 3
	},

	dragold: {
		enabled: true,
		preSpawnBuffer: 3000,
	}
};

// ============================================================================
// CONSTANTS
// ============================================================================
const TICK_RATE = { main: 100, action: 1, mark: 40, equipment: 25, maintenance: 2000 };
const COOLDOWNS = { cc: 135 };
const CACHE_TTL = 50;

const EVENT_LOCATIONS = [
	{ name: 'dragold', map: 'cave', x: 1150, y: -850 },
	//{ name: 'crabxx', map: 'main', x: -961, y: 1780, join: true },
	{ name: 'mrgreen', map: 'spookytown', x: 610, y: 1000 },
	{ name: 'mrpumpkin', map: 'halloween', x: -222, y: 720 }
];

const getDynamicEvents = () => {
	const w = parent.S?.wabbit;
	return w?.live ? [...EVENT_LOCATIONS, { name: 'wabbit', map: w.map, x: w.x, y: w.y }] : EVENT_LOCATIONS;
};

const REGIONS = ['US', 'EU', 'ASIA'];

// ============================================================================
// OPTIMIZED LOOKUPS
// ============================================================================
const COMBAT_SETS = {
	neverAttack: new Set(CONFIG.combat.neverAttack),
	attackIfTargeted: new Set(CONFIG.combat.attackIfTargeted),
	alwaysAttack: new Set(CONFIG.combat.alwaysAttack),
	targetPriority: new Set(CONFIG.combat.targetPriority),
	xpMonsters: new Set(CONFIG.equipment.xpMonsters),
	bosses: new Set(allBosses),
};

// ============================================================================
// STATE & CACHE
// ============================================================================
const state = {
	skinReady: false,
	lastEquipTime: 0,
	lastBoosterSwap: 0,
	lastCapeSwap: 0,
	lastCoatSwap: 0,
	lastBossSetSwap: 0,
	lastXpSwap: 0,
	angle: 0,
	lastAngleUpdate: performance.now(),
};

const cache = {
	targets: { sortedByHP: [], inRange: [], outOfRange: [], clumped: [] },
	healTarget: null,
	priestTargets: 0,
	hasLowHpXpMob: false,
	lastUpdate: 0,
	isValid() { return performance.now() - this.lastUpdate < CACHE_TTL; }
};

// ============================================================================
// LOCATION & EQUIPMENT DATA
// ============================================================================
const locations = {
	bat: [{ x: 1200, y: -782 }],
	bigbird: [{ x: 1258, y: -120 }],
	bluefairy: [{ x: -376, y: -680 }],
	bscorpion: [{ x: -561, y: -1400 }],
	boar: [{ x: 19, y: -1109 }],
	cgoo: [{ x: -221, y: -274 }],
	crab: [{ x: -11840, y: -37 }],
	dryad: [{ x: 403, y: -347 }],
	ent: [{ x: -413, y: -1961 }],
	fireroamer: [{ x: 222, y: -827 }],
	ghost: [{ x: -405, y: -1642 }],
	gscorpion: [{ x: 390, y: -1422 }],
	iceroamer: [{ x: 823, y: -45 }],
	mechagnome: [{ x: 0, y: 0 }],
	mole: [{ x: 14, y: -1072 }],
	mummy: [{ x: 256, y: -1417 }],
	odino: [{ x: -52, y: 756 }],
	oneeye: [{ x: -632, y: 55 }],
	pinkgoblin: [{ x: 485, y: 157 }],
	poisio: [{ x: -121, y: 1360 }],
	prat: [{ x: 11, y: 84 }],
	pppompom: [{ x: 292, y: -189 }],
	plantoid: [{ x: -780, y: -387 }],
	rat: [{ x: 6, y: 430 }],
	scorpion: [{ x: -495, y: 685 }],
	stoneworm: [{ x: 830, y: 7 }],
	spider: [{ x: 895, y: -145 }],
	squig: [{ x: -1175, y: 422 }],
	targetron: [{ x: -544, y: -275 }],
	wolf: [{ x: 433, y: -2745 }],
	wolfie: [{ x: 113, y: -2014 }],
	xscorpion: [{ x: -495, y: 685 }]
};

const destination = { map: mobMap, x: locations[home][0].x, y: locations[home][0].y };

const equipmentSets = {
	single: [
		{ itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
		{ itemName: "t2quiver", slot: "offhand", level: 9, l: "l" },
	],
	dead: [
		{ itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
		{ itemName: "t2quiver", slot: "offhand", level: 9, l: "l" },
	],
	deadx: [
		{ itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
		{ itemName: "alloyquiver", slot: "offhand", level: 10, l: "l" },
	],
	boom: [
		{ itemName: "pouchbow", slot: "mainhand", level: 13, l: "l" },
		{ itemName: "alloyquiver", slot: "offhand", level: 10, l: "l" },
	],
	heal: [{ itemName: "cupid", slot: "mainhand", level: 9, l: "l" }],
	dps: [
		{ itemName: "dexearring", slot: "earring2", level: 5, l: "l" },
		{ itemName: "dexearring", slot: "earring1", level: 5, l: "l" },
		{ itemName: "suckerpunch", slot: "ring1", level: 3, l: "l" },
		{ itemName: "suckerpunch", slot: "ring2", level: 3, l: "u" },
	],
	luck: [
		{ itemName: "mearring", slot: "earring1", level: 0, l: "l" },
		{ itemName: "mearring", slot: "earring2", level: 0, l: "u" },
		{ itemName: "rabbitsfoot", slot: "orb", level: 2, l: "l" },
		{ itemName: "ringofluck", slot: "ring2", level: 0, l: "u" },
		{ itemName: "ringofluck", slot: "ring1", level: 0, l: "l" }
	],
	xp: [
		{ itemName: "talkingskull", slot: "orb", level: 4, l: "l" },
		{ itemName: "northstar", slot: "amulet", level: 2, l: "l" },
	],
	orb: [
		{ itemName: "orbofdex", slot: "orb", level: 5, l: "l" },
		{ itemName: "dexamulet", slot: "amulet", level: 6, l: "l" },
		//{ itemName: "amuletofm", slot: "amulet", level: 0, l: "l" },
	],
	stealth: [{ itemName: "stealthcape", slot: "cape", level: 0, l: "l" }],
	cape: [{ itemName: "vcape", slot: "cape", level: 6, l: "l" }],
	mana: [{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" }],
	stat: [{ itemName: "coat", slot: "chest", level: 12, l: "s" }],
};

// ============================================================================
// CORE UTILITIES
// ============================================================================
const shouldAttackMob = (mob) => {
	if (!mob || mob.dead) return false;
	if (COMBAT_SETS.neverAttack.has(mob.mtype)) return false;
	if (COMBAT_SETS.alwaysAttack.has(mob.mtype)) return true;
	if (COMBAT_SETS.attackIfTargeted.has(mob.mtype)) {
		return mob.target !== null && mob.target !== undefined;
	}
	return COMBAT_SETS.targetPriority.has(mob.target);
};

const EXPLOSION_RADIUS = { boom: 68 / 3.6, dead: 23 / 3.6 };

const updateCache = () => {
	if (!cache.isValid()) {
		const now = performance.now();
		const { x: homeX, y: homeY } = locations[home][0];
		const clumpRadius = CONFIG.movement.clumpRadius;
		const xpHpThreshold = CONFIG.equipment.xpMobHpThreshold;

		cache.priestTargets = 0;
		cache.hasLowHpXpMob = false;
		cache.untargeted = [];

		const sortedByHP = [];

		for (const id in parent.entities) {
			const e = parent.entities[id];
			if (e.type !== 'monster') continue;

			if (e.target === 'CrownPriest') cache.priestTargets++;

			if (!cache.hasLowHpXpMob && !e.dead &&
				COMBAT_SETS.xpMonsters.has(e.mtype) &&
				e.hp < xpHpThreshold) {
				cache.hasLowHpXpMob = true;
			}

			if (e.target == null && !COMBAT_SETS.alwaysAttack.has(e.mtype)) {
				cache.untargeted.push(e);
			}

			if (shouldAttackMob(e)) sortedByHP.push(e);
		}

		sortedByHP.sort((a, b) => {
			const aBoss = COMBAT_SETS.attackIfTargeted.has(a.mtype);
			const bBoss = COMBAT_SETS.attackIfTargeted.has(b.mtype);
			if (aBoss !== bBoss) return bBoss - aBoss;

			const aPriority = COMBAT_SETS.alwaysAttack.has(a.mtype);
			const bPriority = COMBAT_SETS.alwaysAttack.has(b.mtype);
			if (aPriority !== bPriority) return bPriority - aPriority;

			const aCurse = a.s?.curse ? 1 : 0, bCurse = b.s?.curse ? 1 : 0;
			if (aCurse !== bCurse) return bCurse - aCurse;

			const aMarked = a.s?.marked ? 1 : 0, bMarked = b.s?.marked ? 1 : 0;
			if (aMarked !== bMarked) return bMarked - aMarked;

			return b.hp - a.hp;
		});

		const inRange = [], outOfRange = [], clumped = [];
		for (const mob of sortedByHP) {
			if (is_in_range(mob)) {
				inRange.push(mob);
				if (Math.hypot(mob.x - homeX, mob.y - homeY) <= clumpRadius) {
					clumped.push(mob);
				}
			} else {
				outOfRange.push(mob);
			}
		}

		cache.targets = { sortedByHP, inRange, outOfRange, clumped };
		cache.healTarget = findHealTarget();
		cache.lastUpdate = now;
	}
};

const aoeUnsafe = (targets, radius) => {
	for (const t of targets) {
		for (const e of cache.untargeted) {
			if (Math.hypot(e.x - t.x, e.y - t.y) <= radius) return true;
		}
	}
	return false;
};

const findHealTarget = () => {
	const healer = get_entity('CrownPriest');
	const threshold = (!healer || healer.rip) ? 0.9 : 0.5;
	const party = Object.keys(get_party() || {});

	let target = null, minPct = 1;

	for (const name of party) {
		if (name === character.name) continue;
		const ally = get_player(name);
		if (ally?.hp && ally?.max_hp && !ally.rip) {
			const pct = ally.hp / ally.max_hp;
			if (pct < minPct) { minPct = pct; target = ally; }
		}
	}

	return minPct < threshold ? target : null;
};

// ============================================================================
// MAIN TICK LOOP
// ============================================================================
async function mainLoop() {
	try {
		if (is_disabled(character)) return setTimeout(mainLoop, 250);

		updateCache();

		if (CONFIG.equipment.useLicence) {
			let slot = locate_item("licence");
			if (slot === -1 && (character?.s?.licenced?.ms ?? 0) < 5000) {
				await buy("licence");
				slot = locate_item("licence");
			}
			if ((character?.s?.licenced?.ms ?? 0) < 250 && slot !== -1) {
				await consume(slot);
			}
		}

		if (await dragold.tick() === 'block') {
			return setTimeout(mainLoop, TICK_RATE.main);
		}
		if (character.map === "jail" && !smart.moving) {
			log("Jail escape plan!");
			return smart_move(find_npc("jailer")).then(() => {
				parent.socket.emit("leave");
			});
		}

		else if (shouldHandleEvents()) {
			handleEvents();
		}
		else if (CONFIG.movement.enabled) {
			if (!get_nearest_monster({ type: home })) {
				handleReturnHome();
			} else if (CONFIG.movement.rangedKiting.enabled) {
				await rangedKite();
			} else if (CONFIG.movement.circleWalk) {
				walkInCircle();
			}
		}
	} catch (e) {
		console.error('mainLoop error:', e);
	}

	setTimeout(mainLoop, TICK_RATE.main);
}

// ============================================================================
// ACTION LOOP
// ============================================================================
const actionLoop = async () => {
	try {
		if (is_disabled(character)) return setTimeout(actionLoop, 25);
		updateCache();
		const ms = ms_to_next_skill('attack') - 1.5;
		if (ms < 3) {
			if (ms > 0) { const until = performance.now() + ms; while (performance.now() < until); }
			if (cache.healTarget) { equipSet('heal'); await use_skill('attack', cache.healTarget); }
			else await handleAttack();
			return setTimeout(actionLoop, 0);
		}
		return setTimeout(actionLoop, ms > 8 ? ms - 6 : 1);
	} catch { return setTimeout(actionLoop, 1); }
};

const handleAttack = async () => {
	const { sortedByHP, clumped } = cache.targets;
	if (!sortedByHP.length) return;

	const min5 = CONFIG.combat.minTargetsFor5Shot;
	const min3 = CONFIG.combat.minTargetsFor3Shot;
	const can5 = character.mp >= (G.skills['5shot']?.mp || 0);
	const can3 = character.mp >= (G.skills['3shot']?.mp || 0);
	const top5 = can5 && sortedByHP.length >= min5 ? sortedByHP.slice(0, 5) : null;
	const top3 = can3 && sortedByHP.length >= min3 ? sortedByHP.slice(0, 3) : null;

	if (can5 && clumped.length >= min5) {
		const slice = clumped.slice(0, 5);
		if (!aoeUnsafe(slice, EXPLOSION_RADIUS.boom)) {
			equipSet('boom');
			await use_skill('5shot', slice.map(e => e.id));
			return;
		}
	}
	if (top5 && !aoeUnsafe(top5, EXPLOSION_RADIUS.dead)) {
		equipSet('dead'); await use_skill('5shot', top5.map(e => e.id)); return;
	}
	if (top3 && clumped.length >= min3 && !aoeUnsafe(top3, EXPLOSION_RADIUS.dead)) {
		equipSet('deadx'); await use_skill('3shot', top3.map(e => e.id)); return;
	}
	if (top3 && !aoeUnsafe(top3, EXPLOSION_RADIUS.dead)) {
		equipSet('dead'); await use_skill('3shot', top3.map(e => e.id)); return;
	}
	if (top5) {
		equipSet('dead'); await use_skill('5shot', top5.map(e => e.id));
	} else if (top3) {
		equipSet('dead'); await use_skill('3shot', top3.map(e => e.id));
	} else if (is_in_range(sortedByHP[0])) {
		equipSet('single'); await use_skill('attack', sortedByHP[0]);
	}
};

const skillLoop = async () => {
	let delay = 5;
	try {
		if (!CONFIG.combat.useHuntersMark && !CONFIG.combat.useSupershot) return;
		if (is_disabled(character)) return setTimeout(skillLoop, 250);

		updateCache();

		const { sortedByHP } = cache.targets;
		if (!sortedByHP.length) return setTimeout(skillLoop, 250);

		const target = sortedByHP[0];
		if (!target || !is_in_range(target)) return setTimeout(skillLoop, 250);

		const msHunter = ms_to_next_skill('huntersmark');
		const msSuper = ms_to_next_skill('supershot');
		const minMs = Math.min(msHunter, msSuper);

		if (minMs < character.ping / 10) {
			change_target(target);

			if (CONFIG.combat.useHuntersMark && msHunter === 0 && !target.s?.marked && target.hp >= target.max_hp * 0.01) {
				await use_skill('huntersmark', target);
			}

			if (CONFIG.combat.useSupershot && msSuper === 0) {
				await use_skill('supershot', target);
			}
		} else {
			delay = minMs > 200 ? 100 : minMs > 50 ? 20 : 5;
		}
	} catch (e) {
		console.error("skillLoop error:", e);
		delay = 1;
	}
	setTimeout(skillLoop, delay);
};

// ============================================================================
// MAINTENANCE LOOP
// ============================================================================
const maintenanceLoop = async () => {
	try {
		if (CONFIG.potions.autoBuy) autoBuyPotions();
		if (CONFIG.party.autoManage) partyMaker();
		if (CONFIG.selling.enabled) sellItems();
		if (CONFIG.upgrading.enabled) upgradeItems();
		if (CONFIG.combining.enabled) combineItems();

		clearInventory();
		inventorySorter();
		elixirUsage();

		if (character.rip && locate_item('xptome') !== -1) respawn();
	} catch (e) {
		console.error('maintenanceLoop error:', e);
	}

	setTimeout(maintenanceLoop, TICK_RATE.maintenance);
}

// ============================================================================
// POTION LOOP
// ============================================================================
async function potionLoop() {
	let delay = 100;

	try {
		const hpThreshold = character.max_hp - CONFIG.potions.hpThreshold;
		const mpThreshold = character.max_mp - CONFIG.potions.mpThreshold;

		if (character.mp < mpThreshold && !is_on_cooldown('use_mp')) {
			use_skill('use_mp');
			reduce_cooldown('use_mp', character.ping * 0.95);
			delay = ms_to_next_skill('use_mp');
		} else if (character.hp < hpThreshold && !is_on_cooldown('use_hp')) {
			use_skill('use_hp');
			reduce_cooldown('use_hp', character.ping * 0.95);
			delay = ms_to_next_skill('use_hp');
		}
	} catch (e) {
		console.error('potionLoop error:', e);
	}

	setTimeout(potionLoop, delay || 2000);
}

// ============================================================================
// EQUIPMENT MANAGEMENT LOOP
// ============================================================================
async function equipmentLoop() {
	const delay = TICK_RATE.equipment;

	try {
		if (!state.skinReady || character.cc > COOLDOWNS.cc) {
			return setTimeout(equipmentLoop, delay);
		}

		const now = performance.now();
		const swapCooldown = CONFIG.equipment.swapCooldown;

		const mainhand = character.slots?.mainhand?.name;
		if (mainhand === 'cupid') return setTimeout(equipmentLoop, delay);

		let activeBossName = null, activeBossData = null;
		for (const e of getDynamicEvents()) {
			const d = parent.S[e.name];
			if (d?.live) { activeBossName = e.name; activeBossData = d; break; }
		}

		if (now - state.lastBoosterSwap > swapCooldown) {
			let desiredBooster = activeBossData && activeBossData.hp < CONFIG.equipment.bossHpThresholds[activeBossName]
				? 'luckbooster'
				: 'xpbooster';

			const currentBoosterSlot = locate_item(desiredBooster);
			if (currentBoosterSlot === -1) {
				const otherBoosterSlot = findBoosterSlot();
				if (otherBoosterSlot !== null) {
					shift(otherBoosterSlot, desiredBooster);
					state.lastBoosterSwap = now;
				}
			}
		}

		if (CONFIG.equipment.capeSwapEnabled && now - state.lastCapeSwap > swapCooldown) {
			const chestCount = getNumChests();
			const numTargets = cache.priestTargets;
			const targetCapeSet = chestCount >= CONFIG.equipment.chestThreshold && numTargets < 6
				? 'stealth'
				: 'cape';

			if (targetCapeSet && !isSetEquipped(targetCapeSet)) {
				equipSet(targetCapeSet);
				state.lastCapeSwap = now;
			}
		}

		if (CONFIG.equipment.coatSwapEnabled && now - state.lastCoatSwap > swapCooldown) {
			const targetCoatSet = character.mp > CONFIG.equipment.mpThresholds.upper
				? 'stat'
				: character.mp < CONFIG.equipment.mpThresholds.lower && 'mana';

			if (targetCoatSet && !isSetEquipped(targetCoatSet)) {
				equipSet(targetCoatSet);
				state.lastCoatSwap = now;
			}
		}

		if (now - state.lastBossSetSwap > swapCooldown) {
			if (activeBossData && activeBossData.hp <= CONFIG.equipment.bossHpThresholds[activeBossName]) {
				if (!isSetEquipped('luck')) {
					equipSet('luck');
					state.lastBossSetSwap = now;
				}
			} else {
				if (activeBossName || character.map === mobMap) {
					if (!isSetEquipped('dps')) {
						equipSet('dps');
						state.lastBossSetSwap = now;
					}
				}

				if (CONFIG.equipment.xpSetSwapEnabled && now - state.lastXpSwap > swapCooldown) {
					const targetOrb = cache.hasLowHpXpMob ? 'xp' : 'orb';
					if (!isSetEquipped(targetOrb)) {
						equipSet(targetOrb);
						state.lastXpSwap = now;
					}
				}
			}
		}

		scare();

	} catch (e) {
		console.error('equipmentLoop error:', e);
	}

	setTimeout(equipmentLoop, delay);
}

const BOOSTER_NAMES = new Set(['xpbooster', 'goldbooster', 'luckbooster']);
function findBoosterSlot() {
	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item && BOOSTER_NAMES.has(item.name)) return i;
	}
	return null;
}

function getNumChests() {
	let n = 0;
	for (const _ in get_chests()) n++;
	return n;
}

// ============================================================================
// MOVEMENT FUNCTIONS
// ============================================================================
function shouldHandleEvents() {
	const holidaySpirit = parent?.S?.holidayseason && !character?.s?.holidayspirit;
	const hasHandleableEvent = getDynamicEvents().some(e => parent?.S?.[e.name]?.live);
	return holidaySpirit || hasHandleableEvent;
}

function handleEvents() {
	if (parent?.S?.holidayseason && !character?.s?.holidayspirit) {
		if (!smart.moving) {
			smart_move({ to: 'town' }, () => {
				parent.socket.emit('interaction', { type: 'newyear_tree' });
			});
		}
		return;
	}

	let target = null, bestRatio = Infinity;
	for (const e of getDynamicEvents()) {
		const d = parent.S[e.name];
		if (!d?.live) continue;
		const r = d.hp / d.max_hp;
		if (r < bestRatio) { bestRatio = r; target = e; }
	}

	if (!target) return;

	if (target.join === true && character.map !== target.map) {
		parent.socket.emit('join', { name: target.name });
		return;
	}

	if (!smart.moving) {
		handleSpecificEvent(target.name, target.map, target.x, target.y);
	}
}

async function handleSpecificEvent(eventType, mapName, x, y) {
	if (!parent?.S?.[eventType]?.live) return;

	const monster = get_nearest_monster({ type: eventType });
	if (!monster) {
		smart_move({ x, y, map: mapName });
		return;
	}

	if (COMBAT_SETS.bosses.has(eventType)) {
		if (!is_in_range(monster) && !smart.moving) {
			const dx = monster.x - character.x;
			const dy = monster.y - character.y;
			const dist = Math.hypot(dx, dy);
			const targetDist = character.range * 0.8;
			await xmove(
				character.x + dx * (1 - targetDist / dist),
				character.y + dy * (1 - targetDist / dist)
			);
		}
		return;
	}

	const halfway_x = character.x + (monster.x - character.x) / 2;
	const halfway_y = character.y + (monster.y - character.y) / 2;
	if (!is_in_range(monster, 'attack') && !smart.moving) {
		await xmove(halfway_x, halfway_y);
	}
}

// DRAGOLD SERVER HOPPING 
const dragold = {
	state: 'IDLE',
	targetShard: null,
	scanResults: [],
	hopping: false,

	startScanning() {
		if (!CONFIG.dragold.enabled) return;
		const servers = parent?.X?.servers;
		if (!servers) return;

		for (const server of servers) {
			if (server.name === 'PVP') continue;
			const shard = server.region + server.name;
			const socket = parent.io(`https://${server.address}`, { path: server.path + 'socket.io', transports: ['websocket'] });
			socket.on('server_info', (data) => {
				if (!data?.dragold) return;
				const spawnTime = new Date(data.dragold.spawn).getTime();
				const idx = this.scanResults.findIndex(r => r.shard === shard);
				const entry = { shard, live: data.dragold.live, spawnTime };
				if (idx >= 0) this.scanResults[idx] = entry;
				else this.scanResults.push(entry);
			});
		}
	},

	currentShard() {
		return parent.server_region + parent.server_identifier;
	},

	localDragoldLive() {
		return parent?.S?.dragold?.live === true;
	},

	pickTargetShard() {
		const now = Date.now();
		const cur = this.currentShard();
		let best = null;

		for (const r of this.scanResults) {
			if (r.shard === cur) continue;

			if (r.live) {
				best = r;
				break;
			}

			const untilSpawn = r.spawnTime - now;
			if (untilSpawn > 0 && untilSpawn <= CONFIG.dragold.preSpawnBuffer) {
				if (!best || r.spawnTime < best.spawnTime) best = r;
			}
		}

		return best?.shard ?? null;
	},

	async lootBeforeHop() {
		const chests = Object.keys(get_chests());
		if (chests.length === 0) return false;

		for (const id of chests) {
			try { await loot(id); } catch (e) { }
		}
		return true;
	},

	parseShard(shard) {
		for (const region of REGIONS) {
			if (shard.startsWith(region)) return { region, name: shard.slice(region.length) };
		}
		return null;
	},

	async changeServer(shard) {
		const parsed = this.parseShard(shard);
		if (!parsed) {
			game_log(`dragold: can't parse shard "${shard}"`, 'red');
			return false;
		}
		game_log(`🐉 Hopping to ${shard} for dragold`, '#FFD700');
		this.hopping = true;
		try {
			change_server(parsed.region, parsed.name);
			return true;
		} catch (e) {
			game_log(`dragold: server change failed — ${e}`, 'red');
			this.hopping = false;
			return false;
		}
	},

	async tick() {
		if (!CONFIG.dragold.enabled) return 'continue';
		if (this.hopping) return 'block';

		const cur = this.currentShard();

		switch (this.state) {
			case 'IDLE': {
				if (this.localDragoldLive()) {
					this.state = 'FIGHTING';
					this.targetShard = cur;
					game_log('🐉 Dragold live here — entering FIGHTING', '#FFD700');
					return 'continue';
				}

				const target = this.pickTargetShard();
				if (target) {
					this.state = 'HOPPING';
					this.targetShard = target;
				} else {
					return 'continue';
				}
			}

			case 'HOPPING': {
				if (cur === this.targetShard) {
					if (this.localDragoldLive()) {
						this.state = 'FIGHTING';
						game_log('🐉 Arrived — dragold is live, FIGHTING', '#FFD700');
						return 'continue';
					}
					game_log('🐉 Arrived but dragold not live here — back to IDLE', '#FFD700');
					this.state = 'IDLE';
					this.targetShard = null;
					return 'continue';
				}

				if (await this.lootBeforeHop()) return 'block';

				await this.changeServer(this.targetShard);
				return 'block';
			}

			case 'FIGHTING': {
				if (this.localDragoldLive()) {
					return 'continue';
				}
				game_log('🐉 Dragold dead — RETURNING home', '#FFD700');
				this.state = 'RETURNING';
				this.targetShard = null;
			}

			case 'RETURNING': {
				const liveShard = this.scanResults.find(
					r => r.shard !== cur && r.live
				)?.shard;

				if (liveShard) {
					this.state = 'HOPPING';
					this.targetShard = liveShard;
					game_log(`🐉 New live dragold on ${liveShard} — diverting`, '#FFD700');
					return 'block';
				}

				if (cur === homeServer) {
					this.state = 'IDLE';
					this.targetShard = null;
					return 'continue';
				}

				if (await this.lootBeforeHop()) return 'block';

				await this.changeServer(homeServer);
				return 'block';
			}

			default:
				this.state = 'IDLE';
				return 'continue';
		}
	}
};

function handleReturnHome() {
	if (distance(character, destination) < 20) return;

	if (!smart.moving) {
		smart_move(destination);
	}
}

async function walkInCircle() {
	if (smart.moving) return;
	const center = locations[home][0], r = CONFIG.movement.circleRadius, now = performance.now();
	const dt = Math.min((now - state.lastAngleUpdate) / 1000, 0.5);
	state.lastAngleUpdate = now;
	state.angle = (state.angle + (character.speed / r) * dt) % (2 * Math.PI);
	if (!character.moving) await xmove(center.x + Math.cos(state.angle) * r, center.y + Math.sin(state.angle) * r);
}

async function rangedKite() {
	const cfg = CONFIG.movement.rangedKiting;
	if (!cfg.enabled || smart.moving) return false;
	const target = get_nearest_monster_v2({ type: cfg.targets, max_distance: cfg.maxKiteRange });
	if (!target) return false;

	const cx = character.real_x, cy = character.real_y;
	const dist = Math.hypot(target.real_x - cx, target.real_y - cy);

	let reason = 0, need = 0; // need = how far we actually want to move, capped below
	if (dist < cfg.minDistance) { reason = 1; need = cfg.optimalDistance - dist; }
	else if (dist > cfg.maxDistance) { reason = 2; need = dist - cfg.optimalDistance; }
	else if (Math.abs(dist - cfg.optimalDistance) > cfg.repositionThreshold) { reason = 3; need = Math.abs(dist - cfg.optimalDistance); }
	if (!reason) return true;

	const now = performance.now();
	if (now - rangedKite.lastMove <= cfg.moveThrottle) return true;

	const mag = Math.min(cfg.moveDistance, need); // <- the actual fix: don't step further than needed
	const step = Math.PI / cfg.sampleAngles, n = cfg.sampleAngles * 2;
	let bestW = -Infinity, bestX = 0, bestY = 0, found = false;
	for (let i = 0, a = 0; i < n; i++, a += step) {
		const tx = cx + mag * Math.cos(a), ty = cy + mag * Math.sin(a);
		if (!can_move_to(tx, ty)) continue;
		const nd = Math.hypot(target.real_x - tx, target.real_y - ty);
		let w = reason === 1 ? nd - dist : reason === 2 ? dist - nd
			: Math.abs(dist - cfg.optimalDistance) - Math.abs(nd - cfg.optimalDistance);
		if (nd < cfg.minDistance || nd > cfg.maxDistance) w -= 1000;
		if (w > bestW) { bestW = w; bestX = tx; bestY = ty; found = true; }
	}
	if (!found) return true;

	await xmove(bestX, bestY);
	rangedKite.lastMove = now;
	if (cfg.debug) game_log(`Kiting: ${reason} (${Math.round(dist)} → ${Math.round(Math.hypot(target.real_x - bestX, target.real_y - bestY))})`, '#FFA500');
	return true;
}
rangedKite.lastMove = 0;

// ============================================================================
// TEMPORAL SURGE COORDINATION
// ============================================================================
function getTemporalRotation() {
	const stored = localStorage.getItem(CONFIG.equipment.temporal.storageKey);
	if (!stored) {
		const initial = {
			lastUser: null,
			nextIndex: 0,
			lastKillTime: 0
		};
		localStorage.setItem(CONFIG.equipment.temporal.storageKey, JSON.stringify(initial));
		return initial;
	}
	return JSON.parse(stored);
}

function updateTemporalRotation() {
	const rotation = getTemporalRotation();
	rotation.lastUser = character.name;
	rotation.nextIndex = (rotation.nextIndex + 1) % CONFIG.equipment.temporal.characters.length;
	rotation.lastKillTime = Date.now();
	localStorage.setItem(CONFIG.equipment.temporal.storageKey, JSON.stringify(rotation));
}

function isMyTurnForTemporal() {
	const rotation = getTemporalRotation();
	const myIndex = CONFIG.equipment.temporal.characters.indexOf(character.name);

	if (myIndex === -1) return false;

	return rotation.lastUser === null || rotation.nextIndex === myIndex;
}

async function handleTemporalSurge() {
	if (!CONFIG.equipment.temporal.enabled) return;
	if (!isMyTurnForTemporal()) return;

	const orbSlot = character.items.findIndex(i => i?.name === 'orboftemporal');
	if (orbSlot === -1) {
		game_log(`Missing ${CONFIG.equipment.temporal.orbName}!`, 'red');
		return;
	}

	try {
		equip(orbSlot, 'orb');
		use_skill(CONFIG.equipment.temporal.skillName);
		game_log(`⏰ Temporal Surge used on ${CONFIG.equipment.temporal.targetMob}!`, '#00FFFF');
		updateTemporalRotation();
		equip(orbSlot, 'orb');
	} catch (e) {
		game_log(`Temporal surge failed: ${e}`, 'red');
		console.error('Temporal surge error:', e);
	}
}

// ============================================================================
// LOOTING
// ============================================================================
const CHEST_STORAGE_KEY = 'loot_chest_ids';

function loadChestMap() {
	const data = get(CHEST_STORAGE_KEY);
	return typeof data === 'object' && data !== null ? data : {};
}

function saveChestMap(map) {
	set(CHEST_STORAGE_KEY, map);
}

function removeChestId(id) {
	const stored = loadChestMap();
	if (stored[id]) {
		delete stored[id];
		saveChestMap(stored);
	}
}

function updateChestsInStorage() {
	const stored = loadChestMap();
	const now = performance.now();
	for (const id of Object.keys(get_chests())) {
		if (!stored[id]) {
			stored[id] = now;
		}
	}
	saveChestMap(stored);
}

async function handleLooting() {
	if (!CONFIG.looting.enabled) return;

	try {
		const chestMap = loadChestMap();
		const now = performance.now();
		let looted = 0;

		for (const id of Object.keys(chestMap)) {
			const storedAt = chestMap[id];
			if (!storedAt) continue;
			if (now - storedAt < CONFIG.looting.delayMs) continue;
			await loot(id);
			removeChestId(id);
			looted++;
		}

		if (looted > 0) {
			console.log(`Looted ${looted} chest(s)`);
		}
	} catch (err) {
		console.error('Looting error:', err);
	}
}

function lootInterval() {
	updateChestsInStorage();
	handleLooting();
}
setInterval(lootInterval, 250);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const clearInventory = () => {
	const mule = get_player('CrownMerch');
	if (!mule) return;

	if (character.gold > 51000000) send_gold(mule, character.gold - 50000000);

	const exclude = new Set(['hpot1', 'mpot1', 'luckbooster', 'xpbooster', 'pumpkinspice', 'xptome']);

	character.items.forEach((item, i) => {
		if (item && !exclude.has(item.name) && !item.l && !item.s && is_in_range(mule, 'attack'))
			send_item(mule.id, i, item.q ?? 1);
	});
};

const inventorySorter = () => {
	const slots = { tracktrix: 0, ancientcomputer: 1, hpot1: 2, mpot1: 3, xptome: 4, pumpkinspice: 5, xpbooster: 6 };
	character.items.forEach((item, i) => {
		const target = slots[item?.name];
		if (target !== undefined && i !== target) swap(i, target);
	});
};

function autoBuyPotions() {
	if (quantity('hpot1') < CONFIG.potions.minStock) buy('hpot1', CONFIG.potions.minStock);
	if (quantity('mpot1') < CONFIG.potions.minStock) buy('mpot1', CONFIG.potions.minStock);
	if (quantity('xptome') < 1) buy('xptome', 1);
}

function elixirUsage() {
	const required = 'pumpkinspice';
	const currentElixir = character.slots.elixir?.name;

	if (currentElixir !== required) {
		const slot = locate_item(required);
		if (slot !== -1) use(slot);
	}
}

const targetStartTimes = new Map();

const scare = () => {
	const slot = character.items.findIndex(i => i?.name === 'jacko');
	const now = performance.now();
	let shouldScare = false;

	for (const id in parent.entities) {
		const e = parent.entities[id];
		if (e.type === 'monster' && e.target === character.name && e.mtype !== 'grinch') {
			let t = targetStartTimes.get(id);
			if (t === undefined) targetStartTimes.set(id, t = now);
			if (now - t > 250) shouldScare = true;
		} else if (targetStartTimes.has(id)) {
			targetStartTimes.delete(id);
		}
	}

	if (shouldScare && !is_on_cooldown('scare') && slot !== -1) {
		equip(slot);
		use_skill('scare');
		equip(slot);
	}

	const paused = parent?.paused;
	if (character?.afk && !paused) { pause(); parent.no_graphics = true; }
	else if (!character?.afk && paused) { pause(); parent.no_graphics = false; }
};

function partyMaker() {
	if (!CONFIG.party.autoManage) return;

	const group = CONFIG.party.groupMembers;
	const leaderName = group[0];
	const party = get_party() || {};
	const partyLead = get_entity(leaderName);

	if (character.name === leaderName) {
		for (let i = 1; i < group.length; i++) {
			const name = group[i];
			if (name === character.name) continue;
			if (party[name]) continue;

			send_party_invite(name);
		}
	} else {
		if (!party[character.name] && partyLead) {
			send_party_request(leaderName);
		}
	}
}

function suicide() {
	if (!character.rip && character.hp < 2000) {
		parent.socket.emit('harakiri');
		game_log('Harakiri');
	}

	if (character.rip && locate_item('xptome') !== -1) {
		respawn();
	}
}
setInterval(suicide, 50);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CHARACTER STARTER
// ============================================================================
function teamStarter() {
	if (!CONFIG.characterStarter.enabled) return;

	const activeCharacters = get_active_characters();

	for (const [key, char] of Object.entries(CONFIG.characterStarter.characters)) {
		if (!activeCharacters[char.name]) {
			start_character(char.name, char.codeSlot);
		}
	}
}
setInterval(teamStarter, 3000);

// ============================================================================
// LOCATION BROADCASTER
// ============================================================================
async function sendLocationUpdate() {
	if (!CONFIG.locationBroadcast.enabled) return;

	try {
		const needsUpdate = !character.s.mluck || character.s.mluck.f !== CONFIG.locationBroadcast.targetPlayer;
		const nullCount = character.items.filter(item => item === null).length;

		if (needsUpdate || nullCount <= CONFIG.locationBroadcast.lowInventorySlots) {
			send_cm(CONFIG.locationBroadcast.targetPlayer, {
				message: 'location',
				x: character.x,
				y: character.y,
				map: character.map
			});
		}
	} catch (error) {
		console.error('Failed to send location update:', error);
	}
}
setInterval(sendLocationUpdate, CONFIG.locationBroadcast.checkInterval);

// ============================================================================
// SELLING
// ============================================================================
const SELL_WHITELIST = new Set(CONFIG.selling.whitelist);
function sellItems() {
	if (!CONFIG.selling.enabled) return;
	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item && SELL_WHITELIST.has(item.name) && item.p === undefined && item.l !== 'l') sell(i);
	}
}

// ============================================================================
// UPGRADING
// ============================================================================
async function upgradeItems() {
	if (!CONFIG.upgrading.enabled) return;

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (!item || item.p || !CONFIG.upgrading.whitelist[item.name]) continue;

		const config = CONFIG.upgrading.whitelist[item.name];
		if (item.level >= config.targetLevel) continue;

		const grades = G.items[item.name].grades;
		let scrollname;

		if (item.level < grades[0]) scrollname = 'scroll0';
		else if (item.level < grades[1]) scrollname = 'scroll1';
		else scrollname = 'scroll2';

		const scrollSlot = locate_item(scrollname);
		if (scrollSlot === -1) {
			buy(scrollname);
			return;
		}

		let offeringSlot = null;
		if (item.level >= config.prim) {
			offeringSlot = locate_item('offering');
		} else if (item.level >= config.primling) {
			offeringSlot = locate_item('offeringp');
		}

		if (character.q.upgrade === undefined) {
			try {
				await upgrade(i, scrollSlot, offeringSlot);
			} catch (e) {
				console.error('Upgrade failed:', e);
			}
		}
		return;
	}
}

// ============================================================================
// COMBINING
// ============================================================================
async function combineItems() {
	if (!CONFIG.combining.enabled) return;

	const toCompound = new Map();

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (!item || !CONFIG.combining.whitelist[item.name]) continue;

		const config = CONFIG.combining.whitelist[item.name];
		if (item.level >= config.targetLevel) continue;

		const key = item.name + item.level;
		const grade = item_grade(item);

		if (!toCompound.has(key)) {
			toCompound.set(key, [item.level, grade, i]);
		} else {
			toCompound.get(key).push(i);
		}
	}

	for (const group of toCompound.values()) {
		const itemLevel = group[0];
		const grade = group[1];
		const scrollName = 'cscroll' + grade;

		for (let i = 2; i + 2 < group.length; i += 3) {
			const scrollSlot = locate_item(scrollName);
			if (scrollSlot === -1) {
				buy(scrollName);
				return;
			}

			const item = character.items[group[i]];
			const config = CONFIG.combining.whitelist[item.name];

			let offeringSlot = null;
			if (itemLevel >= config.prim) {
				offeringSlot = locate_item('offering');
			} else if (itemLevel >= config.primling) {
				offeringSlot = locate_item('offeringp');
			}

			if (character.q.compound === undefined) {
				try {
					await compound(group[i], group[i + 1], group[i + 2], scrollSlot, offeringSlot);
				} catch (e) {
					console.error('Compound failed:', e);
				}
			}
			return;
		}
	}
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================
function pingButton() {
	add_top_button('Ping', character.ping.toFixed(0));
}
setInterval(pingButton, 1000);

function topButtons() {
	if (parent.S.lunarnewyear) {
		add_top_button('ShowDragold', '🐉', () => {
			const info = {
				state: dragold.state,
				targetShard: dragold.targetShard,
				currentShard: dragold.currentShard(),
				localDragoldLive: dragold.localDragoldLive(),
				scanResults: dragold.scanResults
					.slice()
					.sort((a, b) => a.spawnTime - b.spawnTime)
					.map(r => ({
						shard: r.shard,
						live: r.live,
						spawnTime: new Date(r.spawnTime).toLocaleString()
					}))
			};
			show_json(info);
		});
	}

	add_top_button('Return', 'R&M', () => {
		send_cm(['CrownPriest', 'CrownMage', 'CrownTown'], {
			message: 'location',
			x: character.x,
			y: character.y,
			map: character.map
		});
	});

	add_top_button('showLoot', '💼', displayLoot);

	add_top_button('Pause2', '⏸️', () => {
		pause();
		CONFIG.characterStarter.enabled = true
	});

	add_top_button('Stop', '🔄', () => {
		stop_character('CrownMerch');
		CONFIG.characterStarter.enabled = false
	});
}
topButtons();
function displayLoot() {
	const savedLoot = JSON.parse(localStorage.getItem('lootItems' + new Date().toLocaleString('en', { month: 'long' })) || "{}");
	const sortedLoot = Object.fromEntries(Object.keys(savedLoot).sort().map(k => [k, savedLoot[k]]));
	console.log("Saved Loot (Sorted):", sortedLoot);
	show_json(sortedLoot);
}

// ============================================================================
// ESSENTIAL HELPER FUNCTIONS
// ============================================================================
function get_nearest_monster_v2(args = {}) {
	let min_d = 999999;
	let target = null;
	let optimal_hp = args.check_max_hp ? 0 : 999999999;

	for (let id in parent.entities) {
		let current = parent.entities[id];
		if (current.type !== 'monster' || !current.visible || current.dead) continue;

		if (args.type) {
			if (Array.isArray(args.type)) {
				if (!args.type.includes(current.mtype)) continue;
			} else {
				if (current.mtype !== args.type) continue;
			}
		}

		if (args.min_level !== undefined && current.level < args.min_level) continue;
		if (args.max_level !== undefined && current.level > args.max_level) continue;
		if (args.target && !args.target.includes(current.target)) continue;
		if (args.no_target && current.target && current.target !== character.name) continue;

		if (args.statusEffects && !args.statusEffects.every(effect => current.s[effect])) continue;

		if (args.min_xp !== undefined && current.xp < args.min_xp) continue;
		if (args.max_xp !== undefined && current.xp > args.max_xp) continue;

		if (args.max_att !== undefined && current.attack > args.max_att) continue;

		if (args.path_check && !can_move_to(current)) continue;

		let c_dist = args.point_for_distance_check
			? Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y)
			: parent.distance(character, current);

		if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

		if (args.check_min_hp || args.check_max_hp) {
			let c_hp = current.hp;
			if ((args.check_min_hp && c_hp < optimal_hp) || (args.check_max_hp && c_hp > optimal_hp)) {
				optimal_hp = c_hp;
				target = current;
			}
			continue;
		}

		if (c_dist < min_d) {
			min_d = c_dist;
			target = current;
		}
	}

	return target;
}

function ms_to_next_skill(skill) {
	const next_skill = parent.next_skill[skill];
	if (next_skill === undefined) return 0;
	const ping = parent.pings?.length ? Math.min(...parent.pings) : 0;
	const ms = next_skill.getTime() - Date.now() - ping;
	return ms < 0 ? 0 : ms;
}

const equipBatch = async data => {
	if (!Array.isArray(data) || data.length > 15) return;

	const valid = data.reduce((acc, { itemName, slot, level, l }) => {
		if (!itemName) return acc;

		const current = character.slots[slot];
		if (current?.name === itemName && current.level === level && current.l === l) return acc;

		const i = character.items.findIndex(item =>
			item?.name === itemName && item.level === level && item.l === l
		);
		if (i !== -1) acc.push({ num: i, slot });
		return acc;
	}, []);

	if (!valid.length) return;

	try {
		parent.socket.emit('equip_batch', valid);
		await parent.push_deferred('equip_batch');
	} catch (e) {
		console.error('equipBatch:', e);
	}
};

function isSetEquipped(setName) {
	const set = equipmentSets[setName];
	if (!set) return false;

	return set.every(item =>
		character.slots[item.slot]?.name === item.itemName &&
		character.slots[item.slot]?.level === item.level
	);
}

const equipSet = name => equipmentSets[name] && equipBatch(equipmentSets[name]);

// ============================================================================
// SKIN CHANGER
// ============================================================================
const skinConfigs = {
	ranger: {
		skin: 'tm_yellow',
		skinRing: { name: 'tristone', level: 2, locked: 'l' },
		normalRing: { name: 'suckerpunch', level: 3, locked: 'l' }
	},
};

function skinNeeded(ringName, ringLevel, slot = 'ring1', locked = 'l', ccThreshold = 135) {
	if (character.cc <= ccThreshold) {
		if (character.slots[slot]?.name !== ringName || character.slots[slot]?.level !== ringLevel) {
			equipIfNeeded(ringName, slot, ringLevel, locked);
		}
		parent.socket.emit('activate', { slot });
	}
}

async function equipIfNeeded(itemName, slotName, level, l) {
	let name = null;

	if (typeof itemName === 'object') {
		name = itemName.name;
		level = itemName.level;
		l = itemName.l;
	} else {
		name = itemName;
	}

	if (character.slots[slotName] != null) {
		let slotItem = character.slots[slotName];
		if (slotItem.name === name && slotItem.level === level && slotItem.l === l) {
			return;
		}
	}

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item != null && item.name === name && item.level === level && item.l === l) {
			return equip(i, slotName);
		}
	}
}

async function skinChanger() {
	const config = skinConfigs[character.ctype];
	if (!config) {
		console.warn(`No skin config for type: ${character.ctype}`);
		state.skinReady = true;
		return;
	}

	if (character.skin !== config.skin) {
		console.log(`Applying skinRing: ${config.skinRing.name} lvl ${config.skinRing.level}`);
		skinNeeded(config.skinRing.name, config.skinRing.level, 'ring1', config.skinRing.locked);
		await sleep(500);
		return skinChanger();
	}

	const slot = character.slots.ring1;
	if (slot?.name !== config.normalRing.name || slot?.level !== config.normalRing.level) {
		console.log(`Equipping normalRing: ${config.normalRing.name} lvl ${config.normalRing.level}`);
		equipIfNeeded(config.normalRing.name, 'ring1', config.normalRing.level, config.normalRing.locked);
		await sleep(500);
		return skinChanger();
	}

	state.skinReady = true;
	console.log(`Skin ready! ${character.ctype} has skin ${character.skin} and ring ${slot.name}`);
}

skinChanger();

// ============================================================================
// EVENT HANDLERS
// ============================================================================
function on_party_request(name) {
	if (CONFIG.party.groupMembers.includes(name)) {
		console.log('Accepting party request from ' + name);
		accept_party_request(name);
	}
}

function on_party_invite(name) {
	if (CONFIG.party.groupMembers.includes(name)) {
		console.log('Accepting party invite from ' + name);
		accept_party_invite(name);
	}
}

function sendUpdates() {
	parent.socket.emit('send_updates', {});
}
setInterval(sendUpdates, 20000);

// ============================================================================
// START ALL LOOPS
// ============================================================================
mainLoop();
actionLoop();
skillLoop();
equipmentLoop();
dragold.startScanning();
maintenanceLoop();
potionLoop();
