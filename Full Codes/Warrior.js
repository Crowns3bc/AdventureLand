// autorerun
// ============================================================================
// CONFIGURATION - Toggle features here instead of editing code
// ============================================================================
const home = 'bigbird';
const mobMap = 'main';
const allBosses = ['bgoo', 'crabxx', 'dragold', 'franky', 'greenjr', 'grinch', 'icegolem', 'jr', 'mrgreen', 'mrpumpkin', 'phoenix', 'rgoo', 'wabbit'];

const CONFIG = {
	combat: {
		enabled: true,
		targetPriority: ['CrownPriest', 'CrownTown'],
		allBosses,
		cleaveMinMobs: 1,
		agitateMinMobs: 3,
		tauntEnts: false,
		scare: false
	},

	movement: {
		enabled: true,
		circleWalk: false,
		circleSpeed: 1.8,
		circleRadius: 35,
		moveThreshold: 10,
		followKited: {
			enabled: false,
			targets: ['bscorpion', 'phoenix', 'mvampire'],
			approachDistance: 0.5,  // Move halfway (0.5) or closer (1)
			maxFollowRange: 400,  // Don't chase beyond this distance
			updateInterval: 50,  // How often to recalculate position (ms)
			stopWhenInRange: true  // Stop moving when in attack range
		},
		clusterWalk: true,
		cluster: {
			wanderRadius: 200,
			clusterRadius: 95,
		}
	},

	equipment: {
		autoSwapSets: true,
		bossLuckSwitch: true,
		bossHpThresholds: {
			mrpumpkin: 200000,
			mrgreen: 200000,
			grinch: 100000,
			crabxx: 40000,
			dragold: 200000,
		},
		singleTargetMaps: ['halloween', 'spookyforest', 'desertland', 'cave'],
		aoeMaps: ['main', 'goobrawl', 'level2n', 'level2w', 'mforest', 'tunnel', 'uhills', 'winterland'],
		cleaveMaps: ['cave', 'desertland', 'goobrawl', 'halloween', 'level2n', 'level2w', 'main', 'mforest', 'spookytown', 'uhills', 'winterland', 'level2e'],
		mpThresholds: { upper: 2250, lower: 1850 },
		chestThreshold: 12,
		swapCooldown: 500,
		boosterSwapEnabled: true,
		capeSwapEnabled: false,
		coatSwapEnabled: true,
		bossSetSwapEnabled: true,
		weaponSwapEnabled: true,
		temporal: {
			enabled: true,
			targetMob: 'bscorpion',
			orbName: 'orboftemporal',
			skillName: 'temporalsurge',
			characters: ['CrownPriest', 'CrownsAnal', 'CrownTown'], // Rotation order
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
		groupMembers: ['CrownsAnal', 'CrownTown', 'CrownPriest']
	},

	skills: {
		stompEnabled: true,
		cleaveEnabled: true,
		agitateEnabled: true,
		tauntEnabled: true,
		chargeEnabled: true,
		hardshellEnabled: true,
		hardshellHpThreshold: 12000,
		warcryEnabled: true
	}
};

// ============================================================================
// CONSTANTS
// ============================================================================
const TICK_RATE = {
	main: 50,
	action: 1,
	skill: 40,
	equipment: 50,
	maintenance: 2000
};

const COOLDOWNS = {
	weaponSwap: 1000,
	cc: 135
};

const EVENT_LOCATIONS = [
	{ name: 'dragold', map: 'cave', x: 1150, y: -850 },
	//{ name: 'crabxx', map: 'main', x: -961, y: 1780, join: true },
	{ name: 'mrgreen', map: 'spookytown', x: 610, y: 1000 },
	{ name: 'mrpumpkin', map: 'halloween', x: -222, y: 720 }
];

const getDynamicEvents = () => {
	const events = [...EVENT_LOCATIONS];
	const w = parent.S?.wabbit;
	if (w?.live) events.push({ name: 'wabbit', map: w.map, x: w.x, y: w.y });
	return events;
};

const CACHE_TTL = 50;

// ============================================================================
// STATE & CACHE
// ============================================================================
const state = {
	skinReady: false,
	lastBasherSwap: 0,
	lastCleaveSwap: 0,
	lastCapeSwap: 0,
	lastCoatSwap: 0,
	lastBossSetSwap: 0,
	lastBoosterSwap: 0,
	angle: 0,
	lastAngleUpdate: performance.now()
};

const cache = {
	target: null,
	partyMembers: [],
	tankEntity: null,
	monstersInCleaveRange: [],
	lastUpdate: 0,

	isValid() {
		return performance.now() - this.lastUpdate < CACHE_TTL;
	},

	invalidate() {
		this.lastUpdate = 0;
	}
};

// ============================================================================
// LOCATION & EQUIPMENT DATA
// ============================================================================
const locations = {
	bat: [{ x: 1200, y: -782 }],
	bigbird: [{ x: 1258, y: -79 }],
	bscorpion: [{ x: -408, y: -1241 }],
	boar: [{ x: 19, y: -1109 }],
	cgoo: [{ x: -221, y: -274 }],
	crab: [{ x: -11840, y: -37 }],
	dryad: [{ x: 403, y: -347 }],
	ent: [{ x: -420, y: -1960 }],
	fireroamer: [{ x: 222, y: -827 }],
	ghost: [{ x: -405, y: -1642 }],
	gscorpion: [{ x: 390, y: -1422 }],
	iceroamer: [{ x: 823, y: -45 }],
	mechagnome: [{ x: 0, y: 0 }],
	mole: [{ x: 14, y: -1072 }],
	mummy: [{ x: 256, y: -1417 }],
	odino: [{ x: -42, y: 746 }],
	oneeye: [{ x: -270, y: 160 }],
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

const destination = {
	map: mobMap,
	x: locations[home][0].x,
	y: locations[home][0].y
};

const equipmentSets = {
	single: [
		{ itemName: "candycanesword", slot: "mainhand", level: 13, l: "s" },
		{ itemName: "fireblade", slot: "offhand", level: 13, l: "s" },
	],
	aoe: [
		{ itemName: "vhammer", slot: "mainhand", level: 9, l: "s" },
		{ itemName: "glolipop", slot: "offhand", level: 12, l: "l" },
	],
	basher: [
		{ itemName: "basher", slot: "mainhand", level: 8, l: "l" }
	],
	scythe: [
		{ itemName: "bataxe", slot: "mainhand", level: 10, l: "l" }
	],
	dps: [
		{ itemName: "cearring", slot: "earring1", level: 5, l: "l" },
		{ itemName: "cearring", slot: "earring2", level: 5, l: "u" },
		//{ itemName: "coat", slot: "chest", level: 13, l: "l" },
		{ itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
		{ itemName: "suckerpunch", slot: "ring1", level: 2, l: "l" },
		{ itemName: "suckerpunch", slot: "ring2", level: 2, l: "u" },
		//{ itemName: "fireblade", slot: "mainhand", level: 13, l: "s" },
		//{ itemName: "candycanesword", slot: "offhand", level: 13, l: "s" },
	],
	luck: [
		{ itemName: "mearring", slot: "earring1", level: 0, l: "l" },
		{ itemName: "mearring", slot: "earring2", level: 0, l: "u" },
		{ itemName: "rabbitsfoot", slot: "orb", level: 2, l: "l" },
		{ itemName: "ringofluck", slot: "ring2", level: 0, l: "u" },
		{ itemName: "ringofluck", slot: "ring1", level: 0, l: "l" },
		{ itemName: "mshield", slot: "offhand", level: 9, l: "l" },
		{ itemName: "tshirt88", slot: "chest", level: 0, l: "l" }
	],
	stealth: [{ itemName: "stealthcape", slot: "cape", level: 0, l: "l" }],
	cape: [{ itemName: "vcape", slot: "cape", level: 6, l: "l" }],
	mana: [{ itemName: "tshirt9", slot: "chest", level: 6, l: "l" }],
	stat: [{ itemName: "coat", slot: "chest", level: 13, l: "l" }],

	dpsAccessories: [
		{ itemName: "cearring", slot: "earring1", level: 5, l: "l" },
		{ itemName: "cearring", slot: "earring2", level: 5, l: "u" },
		{ itemName: "orbofstr", slot: "orb", level: 5, l: "l" },
		{ itemName: "suckerpunch", slot: "ring1", level: 2, l: "l" },
		{ itemName: "suckerpunch", slot: "ring2", level: 2, l: "u" },
	],
};

// ============================================================================
// CORE UTILITIES
// ============================================================================
function updateCache() {
	if (cache.isValid()) return;

	const now = performance.now();
	cache.target = null;
	cache.tankEntity = get_entity('CrownPriest');
	cache.mobCount = 0;
	cache.hasLowBoss = false;
	cache.monstersInCleaveRange = [];
	cache.clusterTarget = null;

	const tankName = cache.tankEntity?.name;
	const cleaveRange = G.skills.cleave.range;
	const doCluster = CONFIG.movement.clusterWalk;
	const { x: homeX, y: homeY } = locations[home][0];
	const wanderR2 = CONFIG.movement.cluster.wanderRadius ** 2;
	const clusterR2 = CONFIG.movement.cluster.clusterRadius ** 2;

	const nearMobs = [];

	for (const id in parent.entities) {
		const e = parent.entities[id];
		if (e.type !== 'monster' || e.dead) continue;

		if (tankName && e.target === tankName) cache.mobCount++;

		if (!cache.hasLowBoss && CONFIG.combat.allBosses.includes(e.mtype) &&
			e.hp < (CONFIG.equipment.bossHpThresholds[e.mtype] || Infinity))
			cache.hasLowBoss = true;

		if (!e.visible) continue;

		if (distance(character, e) <= cleaveRange)
			cache.monstersInCleaveRange.push(e);

		if (!cache.target) {
			const dist = distance(character, e);
			if (dist <= character.range) {
				if (CONFIG.combat.allBosses.includes(e.mtype) || CONFIG.combat.targetPriority.includes(e.target))
					cache.target = e;
			}
		}

		if (doCluster) {
			const dx = e.x - homeX, dy = e.y - homeY;
			if (dx * dx + dy * dy <= wanderR2) nearMobs.push(e);
		}
	}

	if (doCluster && nearMobs.length >= 2) {
		let bestX = 0, bestY = 0, bestCount = 0;
		for (const mob of nearMobs) {
			let count = 0;
			for (const other of nearMobs) {
				const dx = mob.x - other.x, dy = mob.y - other.y;
				if (dx * dx + dy * dy <= clusterR2) count++;
			}
			if (count > bestCount) { bestCount = count; bestX = mob.x; bestY = mob.y; }
		}
		if (bestCount >= 2) cache.clusterTarget = { x: bestX, y: bestY, count: bestCount };
	}

	cache.partyMembers = Object.keys(get_party() || {});
	cache.lastUpdate = now;
}

// ============================================================================
// MAIN TICK LOOP
// ============================================================================
async function mainLoop() {
	try {
		if (is_disabled(character)) {
			return setTimeout(mainLoop, 500);
		}

		updateCache();

		if (shouldHandleEvents()) {
			handleEvents();
		}
		else if (CONFIG.movement.enabled) {
			if (!get_nearest_monster({ type: home })) {
				handleReturnHome();
			} else if (CONFIG.movement.followKited.enabled) {
				await follower.followKited();
			} else if (CONFIG.movement.clusterWalk) {
				await walkToDenseCluster();
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
// ACTION LOOP - Attack only
// ============================================================================
async function actionLoop() {
	let delay = 10;

	try {
		if (is_disabled(character)) {
			return setTimeout(actionLoop, 25);
		}

		updateCache();

		const target = cache.target;
		const msUntilAttack = ms_to_next_skill('attack');

		if (target && msUntilAttack < 5 && is_in_range(target)) {
			await use_skill("attack", target);
		} else {
			if (msUntilAttack > 200) delay = 100;
			else if (msUntilAttack > 60) delay = 20;
			else delay = 5;
		}

	} catch (e) {
		//console.error('actionLoop error:', e);
		delay = 5;
	}

	setTimeout(actionLoop, delay);
}

// ============================================================================
// SKILL LOOP - All warrior skills
// ============================================================================
async function skillLoop() {
	const delay = TICK_RATE.skill;

	try {
		if (is_disabled(character)) {
			return setTimeout(skillLoop, 250);
		}

		updateCache();

		const tank = cache.tankEntity;

		if (CONFIG.skills.warcryEnabled && !is_on_cooldown('warcry') && !character.s.warcry && character.s.darkblessing) {
			await use_skill('warcry');
		}

		if (CONFIG.skills.stompEnabled && tank?.hp < tank?.max_hp * 0.3) {
			await handleStomp();
		}

		if (CONFIG.skills.cleaveEnabled) {
			await handleCleave();
		}

		if (CONFIG.skills.agitateEnabled && tank) {
			await handleAgitate(tank);
		}

		if (CONFIG.skills.tauntEnabled) {
			await handleTaunt();
		}

		if (CONFIG.skills.chargeEnabled && !is_on_cooldown('charge')) {
			await use_skill('charge');
		}

		if (CONFIG.skills.hardshellEnabled && !is_on_cooldown('hardshell') && character.hp < CONFIG.skills.hardshellHpThreshold) {
			await use_skill('hardshell');
		}

	} catch (e) {
		console.error('skillLoop error:', e);
	}

	setTimeout(skillLoop, delay);
}

async function handleStomp() {
	if (is_on_cooldown('stomp')) return;
	if (ms_to_next_skill('attack') <= 75) return;

	const mainhand = character.slots?.mainhand?.name;
	const needsSwap = mainhand !== 'basher';
	const now = performance.now();

	if (needsSwap && now - state.lastBasherSwap > COOLDOWNS.weaponSwap) {
		state.lastBasherSwap = now;
		unequip('offhand');
		equipBatch(equipmentSets.basher);
	}

	await use_skill('stomp');

	if (needsSwap) {
		const targetSet = CONFIG.equipment.singleTargetMaps.includes(character.map) ? 'single' : 'aoe';
		state.lastBossSetSwap = now;
		equipBatch(equipmentSets[targetSet]);
	}
}

async function handleCleave() {
	const msUntilCleave = ms_to_next_skill('cleave');
	if (msUntilCleave !== 0) return;
	if (!canCleave()) return;
	if (cache.hasLowBoss) return false;

	const mainhand = character.slots?.mainhand?.name;
	const needsSwap = mainhand !== 'bataxe';
	const now = performance.now();

	if (needsSwap && now - state.lastCleaveSwap > COOLDOWNS.weaponSwap) {
		state.lastCleaveSwap = now;
		unequip('offhand');
		equipBatch(equipmentSets.scythe);
	}

	await use_skill('cleave');

	const targetSet = CONFIG.equipment.singleTargetMaps.includes(character.map) ? 'single' : 'aoe';
	state.lastBossSetSwap = now;
	equipBatch(equipmentSets[targetSet]);
}

function canCleave() {
	if (!CONFIG.equipment.cleaveMaps.includes(character.map)) return false;
	if (smart.moving || is_disabled(character)) return false;
	if (character.cc >= COOLDOWNS.cc) return false;
	if (ms_to_next_skill('attack') <= 75) return false;

	const requiredMP = character.mp_cost * 2 + G.skills.cleave.mp + 800;
	if (character.mp < requiredMP) return false;

	const tank = cache.tankEntity;
	if (!tank) return false;

	const lowBoss = Object.values(parent.entities).find(e =>
		e?.type === 'monster' &&
		CONFIG.combat.allBosses.includes(e.mtype) &&
		!e.dead &&
		e.hp < CONFIG.equipment.bossHpThresholds[e.mtype]
	);
	if (lowBoss) return false;

	return cache.monstersInCleaveRange.length >= CONFIG.combat.cleaveMinMobs;
}

async function handleAgitate(tank) {
	if (is_on_cooldown('agitate') || !tank?.rip === false) return;

	const range = G.skills.agitate.range;
	let crabCount = 0, crabTargeted = 0;
	let otherCount = 0, otherTargeted = 0;

	for (const id in parent.entities) {
		const e = parent.entities[id];
		if (e.type !== 'monster' || !e.visible || e.dead) continue;
		if (distance(character, e) > range) continue;

		if (e.mtype === 'crabx') {
			crabCount++;
			if (e.target) crabTargeted++;
		} else if (['sparkbot', 'jr', 'greenjr', 'spider', 'scorpion', 'bigbird', home].includes(e.mtype)) {
			if (e.target !== character.name && e.target !== tank?.name) {
				otherCount++;
			}
		}
	}

	if (crabCount >= 3 && crabTargeted === 0) {
		await use_skill('agitate');
		game_log("Agitating " + crabCount + " crabs", "#EF8642");
		return;
	}

	if (otherCount >= CONFIG.combat.agitateMinMobs &&
		!smart.moving &&
		distance(character, tank) <= 100) {
		await use_skill('agitate');
		game_log("Agitating " + otherCount + " mobs", "#EF8642");
	}
}

async function handleTaunt() {
	if (is_on_cooldown('taunt')) return;
	if (!CONFIG.combat.tauntEnts) return;

	const skillRange = G.skills.taunt.range;
	const ents = Object.values(parent.entities).filter(e =>
		e.type === 'monster' &&
		e.mtype === 'ent' &&
		e.target !== character.name &&
		e.visible &&
		!e.dead &&
		distance(character, e) <= skillRange
	);

	for (const ent of ents) {
		if (is_in_range(ent, 'taunt')) {
			await use_skill('taunt', ent.id);
			game_log(`Taunting ${ent.name}`, '#FFA600');
			break;
		}
	}
}

// ============================================================================
// MAINTENANCE LOOP
// ============================================================================
async function maintenanceLoop() {
	try {
		if (CONFIG.potions.autoBuy) {
			autoBuyPotions();
		}

		if (CONFIG.party.autoManage) {
			partyMaker();
		}

		clearInventory();
		inventorySorter();
		elixirUsage();

		if (character.rip && locate_item('xptome') !== -1) {
			respawn();
		}

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
// EQUIPMENT MANAGEMENT LOOP - Independent from combat
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
		if (mainhand === 'basher' || mainhand === 'bataxe') {
			//return setTimeout(equipmentLoop, delay);
		}

		// --- FIND ACTIVE BOSS ---
		const activeBoss = getDynamicEvents()
			.map(e => ({ name: e.name, data: parent.S[e.name] }))
			.find(e => e.data?.live);

		// --- BOOSTER SWAP ---
		if (CONFIG.equipment.boosterSwapEnabled && now - state.lastBoosterSwap > swapCooldown) {
			let desiredBooster = 'xpbooster';

			if (activeBoss && activeBoss.data.hp < CONFIG.equipment.bossHpThresholds[activeBoss.name]) {
				desiredBooster = 'luckbooster';
			}

			const currentBoosterSlot = locate_item(desiredBooster);
			if (currentBoosterSlot === -1) {
				const otherBoosterSlot = findBoosterSlot();
				if (otherBoosterSlot !== null) {
					shift(otherBoosterSlot, desiredBooster);
					state.lastBoosterSwap = now;
				}
			}
		}

		// --- CAPE SWAP ---
		if (CONFIG.equipment.capeSwapEnabled && now - state.lastCapeSwap > swapCooldown) {
			let targetCapeSet = null;
			const chestCount = getNumChests();
			const numTargets = cache.tankEntity ? getNumTargets(cache.tankEntity.name) : 0;

			if (chestCount >= CONFIG.equipment.chestThreshold && numTargets < 6) {
				targetCapeSet = 'stealth';
			} else {
				targetCapeSet = 'cape';
			}

			if (targetCapeSet && !isSetEquipped(targetCapeSet)) {
				equipSet(targetCapeSet);
				state.lastCapeSwap = now;
			}
		}

		// --- COAT SWAP (only when not at boss or boss HP high) ---
		if (CONFIG.equipment.coatSwapEnabled && (!activeBoss || activeBoss.data.hp > CONFIG.equipment.bossHpThresholds[activeBoss.name]) && now - state.lastCoatSwap > swapCooldown) {
			let targetCoatSet = null;

			if (character.mp > CONFIG.equipment.mpThresholds.upper) {
				targetCoatSet = 'stat';
			} else if (character.mp < CONFIG.equipment.mpThresholds.lower) {
				targetCoatSet = 'mana';
			}

			if (targetCoatSet && !isSetEquipped(targetCoatSet)) {
				equipSet(targetCoatSet);
				state.lastCoatSwap = now;
			}
		}

		// --- BOSS/WEAPON SET LOGIC ---
		if (now - state.lastBossSetSwap > swapCooldown) {
			let targetSet = null;

			if (CONFIG.equipment.bossSetSwapEnabled && activeBoss) {
				const bossHp = activeBoss.data.hp;
				if (bossHp > CONFIG.equipment.bossHpThresholds[activeBoss.name]) {
					if (character.map !== mobMap) {
						targetSet = 'dps';
					}
				} else {
					targetSet = 'luck';
				}
			}
			else if (character.map === mobMap) {
				targetSet = 'dpsAccessories';

				if (CONFIG.equipment.weaponSwapEnabled) {
					const homeCount = cache.mobCount;
					if (homeCount === 1) {
						if (!isSetEquipped('single')) {
							equipSet('single');
							state.lastBossSetSwap = now;
						}
					} else if (homeCount > 1) {
						if (!isSetEquipped('aoe')) {
							equipSet('aoe');
							state.lastBossSetSwap = now;
						}
					} else {
						if (CONFIG.equipment.aoeMaps.includes(character.map) && !isSetEquipped('aoe')) {
							equipSet('aoe');
							state.lastBossSetSwap = now;
						} else if (CONFIG.equipment.singleTargetMaps.includes(character.map) && !isSetEquipped('single')) {
							equipSet('single');
							state.lastBossSetSwap = now;
						}
					}
				}
			}

			if (targetSet && !isSetEquipped(targetSet)) {
				equipSet(targetSet);
				state.lastBossSetSwap = now;
			}
		}
		if (CONFIG.combat.scare) {
			scare();
		}
	} catch (e) {
		console.error('equipmentLoop error:', e);
	}

	setTimeout(equipmentLoop, delay);
}

function findBoosterSlot() {
	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item && ['xpbooster', 'goldbooster', 'luckbooster'].includes(item.name)) {
			return i;
		}
	}
	return null;
}

function getNumChests() {
	return Object.keys(get_chests()).length;
}

function getNumTargets(playerName) {
	if (!playerName) return 0;
	let targetCount = 0;

	for (const id in parent.entities) {
		const entity = parent.entities[id];
		if (entity.type === 'monster' && entity.target === playerName) {
			targetCount++;
		}
	}

	return targetCount;
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

	const aliveSorted = getDynamicEvents()
		.map(e => ({ ...e, data: parent.S[e.name] }))
		.filter(e => e.data?.live)
		.sort((a, b) =>
			(a.data.hp / a.data.max_hp) - (b.data.hp / b.data.max_hp)
		);

	if (!aliveSorted.length) return;

	const target = aliveSorted[0];

	if (target.join === true && character.map !== target.map) {
		parent.socket.emit('join', { name: target.name });
		return;
	}

	if (!smart.moving) {
		handleSpecificEvent(target.name, target.map, target.x, target.y);
	}
}

const MOVING_BOSSES = new Set(allBosses);

async function handleSpecificEvent(eventType, mapName, x, y) {
	if (!parent?.S?.[eventType]?.live) return;

	const monster = get_nearest_monster({ type: eventType });
	if (!monster) {
		smart_move({ x, y, map: mapName });
		return;
	}

	if (MOVING_BOSSES.has(eventType)) {
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

function handleReturnHome() {
	if (distance(character, destination) < 20) return;

	if (!smart.moving) {
		smart_move(destination);
	}
}

const walkInCircle = async () => {
	if (smart.moving || character.moving) return;

	const { x: centerX, y: centerY } = locations[home][0];
	const now = performance.now();
	const delta = (now - state.lastAngleUpdate) / 1000;

	state.angle = (state.angle - CONFIG.movement.circleSpeed * delta) % (2 * Math.PI);
	state.lastAngleUpdate = now;

	const targetX = centerX + Math.cos(state.angle) * CONFIG.movement.circleRadius;
	const targetY = centerY + Math.sin(state.angle) * CONFIG.movement.circleRadius;

	const distToTarget = Math.hypot(character.x - targetX, character.y - targetY);
	if (distToTarget > CONFIG.movement.moveThreshold) {
		await xmove(targetX, targetY);
	}
};

const follower = {
	async followKited() {
		if (!CONFIG.movement.followKited.enabled) return false;
		if (smart.moving) return false;

		const target = get_nearest_monster_v2({
			type: CONFIG.movement.followKited.targets,
			max_distance: CONFIG.movement.followKited.maxFollowRange
		});

		if (!target) return false;

		if (CONFIG.movement.followKited.stopWhenInRange && is_in_range(target, 40)) return true;

		const dx = target.real_x - character.real_x;
		const dy = target.real_y - character.real_y;
		const approachX = character.real_x + dx * CONFIG.movement.followKited.approachDistance;
		const approachY = character.real_y + dy * CONFIG.movement.followKited.approachDistance;

		if (!smart.moving) {
			await xmove(approachX, approachY);
		}

		return true;
	}
};

const walkToDenseCluster = async () => {
	if (smart.moving || character.moving) return;

	const cluster = cache.clusterTarget;
	if (!cluster) return handleReturnHome();

	if (Math.hypot(character.x - cluster.x, character.y - cluster.y) > CONFIG.movement.moveThreshold)
		if (can_move_to(cluster.x, cluster.y)) {
			await move(cluster.x, cluster.y);
		}
};

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

	const orbSlot = character.items.findIndex(i => i?.name === 'orboftemporal');;
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

parent.socket.on('kill_credit', async (data) => {
	if (!CONFIG.equipment.temporal.enabled) return;
	if (data.mtype !== CONFIG.equipment.temporal.targetMob) return;

	if (!is_on_cooldown("temporalsurge")) {
		await handleTemporalSurge();
	}
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function clearInventory() {
	const lootMule = get_player('CrownsAnal') || get_player('CrownMerch');
	if (!lootMule) return;

	if (character.gold > 5000000) {
		send_gold(lootMule, character.gold - 5000000);
	}

	const itemsToExclude = ['hpot1', 'mpot1', 'luckbooster', 'xpbooster', 'pumpkinspice', 'xptome'];

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
			if (is_in_range(lootMule, "zapperzap")) {
				send_item(lootMule.id, i, item.q ?? 1);
			}
		}
	}
}

const moveStuff = {
	tracker: 0,
	computer: 1,
	hpot1: 2,
	mpot1: 3,
	xptome: 4,
	pumpkinspice: 5,
	luckbooster: 6,
	vhammer: 24,
	glolipop: 25,
	fireblade: 35,
	candycanesword: 36,
	vattire: 37,
	mshield: 38,
	bataxe: 39,
	basher: 40,
	rapier: 41,
};

function inventorySorter() {
	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (!item || !(item.name in moveStuff)) continue;

		const targetSlot = moveStuff[item.name];
		if (i !== targetSlot) {
			swap(i, targetSlot);
		}
	}
}

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

let targetStartTimes = {};

function scare() {
	const slot = character.items.findIndex(i => i && i.name === 'jacko');
	const currentTime = performance.now();
	let shouldScare = false;

	for (const id in parent.entities) {
		const current = parent.entities[id];

		if (current.type === 'monster' && current.target === character.name && current.mtype !== 'grinch') {
			targetStartTimes[id] ??= currentTime;
			if (currentTime - targetStartTimes[id] > 1000) shouldScare = true;
		} else {
			delete targetStartTimes[id];
		}
	}

	if (shouldScare && !is_on_cooldown('scare') && slot !== -1) {
		equip(slot);
		use('scare');
		equip(slot);
	}
}

function partyMaker() {
	if (!CONFIG.party.autoManage) return;

	const group = CONFIG.party.groupMembers;
	const partyLead = get_entity(group[0]);
	const currentParty = character.party;
	const healer = get_entity('CrownPriest');

	if (character.name === group[0]) {
		for (let i = 1; i < group.length; i++) {
			send_party_invite(group[i]);
		}
	} else {
		if (currentParty && currentParty !== group[0] && healer) {
			leave_party();
		}

		if (!currentParty && partyLead) {
			send_party_request(group[0]);
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

setInterval(() => {
	if (character?.afk && !parent?.paused) pause();
	else if (!character?.afk && parent?.paused) pause();
}, 50);

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

async function equipBatch(data) {
	if (!Array.isArray(data)) {
		return Promise.reject({ reason: 'invalid', message: 'Not an array' });
	}
	if (data.length > 15) {
		return Promise.reject({ reason: 'invalid', message: 'Too many items' });
	}

	let validItems = [];

	for (let i = 0; i < data.length; i++) {
		let itemName = data[i].itemName;
		let slot = data[i].slot;
		let level = data[i].level;
		let l = data[i].l;

		if (!itemName) continue;

		let found = false;
		if (parent.character.slots[slot]) {
			let slotItem = parent.character.items[parent.character.slots[slot]];
			if (slotItem && slotItem.name === itemName && slotItem.level === level && slotItem.l === l) {
				found = true;
			}
		}

		if (found) continue;

		for (let j = 0; j < parent.character.items.length; j++) {
			const item = parent.character.items[j];
			if (item && item.name === itemName && item.level === level && item.l === l) {
				validItems.push({ num: j, slot: slot });
				break;
			}
		}
	}

	if (validItems.length === 0) return;

	try {
		parent.socket.emit('equip_batch', validItems);
		await parent.push_deferred('equip_batch');
	} catch (error) {
		console.error('equipBatch error:', error);
		return Promise.reject({ reason: 'invalid', message: 'Failed to equip' });
	}
}

function isSetEquipped(setName) {
	const set = equipmentSets[setName];
	if (!set) return false;

	return set.every(item =>
		character.slots[item.slot]?.name === item.itemName &&
		character.slots[item.slot]?.level === item.level
	);
}

function equipSet(setName) {
	const set = equipmentSets[setName];
	if (set) {
		equipBatch(set);
	} else {
		console.error(`Set "${setName}" not found.`);
	}
}
// ============================================================================
// SKIN CHANGER
// ============================================================================
const skinConfigs = {
	warrior: {
		skin: 'tf_green',
		skinRing: { name: 'tristone', level: 1, locked: 'l' },
		normalRing: { name: 'suckerpunch', level: 2, locked: 'l' }
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

game.on('death', data => {
	const mob = parent.entities[data.id];
	if (!mob || !mob.cooperative) return;

	const mobName = mob.mtype;
	const mobTarget = mob.target;
	const partyMembers = Object.keys(get_party() || {});

	if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
		const msg = `${mobName} died with ${character.luckm} luck`;
		game_log(msg, '#96a4ff');
		console.log(msg);
	}
});

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
maintenanceLoop();
potionLoop();
