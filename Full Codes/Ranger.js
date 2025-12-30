// ============================================================================
// CONFIGURATION - Toggle features here instead of editing code
// ============================================================================
const home = 'targetron';
const mobMap = 'uhills';
const allBosses = ['grinch', 'icegolem', 'dragold', 'mrgreen', 'mrpumpkin', 'greenjr', 'jr', 'franky', 'rgoo', 'bgoo'];

const CONFIG = {
	combat: {
		enabled: true,
		targetPriority: ['CrownTown', 'CrownPriest'],
		allBosses,
		useHuntersMark: true,
		useSupershot: true,
		minTargetsFor5Shot: 4,
		minTargetsFor3Shot: 2
	},

	movement: {
		enabled: true,
		circleWalk: true,
		circleSpeed: 1.8,
		circleRadius: 75,
	},

	equipment: {
		autoSwapSets: true,
		bossLuckSwitch: true,
		bossHpThresholds: {
			mrpumpkin: 100000,
			mrgreen: 100000,
		},
		mpThresholds: { upper: 1800, lower: 2400 },
		chestThreshold: 12,
		swapCooldown: 500,
		capeSwapEnabled: false,
		coatSwapEnabled: true,
		bossSetSwapEnabled: true,
		xpSetSwapEnabled: true,
		xpMonsters: [home, 'sparkbot'],
		xpMobHpThreshold: 25000
	},

	potions: {
		autoBuy: true,
		hpThreshold: 400,
		mpThreshold: 500,
		minStock: 1000
	},

	party: {
		autoManage: true,
		groupMembers: ['CrownsAnal', 'CrownTown', 'CrownPriest', "CrownMerch"]
	},

	looting: {
		enabled: true,
		delayMs: 180000,
		lootMonth: 'lootItemsDec'
	},

	selling: {
		enabled: true,
		whitelist: ['vitearring', 'iceskates', 'cclaw', 'hpbelt', 'ringsj', 'hpamulet',
			'warmscarf', 'quiver', 'snowball', 'vitring', 'wbreeches', 'wgloves',
			'strring', 'dexring', 'intring']
	},

	upgrading: {
		enabled: false,
		whitelist: {}
	},

	combining: {
		enabled: false,
		whitelist: {
			dexamulet: { targetLevel: 3, primling: 3, prim: 4 },
			intamulet: { targetLevel: 3, primling: 3, prim: 4 },
			stramulet: { targetLevel: 3, primling: 3, prim: 4 }
		}
	},

	characterStarter: {
		enabled: true,
		characters: {
			MERCHANT: { name: 'CrownMerch', codeSlot: 95 },
			PRIEST: { name: 'CrownPriest', codeSlot: 3 },
			WARRIOR1: { name: 'CrownTown', codeSlot: 2 }
		}
	},

	locationBroadcast: {
		enabled: true,
		targetPlayer: 'CrownMerch',
		checkInterval: 1000,
		lowInventorySlots: 7
	}
};

// ============================================================================
// CONSTANTS
// ============================================================================
const TICK_RATE = {
	main: 100,
	action: 1,
	equipment: 25,
	maintenance: 2000
};

const COOLDOWNS = {
	cc: 135
};

const EVENT_LOCATIONS = [
	{ name: 'mrpumpkin', map: 'halloween', x: -222, y: 720 },
	{ name: 'mrgreen', map: 'spookytown', x: 610, y: 1000 }
];

const CACHE_TTL = 50;

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
	targets: { sortedByHP: [], inRange: [], outOfRange: [], lastUpdate: 0 },
	healTarget: null,
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
	bigbird: [{ x: 1304, y: -69 }],
	bscorpion: [{ x: -408, y: -1141 }],
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
	odino: [{ x: -52, y: 756 }],
	oneeye: [{ x: -255, y: 176 }],
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
		{ itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
		{ itemName: "t2quiver", slot: "offhand", level: 9, l: "l" },
	],
	dead: [
		{ itemName: "bowofthedead", slot: "mainhand", level: 11, l: "l" },
		{ itemName: "alloyquiver", slot: "offhand", level: 10, l: "l" },
	],
	boom: [
		{ itemName: "pouchbow", slot: "mainhand", level: 13, l: "l" },
		{ itemName: "alloyquiver", slot: "offhand", level: 10, l: "l" },
	],
	heal: [
		{ itemName: "cupid", slot: "mainhand", level: 9, l: "l" },
	],
	dps: [
		{ itemName: "amuletofm", slot: "amulet", level: 6, l: "l" },
		{ itemName: "dexearring", slot: "earring2", level: 5, l: "l" },
		{ itemName: "dexearring", slot: "earring1", level: 5, l: "l" },
		{ itemName: "suckerpunch", slot: "ring1", level: 2, l: "l" },
		{ itemName: "suckerpunch", slot: "ring2", level: 2, l: "u" },
	],
	luck: [
		{ itemName: "mearring", slot: "earring1", level: 0, l: "l" },
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
		{ itemName: "amuletofm", slot: "amulet", level: 0, l: "l" },
	],
	stealth: [
		{ itemName: "stealthcape", slot: "cape", level: 0, l: "l" },
	],
	cape: [
		{ itemName: "vcape", slot: "cape", level: 6, l: "l" },
	],
	mana: [
		{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" }
	],
	stat: [
		{ itemName: "coat", slot: "chest", level: 12, l: "s" }
	],
};

// ============================================================================
// CORE UTILITIES
// ============================================================================
function updateCache() {
	cache.targets = updateTargetCache();
	cache.healTarget = findHealTarget();
	cache.lastUpdate = performance.now();
}

function updateTargetCache() {
	const X = locations[home][0].x;
	const Y = locations[home][0].y;
	const rangeThreshold = 65;

	const sortedByHP = [];

	for (const id in parent.entities) {
		const e = parent.entities[id];
		if (
			e.type === 'monster' &&
			(CONFIG.combat.targetPriority.includes(e.target)) &&
			!e.dead
		) {
			sortedByHP.push(e);
		}
	}

	sortedByHP.sort((a, b) => b.hp - a.hp);

	const inRange = [];
	const outOfRange = [];

	for (const mob of sortedByHP) {
		const dist = Math.hypot(mob.x - X, mob.y - Y);
		(dist <= rangeThreshold ? inRange : outOfRange).push(mob);
	}

	return { sortedByHP, inRange, outOfRange };
}

function findHealTarget() {
	const healer = get_entity('CrownPriest');
	const healThreshold = (!healer || healer.rip) ? 0.9 : 0.4;

	const partyNames = Object.keys(get_party() || {});
	let lowest = null;
	let lowestPct = 1;

	for (const name of partyNames) {
		if (name === character.name) continue;

		const ally = get_player(name);
		if (!ally || ally.rip) continue;

		const pct = ally.hp / ally.max_hp;
		if (pct < lowestPct) {
			lowestPct = pct;
			lowest = ally;
		}
	}

	return lowest && lowestPct < healThreshold ? lowest : null;
}

// ============================================================================
// MAIN TICK LOOP
// ============================================================================
async function mainLoop() {
	try {
		if (is_disabled(character)) {
			return setTimeout(mainLoop, 250);
		}

		updateCache();

		if (shouldHandleEvents()) {
			handleEvents();
		} else if (CONFIG.movement.enabled) {
			if (!get_nearest_monster({ type: home })) {
				handleReturnHome();
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
// ACTION LOOP - Attack and heal
// ============================================================================
async function actionLoop() {
	let delay = 5;

	try {
		if (is_disabled(character)) {
			return setTimeout(actionLoop, 25);
		}

		updateCache();

		const msUntilAttack = ms_to_next_skill('attack');

		if (msUntilAttack < character.ping / 10) {
			const healTarget = cache.healTarget;

			if (healTarget) {
				equipSet('heal');
				await attack(healTarget);
			} else {
				await handleAttack();
			}
		} else {
			if (msUntilAttack > 200) delay = 50;
			else if (msUntilAttack > 50) delay = 20;
			else delay = 5;
		}

	} catch (err) {
		//console.error('actionLoop error:', err);
		delay = 1;
	}

	setTimeout(actionLoop, delay);
}

async function handleAttack() {
	const { sortedByHP, inRange, outOfRange } = cache.targets;

	if (sortedByHP.length === 0) return;

	const cursed = get_nearest_monster_v2({ statusEffects: ['cursed'] });
	if (cursed) {
		change_target(cursed);
		if (CONFIG.combat.useHuntersMark && !is_on_cooldown('huntersmark')) {
			await use_skill('huntersmark', cursed);
		}
		if (CONFIG.combat.useSupershot && !is_on_cooldown('supershot')) {
			await use_skill('supershot', cursed);
		}
	}

	if (inRange.length >= CONFIG.combat.minTargetsFor5Shot) {
		equipSet('boom');
		await use_skill('5shot', inRange.slice(0, 5).map(e => e.id));
	} else if (outOfRange.length >= CONFIG.combat.minTargetsFor5Shot) {
		equipSet('dead');
		await use_skill('5shot', outOfRange.slice(0, 5).map(e => e.id));
	} else if (sortedByHP.length >= CONFIG.combat.minTargetsFor3Shot) {
		equipSet('dead');
		await use_skill('3shot', sortedByHP.slice(0, 3).map(e => e.id));
	} else if (sortedByHP.length === 1 && is_in_range(sortedByHP[0])) {
		equipSet('single');
		await attack(sortedByHP[0]);
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

		if (CONFIG.selling.enabled) {
			sellItems();
		}

		if (CONFIG.upgrading.enabled) {
			upgradeItems();
		}

		if (CONFIG.combining.enabled) {
			combineItems();
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

		const activeBoss = EVENT_LOCATIONS
			.map(e => ({ name: e.name, data: parent.S[e.name] }))
			.find(e => e.data?.live);

		// Booster Swap
		if (now - state.lastBoosterSwap > swapCooldown) {
			let desiredBooster = activeBoss && activeBoss.data.hp < CONFIG.equipment.bossHpThresholds[activeBoss.name]
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

		// Cape Swap
		if (CONFIG.equipment.capeSwapEnabled && now - state.lastCapeSwap > swapCooldown) {
			const chestCount = getNumChests();
			const numTargets = getNumTargets('CrownPriest') || getNumTargets('CrownPal');
			const targetCapeSet = chestCount >= CONFIG.equipment.chestThreshold && numTargets < 6
				? 'stealth'
				: 'cape';

			if (targetCapeSet && !isSetEquipped(targetCapeSet)) {
				equipSet(targetCapeSet);
				state.lastCapeSwap = now;
			}
		}

		// Coat Swap
		if (CONFIG.equipment.coatSwapEnabled && now - state.lastCoatSwap > swapCooldown) {
			const targetCoatSet = character.mp > CONFIG.equipment.mpThresholds.upper
				? 'stat'
				: character.mp < CONFIG.equipment.mpThresholds.lower && 'mana';

			if (targetCoatSet && !isSetEquipped(targetCoatSet)) {
				equipSet(targetCoatSet);
				state.lastCoatSwap = now;
			}
		}

		// XP Set Swap
		if (CONFIG.equipment.xpSetSwapEnabled && now - state.lastXpSwap > swapCooldown && character.map === mobMap) {
			const hasLowHpXpMob = Object.values(parent.entities).some(e =>
				e.type === 'monster' &&
				CONFIG.equipment.xpMonsters.includes(e.mtype) &&
				e.hp < CONFIG.equipment.xpMobHpThreshold
			);
			const targetXpSet = hasLowHpXpMob ? 'xp' : 'orb';

			if (targetXpSet && !isSetEquipped(targetXpSet)) {
				equipSet(targetXpSet);
				state.lastXpSwap = now;
			}
		}

		// Boss Set Swap
		if (CONFIG.equipment.bossSetSwapEnabled && now - state.lastBossSetSwap > swapCooldown) {
			const targetSet = activeBoss
				? activeBoss.data.hp > CONFIG.equipment.bossHpThresholds[activeBoss.name] ? 'dps' : 'luck'
				: (character.map === mobMap && 'dps');

			if (targetSet && !isSetEquipped(targetSet)) {
				equipSet(targetSet);
				state.lastBossSetSwap = now;
			}
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
	const hasHandleableEvent = EVENT_LOCATIONS.some(e => parent?.S?.[e.name]?.live);
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

	const aliveSorted = EVENT_LOCATIONS
		.map(e => ({ ...e, data: parent.S[e.name] }))
		.filter(e => e.data?.live)
		.sort((a, b) => (a.data.hp / a.data.max_hp) - (b.data.hp / b.data.max_hp));

	if (!aliveSorted.length) return;

	const target = aliveSorted[0];

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

	const halfway_x = character.x + (monster.x - character.x) / 2;
	const halfway_y = character.y + (monster.y - character.y) / 2;

	if (!is_in_range(monster, 'attack') && !smart.moving) {
		await xmove(halfway_x, halfway_y);
	}
}

function handleReturnHome() {
	if (!smart.moving) {
		smart_move(destination);
	}
}

async function walkInCircle() {
	if (smart.moving) return;

	const center = locations[home][0];
	const radius = CONFIG.movement.circleRadius;

	const currentTime = performance.now();
	const deltaTime = currentTime - state.lastAngleUpdate;
	state.lastAngleUpdate = currentTime;

	const deltaAngle = CONFIG.movement.circleSpeed * (deltaTime / 1000);
	state.angle = (state.angle + deltaAngle) % (2 * Math.PI);

	const offsetX = Math.cos(state.angle) * radius;
	const offsetY = Math.sin(state.angle) * radius;
	const targetX = center.x + offsetX;
	const targetY = center.y + offsetY;

	if (!character.moving) {
		await xmove(targetX, targetY);
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
function clearInventory() {
	const lootMule = get_player('CrownMerch');
	if (!lootMule) return;

	if (character.gold > 11000000) {
		send_gold(lootMule, character.gold - 10000000);
	}

	const itemsToExclude = ['hpot1', 'mpot1', 'luckbooster', 'goldbooster', 'xpbooster', 'pumpkinspice', 'xptome'];

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (item && !itemsToExclude.includes(item.name) && !item.l && !item.s) {
			if (is_in_range(lootMule, 'attack')) {
				send_item(lootMule.id, i, item.q ?? 1);
			}
		}
	}
}

function inventorySorter() {
	const slotMap = {
		tracktrix: 0,
		ancientcomputer: 1,
		hpot1: 2,
		mpot1: 3,
		xptome: 4,
		pumpkinspice: 5,
		xpbooster: 6,
	};

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (!item) continue;

		const targetSlot = slotMap[item.name];
		if (targetSlot !== undefined && i !== targetSlot) {
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
			if (!targetStartTimes[id]) {
				targetStartTimes[id] = currentTime;
			} else if (currentTime - targetStartTimes[id] > 1000) {
				shouldScare = true;
			}
		} else {
			delete targetStartTimes[id];
		}
	}

	if (shouldScare && !is_on_cooldown('scare') && slot !== -1) {
		equip(slot);
		use('scare');
		equip(slot);
	}
	if (character?.afk && !parent?.paused) {
		pause();
		parent.no_graphics = true
	} else if (!character?.afk && parent?.paused) {
		pause();
		parent.no_graphics = false
	}
}
setInterval(scare, 100);

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
setInterval(teamStarter, 5000);

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
function sellItems() {
	if (!CONFIG.selling.enabled) return;

	for (let i = 0; i < character.items.length; i++) {
		const item = character.items[i];
		if (!item) continue;

		if (CONFIG.selling.whitelist.includes(item.name)) {
			if (item.p === undefined && item.l !== 'l') {
				sell(i);
			}
		}
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
	const savedLoot = JSON.parse(localStorage.getItem(CONFIG.looting.lootMonth) || '{}');

	const sortedLoot = {};
	Object.keys(savedLoot)
		.sort()
		.forEach((key) => {
			sortedLoot[key] = savedLoot[key];
		});

	console.log('Saved Loot (Sorted):', sortedLoot);
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
	if (isSetEquipped(setName)) return;
	const set = equipmentSets[setName];
	if (set) equipBatch(set);
}

// ============================================================================
// SKIN CHANGER
// ============================================================================
const skinConfigs = {
	ranger: {
		skin: 'tm_yellow',
		skinRing: { name: 'tristone', level: 2, locked: 'l' },
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
equipmentLoop();
maintenanceLoop();
potionLoop();

// ============================================================================
// UI Stuff
// ============================================================================
let deaths = 0; // Variable to track the number of deaths
const killTime = new Date(); // Start time to calculate elapsed time

game.on('death', function (data) {
	if (parent.entities[data.id]) { // Check if the entity exists
		const mob = parent.entities[data.id];
		const mobName = mob.type;

		// Check if the mob is a monster
		if (mobName === 'monster') {
			const mobTarget = mob.target; // Get the mob's target
			const party = get_party(); // Get your party members

			// If party exists, extract party member names into an array
			const partyMembers = party ? Object.keys(party) : [];

			// Check if the mob's target was the player or someone in the party
			if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
				//console.log(data); // Log the death event
				deaths++; // Increment the death count
				killHandler(); // Call the killHandler function
			}
		}
	}
});

function killHandler() {
	const elapsed = (new Date() - killTime) / 1000; // Calculate elapsed time in seconds
	if (elapsed > 0) { // Prevent division by zero
		const deathsPerSec = deaths / elapsed; // Calculate deaths per second
		const dailyKillRate = calculateKillRate(deathsPerSec); // Calculate deaths based on interval

		//add_top_button("kpm", Math.round(dailyKillRate.kpm).toLocaleString() + ' kpm'); // Deaths per minute
		//add_top_button("kph", Math.round(dailyKillRate.kph).toLocaleString() + ' kph'); // Deaths per hour
		add_top_button("kpd", Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd'); // Deaths per day

		// If you don't like the buttons and would rather the old set_message version
		// set_message(Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd');
	} else {
		console.warn("Elapsed time is zero, cannot calculate rates.");
	}
}

// Function to calculate deaths based on the interval
function calculateKillRate(deathsPerSec) {
	let kpm = deathsPerSec * 60; // Convert to deaths per minute
	let kph = kpm * 60; // Convert to deaths per hour
	let kpd = kph * 24; // Convert to deaths per day
	return { kpm, kph, kpd };
}

function updateMonsterButton() {
	let totalMonsters = 0;
	let poisonedMonsters = 0;

	for (const id in parent.entities) {
		const entity = parent.entities[id];
		if (entity.type === "monster" && (entity.target === "CrownPriest" || entity.target === "CrownPal")) {
			totalMonsters++;
			if (entity.s && entity.s.poisoned) {
				poisonedMonsters++;
			}
		}
	}

	add_top_button("mon_status", `${totalMonsters} | ${poisonedMonsters} poisoned`);
}

// Call this function periodically to update the button
setInterval(updateMonsterButton, 250);

// ============= CONFIGURATION =============
const DISCORD_WEBHOOK_URL = DISCORD_WEBHOOK_URL_HERE;
const MENTION_USER_ID = "******************";  // Set to null or "" to disable pings
const BOT_USERNAME = "Lootbot";
const OUTPUT_SIZE = 50; // Scale image size
// =========================================

const rareItems = {
	"suckerpunch": { name: "Sucker Punch" },
	"ringofluck": { name: "Ring of Luck" },
	"mpxbelt": { name: "Mana Belt" },
	"amuletofm": { name: "Amulet of Mystery" },
	"goldring": { name: "Gold Ring" },
	"ukey": { name: "Underground Key" },
	"goldenpowerglove": { name: "Golden Power Glove" },
	"goldbooster": { name: "Gold Booster" },
	"fallen": { name: "Pants of the Fallen Master" },
	'bkey': { name: "Bank Key" },
	'networkcard': { name: "Network Card" },
	'glitch': { name: "Glitch" },
	//'electronics': { name: "Electronics"},
	//'stramulet': { name: "Strength Amulet" },
};

async function sendRareLootToDiscord(itemID, quantity, itemData, mentionUserID, looterName) {
	const article = getArticle(itemData.name);

	try {
		const imageDataURL = await generateItemImage(itemID);

		const base64Data = imageDataURL.split(',')[1];
		const byteCharacters = atob(base64Data);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: 'image/png' });

		const formData = new FormData();
		formData.append('file', blob, `${itemID}.png`);

		let messageContent = `${looterName} found ${article} **${itemData.name}**!`;
		if (mentionUserID) {
			messageContent += ` <@${mentionUserID}>`;
		}

		const payload = {
			...(mentionUserID && { content: messageContent }),
			username: BOT_USERNAME,
			embeds: [{
				description: `${looterName} found ${quantity > 1 ? `${quantity}x ` : ''}${article} **${itemData.name}**!`,
				thumbnail: {
					url: `attachment://${itemID}.png`
				},
				color: 0xFFD700,
				timestamp: new Date().toISOString()
			}]
		};

		formData.append('payload_json', JSON.stringify(payload));

		const response = await fetch(DISCORD_WEBHOOK_URL, {
			method: 'POST',
			body: formData
		});

		const responseData = await response.json();

		if (!response.ok) {
			console.error('Discord error:', responseData);
		} else {
			console.log(`Discord message sent: ${itemData.name}`);
		}
	} catch (error) {
		console.error('Error sending to Discord:', error);
	}
}

const TILE_SIZE = 20;

function generateItemImage(itemID) {
	return new Promise(async (resolve, reject) => {
		const coords = G.positions[itemID];
		if (!coords) {
			reject(`No sprite data for ${itemID}`);
			return;
		}

		console.log(`Found coords for ${itemID}:`, coords);

		const [sheetName, col, row] = coords;

		const actualSheetName = sheetName === "" ? "pack_20vt8" : sheetName;
		const sheetURL = `https://raw.githubusercontent.com/kaansoral/adventureland/main/images/tiles/items/${actualSheetName}.png`;

		console.log(`Fetching sprite sheet: ${sheetURL}`);

		try {
			const response = await fetch(sheetURL, { mode: 'cors' });

			if (!response.ok) {
				reject(`Failed to fetch: ${response.status}`);
				return;
			}

			const blob = await response.blob();
			console.log(`Fetched blob size: ${blob.size}`);

			const objectURL = URL.createObjectURL(blob);

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = OUTPUT_SIZE;
			canvas.height = OUTPUT_SIZE;

			const img = new Image();

			img.onload = () => {
				console.log(`Drawing at col:${col}, row:${row}`);

				ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

				// Disable image smoothing
				ctx.imageSmoothingEnabled = false;
				ctx.mozImageSmoothingEnabled = false;
				ctx.webkitImageSmoothingEnabled = false;
				ctx.msImageSmoothingEnabled = false;

				ctx.drawImage(
					img,
					col * TILE_SIZE,
					row * TILE_SIZE,
					TILE_SIZE,
					TILE_SIZE,
					0,
					0,
					OUTPUT_SIZE,
					OUTPUT_SIZE
				);

				URL.revokeObjectURL(objectURL);

				const dataURL = canvas.toDataURL('image/png');
				console.log(`Generated image, length: ${dataURL.length}`);
				resolve(dataURL);
			};

			img.onerror = (error) => {
				URL.revokeObjectURL(objectURL);
				reject(`Image load error: ${error}`);
			};

			img.src = objectURL;

		} catch (error) {
			reject(`Fetch error: ${error}`);
		}
	});
}

function getArticle(itemName) {
	const vowels = ['A', 'E', 'I', 'O', 'U'];
	return vowels.includes(itemName[0].toUpperCase()) ? "an" : "a";
}

/**
 * Enhanced game log with filtering and timestamps
 * Creates a tabbed filter UI above the game log to show/hide different message types
 */
(function () {
	const FILTERS = {
		kills: { show: false, regex: /killed/, label: 'Kills' },
		gold: { show: true, regex: /gold/, label: 'Gold' },
		party: { show: true, regex: /party/, label: 'Party' },
		items: { show: true, regex: /found/, label: 'Items' },
		upgrade: { show: true, regex: /(upgrade|combination)/, label: 'Upgr.' },
		errors: { show: true, regex: /(error|line|column)/i, label: 'Errors' }
	};

	const COLORS = {
		active: ['#151342', '#1D1A5C'],
		inactive: ['#222', '#333'],
		activeText: '#FFF',
		inactiveText: '#999'
	};

	const TRUNCATE_AT = 1000;
	const TRUNCATE_TO = 720;

	function padZero(num, length = 2) {
		return num.toString().padStart(length, '0');
	}

	function getTimestamp() {
		const now = new Date();
		return `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
	}

	function createFilterBar() {
		const existingBar = parent.document.getElementById('gamelog-tab-bar');
		if (existingBar) existingBar.remove();

		const bar = parent.document.createElement('div');
		bar.id = 'gamelog-tab-bar';
		bar.className = 'enableclicks';
		Object.assign(bar.style, {
			border: '5px solid gray',
			height: '24px',
			background: 'black',
			margin: '-5px 0',
			display: 'flex',
			fontSize: '20px',
			fontFamily: 'pixel'
		});

		Object.entries(FILTERS).forEach(([key, filter], index) => {
			const tab = parent.document.createElement('div');
			tab.id = `gamelog-tab-${key}`;
			tab.className = 'gamelog-tab enableclicks';
			tab.textContent = filter.label;

			const colors = filter.show ? COLORS.active : COLORS.inactive;
			const textColor = filter.show ? COLORS.activeText : COLORS.inactiveText;

			Object.assign(tab.style, {
				height: '100%',
				width: `${100 / Object.keys(FILTERS).length}%`,
				textAlign: 'center',
				lineHeight: '24px',
				cursor: 'default',
				background: colors[index % 2],
				color: textColor
			});

			tab.addEventListener('click', () => toggleFilter(key));
			bar.appendChild(tab);
		});

		const gamelog = parent.document.getElementById('gamelog');
		gamelog.parentElement.insertBefore(bar, gamelog);
	}

	function toggleFilter(key) {
		FILTERS[key].show = !FILTERS[key].show;

		const tab = parent.document.getElementById(`gamelog-tab-${key}`);
		const index = Array.from(tab.parentElement.children).indexOf(tab);
		const colors = FILTERS[key].show ? COLORS.active : COLORS.inactive;
		const textColor = FILTERS[key].show ? COLORS.activeText : COLORS.inactiveText;

		tab.style.background = colors[index % 2];
		tab.style.color = textColor;

		filterGamelog();
		scrollGamelogToBottom();
	}

	function filterGamelog() {
		const entries = parent.document.querySelectorAll('.gameentry');
		entries.forEach(entry => {
			let shouldShow = true;
			for (const filter of Object.values(FILTERS)) {
				if (filter.regex.test(entry.innerHTML)) {
					shouldShow = filter.show;
					break;
				}
			}
			entry.style.display = shouldShow ? 'block' : 'none';
		});
	}

	function scrollGamelogToBottom() {
		const gamelog = parent.document.getElementById('gamelog');
		gamelog.scrollTop = gamelog.scrollHeight;
	}

	function addLogEntry(message, color = 'white') {
		if (parent.mode?.dom_tests || parent.inside === 'payments') return;

		const gamelog = parent.document.getElementById('gamelog');

		if (parent.game_logs.length > TRUNCATE_AT) {
			parent.game_logs = parent.game_logs.slice(-TRUNCATE_TO);

			const truncateMsg = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
			const entries = parent.game_logs.map(([msg, clr]) =>
				`<div class='gameentry' style='color: ${clr || 'white'}'>${msg}</div>`
			).join('');

			gamelog.innerHTML = truncateMsg + entries;
		}

		parent.game_logs.push([message, color]);

		let display = 'block';
		for (const filter of Object.values(FILTERS)) {
			if (filter.regex.test(message)) {
				display = filter.show ? 'block' : 'none';
				break;
			}
		}

		const entry = parent.document.createElement('div');
		entry.className = 'gameentry';
		entry.style.color = color;
		entry.style.display = display;
		entry.innerHTML = message;

		gamelog.appendChild(entry);
		scrollGamelogToBottom();
	}

	function initTimestamps() {
		if (parent.socket.hasListeners('game_log')) {
			parent.socket.removeListener('game_log');
		}

		parent.socket.on('game_log', data => {
			parent.draw_trigger(() => {
				const timestamp = getTimestamp();

				if (typeof data === 'string') {
					addLogEntry(`${timestamp} | ${data}`, 'gray');
				} else {
					if (data.sound) sfx(data.sound);
					addLogEntry(`${timestamp} | ${data.message}`, data.color);
				}
			});
		});
	}

	createFilterBar();
	filterGamelog();
	initTimestamps();
})();
///////////////////////////////////////////
// Universal function to toggle any meter's visibility
function toggleMeter(meterId) {
	let $ = parent.$;
	let meter = $(`#${meterId}`);

	if (meter.length) {
		meter.toggle();  // Toggles the visibility
	}
}

// Function to open DPS meter configuration
function openDPSConfig() {
	let $ = parent.$;

	// Remove any existing config popup
	$('#dpsConfigPopup').remove();

	// All available damage types
	const allDamageTypes = ["Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF", "DPS", "Dmg Taken"];

	// Create config popup
	let configPopup = $('<div id="dpsConfigPopup"></div>').css({
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		color: 'white',
		padding: '15px',
		border: '2px solid gray',
		borderRadius: '10px',
		zIndex: 10000,
		width: '350px',
		textAlign: 'center'
	});

	configPopup.append('<h3>DPS Meter Configuration</h3>');
	configPopup.append('<p style="font-size: 12px; margin: 5px 0;">Select which stats to display:</p>');

	// Create checkboxes for each damage type
	allDamageTypes.forEach(type => {
		let checkboxDiv = $('<div></div>').css({
			textAlign: 'left',
			padding: '5px',
			margin: '5px 0'
		});

		let checkbox = $('<input type="checkbox">').attr('id', `dps_${type}`).css({
			marginRight: '10px'
		});

		// Check if currently displayed
		if (damageTypes.includes(type)) {
			checkbox.prop('checked', true);
		}

		let label = $(`<label for="dps_${type}">${type}</label>`).css({
			cursor: 'pointer',
			fontSize: '16px'
		});

		checkboxDiv.append(checkbox);
		checkboxDiv.append(label);
		configPopup.append(checkboxDiv);
	});

	// Apply button
	let applyButton = $('<button>Apply Changes</button>').css({
		margin: '10px 5px 5px 5px',
		padding: '10px 20px',
		backgroundColor: '#4CAF50',
		color: 'white',
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer'
	}).click(function () {
		// Update damageTypes array based on selections
		damageTypes.length = 0; // Clear array
		allDamageTypes.forEach(type => {
			if ($(`#dps_${type}`).is(':checked')) {
				damageTypes.push(type);
			}
		});

		// Force UI update
		updateDPSMeterUI();

		$('#dpsConfigPopup').remove();
	});

	// Close button
	let closeButton = $('<button>Cancel</button>').css({
		margin: '5px',
		padding: '10px 20px',
		backgroundColor: '#f44336',
		color: 'white',
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer'
	}).click(function () {
		$('#dpsConfigPopup').remove();
	});

	configPopup.append(applyButton);
	configPopup.append(closeButton);

	$('body').append(configPopup);
}

// Function to create the toggle popup window
function createTogglePopup() {
	let $ = parent.$;

	// Remove any existing popup window to avoid duplicates
	$('#togglePopupWindow').remove();

	// Create a popup window container
	let togglePopup = $('<div id="togglePopupWindow"></div>').css({
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		color: 'white',
		padding: '10px',
		border: '2px solid gray',
		borderRadius: '10px',
		zIndex: 9999,
		width: '300px',
		textAlign: 'center'
	});

	// Add a title to the popup
	togglePopup.append('<h3>UI Addon Toggles</h3>');

	// Add toggle buttons for each UI element
	let scoopToggleBtn = $('<button>Toggle SCOOP Meter</button>').css({
		margin: '5px',
		padding: '10px'
	}).click(function () {
		toggleMeter('scoopmeter');
	});

	let dpsToggleBtn = $('<button>Toggle DPS Meter</button>').css({
		margin: '5px',
		padding: '10px'
	}).click(function () {
		toggleMeter('dpsmeter');
	});

	// NEW: Configure DPS Meter button
	let dpsConfigBtn = $('<button>Configure DPS Meter</button>').css({
		margin: '5px',
		padding: '10px',
		backgroundColor: '#4CAF50'
	}).click(function () {
		openDPSConfig();
	});

	let xpToggleBtn = $('<button>Toggle XP Meter</button>').css({
		margin: '5px',
		padding: '10px'
	}).click(function () {
		toggleMeter('xptimer');
	});

	let goldToggleBtn = $('<button>Toggle Gold Meter</button>').css({
		margin: '5px',
		padding: '10px'
	}).click(function () {
		toggleMeter('goldtimer');
	});

	let partyToggleBtn = $('<button>Toggle Party</button>').css({
		margin: '5px',
		padding: '10px'
	}).click(function () {
		toggleMeter('newparty');
	});

	// Add buttons to the popup window
	togglePopup.append(scoopToggleBtn);
	togglePopup.append(dpsToggleBtn);
	togglePopup.append(dpsConfigBtn);  // NEW: Add config button
	togglePopup.append(xpToggleBtn);
	togglePopup.append(goldToggleBtn);
	togglePopup.append(partyToggleBtn);

	// Add a close button to hide the popup
	let closeButton = $('<button>Close</button>').css({
		margin: '5px',
		padding: '10px',
		backgroundColor: '#FF0000',
		color: 'white'
	}).click(function () {
		$('#togglePopupWindow').remove();
	});

	togglePopup.append(closeButton);

	// Append the popup window to the game screen
	$('body').append(togglePopup);
}
///////////////////////////////////////////////
function initXP() {
	let $ = parent.$;

	// XP text
	$('#xpui').css({
		fontSize: '28px',
		width: "100%",
		background: "transparent",
		color: "white",
	});

	// XP bar box (semi-transparent)
	$('.xpsui').css({
		background: "rgba(0, 0, 0, 0.7)"   // ← adjust opacity here
	});

	// XP progress fill (solid)
	$('#xpslider').css({
		//background: "rgb(0, 128, 0)"     // ← progress color
	});
}

function displayXP() {
	let $ = parent.$;
	let xpPercent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
	let xpString = `LV${character.level} ${xpPercent}%`;
	$('#xpui').html(xpString);
}

initXP();
//setInterval(displayXP, 1000);
//////////////////////////////////////////////////
let lastGoldCheck = character.gold;  // Store the last known gold value
let totalGoldAcquired = 0;           // Track the total gold acquired since the script started

// Function to check for gold increase and update the total gold acquired
function trackGoldAcquisition() {
	let currentGold = character.gold;

	// If current gold is greater than the last check, we've gained gold
	if (currentGold > lastGoldCheck) {
		let goldGained = currentGold - lastGoldCheck;
		totalGoldAcquired += goldGained; // Add the new gold gain to the total
	}

	// Update the last gold check value
	lastGoldCheck = currentGold;

	// Display the total gold acquired since code start
	//set_message(`Gold Acquired: ${totalGoldAcquired.toLocaleString()}`);
	set_message(totalGoldAcquired.toLocaleString(), "gold");
}

// Call the function periodically to check for gold changes
setInterval(trackGoldAcquisition, 1000);  // Check every second	
//////////////////////////////////////////////////////////////////////////
// Initialize the scoop meter
function initscoopMeter() {
	let $ = parent.$;
	let brc = $('#bottomrightcorner');

	// Remove any existing scoop meter
	brc.find('#scoopmeter').remove();

	// Create a container for the scoop meter
	let scoopmeter_container = $('<div id="scoopmeter"></div>').css({
		fontSize: '20px',
		color: 'white',
		textAlign: 'center',
		display: 'table',
		overflow: 'hidden',
		marginBottom: '-3px',
		width: "100%",
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	});

	// Create a div for the scoop meter content
	let scoopmeter_content = $('<div id="scoopmetercontent"></div>').css({
		display: 'table-cell',
		verticalAlign: 'middle',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		padding: '2px',
		border: '4px solid grey',
	}).appendTo(scoopmeter_container);

	// Insert the scoop meter container
	brc.children().first().after(scoopmeter_container);
}

// Function to get nearby players/entities and sort by scoop
function updatescoopMeterUI() {
	try {
		let $ = parent.$;
		let scoopDisplay = $('#scoopmetercontent');

		if (scoopDisplay.length === 0) return;

		let entitiesWithscoop = [];

		// Add your character's .s.coop.p
		if (character?.s?.coop?.p !== undefined) {
			entitiesWithscoop.push({
				name: character.name, // Your character's name
				scoop: character.s.coop.p, // Accessing the new scoop value
				classType: character.ctype // Get the class type of your character
			});
		}

		// Add nearby players/entities with .s.coop.p
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (!entity.npc && entity.s && entity.s.coop && entity.s.coop.p !== undefined) {  // Include only those with .s.coop.p
				entitiesWithscoop.push({
					name: entity.name || entity.mtype, // Use player name or monster type
					scoop: entity.s.coop.p, // Accessing the new scoop value
					classType: entity.ctype // Get the class type of the entity
				});
			}
		}

		// Sort by scoop in descending order
		entitiesWithscoop.sort((a, b) => b.scoop - a.scoop);

		// Get the highest .s.coop.p to calculate percentages
		let highestscoop = entitiesWithscoop[0].scoop || 1; // Prevent division by zero

		// Prepare the display string
		let listString = '<div>👑 Boss Contribution 👑</div>';
		listString += '<table border="1" style="width:100%;">';

		// Track the max rows per column
		let maxRows = 6;
		let totalPlayers = entitiesWithscoop.length;
		let numColumns = Math.ceil(totalPlayers / maxRows);

		// Calculate column width based on number of columns
		let columnWidth = (100 / numColumns).toFixed(2) + '%'; // e.g., '50.00%', '33.33%', etc.

		// Iterate over each row (up to maxRows)
		for (let row = 0; row < maxRows; row++) {
			listString += '<tr>'; // Start a new row
			for (let col = 0; col < numColumns; col++) {
				let index = row + col * maxRows;
				if (index >= totalPlayers) break; // Stop if no more players

				let entity = entitiesWithscoop[index];
				const playerClass = entity.classType.toLowerCase(); // Ensure class type is in lowercase
				const nameColor = classColors[playerClass] || '#FFFFFF'; // Default to white if class not found

				// Calculate the percentage for the progress bar using .s.coop.p
				let entityScoop = Number(entity.scoop) || 0;
				let highestScoop = Number(highestscoop) || 1;
				let percentBarWidth = (entityScoop / highestScoop) * 100;
				percentBarWidth = Math.min(100, +percentBarWidth.toFixed(1));

				// Create the progress bar with styling and the scoop value inside the bar
				let progressBar = `<div style="width: 100%; background-color: gray; border-radius: 5px; overflow: hidden; position: relative;">
					<div style="width: ${percentBarWidth}%; background-color: ${nameColor}; height: 10px;"></div>
					<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin-top: -1px; color: black; font-size: 16px; font-weight: bold;">
${getFormattedscoop(entity.scoop)}
</span>
				</div>`;

				// Apply color to the player's name and display the progress bar with scoop inside
				listString += `<td style="color: ${nameColor}; width: ${columnWidth};">${entity.name} ${progressBar}</td>`;
			}
			listString += '</tr>'; // End the row
		}

		listString += '</table>';
		scoopDisplay.html(listString);

	} catch (error) {
		//console.error('Error updating scoop meter UI:', error);
	}
}

// Helper function to format scoop with commas for readability and round to nearest whole number
function getFormattedscoop(scoop) {
	try {
		let roundedscoop = Math.round(scoop); // Round to the nearest whole number
		return roundedscoop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	} catch (error) {
		console.error('Formatting scoop error:', error);
		return 'N/A';
	}
}

// Initialize the scoop meter and update it every 250ms
initscoopMeter();
setInterval(updatescoopMeterUI, 250);
////////////////////////////////////////////
/**
 * Modifies the game log window appearance with fixed width
 * @returns {boolean} True if successful, false if gamelog not found
 */
function modifyGamelogAppearance() {
	const gamelog = parent.document.getElementById('gamelog');

	if (!gamelog) {
		console.log('Gamelog not ready yet');
		return false;
	}

	Object.assign(gamelog.style, {
		position: 'relative',
		background: 'rgba(0,0,0,0.7)',
		border: '4px solid gray',
		width: '330px',
		height: '150px',
		fontSize: '20px',
		color: 'white',
		textAlign: 'left',
		overflowY: 'scroll',
		lineHeight: '24px',
		padding: '10px',
		fontFamily: 'pixel',
		wordWrap: 'break-word',
		webkitFontSmoothing: 'subpixel-antialiased',
		pointerEvents: 'auto',
		fontWeight: 'normal',
		verticalAlign: 'middle',
		boxSizing: 'border-box'
	});

	console.log('Gamelog appearance modified successfully');
	return true;
}

setTimeout(modifyGamelogAppearance, 1000);

function modifyServerDivAppearance() {
	let $ = parent.$;
	let otherDiv = $('#bottomleftcorner2 > div.clickable');

	if (otherDiv.length) {
		// Modify the appearance of the other div
		otherDiv.css({
			background: 'black',
			border: 'solid gray',
			borderWidth: '4px 4px',
			width: '272px', // Adjust width as needed
			height: '25px', // Adjust height as needed
			lineHeight: '27px',
			fontSize: '20px', // Adjust font size as needed
			color: '#FFFFFF', // Adjust text color as needed
			textAlign: 'center',
			overflow: 'auto', // Add overflow auto to enable scrolling
			backgroundColor: 'rgba(0, 0, 0, 0.7)', // Set opacity to 70%
		});
	} else {
		console.log("Element not found.");
	}
}
// Call the function after 30 seconds
setTimeout(modifyServerDivAppearance, 40000);

function modifyChatDivAppearance() {
	let $ = parent.$;
	let otherDiv = $('#bottomleftcorner2 > div:nth-child(3)');

	if (otherDiv.length) {
		// Modify the appearance of the other div
		otherDiv.css({
			background: 'black',
			border: 'solid gray',
			borderWidth: '4px 4px',
			width: '280px', // Adjust width as needed
			height: '159px', // Adjust height as needed
			fontSize: '17px', // Adjust font size as needed
			color: '#FFFFFF', // Adjust text color as needed
			textAlign: 'left',
			overflow: 'auto', // Add overflow auto to enable scrolling
			backgroundColor: 'rgba(0, 0, 0, 0.7)', // Set opacity to 70%
		});
	} else {
		console.log("Element not found.");
	}
}
// Call the function after 30 seconds
setTimeout(modifyChatDivAppearance, 40000);

function modifyChatLogDivAppearance() {
	let $ = parent.$;
	let chatLogDiv = $('#chatlog');

	if (chatLogDiv.length) {
		// Modify the font size of the chat log div and disable horizontal scrolling
		chatLogDiv.css({
			fontSize: '18px', // Adjust font size as needed
			overflowX: 'hidden', // Disable horizontal scrolling
			backgroundColor: 'rgba(0, 0, 0, 0.1)',
			width: '100%',
		});
	} else {
		console.log("Chat log div element not found.");
	}
}
// Call the function after 30 seconds
setTimeout(modifyChatLogDivAppearance, 40000);

function modifyChatInputDivAppearance() {
	let $ = parent.$;
	let otherDiv = $('#chatinput');

	if (otherDiv.length) {
		// Modify the appearance of the other div
		otherDiv.css({
			userSelect: 'none',
			wordWrap: 'break-word',
			WebkitFontSmoothing: 'subpixel-antialiased',
			position: 'fixed',
			zIndex: 99,
			bottom: '2px',
			left: '7px',
			width: '275px',
			height: '25px',
			fontSize: '24px',
			fontFamily: 'Pixel',
			display: 'inline-block',
			background: '#404040',
			color: 'white',
			border: 'none',
			padding: '1px'
		});
	} else {
		console.log("Element not found.");
	}
}
// Call the function after 30 seconds
setTimeout(modifyChatInputDivAppearance, 40000);

function removeChatWithParty() {
	let $ = parent.$;
	let chatWithPartyDiv = $('#chatwparty');

	if (chatWithPartyDiv.length) {
		// Remove the chat with party div if it exists
		chatWithPartyDiv.remove();
	} else {
		console.log("Chat with party div element not found.");
	}
}

// Call the function after 30 seconds
setTimeout(removeChatWithParty, 40000);
//////////////////////////////////////////////////////////////////////////////
// Helper to load the map of saved chest IDs
function loadChestMap() {
	const data = get(CHEST_STORAGE_KEY);
	// Only accept non-null objects that are not arrays
	return (data && typeof data === "object" && !Array.isArray(data))
		? data
		: {};
}

function updateChestButton() {
	const chestMap = loadChestMap();
	const count = Object.keys(chestMap).length;

	add_top_button(
		"chest_status",           // unique button ID
		`Chests: ${count}`,       // button label
		() => show_json(chestMap) // on-click function
	);
}

setInterval(updateChestButton, 250);
//////////////////////////////////////////////////////////////////////////////
function swapDivs() {
	let $ = parent.$;
	let skbar = $('#skillbar');
	let iframelist = $('#iframelist');
	$('#movebottomrighthere').remove();
	$('#skillbar').remove();
	$('#chatwparty').remove();
	//$('#chatinput').remove();
	$('#bottomleftcorner2').children().first().before(`<div id="movebottomrighthere" style="display: flex; flex-direction: row; align-items: flex-end; margin-top: -20px;"></div>`);
	$('#movebottomrighthere').append(skbar);
	//$('#movebottomrighthere').append(iframelist);
}

swapDivs();
/////////////////////////////////////////////////////////////////////////////////////////////////

if (parent.party_style_prepared) {
	parent.$('#style-party-frames').remove();
}

let css = `
		.party-container {
			position: absolute;
			top: 55px;
			left: -15%;
			width: 1000px; 
			height: 300px;
			transform: translate(0%, 0);
			fontFamily: 'pixel';
		}
	`;
//width normal is 480px, translate 8% normal
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name', 'xp', 'level', 'share', 'cc'];
const partyFrameWidth = 80; // Set the desired width for the party frames

function updatePartyData() {
	let myInfo = Object.fromEntries(Object.entries(character).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
	myInfo.lastSeen = Date.now();
	set(character.name + '_newparty_info', myInfo);
}

setInterval(updatePartyData, 200);

function getIFramedCharacter(name) {
	for (const iframe of top.$('iframe')) {
		const char = iframe.contentWindow.character;
		if (!char) continue; // Character isn't loaded yet
		if (char.name == name) return char;
	}
	return null;
}

let show_party_frame_property = {
	img: true,
	hp: true,
	mp: true,
	xp: true,
	cc: true,
	ping: true,
	share: true
};

function get_toggle_text(key) {
	return key.toUpperCase() + (show_party_frame_property[key] ? '✔️' : '❌');
}

function update_toggle_text(key) {
	const toggle = parent.document.getElementById('party-props-toggles-' + key);
	toggle.textContent = get_toggle_text(key);
}

function addPartyFramePropertiesToggles() {
	if (parent.document.getElementById('party-props-toggles')) {
		return;
	}

	const toggles = parent.document.createElement('div');
	toggles.id = 'party-props-toggles';
	toggles.classList.add('hidden');
	toggles.style = `
	display: flex; 
	flex-wrap: wrap;
	width: 100%;
	max-width: 480px;
	background-color: black;
	margin-top: 2px;
`;

	function create_toggle(key) {
		const toggle = parent.document.createElement('button');
		toggle.id = 'party-props-toggles-' + key;
		toggle.setAttribute('data-key', key);
		toggle.style = `
		border: 1px #ccc solid; 
		background-color: #000; 
		color: #ccc;
		width: 20%;
		margin: 0px;
		font-size: 9px;
		padding: 5px;
		cursor: pointer;
	`;
		toggle.setAttribute(
			'onclick',
			`parent.code_eval(show_party_frame_property['${key}'] = !show_party_frame_property['${key}']; update_toggle_text('${key}'));`
		);
		toggle.appendChild(parent.document.createTextNode(get_toggle_text(key)));
		return toggle;
	}

	for (let key of ['img', 'hp', 'mp', 'xp', 'cc']) {
		toggles.appendChild(create_toggle(key));
	}

	//let party = parent.document.getElementById('newparty');
	//let party_parent = party.parentNode;
	//party_parent.append(toggles);

	const rightBottomMenu = parent.document.getElementById("bottomrightcorner");
	const gameLogUi = parent.document.getElementById("gamelog");
	//rightBottomMenu.insertBefore(toggles, gameLogUi);
	// reactivate if you want toggle buttons ^^^^
}

function updatePartyFrames() {
	let $ = parent.$;
	let partyFrame = $('#newparty');
	partyFrame.addClass('party-container');

	if (partyFrame) {
		addPartyFramePropertiesToggles();

		for (let x = 0; x < partyFrame.children().length; x++) {
			let party_member_name = Object.keys(parent.party)[x];
			let info = get(party_member_name + '_newparty_info');
			if (!info || Date.now() - info.lastSeen > 1000) {
				let iframed_party_member = getIFramedCharacter(party_member_name);
				if (iframed_party_member) {
					info = Object.fromEntries(Object.entries(iframed_party_member).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
				} else {
					let party_member = get_player(party_member_name);
					if (party_member) {
						info = Object.fromEntries(Object.entries(party_member).filter(current => { return includeThese.includes(current[0]); }));
					} else {
						info = { name: party_member_name };
					}
				}
			}

			let infoHTML = `<div style="width: ${partyFrameWidth}px; height: 20px; margin-top: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${info.name}</div>`;

			info.max_cc = 200;

			let hpWidth = 0;
			let mpWidth = 0;
			let hp = '??';
			let mp = '??';
			if (info.hp !== undefined) {
				hpWidth = info.hp / info.max_hp * 100;
				mpWidth = info.mp / info.max_mp * 100;
				hp = info.hp;
				mp = info.mp;
			}

			let xpWidth = 0;
			let xp = '??';
			if (info.xp !== undefined) {
				let lvl = info.level;
				let max_xp = G.levels[lvl];
				xpWidth = info.xp / max_xp * 100;
				xp = xpWidth.toFixed(2) + '%';

				//const billion = 1_000_000_000;
				//xp = (info.xp / billion).toFixed(1) + 'b/' + (max_xp / billion).toFixed(0) + 'b';
			}

			let ccWidth = 0;
			let cc = '??';
			if (info.cc !== undefined) {
				ccWidth = info.cc / info.max_cc * 100;
				cc = info.cc.toFixed(2);
			}

			let pingWidth = 0;
			let ping = '??';
			if (character.ping !== undefined) {
				pingWidth = -10;
				ping = character.ping.toFixed(0);
			}

			let shareWidth = 0;
			let share = '??';
			if (parent.party[party_member_name] && parent.party[party_member_name].share !== undefined) {
				shareWidth = parent.party[party_member_name].share * 100;
				share = (parent.party[party_member_name].share * 100).toFixed(2) + '%'; // Display share percentage with % sign
			}

			let data = {
				hp: hp,
				hpWidth: hpWidth,
				hpColor: 'red',
				mp: mp,
				mpWidth: mpWidth,
				mpColor: 'blue',
				xp: xp,
				xpWidth: xpWidth,
				xpColor: 'green',
				cc: cc,
				ccWidth: ccWidth,
				ccColor: 'grey',
				ping: ping,
				pingWidth: pingWidth,
				pingColor: 'black',
				share: share,
				shareWidth: shareWidth * 3,
				shareColor: 'teal',
			};

			for (let key of ['hp', 'mp', 'xp', 'cc']) { // add what you want to see here ['hp', 'mp', 'xp', 'cc', 'ping', 'share']
				const text = key.toUpperCase();
				const value = data[key];
				const width = data[key + 'Width'];
				const color = data[key + 'Color'];
				if (show_party_frame_property[key]) {
					infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
	<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 17px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">${text}: ${value}</div>
	<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${color}; width: ${width}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;
				}
			}

			let party_member_frame = partyFrame.find(partyFrame.children()[x]);
			party_member_frame.children().first().css('display', show_party_frame_property['img'] ? 'inherit' : 'none');
			party_member_frame.children().last().html(`<div style="font-size: 22px;" onclick='pcs(event); party_click("${party_member_name}\");'>${infoHTML}</div>`);
		}
	}
}

parent.$('#party-props-toggles').remove();

setInterval(updatePartyFrames, 500);
///////////////////////////////////////////////////////////////////////////////////////
const ALDATA_KEY = "*************************";

function updateTrackerData() {
	parent.socket.once("tracker", (data) => {
		const url = `https://aldata.earthiverse.ca/achievements/${character.id}/${ALDATA_KEY}`;
		const settings = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ max: data.max, monsters: data.monsters }),
		};
		// if response.status == 200, it was successfully updated
		fetch(url, settings).then((response) => console.log(response.status));
	});
}
parent.socket.emit("tracker");
function hideTracker() {
	parent.hide_modal()
}
setTimeout(hideTracker, 1000);
// Run the updateTrackerData function every minute (60000 milliseconds)
setInterval(updateTrackerData, 1000 * 60 * 10);

function modify_parent_function() {
	const change_parent_function = function () {
		this.render_tracker = function () {
			var a = "";
			a += "<div style='font-size: 32px'>";
			a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerm\").show();'>Monsters</div>";
			a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackere\").show();'>Exchanges and Quests</div>";
			a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerx\").show();'>Stats</div>";
			a += "</div>";

			// Render monsters
			a += "<div class='trackers trackerm'>";
			object_sort(G.monsters, "hpsort").forEach(function (b) {
				if ((!b[1].cute || b[1].achievements) && !b[1].unlist) {
					var c = (tracker.monsters[b[0]] || 0) + (tracker.monsters_diff[b[0]] || 0), d = "#50ADDD";
					let borderColor = "#9F9FB0";

					tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] > c && (c = tracker.max.monsters[b[0]][0], d = "#DCC343");
					if ((tracker.max.monsters[b[0]] && tracker.max.monsters[b[0]][0] && tracker.max.monsters[b[0]][0]) && (b[1] && b[1].achievements)) {
						if (tracker.max.monsters[b[0]][0] >= b[1].achievements[b[1].achievements.length - 1][0]) {
							//borderColor = "#22c725";
						}
					}

					a += "<div style='background-color:#575983; border: 2px solid" + borderColor + ";position: relative; display: inline-block; margin: 2px;'" +
						"class='clickable' onclick='pcs(event); render_monster_info(\"" + b[0] + "\")'>";

					a = 1 > (G.monsters[b[0]].size || 1) ? a + sprite(b[1].skin || b[0], { scale: 1 }) : a + sprite(b[1].skin || b[0], { scale: 1.5 });
					c && (a += "<div style='background-color:#575983; border: 2px solid " + borderColor + "; position: absolute; top: -2px; left: -2px; color:" + d + "; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(c) + "</div>");
					tracker.drops && tracker.drops[b[0]] && tracker.drops[b[0]].length && (a += "<div style='background-color:#FD79B0; border: 2px solid " + borderColor + "; position: absolute; bottom: -2px; right: -2px; display: inline-block; padding: 1px 1px 1px 1px; height: 2px; width: 2px'></div>");
					a += "</div>";
				}
			});
			a += "</div>";

			// Render exchanges and quests
			a += "<div class='trackers trackere hidden' style='margin-top: 3px'>";
			object_sort(G.items).forEach(function (b) {
				if (b[1].e && !b[1].ignore) {
					var c = [[b[0], b[0], void 0]];
					if (b[1].upgrade || b[1].compound) {
						c = [];
						for (var d = 0; 13 > d; d++)
							G.drops[b[0] + d] && c.push([b[0], b[0] + d, d]);
					}

					c.forEach(function (b) {
						a += "<div style='margin-right: 3px; margin-bottom: 3px; display: inline-block; position: relative;'";
						a = G.drops[b[1]] ? a + (" class='clickable' onclick='pcs(event); render_exchange_info(\"" + b[1] + '",' + (tracker.exchanges[b[1]] || 0) + ")'>") : a + ">";
						a += item_container({ skin: G.items[b[0]].skin }, { name: b[0], level: b[2] });
						tracker.exchanges[b[1]] && (a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#ED901C; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(tracker.exchanges[b[1]]) + "</div>");
						a += "</div>";
					});
				}
			});
			a += "</div>";

			// Render achievements
			const kills = parent.tracker.max.monsters;
			const achievements = {};

			for (const mtype in kills) {
				if (!(mtype in G.monsters) || !G.monsters[mtype].achievements) continue;

				const kill_count = kills[mtype][0];

				for (const achievement of G.monsters[mtype].achievements) {
					const needed = achievement[0];
					const type = achievement[1];
					const reward = achievement[2];
					const amount = achievement[3];
					if (kill_count < needed) {
						if (type !== "stat") continue;

						if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0, monsters: [] };
						achievements[reward].value += 0;
						achievements[reward].maxvalue += amount;
						achievements[reward].monsters.push({ mtype, needed, amount });
					}
					else {
						if (type !== "stat") continue;
						if (!achievements[reward]) achievements[reward] = { value: 0, maxvalue: 0, monsters: [] };
						achievements[reward].value += amount;
						achievements[reward].maxvalue += amount;
						achievements[reward].monsters.push({ mtype, needed, amount });
					}
				}
			}

			// Sort achievements alphabetically
			const sortedAchievements = Object.entries(achievements)
				.sort(([a], [b]) => a.localeCompare(b))
				.reduce((obj, [key, value]) => {
					obj[key] = value;
					return obj;
				}, {});

			a += "<div class='trackers trackerx hidden' style='margin-top: 3px'>";
			a += "<div style='font-size: 28px; display: flex; flex-wrap: wrap; justify-content: space-evenly;'>";

			for (const ac in sortedAchievements) {
				const achievement = sortedAchievements[ac];
				const isCompleted = achievement.value >= achievement.maxvalue;

				a += "<div style='background-color:#575983; border: 2px solid #9F9FB0; width: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2px; padding: 10px; text-align: center; position: relative;' onclick='toggleDropdown(\"" + ac + "\")'>";
				a += `${ac}: ${achievement.value.toLocaleString()} of ${achievement.maxvalue.toLocaleString()}`;
				a += "<div id='dropdown-" + ac + "' class='dropdown-content' style='display: none; background-color:#000000; border: 2px solid #9F9FB0; width: 550px; margin-top: 5px; padding: 5px; position: absolute; z-index: 9999; max-height: 500px; overflow-y: auto;'>";

				// Sort monsters by needed value, then alphabetically by monster name
				achievement.monsters.sort((a, b) => {
					if (a.needed !== b.needed) {
						return a.needed - b.needed;
					}
					return a.mtype.localeCompare(b.mtype);
				}).forEach(monster => {
					const isCompleted = tracker.max.monsters[monster.mtype] && tracker.max.monsters[monster.mtype][0] >= monster.needed;
					const fontColor = isCompleted ? 'green' : 'white'; // Font color based on completion status

					a += `<div style='color: ${fontColor};'>Monster: ${monster.mtype} | Needed: ${monster.needed.toLocaleString()} | Amount: ${monster.amount.toLocaleString()}</div>`;
				});

				a += "</div>";
				a += "</div>";
			}

			a += "</div>";
			a += "</div>";

			show_modal(a, {
				wwidth: 578,
				hideinbackground: !0
			});

			// Function to toggle dropdown visibility
			window.toggleDropdown = function (achievement) {
				const dropdown = document.getElementById('dropdown-' + achievement);
				dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
			}
		}

		this.render_drop = function (a, b, c) {
			var d = "";
			if ("open" == a[1]) {
				var e = 0;
				G.drops[a[2]].forEach(function (a) {
					e += a[0];
				});
				G.drops[a[2]].forEach(function (g) {
					d += render_drop(g, b * a[0] / e, c);
				});
				return d;
			}
			d += "<div style='position: relative; white-space: nowrap;'>";
			var f = "", g = void 0;
			G.items[a[1]] ? (f = G.items[a[1]].skin, g = { name: a[1], q: a[2], data: a[3] }) : "empty" == a[1] ? d += "<div style='z-index: 1; background-color:#575983; border: 200px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#C5C7E0; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>ZILCH</div>" : "shells" == a[1] ? (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#8DE33B; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>", f = "shells") : "gold" == a[1] && (d += "<div style='z-index: 1; background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:gold; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(a[2]) + "</div>", f = "gold");
			"cx" == a[1] ? d += cx_sprite(a[2], { mright: 4 }) : "cxbundle" == a[1] ? G.cosmetics.bundle[a[2]].forEach(function (a) {
				d += cx_sprite(a, { mright: 4 });
			}) : d += "<span class='clickable' onclick='pcs(event); render_item_info(\"" + a[1] + '",0,"' + (g && g.data || "") + "\")'>" + item_container({ skin: f }, g) + "</span>";
			d = 1 <= round(a[0] * b) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>" + to_pretty_num(round(a[0] * b)) + " / 1</div>") : 1.1 <= 1 / (a[0] * b) && 10 > 1 / (a[0] * b) && 10 * parseInt(1 / (a[0] * b)) != parseInt(10 / (a[0] * b)) ? d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>10 / " + to_pretty_num(round(10 / (a[0] * b))) + "</div>") : d + ("<div style='vertical-align: middle; display: inline-block; font-size: 24px; line-height: 50px; height: 50px; margin-left: 5px; margin-right: 8px'>1 / " + to_pretty_num(round(1 / (a[0] * b))) + "</div>");
			return d += "</div>";
		}
	}
	// Eval the function string to have to defined in parent scope
	const full_function_text = change_parent_function.toString();
	parent.smart_eval(full_function_text.slice(full_function_text.indexOf("{") + 1, full_function_text.lastIndexOf("}")));
}
modify_parent_function();

// ========== TRACKING STATE ==========
let sumGold = 0, largestGoldDrop = 0;
const goldStartTime = performance.now();
let goldInterval = 'hour';
const goldHistory = [];

let sumXP = 0, largestXPGain = 0;
const xpStartTime = performance.now();
const startXP = character.xp;
let xpInterval = 'second';
const xpHistory = [];

let playerDamageSums = {};
const dpsStartTime = performance.now();
const dpsHistory = {};
let dpsMaxValueSmoothed = 100;

// Chart config
const MAX_HISTORY = 60;
const HISTORY_INTERVAL = 5000;
let lastGoldUpdate = 0;
let lastXpUpdate = 0;
let lastDpsUpdate = 0;

const classColors = {
	mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF',
	ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D'
};

const sectionColors = {
	gold: { primary: '#FFD700', rgba: 'rgba(255, 215, 0, 0.3)', axis: 'rgba(255, 215, 0, 0.1)' },
	xp: { primary: '#87CEEB', rgba: 'rgba(135, 206, 235, 0.3)', axis: 'rgba(135, 206, 235, 0.2)' },
	dps: { primary: '#FF6B6B', rgba: 'rgba(255, 107, 107, 0.3)', axis: 'rgba(255, 107, 107, 0.2)' }
};

// ========== INITIALIZATION ==========
setTimeout(() => {
	const $ = parent.$;
	$('#metricsDashboard').remove();
	if (parent.buttons?.['metrics']) {
		delete parent.buttons['metrics'];
		$('.codebuttonmetrics').remove();
	}
	add_top_button('metrics', 'Metrics', toggleMetricsDashboard);
}, 100);

// ========== DPS TRACKING ==========
function getPlayerEntry(id) {
	return playerDamageSums[id] || (playerDamageSums[id] = {
		startTime: performance.now(), sumDamage: 0, sumBurnDamage: 0,
		sumBlastDamage: 0, sumBaseDamage: 0, sumHeal: 0, sumLifesteal: 0,
		sumManaSteal: 0, sumDamageReturn: 0, sumReflection: 0,
		sumDamageTakenPhys: 0, sumDamageTakenMag: 0
	});
}

function calculateDPS(id, now) {
	const entry = playerDamageSums[id];
	if (!entry) return 0;
	const elapsed = now - entry.startTime;
	if (elapsed <= 0) return 0;
	return Math.floor((entry.sumDamage + entry.sumDamageReturn + entry.sumReflection) * 1000 / elapsed);
}

function calculateTotalDPS() {
	let totalDmg = 0;
	for (const id in playerDamageSums) {
		const e = playerDamageSums[id];
		totalDmg += e.sumDamage + e.sumDamageReturn + e.sumReflection;
	}
	const elapsed = performance.now() - dpsStartTime;
	return Math.floor(totalDmg * 1000 / Math.max(elapsed, 1));
}

parent.socket.on('hit', data => {
	const isParty = id => parent.party_list.includes(id);
	try {
		if (!isParty(data.hid) && !isParty(data.id)) return;

		if (data.dreturn && get_player(data.id) && !get_player(data.hid)) {
			getPlayerEntry(data.id).sumDamageReturn += data.dreturn;
		}
		if (data.reflect && get_player(data.id) && !get_player(data.hid)) {
			getPlayerEntry(data.id).sumReflection += data.reflect;
		}
		if (data.damage && get_player(data.id)) {
			const e = getPlayerEntry(data.id);
			if (data.damage_type === 'physical') e.sumDamageTakenPhys += data.damage;
			else e.sumDamageTakenMag += data.damage;
		}
		if (get_player(data.hid) && (data.heal || data.lifesteal)) {
			getPlayerEntry(data.hid).sumHeal += (data.heal || 0) + (data.lifesteal || 0);
		}
		if (get_player(data.hid) && data.manasteal) {
			getPlayerEntry(data.hid).sumManaSteal += data.manasteal;
		}
		if (data.damage && get_player(data.hid)) {
			const e = getPlayerEntry(data.hid);
			e.sumDamage += data.damage;
			if (data.source === 'burn') e.sumBurnDamage += data.damage;
			else if (data.splash) e.sumBlastDamage += data.damage;
			else e.sumBaseDamage += data.damage;
		}
	} catch (err) {
		console.error('hit handler error', err);
	}
});

// ========== UI CREATION ==========
const createMetricsDashboard = () => {
	const $ = parent.$;
	$('#metricsDashboard').remove();

	const metricCard = (label, valueId) =>
		`<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value" id="${valueId}">0</div></div>`;

	const intervalButtons = (type, buttons) =>
		buttons.map(b => `<button class="interval-btn ${b.active ? 'active' : ''}" data-interval="${b.interval}" data-type="${type}">${b.label}</button>`).join('');

	const dashboard = $(`
		<div id="metricsDashboard">
			<div id="metricsHeader">
				<span id="metricsTitle">Performance Metrics</span>
				<button id="closeBtn">×</button>
			</div>
			<div id="metricsContent">
				<div class="metrics-section" data-section="gold">
					<h3>Gold Tracking</h3>
					<div class="metrics-grid">
						${metricCard('Gold/Hour', 'goldRate')}
						${metricCard('Largest Drop', 'jackpotValue')}
						${metricCard('Total Gold', 'totalGold')}
					</div>
					<div class="interval-selector">
						${intervalButtons('gold', [
		{ interval: 'minute', label: 'Minute' },
		{ interval: 'hour', label: 'Hour', active: true },
		{ interval: 'day', label: 'Day' }
	])}
					</div>
					<canvas id="goldChart" class="metric-chart"></canvas>
				</div>
				
				<div class="metrics-section" data-section="xp">
					<h3>XP Tracking</h3>
					<div class="metrics-grid">
						${metricCard('XP/Second', 'xpRate')}
						${metricCard('Time to Level', 'timeToLevel')}
						${metricCard('Total XP Gained', 'totalXP')}
					</div>
					<div class="interval-selector">
						${intervalButtons('xp', [
		{ interval: 'second', label: 'Second', active: true },
		{ interval: 'minute', label: 'Minute' },
		{ interval: 'hour', label: 'Hour' },
		{ interval: 'day', label: 'Day' }
	])}
					</div>
					<canvas id="xpChart" class="metric-chart"></canvas>
				</div>

				<div class="metrics-section" data-section="dps">
					<h3>DPS Tracking</h3>
					<div class="metrics-grid">
						${metricCard('Party DPS', 'partyDPS')}
						${metricCard('Your DPS', 'yourDPS')}
						${metricCard('Session Time', 'sessionTime')}
					</div>
					<canvas id="dpsChart" class="metric-chart"></canvas>
				</div>
			</div>
		</div>
	`).css({
		position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
		width: '1250px', maxHeight: '120vh', background: 'rgba(20, 20, 30, 0.98)',
		border: '3px solid #6366F1', borderRadius: '10px', zIndex: 9999, display: 'none',
		boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)', overflow: 'hidden',
		fontFamily: $('#bottomrightcorner').css('font-family') || 'pixel'
	});

	$('body').append(dashboard);
	applyStyles($);
	attachEventHandlers($);
};

const applyStyles = ($) => {
	// Base styles
	const styles = {
		'#metricsHeader': {
			background: 'linear-gradient(to right, #1a1a2e, #16213e)', padding: '12px 15px',
			borderBottom: '2px solid #3436a0ff', display: 'flex', justifyContent: 'space-between',
			alignItems: 'center', borderRadius: '7px 7px 0 0', userSelect: 'none'
		},
		'#metricsTitle': { color: '#3436a0ff', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(99, 102, 241, 0.5)' },
		'#closeBtn': { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #6366F1', color: '#6366F1', fontSize: '20px', width: '30px', height: '30px', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s' },
		'#metricsContent': { padding: '15px', color: 'white', height: 'calc(90vh - 70px)', overflowY: 'auto', overflowX: 'hidden' },
		'.metrics-section': { marginBottom: '20px', padding: '15px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' },
		'.metrics-section h3': { marginTop: '0', marginBottom: '15px', fontSize: '28px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' },
		'.metrics-grid': { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' },
		'.metric-card': { background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '8px', textAlign: 'center' },
		'.metric-label': { fontSize: '20px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' },
		'.metric-value': { fontSize: '24px', fontWeight: 'bold' },
		'.interval-selector': { display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'center' },
		'.interval-btn': { padding: '8px 15px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', borderRadius: '5px', transition: 'all 0.2s', fontSize: '12px' },
		'.metric-chart': { width: '100%', height: '550px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', display: 'block' }
	};

	// Apply base styles
	Object.entries(styles).forEach(([sel, style]) => $(sel).css(style));

	// Section-specific border colors
	$('.metrics-section').each(function () {
		const section = $(this).data('section'); // gold, xp, dps
		const color = sectionColors[section]?.rgba || 'rgba(255,255,255,0.2)';
		$(this).css('border', `2px solid ${color}`); // slightly thicker for visibility
		// Optionally adjust h3 title color
		$(this).find('h3').css('color', sectionColors[section]?.primary || '#FFF');
	});

	// Chart-specific styling
	Object.entries(sectionColors).forEach(([section, colors]) => {
		$(`[data-section="${section}"] .metric-card`).css('border', `1px solid ${colors.rgba}`);
		$(`[data-section="${section}"] .metric-value`).css('color', colors.primary);
		$(`[data-section="${section}"] .interval-btn`).css('border', `1px solid ${colors.primary}`);
		$(`[data-section="${section}"] .metric-chart`).css('border', `1px solid ${colors.rgba}`);
	});
};

const attachEventHandlers = ($) => {
	$('#closeBtn').on('click', () => $('#metricsDashboard').hide());

	$('.interval-btn').on('click', function () {
		const type = $(this).data('type');
		const interval = $(this).data('interval');
		const color = sectionColors[type].primary;

		$(`[data-type="${type}"]`).removeClass('active').css('background', 'rgba(255, 255, 255, 0.1)');
		const hexToRgba = (hex, a) =>
			`rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
		$(this).css('background', hexToRgba(color, 0.2));

		const intervalState = {
			gold: { get: () => goldInterval, set: v => goldInterval = v, reset: resetGoldHistory },
			xp: { get: () => xpInterval, set: v => xpInterval = v, reset: resetXpHistory }
		};

		const s = intervalState[type];
		if (s && s.get() !== interval) {
			s.set(interval);
			s.reset();
		}

		updateMetricsDashboard();
	});

	$('#closeBtn').hover(
		function () { $(this).css('background', 'rgba(99, 102, 241, 0.3)'); },
		function () { $(this).css('background', 'rgba(255, 255, 255, 0.1)'); }
	);
};


// ========== UPDATE LOGIC ==========
let $goldRate, $jackpotValue, $totalGold, $goldLabel;
let $xpRate, $totalXP, $timeToLevel, $xpLabel;
let $partyDPS, $yourDPS, $sessionTime;

const updateMetricsDashboard = () => {
	const $ = parent.$;
	const now = performance.now();

	if (!$goldRate) {
		$goldRate = $('#goldRate');
		$jackpotValue = $('#jackpotValue');
		$totalGold = $('#totalGold');
		$goldLabel = $('[data-section="gold"] .metric-label').first();

		$xpRate = $('#xpRate');
		$totalXP = $('#totalXP');
		$timeToLevel = $('#timeToLevel');
		$xpLabel = $('[data-section="xp"] .metric-label').first();

		$partyDPS = $('#partyDPS');
		$yourDPS = $('#yourDPS');
		$sessionTime = $('#sessionTime');
	}

	const avgGold = calculateAverageGold();
	$goldRate.text(avgGold.toLocaleString('en'));
	$jackpotValue.text(largestGoldDrop.toLocaleString('en'));
	$totalGold.text(sumGold.toLocaleString('en'));
	$goldLabel.text(`Gold/${goldInterval.charAt(0).toUpperCase() + goldInterval.slice(1)}`);

	if (now - lastGoldUpdate >= HISTORY_INTERVAL) {
		goldHistory.push({ time: now, value: avgGold });
		if (goldHistory.length > MAX_HISTORY) goldHistory.shift();
		lastGoldUpdate = now;
	}

	const xpGained = character.xp - startXP;
	const avgXP = calculateAverageXP();
	$xpRate.text(avgXP.toLocaleString('en'));
	$totalXP.text(xpGained.toLocaleString('en'));

	const xpMissing = parent.G.levels[character.level] - character.xp;
	const elapsedSec = Math.round((now - xpStartTime) / 1000);

	if (elapsedSec > 0 && xpGained > 0) {
		const secondsToLevel = Math.round(xpMissing / (xpGained / elapsedSec));
		$timeToLevel.css('fontSize', '24px').text(elapsedSec > 0 && xpGained > 0 ? formatTime(secondsToLevel) : '--');
	} else {
		$timeToLevel.text('--');
	}

	$xpLabel.text(`XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}`);

	if (now - lastXpUpdate >= HISTORY_INTERVAL) {
		xpHistory.push({ time: now, value: avgXP });
		if (xpHistory.length > MAX_HISTORY) xpHistory.shift();
		lastXpUpdate = now;
	}

	const totalDPS = calculateTotalDPS();
	const yourDPS = calculateDPS(character.id, now);
	$partyDPS.text(totalDPS.toLocaleString('en'));
	$yourDPS.text(yourDPS.toLocaleString('en'));

	const elapsedMs = now - dpsStartTime;
	const hours = Math.floor(elapsedMs / 3600000);
	const minutes = Math.floor((elapsedMs % 3600000) / 60000);
	$sessionTime.text(hours ? `${hours}h ${minutes}m` : `${minutes}m`);

	if (now - lastDpsUpdate >= HISTORY_INTERVAL) {
		for (const id in playerDamageSums) {
			if (!dpsHistory[id]) dpsHistory[id] = [];
			const dps = calculateDPS(id, now);
			dpsHistory[id].push({ time: now, value: dps });
			if (dpsHistory[id].length > MAX_HISTORY) dpsHistory[id].shift();
		}
		lastDpsUpdate = now;
	}

	drawChart('goldChart', [{ history: goldHistory, color: sectionColors.gold.primary }], sectionColors.gold.primary);
	drawChart('xpChart', [{ history: xpHistory, color: sectionColors.xp.primary }], sectionColors.xp.primary);
	drawChart('dpsChart', getDPSLines(), sectionColors.dps.primary);
};


// ========== CHART DRAWING ==========
const getDPSLines = () => {
	let currentMax = 1;
	const lines = [];

	for (const id in dpsHistory) {
		const history = dpsHistory[id];
		if (!history?.length) continue;

		for (const p of history) currentMax = Math.max(currentMax, p.value);

		const player = get_player(id);
		if (player && history.length >= 2) {
			lines.push({
				history,
				color: classColors[player.ctype] || '#FFF',
				label: player.name
			});
		}
	}

	dpsMaxValueSmoothed = dpsMaxValueSmoothed * 0.95 + currentMax * 0.05;
	lines.forEach(l => l.smoothedMax = Math.max(dpsMaxValueSmoothed, currentMax));

	return lines;
};

const drawChart = (canvasId, lines, sectionColor) => {
	const canvas = parent.document.getElementById(canvasId);
	if (!canvas || !parent.$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let hasData = false;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].history.length >= 2) {
			hasData = true;
			break;
		}
	}

	if (!hasData) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Collecting data...', canvas.width / 2, canvas.height / 2);
		return;
	}

	let lastMinutes = 0;
	if (lines.length && lines[0].history.length > 1) {
		const hist = lines[0].history;
		const firstTime = hist[0].time;
		const lastTime = hist[hist.length - 1].time;
		lastMinutes = Math.round((lastTime - firstTime) / 60000);
	}

	let maxValue = 1;
	for (let i = 0; i < lines.length; i++) {
		const lineMax = lines[i].smoothedMax || Math.max(...lines[i].history.map(d => d.value), 1);
		if (lineMax > maxValue) maxValue = lineMax;
	}
	maxValue *= 1.2;
	const range = maxValue || 1;

	ctx.font = '18px pixel, monospace';
	const padding = ctx.measureText(maxValue.toLocaleString()).width + 15;
	const labelSpace = lines[0].label ? 60 : 0;
	const gw = canvas.width - 2 * padding - labelSpace;
	const gh = canvas.height - 2 * padding;
	const axisColor = sectionColors[canvasId.replace('Chart', '').toLowerCase()]?.axis || 'rgba(255,255,255,0.1)';

	ctx.strokeStyle = axisColor;
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + gh * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();
	}

	ctx.strokeStyle = axisColor;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, canvas.height - padding);
	ctx.lineTo(canvas.width - padding, canvas.height - padding);
	ctx.stroke();

	for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
		const line = lines[lineIdx];
		const history = line.history;
		const color = line.color;
		const histLen = history.length - 1;

		if (lines.length === 1) {
			const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
			gradient.addColorStop(0, color + '4D');
			gradient.addColorStop(1, color + '0D');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.moveTo(padding, canvas.height - padding);
			for (let i = 0; i < history.length; i++) {
				const x = padding + gw * i / histLen;
				const y = canvas.height - padding - gh * history[i].value / range;
				ctx.lineTo(x, y);
			}
			ctx.lineTo(padding + gw, canvas.height - padding);
			ctx.closePath();
			ctx.fill();
		}

		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let i = 0; i < history.length; i++) {
			const x = padding + gw * i / histLen;
			const y = canvas.height - padding - gh * history[i].value / range;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();

		ctx.fillStyle = color;
		for (let i = 0; i < history.length; i++) {
			const x = padding + gw * i / histLen;
			const y = canvas.height - padding - gh * history[i].value / range;
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI);
			ctx.fill();
		}

		if (line.label) {
			const last = history[histLen];
			const lastY = canvas.height - padding - gh * last.value / range;
			ctx.font = '16px pixel, monospace';
			ctx.textAlign = 'left';
			ctx.fillText(line.label, padding + gw + 6, lastY + 4);
		}
	}

	ctx.fillStyle = sectionColor;
	ctx.font = '18px pixel, monospace';
	ctx.textAlign = 'right';
	for (let i = 0; i <= 5; i++) {
		const value = Math.round(range * i / 5);
		const y = canvas.height - padding - (gh * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 6, y + 4);
	}
	ctx.textAlign = 'center';
	ctx.fillText(`Last ${lastMinutes} min${lastMinutes !== 1 ? 's' : ''}`, canvas.width / 2, canvas.height - 10);
};

// ========== HELPER FUNCTIONS ==========
const intervalSeconds = {
	second: 1,
	minute: 60,
	hour: 3600,
	day: 86400
};

const calculateAverageGold = () => {
	const elapsed = (performance.now() - goldStartTime) / 1000;
	const divisor = elapsed / intervalSeconds[goldInterval];
	return divisor > 0 ? Math.round(sumGold / divisor) : 0;
};

const calculateAverageXP = () => {
	const elapsed = (performance.now() - xpStartTime) / 1000;
	const divisor = elapsed / intervalSeconds[xpInterval];
	return divisor > 0 ? Math.round((character.xp - startXP) / divisor) : 0;
};

const formatTime = (seconds) => {
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${d}d ${h}h ${m}m`;
};

const resetGoldHistory = () => {
	goldHistory.length = 0;
	lastGoldUpdate = 0;
};

const resetXpHistory = () => {
	xpHistory.length = 0;
	lastXpUpdate = 0;
};

// ========== EVENT LISTENERS ==========
let updateInterval;

const toggleMetricsDashboard = () => {
	const $ = parent.$;
	let dashboard = $('#metricsDashboard');
	if (dashboard.length === 0) {
		createMetricsDashboard();
		dashboard = $('#metricsDashboard');
	}

	if (dashboard.is(':visible')) {
		dashboard.hide();
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}
	} else {
		dashboard.show();
		updateMetricsDashboard();
		if (!updateInterval) {
			updateInterval = setInterval(updateMetricsDashboard, 1000);
		}
	}
};

character.on("loot", (data) => {

	if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
		const count = Object.keys(parent.party).filter(name =>
			name === character.name || parent.entities[name]?.owner === character.owner
		).length;
		const myGold = Math.round(data.gold * count);
		sumGold += myGold;
		if (myGold > largestGoldDrop) largestGoldDrop = myGold;
	}
	if (data.items && Array.isArray(data.items)) {
		data.items.forEach((item) => {
			let quantity = item.q !== undefined ? item.q : 1;
			let savedLoot = JSON.parse(localStorage.getItem(CONFIG.looting.lootMonth) || "{}");

			if (savedLoot[item.name]) {
				savedLoot[item.name] += quantity;
			} else {
				savedLoot[item.name] = quantity;
			}
			localStorage.setItem(CONFIG.looting.lootMonth, JSON.stringify(savedLoot));
			console.log(`Looted: ${item.name}, Quantity: ${quantity}`);

			if (rareItems[item.name]) {
				console.log(`Sending ${item.name} to Discord!`);
				sendRareLootToDiscord(
					item.name,
					quantity,
					rareItems[item.name],
					MENTION_USER_ID,
					item.looter || character.name
				);
			}
		});
	}
});
