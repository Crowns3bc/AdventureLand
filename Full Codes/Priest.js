// autorerun
// ============================================================================
// CONFIGURATION - Toggle features here instead of editing code
// ============================================================================
const home = 'targetron';
const mobMap = 'uhills';
const allBosses = ['grinch', 'icegolem', 'dragold', 'mrgreen', 'mrpumpkin', 'greenjr', 'jr', 'franky', 'rgoo', 'bgoo'];

const CONFIG = {
	combat: {
		enabled: true,
		zapperEnabled: true,
		zapperMobs: [home, ...allBosses, 'sparkbot'],
		targetPriority: ['CrownTown', 'CrownPriest'],
		allBosses,
	},

	movement: {
		enabled: true,
		circleWalk: true,
		circleSpeed: 1.8,
		circleRadius: 25,
		avoidMobs: true //to be implemented
	},

	support: {
		partyHealThreshold: 0.65,
		partyHealMinMp: 2000,
		absorbEnabled: true,
		darkBlessingEnabled: true
	},

	looting: {
		enabled: true,
		chestThreshold: 10,
		targetCount: 8,
		equipGoldGear: true,
		lootCooldown: 3000
	},

	equipment: {
		autoSwapSets: true,
		bossLuckSwitch: true,
		bossHpThresholds: {
			mrpumpkin: 300000,
			mrgreen: 300000,
			bscorpion: 75000,
			pinkgoblin: 75000
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
};

// ============================================================================
// CONSTANTS - Named values instead of magic numbers
// ============================================================================
const TICK_RATE = {
	main: 100,      // Main game loop
	action: 1,     // Combat/skill actions (dynamic)
	maintenance: 2000  // Inventory, potions, etc
};

const COOLDOWNS = {
	equipSwap: 300,
	zapperSwap: 200,
	cc: 125
};

const EVENT_LOCATIONS = [
	{ name: 'mrpumpkin', map: 'halloween', x: -222, y: 720 },
	{ name: 'mrgreen', map: 'spookytown', x: 610, y: 1000 }
];

const CACHE_TTL = 100; // Cache validity in ms

// ============================================================================
// STATE & CACHE
// ============================================================================
const state = {
	current: 'idle', // idle, looting, moving
	skinReady: false,
	lastEquipTime: 0,
	lastLootTime: 0,
	angle: 0,
	lastAngleUpdate: performance.now()
};

const cache = {
	target: null,
	healTarget: null,
	zapTargets: [],
	partyMembers: [],
	nearestBoss: null,
	lastUpdate: 0,

	isValid() {
		return Date.now() - this.lastUpdate < CACHE_TTL;
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
	bluefairy: [{ x: -357, y: -675 }],
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
	sparkbot: [{ x: -544, y: -275 }],
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
	zapOn: [
		{ itemName: "zapper", slot: "ring2", level: 2, l: "u" }
	],
	zapOff: [
		{ itemName: "ringofluck", slot: "ring2", level: 2, l: "l" }
	],
	luck: [
		{ itemName: "xhelmet", slot: "helmet", level: 9, l: "l" },
		{ itemName: "tshirt88", slot: "chest", level: 4, l: "l" },
		{ itemName: "starkillers", slot: "pants", level: 8, l: "l" },
		{ itemName: "wingedboots", slot: "shoes", level: 9, l: "l" },
		{ itemName: "mpxgloves", slot: "gloves", level: 7, l: "l" },
		{ itemName: "sbelt", slot: "belt", level: 2, l: "l" },
		{ itemName: "lmace", slot: "mainhand", level: 9, l: "l" },
		{ itemName: "mshield", slot: "offhand", level: 10, l: "l" },
		{ itemName: "ringofluck", slot: "ring1", level: 2, l: "u" },
		{ itemName: "ringofluck", slot: "ring2", level: 2, l: "l" },
		{ itemName: "rabbitsfoot", slot: "orb", level: 3, l: "l" },
		{ itemName: "mpxamulet", slot: "amulet", level: 1, l: "l" },
		{ itemName: "gcape", slot: "cape", level: 9, l: "l" },
		{ itemName: "mearring", slot: "earring1", level: 1, l: "l" },
		{ itemName: "mearring", slot: "earring2", level: 1, l: "u" }
	],
	gold: [
		{ itemName: "wcap", slot: "helmet", level: 6, l: "l" },
		{ itemName: "wattire", slot: "chest", level: 6, l: "l" },
		{ itemName: "wbreeches", slot: "pants", level: 6, l: "l" },
		{ itemName: "wshoes", slot: "shoes", level: 6, l: "l" },
		{ itemName: "handofmidas", slot: "gloves", level: 9, l: "l" },
		{ itemName: "goldring", slot: "ring1", level: 1, l: "l" },
		{ itemName: "goldring", slot: "ring2", level: 0, l: "u" },
		{ itemName: "spookyamulet", slot: "amulet", level: 1, l: "l" }
	]
};

// ============================================================================
// CORE UTILITIES
// ============================================================================
function updateCache() {
	if (cache.isValid()) return;

	cache.target = findBestTarget();
	cache.healTarget = findHealTarget();
	cache.zapTargets = findZapTargets();
	cache.partyMembers = getPartyMembers();
	cache.nearestBoss = findNearestBoss();
	cache.lastUpdate = Date.now();
}

function findBestTarget() {
	// Priority 1: Bosses
	for (const bossType of CONFIG.combat.allBosses) {
		const boss = get_nearest_monster_v2({
			type: bossType,
			max_distance: character.range
		});
		if (boss) return boss;
	}

	// Priority 2: Named targets
	for (const name of CONFIG.combat.targetPriority) {
		const target = get_nearest_monster_v2({
			target: name,
			check_min_hp: true,
			max_distance: character.range
		});
		if (target) return target;
	}

	return null;
}

function findHealTarget() {
	const partyNames = Object.keys(get_party() || {});
	let lowest = character;
	let lowestPct = character.hp / character.max_hp;

	for (const name of partyNames) {
		const ally = get_player(name);
		if (!ally || ally.rip) continue;

		const pct = ally.hp / ally.max_hp;
		if (pct < lowestPct) {
			lowestPct = pct;
			lowest = ally;
		}
	}

	return lowest;
}

function findZapTargets() {
	if (!CONFIG.combat.zapperEnabled) return [];

	return Object.values(parent.entities).filter(e =>
		e &&
		e.type === 'monster' &&
		!e.target &&
		CONFIG.combat.zapperMobs.includes(e.mtype) &&
		is_in_range(e, 'zapperzap') &&
		e.visible &&
		!e.dead
	);
}

function getPartyMembers() {
	return Object.keys(get_party() || {});
}

function findNearestBoss() {
	for (const bossType of CONFIG.combat.allBosses) {
		const boss = get_nearest_monster_v2({ type: bossType });
		if (boss) return { mob: boss, type: bossType };
	}
	return null;
}

// ============================================================================
// MAIN TICK LOOP - Handles state updates, caching, movement
// ============================================================================
async function mainLoop() {
	try {
		if (is_disabled(character)) {
			return setTimeout(mainLoop, 250);
		}

		updateCache();

		// Handle events (bosses, holiday)
		if (shouldHandleEvents()) {
			handleEvents();
		}
		// Handle looting
		else if (shouldLoot()) {
			await handleLooting();
		}
		// Normal hunting behavior
		else if (CONFIG.movement.enabled) {
			if (!get_nearest_monster({ type: home })) {
				handleReturnHome();
			} else if (CONFIG.movement.circleWalk) {
				walkInCircle();
			}
		}

		// Equipment management
		if (CONFIG.equipment.autoSwapSets && state.skinReady) {
			handleEquipmentSwap();
		}

	} catch (e) {
		console.error('mainLoop error:', e);
	}

	setTimeout(mainLoop, TICK_RATE.main);
}

// ============================================================================
// ACTION LOOP - Combat and healing only
// ============================================================================
async function actionLoop() {
	let delay = 1;

	try {
		if (is_disabled(character)) {
			return setTimeout(actionLoop, 25);
		}

		updateCache();

		// Healing priority
		if (await tryHeal()) {
			delay = ms_to_next_skill('attack');
			return setTimeout(actionLoop, delay);
		}

		// Attack
		const target = cache.target;
		if (target && is_in_range(target) && !smart.moving) {
			await attack(target);
			delay = ms_to_next_skill('attack');
		}

	} catch (e) {
		console.error('actionLoop error:', e);
		delay = 25;
	}

	setTimeout(actionLoop, delay);
}

// ============================================================================
// SKILL LOOP - Independent skill management
// ============================================================================
async function skillLoop() {
	const delay = 40;

	try {
		if (is_disabled(character)) {
			return setTimeout(skillLoop, 250);
		}

		updateCache();

		const penalty = character.s?.penalty_cd?.ms || 0;

		// Curse
		if (CONFIG.combat.enabled) {
			await handleCurse();
		}

		// Absorb - high priority, frequent checks
		if (CONFIG.support.absorbEnabled && penalty < 500) {
			await handleAbsorb();
		}

		// Party Heal
		if (character.party) {
			await handlePartyHeal();
		}

		// Dark Blessing
		if (CONFIG.support.darkBlessingEnabled && !is_on_cooldown('darkblessing')) {
			await use_skill('darkblessing');
		}

		// Zapper
		if (CONFIG.combat.zapperEnabled) {
			await handleZapper();
		}

	} catch (e) {
		console.error('skillLoop error:', e);
	}

	setTimeout(skillLoop, delay);
}

async function tryHeal() {
	const healTarget = cache.healTarget;
	if (!healTarget) return false;

	const healThreshold = healTarget.max_hp - character.heal / 1.33;

	if (healTarget.hp < healThreshold && is_in_range(healTarget)) {
		await heal(healTarget);
		return true;
	}

	return false;
}

async function handleCurse() {
	if (is_on_cooldown('curse') || smart.moving) return;

	const X = locations[home][0].x;
	const Y = locations[home][0].y;

	let target = null;

	// Boss priority
	for (const b of CONFIG.combat.allBosses) {
		const mb = get_nearest_monster_v2({ type: b });
		if (mb) {
			target = mb;
			break;
		}
	}

	// Home mob
	if (!target) {
		target = get_nearest_monster_v2({
			type: home,
			check_max_hp: true,
			max_distance: 175,
			point_for_distance_check: [X, Y]
		});
	}

	if (target && target.hp >= target.max_hp * 0.01 && !target.immune && is_in_range(target, 'curse')) {
		await use_skill('curse', target);
	}
}

async function handleAbsorb() {
	if (is_on_cooldown('absorb')) return;

	const mapsToExclude = ['level2n', 'level2w'];
	if (mapsToExclude.includes(character.map)) return;

	// Boss check - ALWAYS absorb boss targets (highest priority)
	const boss = get_nearest_monster_v2({ type: CONFIG.combat.allBosses });
	if (boss?.target && boss.target !== character.name) {
		const targetPlayer = get_player(boss.target);
		if (targetPlayer) {
			await use_skill('absorb', boss.target);
			game_log(`Boss Absorb → ${boss.mtype} from ${boss.target}`, '#FF3333');
			return;
		}
	}

	// Party absorb - check in real-time, not from cache
	if (!character.party) return;

	const partyNames = Object.keys(get_party());
	const allies = partyNames.filter(n => n !== character.name);
	if (!allies.length) return;

	// Find ANY monster targeting party members
	// This ensures we catch all threats, not just one
	for (let id in parent.entities) {
		const entity = parent.entities[id];
		if (!entity || entity.type !== 'monster' || entity.dead) continue;

		// If this monster is targeting an ally and not us
		if (entity.target && allies.includes(entity.target) && entity.target !== character.name) {
			await use_skill('absorb', entity.target);
			game_log(`Absorbing ${entity.target}`, '#FFA600');
			return;
		}
	}
}

async function handlePartyHeal() {
	let threshold = CONFIG.support.partyHealThreshold;

	if (character.map !== mobMap) {
		threshold = 0.99;
	}

	if (character.mp <= CONFIG.support.partyHealMinMp || is_on_cooldown('partyheal')) return;

	for (const name of cache.partyMembers) {
		const ally = get_player(name);
		if (!ally || ally.rip || ally.hp >= ally.max_hp * threshold) continue;

		await use_skill('partyheal');
		break;
	}
}

async function handleZapper() {
	const targets = findZapTargets();
	const now = Date.now();
	const hasZapper = character.slots.ring2?.name === 'zapper';
	const canSwap = now - state.lastEquipTime > COOLDOWNS.zapperSwap;
	const hasEnoughMp = character.mp > (G?.skills?.zapperzap?.mp || 0) + 1250;

	if (smart.moving || character.cc > COOLDOWNS.cc) return;

	// Step 1: Equip zapper if untargeted mobs exist and we don't have it equipped
	if (targets.length > 0 && !hasZapper && canSwap && hasEnoughMp && character.map === mobMap) {
		try {
			await equipSet('zapOn');
			state.lastEquipTime = now;
		} catch (e) {
			console.error('Failed to equip zapper:', e);
		}
		return;
	}

	// Step 2: Zap all untargeted mobs if we have zapper equipped
	if (targets.length > 0 && hasZapper && hasEnoughMp && !is_on_cooldown('zapperzap')) {
		for (const entity of targets) {
			if (is_on_cooldown('zapperzap')) break;

			try {
				await use_skill('zapperzap', entity);
			} catch (e) {
				// Silently continue on skill errors
			}
		}
	}

	// Step 3: Only unequip zapper when NO untargeted mobs remain
	// Don't unequip just because we zapped them all - they might respawn
	if (targets.length === 0 && hasZapper && canSwap && character.map === mobMap) {
		try {
			await equipSet('zapOff');
			state.lastEquipTime = now;
		} catch (e) {
			console.error('Failed to unequip zapper:', e);
		}
	}
}

// ============================================================================
// MAINTENANCE LOOP - Inventory, potions, party management
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
// POTION HANDLER - Separate from maintenance for faster response
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
// MOVEMENT FUNCTIONS
// ============================================================================
function shouldHandleEvents() {
	const holidaySpirit =
		parent?.S?.holidayseason && !character?.s?.holidayspirit;

	const hasHandleableEvent = EVENT_LOCATIONS.some(e =>
		parent?.S?.[e.name]?.live
	);

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
function shouldLoot() {
	if (!CONFIG.looting.enabled || !state.skinReady || character.cc > COOLDOWNS.cc) return false;

	const now = Date.now();
	const storedChestCount = Object.keys(loadChestMap()).length;
	const penalty = character.s?.penalty_cd?.ms || 0;
	const cooldownPass = now - state.lastLootTime > CONFIG.looting.lootCooldown;

	return (
		storedChestCount >= CONFIG.looting.chestThreshold &&
		character.targets < CONFIG.looting.targetCount &&
		cooldownPass &&
		penalty === 0 &&
		state.current !== 'looting'
	);
}

async function handleLooting() {
	state.lastLootTime = Date.now();
	state.current = 'looting';

	try {
		if (CONFIG.looting.equipGoldGear && !isSetEquipped('gold')) {
			equipSet('gold');
			swapBooster('luckbooster', 'goldbooster');
			await sleep(150);
		}

		let looted = 0;
		const maxLoots = CONFIG.looting.chestThreshold * 5;

		// Loot stored chest IDs from localStorage
		const storedChests = loadChestMap();
		for (const chestId in storedChests) {
			if (looted >= maxLoots) break;
			parent.open_chest(chestId);
			looted++;
		}

		await sleep(75);

		if (CONFIG.looting.equipGoldGear) {
			swapBooster('goldbooster', 'luckbooster');
		}
	} catch (e) {
		console.error('Looting error:', e);
	} finally {
		state.current = 'idle';
	}
}

const CHEST_STORAGE_KEY = "loot_chest_ids";
function loadChestMap() {
	const data = get(CHEST_STORAGE_KEY);
	return typeof data === "object" && data !== null ? data : {};
}

function removeChestId(id) {
	const stored = loadChestMap();
	if (stored[id]) {
		delete stored[id];
		saveChestMap(stored);
	}
}

function saveChestMap(map) {
	set(CHEST_STORAGE_KEY, map);
}
// ============================================================================
// EQUIPMENT MANAGEMENT
// ============================================================================
function handleEquipmentSwap() {
	if (!CONFIG.equipment.autoSwapSets || character.cc > COOLDOWNS.cc) return;

	const now = Date.now();
	if (now - state.lastEquipTime < COOLDOWNS.equipSwap) return;

	let targetSet = 'luck';

	if (CONFIG.equipment.bossLuckSwitch && cache.nearestBoss) {
		const { mob, type } = cache.nearestBoss;
		const threshold = CONFIG.equipment.bossHpThresholds[type] || 0;
		targetSet = mob.hp < threshold ? 'luck' : 'luck';
	}

	if (!isSetEquipped(targetSet)) {
		state.lastEquipTime = now;
		equipSet(targetSet);
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
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function clearInventory() {
	let lootMule = get_player('CrownsAnal') || get_player('CrownMerch');
	if (!lootMule) return;

	if (character.gold > 5000000) {
		send_gold(lootMule, character.gold - 5000000);
	}

	const itemsToExclude = ['hpot1', 'mpot1', 'luckbooster', 'goldbooster', 'xpbooster', 'elixirluck', 'xptome', 'essenceoflife'];

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
		tracker: 0,
		computer: 1,
		hpot1: 2,
		mpot1: 3,
		luckbooster: 4,
		elixirluck: 5,
		xptome: 6
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
	const required = 'elixirluck';
	const currentElixir = character.slots.elixir?.name;
	const currentQty = quantity(required);

	if (currentElixir !== required) {
		const slot = locate_item(required);
		if (slot !== -1) use(slot);
	}

	if (currentQty < 2) {
		buy(required, 2 - currentQty);
	}
}

function swapBooster(current, target) {
	const slot = locate_item(current);
	if (slot !== -1) shift(slot, target);
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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function suicide() {
	if (!character.rip && character.hp < 2000) {
		parent.socket.emit('harakiri');
		game_log("Harakiri");
	}

	if (character.rip && locate_item("xptome") !== -1) {
		respawn();
	}
}
setInterval(suicide, 50);
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

		// Allow type to be an array for multiple types
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

		// Status effects check
		if (args.statusEffects && !args.statusEffects.every(effect => current.s[effect])) continue;

		// Min/max XP check
		if (args.min_xp !== undefined && current.xp < args.min_xp) continue;
		if (args.max_xp !== undefined && current.xp > args.max_xp) continue;

		// Attack limit
		if (args.max_att !== undefined && current.attack > args.max_att) continue;

		// Path check
		if (args.path_check && !can_move_to(current)) continue;

		// Distance calculation
		let c_dist = args.point_for_distance_check
			? Math.hypot(args.point_for_distance_check[0] - current.x, args.point_for_distance_check[1] - current.y)
			: parent.distance(character, current);

		if (args.max_distance !== undefined && c_dist > args.max_distance) continue;

		// HP check
		if (args.check_min_hp || args.check_max_hp) {
			let c_hp = current.hp;
			if ((args.check_min_hp && c_hp < optimal_hp) || (args.check_max_hp && c_hp > optimal_hp)) {
				optimal_hp = c_hp;
				target = current;
			}
			continue;
		}

		// Closest monster
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
	const ms = parent.next_skill[skill].getTime() - Date.now() - Math.min(...parent.pings);
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

		// Check if already equipped
		let found = false;
		if (parent.character.slots[slot]) {
			let slotItem = parent.character.items[parent.character.slots[slot]];
			if (slotItem && slotItem.name === itemName && slotItem.level === level && slotItem.l === l) {
				found = true;
			}
		}

		if (found) continue;

		// Find item in inventory
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

// ============================================================================
// SKIN CHANGER
// ============================================================================

const skinConfigs = {
	priest: {
		skin: 'tm_white',
		skinRing: { name: 'tristone', level: 0, locked: 'l' },
		normalRing: { name: 'ringofluck', level: 2, locked: 'u' }
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
		state.skinReady = true; // Allow code to continue even if no config
		return;
	}

	// 1. Ensure correct skin
	if (character.skin !== config.skin) {
		console.log(`Applying skinRing: ${config.skinRing.name} lvl ${config.skinRing.level}`);
		skinNeeded(config.skinRing.name, config.skinRing.level, 'ring1', config.skinRing.locked);
		await sleep(500);
		return skinChanger();
	}

	// 2. Ensure correct normal ring
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
	if (!mob) return;

	const mobName = mob.mtype;
	const mobTarget = mob.target;

	const partyMembers = Object.keys(get_party() || {});

	if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
		const luckDisplay = mob.cooperative ? character.luckm : data.luckm;
		const msg = `${mobName} died with ${luckDisplay} luck`;
		game_log(msg, '#96a4ff');
		console.log(msg);
	}
});

character.on('loot', data => {
	if (data.id) {
		console.log(`${data.opener} looted chest goldm: ${data.goldm}`);
		game_log(`${data.opener} looted chest goldm: ${data.goldm}`, 'gold');

		// Remove chest ID after successful loot with delay to ensure it's gone
		setTimeout(() => {
			removeChestId(data.id);
		}, 2000);
	}
});

// ============================================================================
// START ALL LOOPS
// ============================================================================

mainLoop();
actionLoop();
skillLoop();
maintenanceLoop();
potionLoop();
