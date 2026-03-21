// ============================================================================
// CONFIGURATION
// ============================================================================
const home = 'targetron';
const mobMap = 'uhills';
const homeServer = 'USIII';
const allBosses = ['grinch', 'icegolem', 'dragold', 'mrgreen', 'mrpumpkin', 'greenjr', 'jr', 'franky', 'rgoo', 'bgoo', 'crabxx'];

const CONFIG = {
	combat: {
		enabled: true,
		targetPriority: ['CrownPriest'],
		alwaysAttack: ['crabx'],
		attackIfTargeted: [...allBosses, 'phoenix'],
		neverAttack: ['nerfedmummy', 'bat'],
		useHuntersMark: true,
		useSupershot: true,
		minTargetsFor5Shot: 4,
		minTargetsFor3Shot: 2,
	},

	movement: {
		enabled: true,
		circleWalk: true,
		circleSpeed: 0.95,
		circleRadius: 75,
		moveThreshold: 10,
		clumpRadius: 65,
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
		},
		mpThresholds: { upper: 1700, lower: 2100 },
		chestThreshold: 12,
		swapCooldown: 500,
		capeSwapEnabled: false,
		coatSwapEnabled: true,
		bossSetSwapEnabled: true,
		xpSetSwapEnabled: true,
		xpMonsters: ['sparkbot'],
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
		lootMonth: 'lootItemsFeb'
	},

	selling: {
		enabled: true,
		whitelist: ['vitearring', 'iceskates', 'cclaw', 'hpbelt', 'ringsj', 'hpamulet',
			'warmscarf', 'quiver', 'snowball', 'vitring', 'wbreeches', 'wgloves',
			'wattire', 'wshoes', 'wcap', 'strring', 'dexring', 'intring', 'wbook0']
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
		enabled: true,
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
		lowInventorySlots: 7
	},

	dragold: {
		enabled: true,
		preSpawnBuffer: 5000,
	}
};

// ============================================================================
// CONSTANTS
// ============================================================================
const TICK_RATE = { main: 100, action: 1, mark: 40, equipment: 25, maintenance: 2000 };
const COOLDOWNS = { cc: 135 };
const CACHE_TTL = 50;

const EVENT_LOCATIONS = [
	{ name: 'mrpumpkin', map: 'halloween', x: -217, y: 720 },
	{ name: 'mrgreen', map: 'spookytown', x: 605, y: 1000 },
	//{ name: 'crabxx', map: 'main', x: -971, y: 1780, join: true },
	{ name: 'dragold', map: 'cave', x: 1200, y: -850 }
];

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
	bigbird: [{ x: 1304, y: -69 }],
	bscorpion: [{ x: -561, y: -1400 }],
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

const destination = { map: mobMap, x: locations[home][0].x, y: locations[home][0].y };

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
	heal: [{ itemName: "cupid", slot: "mainhand", level: 9, l: "l" }],
	dps: [
		{ itemName: "dexearring", slot: "earring2", level: 5, l: "l" },
		{ itemName: "dexearring", slot: "earring1", level: 5, l: "l" },
		{ itemName: "suckerpunch", slot: "ring1", level: 2, l: "l" },
		{ itemName: "suckerpunch", slot: "ring2", level: 2, l: "u" },
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
	],
	stealth: [{ itemName: "stealthcape", slot: "cape", level: 0, l: "l" }],
	cape: [{ itemName: "vcape", slot: "cape", level: 6, l: "l" }],
	mana: [{ itemName: "tshirt9", slot: "chest", level: 7, l: "l" }],
	stat: [{ itemName: "coat", slot: "chest", level: 12, l: "s" }],
};

// ============================================================================
// DRAGOLD SERVER HOPPING — STATE MACHINE
// ============================================================================
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

// ============================================================================
// CORE UTILITIES
// ============================================================================
const shouldAttackMob = (mob) => {
	if (!mob || mob.dead) return false;
	if (COMBAT_SETS.neverAttack.has(mob.mtype)) return false;
	if (COMBAT_SETS.attackIfTargeted.has(mob.mtype)) {
		return mob.target !== null && mob.target !== undefined;
	}
	if (COMBAT_SETS.alwaysAttack.has(mob.mtype)) return true;
	return COMBAT_SETS.targetPriority.has(mob.target);
};

const updateCache = () => {
	if (!cache.isValid()) {
		const now = performance.now();
		const { x: homeX, y: homeY } = locations[home][0];
		const clumpRadius = CONFIG.movement.clumpRadius;
		const xpHpThreshold = CONFIG.equipment.xpMobHpThreshold;

		cache.priestTargets = 0;
		cache.hasLowHpXpMob = false;

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

			if (shouldAttackMob(e)) sortedByHP.push(e);
		}

		sortedByHP.sort((a, b) => {
			const aBoss = COMBAT_SETS.attackIfTargeted.has(a.mtype);
			const bBoss = COMBAT_SETS.attackIfTargeted.has(b.mtype);
			if (aBoss !== bBoss) return bBoss - aBoss;

			const aPriority = COMBAT_SETS.alwaysAttack.has(a.mtype);
			const bPriority = COMBAT_SETS.alwaysAttack.has(b.mtype);
			if (aPriority !== bPriority) return bPriority - aPriority;

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

const findHealTarget = () => {
	const healer = get_entity('CrownPriest');
	const threshold = (!healer || healer.rip) ? 0.9 : 0.4;
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


		if (shouldHandleEvents()) {
			handleEvents();
		} else if (CONFIG.movement.enabled) {
			if (!get_nearest_monster({ type: home })) {
				handleReturnHome();
			} else if (CONFIG.movement.rangedKiting.enabled) {
				await rangedKiting.kite();
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
	let delay = 5;
	try {
		if (is_disabled(character)) return setTimeout(actionLoop, 25);

		updateCache();
		const ms = ms_to_next_skill('attack');

		if (ms < character.ping / 10) {
			if (cache.healTarget) {
				equipSet('heal');
				await use_skill("attack", cache.healTarget);
			} else await handleAttack();
		} else {
			delay = ms > 200 ? 50 : ms > 50 ? 20 : 5;
		}
	} catch { delay = 1; }
	setTimeout(actionLoop, delay);
};

const handleAttack = async () => {
	const { sortedByHP, clumped, inRange, outOfRange } = cache.targets;
	if (!sortedByHP.length) return;

	const min5 = CONFIG.combat.minTargetsFor5Shot;
	const min3 = CONFIG.combat.minTargetsFor3Shot;
	const mp5 = (G.skills['5shot']?.mp || 0);
	const mp3 = (G.skills['3shot']?.mp || 0);
	const can5shot = character.mp >= mp5;
	const can3shot = character.mp >= mp3;

	if (can5shot && clumped.length >= min5) {
		equipSet('boom');
		await use_skill('5shot', clumped.slice(0, 5).map(e => e.id));
	} else if (can5shot && inRange.length >= min5) {
		equipSet('dead');
		await use_skill('5shot', inRange.slice(0, 5).map(e => e.id));
	} else if (can5shot && outOfRange.length >= min5) {
		equipSet('dead');
		await use_skill('5shot', outOfRange.slice(0, 5).map(e => e.id));
	} else if (can3shot && sortedByHP.length >= min3) {
		equipSet('dead');
		await use_skill('3shot', sortedByHP.slice(0, 3).map(e => e.id));
	} else if (sortedByHP.length >= 1 && is_in_range(sortedByHP[0])) {
		equipSet('single');
		await use_skill("attack", sortedByHP[0]);
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

			if (CONFIG.combat.useHuntersMark && msHunter === 0 && !target.s?.marked) {
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
			const numTargets = cache.priestTargets
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

		if (now - state.lastBossSetSwap > swapCooldown) {
			if (activeBoss && activeBoss.data.hp <= CONFIG.equipment.bossHpThresholds[activeBoss.name]) {
				// Boss is low —  luck set
				if (!isSetEquipped('luck')) {
					equipSet('luck');
					state.lastBossSetSwap = now;
				}
			} else {
				// Not in luck phase — dps  first
				if (activeBoss || character.map === mobMap) {
					if (!isSetEquipped('dps')) {
						equipSet('dps');
						state.lastBossSetSwap = now;
					}
				}

				// Now resolve orb independently: xp mob present → talkingskull, else → orbofdex
				if (now - state.lastXpSwap > swapCooldown) {
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

// ============================================================================
// MOVEMENT FUNCTIONS
// ============================================================================
function shouldHandleEvents() {
	const holidaySpirit = parent?.S?.holidayseason && !character?.s?.holidayspirit;
	const hasHandleableEvent = EVENT_LOCATIONS
		.some(e => parent?.S?.[e.name]?.live);
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

	state.angle = (state.angle + CONFIG.movement.circleSpeed * delta) % (2 * Math.PI);
	state.lastAngleUpdate = now;

	const targetX = centerX + Math.cos(state.angle) * CONFIG.movement.circleRadius;
	const targetY = centerY + Math.sin(state.angle) * CONFIG.movement.circleRadius;

	const distToTarget = Math.hypot(character.x - targetX, character.y - targetY);
	if (distToTarget > CONFIG.movement.moveThreshold) {
		await xmove(targetX, targetY);
	}
};

const rangedKiting = {
	lastMove: 0,

	getTarget() {
		return get_nearest_monster_v2({
			type: CONFIG.movement.rangedKiting.targets,
			max_distance: CONFIG.movement.rangedKiting.maxKiteRange
		});
	},

	needsRepositioning(target) {
		const dist = Math.hypot(target.real_x - character.real_x, target.real_y - character.real_y);
		const cfg = CONFIG.movement.rangedKiting;

		if (dist < cfg.minDistance) return { needed: true, reason: 'too_close', dist };

		if (dist > cfg.maxDistance) return { needed: true, reason: 'too_far', dist };

		const distFromOptimal = Math.abs(dist - cfg.optimalDistance);
		if (distFromOptimal > cfg.repositionThreshold) {
			return { needed: true, reason: 'optimize', dist };
		}

		return { needed: false, dist };
	},

	findBestPosition(target, reason, currentDist) {
		const cfg = CONFIG.movement.rangedKiting;
		let maxWeight = null;
		let maxAngle = null;

		for (let i = 0; i < Math.PI * 2; i += Math.PI / cfg.sampleAngles) {
			const testX = character.real_x + cfg.moveDistance * Math.cos(i);
			const testY = character.real_y + cfg.moveDistance * Math.sin(i);

			if (!can_move_to(testX, testY)) continue;

			const newDist = Math.hypot(target.real_x - testX, target.real_y - testY);
			let weight = 0;

			switch (reason) {
				case 'too_close':
					weight = newDist - currentDist;
					break;

				case 'too_far':
					weight = currentDist - newDist;
					break;

				case 'optimize':
					const currentDeviation = Math.abs(currentDist - cfg.optimalDistance);
					const newDeviation = Math.abs(newDist - cfg.optimalDistance);
					weight = currentDeviation - newDeviation;
					break;
			}

			if (newDist < cfg.minDistance) weight -= 1000;
			if (newDist > cfg.maxDistance) weight -= 1000;

			if (maxWeight === null || weight > maxWeight) {
				maxWeight = weight;
				maxAngle = i;
			}
		}

		return maxAngle;
	},

	async kite() {
		if (!CONFIG.movement.rangedKiting.enabled) return false;
		if (smart.moving) return false;

		const target = this.getTarget();
		if (!target) return false;

		const { needed, reason, dist } = this.needsRepositioning(target);
		if (!needed) return true;

		const bestAngle = this.findBestPosition(target, reason, dist);
		if (bestAngle === null) return true;

		const now = performance.now();
		if (now - this.lastMove > CONFIG.movement.rangedKiting.moveThrottle) {
			const cfg = CONFIG.movement.rangedKiting;
			const moveX = character.real_x + cfg.moveDistance * Math.cos(bestAngle);
			const moveY = character.real_y + cfg.moveDistance * Math.sin(bestAngle);

			await xmove(moveX, moveY);
			this.lastMove = now;

			if (cfg.debug) {
				game_log(`Kiting: ${reason} (${Math.round(dist)} → ${Math.round(Math.hypot(target.real_x - moveX, target.real_y - moveY))})`, '#FFA500');
			}
		}

		return true;
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

	const exclude = new Set(['hpot1', 'mpot1', 'luckbooster', 'goldbooster', 'xpbooster', 'pumpkinspice', 'xptome']);

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

let targetStartTimes = {};

const scare = () => {
	const slot = character.items.findIndex(i => i?.name === 'jacko');
	const now = performance.now();
	let shouldScare = false;

	for (const id in parent.entities) {
		const e = parent.entities[id];

		if (e.type === 'monster' && e.target === character.name && e.mtype !== 'grinch') {
			targetStartTimes[id] ??= now;
			if (now - targetStartTimes[id] > 250) shouldScare = true;
		} else {
			delete targetStartTimes[id];
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

// ============================================================================
// UI Stuff
// ============================================================================
// ============= CONFIGURATION =============
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1384621785772986479/kOkWjISThVdoxAL32ONqiq2z9Ach8XJbOduuZFGXXAgkXmiuMMRqWPZtpEoVFG-w89KM";
const MENTION_USER_ID = "212506590950064130";  // Set to null or "" to disable pings
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
		const skin = G.items[itemID]?.skin || itemID;
		const coords = G.positions[skin];
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
function toggleMeter(meterId) {
	let $ = parent.$;
	let meter = $(`#${meterId}`);

	if (meter.length) {
		meter.toggle();
	}
}

function openDPSConfig() {
	let $ = parent.$;

	$('#dpsConfigPopup').remove();

	const allDamageTypes = ["Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF", "DPS", "Dmg Taken"];

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

	allDamageTypes.forEach(type => {
		let checkboxDiv = $('<div></div>').css({
			textAlign: 'left',
			padding: '5px',
			margin: '5px 0'
		});

		let checkbox = $('<input type="checkbox">').attr('id', `dps_${type}`).css({
			marginRight: '10px'
		});

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

	let applyButton = $('<button>Apply Changes</button>').css({
		margin: '10px 5px 5px 5px',
		padding: '10px 20px',
		backgroundColor: '#4CAF50',
		color: 'white',
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer'
	}).click(function () {
		damageTypes.length = 0;
		allDamageTypes.forEach(type => {
			if ($(`#dps_${type}`).is(':checked')) {
				damageTypes.push(type);
			}
		});

		updateDPSMeterUI();

		$('#dpsConfigPopup').remove();
	});

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

function createTogglePopup() {
	let $ = parent.$;

	$('#togglePopupWindow').remove();

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

	togglePopup.append('<h3>UI Addon Toggles</h3>');

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

	togglePopup.append(scoopToggleBtn);
	togglePopup.append(dpsToggleBtn);
	togglePopup.append(dpsConfigBtn);
	togglePopup.append(xpToggleBtn);
	togglePopup.append(goldToggleBtn);
	togglePopup.append(partyToggleBtn);

	let closeButton = $('<button>Close</button>').css({
		margin: '5px',
		padding: '10px',
		backgroundColor: '#FF0000',
		color: 'white'
	}).click(function () {
		$('#togglePopupWindow').remove();
	});

	togglePopup.append(closeButton);
	$('body').append(togglePopup);
}
///////////////////////////////////////////////
function initXP() {
	let $ = parent.$;

	$('#xpui').css({
		fontSize: '28px',
		width: "100%",
		background: "transparent",
		color: "white",
	});

	$('.xpsui').css({
		background: "rgba(0, 0, 0, 0.7)"
	});

	$('#xpslider').css({
	});
}

function displayXP() {
	let $ = parent.$;
	let xpPercent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
	let xpString = `LV${character.level} ${xpPercent}%`;
	$('#xpui').html(xpString);
}

initXP();
setInterval(displayXP, 1000);
//////////////////////////////////////////////////
let lastGoldCheck = character.gold;
let totalGoldAcquired = 0;

function trackGoldAcquisition() {
	let currentGold = character.gold;

	if (currentGold > lastGoldCheck) {
		let goldGained = currentGold - lastGoldCheck;
		totalGoldAcquired += goldGained;
	}

	lastGoldCheck = currentGold;

	set_message(totalGoldAcquired.toLocaleString(), "gold");
}

setInterval(trackGoldAcquisition, 1000);  // Check every second	
//////////////////////////////////////////////////////////////////////////
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
		otherDiv.css({
			background: 'black',
			border: 'solid gray',
			borderWidth: '4px 4px',
			width: '272px',
			height: '25px',
			lineHeight: '27px',
			fontSize: '20px',
			color: '#FFFFFF',
			textAlign: 'center',
			overflow: 'auto',
			backgroundColor: 'rgba(0, 0, 0, 0.7)',
		});
	} else {
		console.log("Element not found.");
	}
}
setTimeout(modifyServerDivAppearance, 40000);

function modifyChatDivAppearance() {
	let $ = parent.$;
	let otherDiv = $('#bottomleftcorner2 > div:nth-child(3)');

	if (otherDiv.length) {
		otherDiv.css({
			background: 'black',
			border: 'solid gray',
			borderWidth: '4px 4px',
			width: '280px',
			height: '159px',
			fontSize: '17px',
			color: '#FFFFFF',
			textAlign: 'left',
			overflow: 'auto',
			backgroundColor: 'rgba(0, 0, 0, 0.7)',
		});
	} else {
		console.log("Element not found.");
	}
}
setTimeout(modifyChatDivAppearance, 40000);

function modifyChatLogDivAppearance() {
	let $ = parent.$;
	let chatLogDiv = $('#chatlog');

	if (chatLogDiv.length) {
		chatLogDiv.css({
			fontSize: '18px',
			overflowX: 'hidden',
			backgroundColor: 'rgba(0, 0, 0, 0.1)',
			width: '100%',
		});
	} else {
		console.log("Chat log div element not found.");
	}
}
setTimeout(modifyChatLogDivAppearance, 40000);

function modifyChatInputDivAppearance() {
	let $ = parent.$;
	let otherDiv = $('#chatinput');

	if (otherDiv.length) {
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
setTimeout(modifyChatInputDivAppearance, 40000);

function removeChatWithParty() {
	let $ = parent.$;
	let chatWithPartyDiv = $('#chatwparty');

	if (chatWithPartyDiv.length) {
		chatWithPartyDiv.remove();
	} else {
		console.log("Chat with party div element not found.");
	}
}

setTimeout(removeChatWithParty, 40000);
////////////////////////////////////////////////////////////////////////////////
function loadChestMap() {
	const data = get(CHEST_STORAGE_KEY);
	return (data && typeof data === "object" && !Array.isArray(data))
		? data
		: {};
}

function updateChestButton() {
	const chestMap = loadChestMap();
	const count = Object.keys(chestMap).length;

	add_top_button(
		"chest_status",
		`Chests: ${count}`,
		() => show_json(chestMap)
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
	$('#bottomleftcorner2').children().first().before(`<div id="movebottomrighthere" style="display: flex; flex-direction: row; align-items: flex-end; margin-top: -20px;"></div>`);
	$('#movebottomrighthere').append(skbar);
}

swapDivs();
/////////////////////////////////////////////////////////////////////////////////////////////////
if (parent.party_style_prepared) parent.$('#style-party-frames').remove();

parent.$('head').append(`<style id="style-party-frames">
.party-container {position: absolute; top: 55px; left: -25%; width: 1000px; height: 300px; font-family: 'pixel';}
</style>`);
parent.party_style_prepared = true;

const DISPLAY_BARS = ['hp', 'mp', 'xp', 'cc']; // <-- Add 'cc', 'ping', 'share' as needed
const FRAME_WIDTH = 80;
const INCLUDE = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'xp', 'level', 'share', 'cc', 'max_cc'];
const SHOW_IMG = true;

const extractInfo = (char) => {
	const info = {};
	for (const key of INCLUDE) if (key in char) info[key] = char[key];
	for (const key of character.read_only) if (key in char) info[key] = char[key];
	return info;
};

setInterval(() => set(character.name + '_newparty_info', { ...extractInfo(character), lastSeen: Date.now() }), 200);

const getIFramedChar = (name) => {
	for (const iframe of top.$('iframe')) {
		const char = iframe.contentWindow.character;
		if (char?.name === name) return char;
	}
};

const barHTML = (text, val, width, color) =>
	`<div style="position:relative;width:100%;height:20px;text-align:center;margin-top:3px;">
<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;font-size:17px;z-index:1;white-space:nowrap;text-shadow:-1px 0 black,0 2px black,2px 0 black,0 -1px black;">${text}: ${val}</div>
<div style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${color};width:${width}%;height:20px;border:1px solid grey;"></div>
</div>`;

const barConfigs = {
	hp: { color: 'red', calc: (i) => ({ val: i.hp, width: i.hp / i.max_hp * 100 }) },
	mp: { color: 'blue', calc: (i) => ({ val: i.mp, width: i.mp / i.max_mp * 100 }) },
	xp: {
		color: 'green', calc: (i) => {
			const pct = i.xp / G.levels[i.level] * 100;
			return { val: pct.toFixed(2) + '%', width: pct };
		}
	},
	cc: { color: 'grey', calc: (i) => ({ val: i.cc?.toFixed(2) ?? i.cc, width: i.cc / (i.max_cc || 200) * 100 }) },
	ping: { color: 'black', calc: () => ({ val: character.ping?.toFixed(0) ?? '??', width: 0 }) },
	share: {
		color: 'teal', calc: (i, partyData) => {
			const share = partyData?.share;
			return share != null ? { val: (share * 100).toFixed(2) + '%', width: share * 300 } : { val: '??', width: 0 };
		}
	}
};

setInterval(() => {
	const partyFrame = parent.$('#newparty').addClass('party-container');
	if (!partyFrame.length) return;

	const members = Object.keys(parent.party);
	partyFrame.children().each((x, el) => {
		const name = members[x];
		let info = get(name + '_newparty_info');

		if (!info || Date.now() - info.lastSeen > 1000) {
			const iframed = getIFramedChar(name);
			info = iframed ? extractInfo(iframed) : (get_player(name) || { name });
		}

		const partyData = parent.party[name];
		let html = `<div style="width:${FRAME_WIDTH}px;height:20px;margin-top:3px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${info.name}</div>`;

		for (const key of DISPLAY_BARS) {
			const cfg = barConfigs[key];
			const { val, width } = cfg.calc(info, partyData);
			if (val !== undefined && val !== '??') {
				html += barHTML(key.toUpperCase(), val, width, cfg.color);
			}
		}

		parent.$(el).children().first().css('display', SHOW_IMG ? 'inherit' : 'none');
		parent.$(el).children().last().html(`<div style="font-size:22px;" onclick='pcs(event);party_click("${name}");'>${html}</div>`);
	});
}, 250);

parent.$('#party-props-toggles').remove();
parent.socket.emit("tracker");
setTimeout(() => parent.hide_modal(), 1000);

const KH = {
	_s: null,
	get s() {
		if (!this._s) {
			try { this._s = JSON.parse(localStorage.killHistory); } catch { }
			if (!this._s || typeof this._s.d !== 'object') this._s = { d: {} };
		}
		return this._s;
	},
	save() { localStorage.killHistory = JSON.stringify(this._s); }
};

parent.KH = KH;

function saveKills() {
	const day = Math.floor(Date.now() / 86400000);
	const d = KH.s.d;
	let dirty = false;
	const monsters = parent.tracker?.monsters || {};
	const maxM = parent.tracker?.max?.monsters || {};
	const allTypes = new Set([...Object.keys(monsters), ...Object.keys(maxM)]);
	for (const mtype of allTypes) {
		const kills = monsters[mtype] | 0;
		const score = maxM[mtype]?.[0] | 0 || 0;
		if (!kills && !score) continue;
		const arr = d[mtype] ??= [];
		const last = arr[arr.length - 1];
		if (!last) { arr.push([day, kills, score]); dirty = true; continue; }
		if (last[1] === kills && last[2] === score) continue;
		if (last[0] === day) { last[1] = kills; last[2] = score; }
		else arr.push([day, kills, score]);
		dirty = true;
	}
	if (dirty) KH.save();
}

saveKills();
setInterval(saveKills, 10 * 60 * 1000);

function modify_tracker() {
	const tracker_function = function () {
		this.render_tracker = function () {
			let html = "<div style='font-size:32px'>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerm\").show()'>Monsters</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackere\").show()'>Exchanges and Quests</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerx\").show()'>Stats</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerg\").show()'>Graphs</div>"
				+ "</div>";

			// Monsters tab
			html += "<div class='trackers trackerm'>";
			object_sort(G.monsters, "hpsort").forEach(function (e) {
				if (e[1].cute && !e[1].achievements || e[1].unlist) return;
				let count = (tracker.monsters[e[0]] || 0) + (tracker.monsters_diff[e[0]] || 0), color = "#50ADDD";
				if (tracker.max.monsters[e[0]] && tracker.max.monsters[e[0]][0] > count) { count = tracker.max.monsters[e[0]][0]; color = "#DCC343"; }
				html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:relative;display:inline-block;margin:2px' class='clickable' onclick='pcs(event);render_monster_info(\"" + e[0] + "\")'>"
					+ sprite(e[0], { scale: 1.5 });
				if (count) html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:absolute;top:-2px;left:-2px;color:" + color + ";display:inline-block;padding:1px 1px 1px 3px'>" + to_shrinked_num(count) + "</div>";
				if (tracker.drops?.[e[0]]?.length) html += "<div style='background-color:#FD79B0;border:2px solid #9F9FB0;position:absolute;bottom:-2px;right:-2px;display:inline-block;padding:1px;height:2px;width:2px'></div>";
				html += "</div>";
			});
			html += "</div>";

			// Exchanges tab
			html += "<div class='trackers trackere hidden' style='margin-top:3px'>";
			object_sort(G.items).forEach(function (e) {
				if (!e[1].e || e[1].ignore) return;
				let list = [[e[0], e[0], undefined]];
				if (e[1].upgrade || e[1].compound) { list = []; for (let i = 0; i < 13; i++) if (G.drops[e[0] + i]) list.push([e[0], e[0] + i, i]); }
				list.forEach(function (d) {
					html += "<div style='margin-right:3px;margin-bottom:3px;display:inline-block;position:relative'" + (G.drops[d[1]] ? " class='clickable' onclick='pcs(event);render_exchange_info(\"" + d[1] + "\"," + (tracker.exchanges[d[1]] || 0) + ")'" : "") + ">"
						+ item_container({ skin: G.items[d[0]].skin }, { name: d[0], level: d[2] });
					if (tracker.exchanges[d[1]]) html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:absolute;top:-2px;left:-2px;color:#ED901C;font-size:16px;display:inline-block;padding:1px 1px 1px 3px'>" + to_shrinked_num(tracker.exchanges[d[1]]) + "</div>";
					html += "</div>";
				});
			});
			html += "</div>";

			// Stats tab
			html += "<div class='trackers trackerx hidden' style='margin-top:3px;padding:10px'><div style='font-size:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px'>";

			const ac = {}, kills = parent.tracker.max.monsters;
			for (const mtype in kills) {
				if (!G.monsters[mtype]?.achievements) continue;
				const n = kills[mtype][0];
				for (const [needed, type, reward, amount] of G.monsters[mtype].achievements) {
					if (type !== "stat") continue;
					(ac[reward] ??= { value: 0, maxvalue: 0, monsters: [] }).monsters.push({ mtype, needed, amount });
					ac[reward].maxvalue += amount;
					if (n >= needed) ac[reward].value += amount;
				}
			}

			for (const key of Object.keys(ac).sort()) {
				const a = ac[key], pct = (a.value / a.maxvalue * 100).toFixed(1);
				html += "<div style='background-color:#575983;border:2px solid " + (a.value >= a.maxvalue ? '#22c725' : '#9F9FB0') + ";padding:5px;text-align:center;cursor:pointer;position:relative' onclick='toggleDropdown(\"" + key + "\")'>"
					+ "<div style='font-weight:bold;font-size:28px;margin-bottom:3px'>" + key + "</div>"
					+ "<div style='font-size:25px;margin-bottom:1px'>" + a.value.toFixed(2) + " / " + a.maxvalue.toFixed(2) + "</div>"
					+ "<div style='font-size:22px;color:#DCC343'>(" + pct + "%)</div>"
					+ "<div id='dropdown-" + key + "' style='display:none;background-color:#1a1a1a;border:2px solid #9F9FB0;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;max-height:70vh;overflow-y:auto;padding:15px;z-index:10000;box-shadow:0 0 20px rgba(0,0,0,.8)'>"
					+ "<div style='position:sticky;top:0;background-color:#1a1a1a;padding-bottom:10px;margin-bottom:10px;border-bottom:2px solid #9F9FB0;font-size:22px;font-weight:bold'>" + key + " Progress</div>";
				for (const m of a.monsters.sort((x, y) => x.needed - y.needed || x.mtype.localeCompare(y.mtype))) {
					const cur = kills[m.mtype] ? Math.floor(kills[m.mtype][0]) : 0, done = cur >= m.needed;
					html += "<div style='background-color:" + (done ? '#1a3d1a' : '#2a2a3a') + ";margin:5px 0;padding:8px;border-radius:4px;display:flex;justify-content:space-between;align-items:center'>"
						+ "<div style='color:" + (done ? '#22c725' : 'white') + ";flex:1'>" + m.mtype + "</div>"
						+ "<div style='color:" + (done ? '#22c725' : 'white') + ";font-size:19px'>" + cur.toLocaleString() + " / " + m.needed.toLocaleString() + " (+" + m.amount.toLocaleString() + ")</div>"
						+ "</div>";
				}
				html += "</div></div>";
			}
			html += "</div></div>";

			// Graphs tab
			html += "<div class='trackers trackerg hidden' style='margin-top:3px;'>";
			html += "<div id='tkr-graph-grid'>";
			object_sort(G.monsters, "hpsort").forEach(function (e) {
				if (e[1].cute && !e[1].achievements || e[1].unlist) return;
				const kh = parent.KH?.s?.d?.[e[0]];
				if (!kh?.length) return;
				html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:relative;display:inline-block;margin:2px' class='clickable' onclick='pcs(event);tkrShowGraph(\"" + e[0] + "\")'>"
					+ sprite(e[0], { scale: 1.5 })
					+ "</div>";
			});
			html += "</div>";
			html += "<div id='tkr-graph-panel' style='display:none;margin-top:6px;'>"
				+ "<div style='display:flex;align-items:center;gap:6px;margin-bottom:6px;'>"
				+ "<div id='tkr-graph-back' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:22px' class='clickable' onclick='pcs(event);tkrShowGrid()'>← Back</div>"
				+ "<div id='tkr-graph-title' style='font-size:26px;font-weight:bold;color:#DCC343;white-space:nowrap'></div>"
				+ "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:2px;'>"
				+ "<div id='tkr-stat-kills' style='font-size:20px;color:#50ADDD;text-align:center'></div>"
				+ "<div id='tkr-stat-score' style='font-size:20px;color:#DCC343;text-align:center'></div>"
				+ "</div>"
				+ "<div style='display:flex;gap:4px'>"
				+ "<div id='tkr-range-all' style='background-color:#575983;border:2px solid #DCC343;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"all\")'>All</div>"
				+ "<div id='tkr-range-year' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"year\")'>Year</div>"
				+ "<div id='tkr-range-month' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"month\")'>Month</div>"
				+ "<div id='tkr-range-week' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"week\")'>Week</div>"
				+ "</div></div>"
				+ "<div style='display:flex;gap:12px;font-size:18px;margin-bottom:4px;'>"
				+ "<span style='color:#50ADDD'>— Kills</span>"
				+ "<span style='color:#DCC343'>— Max Score</span>"
				+ "</div>"
				+ "<canvas id='tkr-graph-canvas' style='width:100%;height:600px;background:rgba(0,0,0,0.3);border:2px solid #9F9FB0;border-radius:4px;display:block;'></canvas>"
				+ "</div>";
			html += "</div>";

			show_modal(html, { wwidth: 578, hideinbackground: true });

			// Graph tab logic
			let tkrMtype = null, tkrRange = 'all';
			const tkrModal = parent.document.querySelector('.imodal');
			const tkrOriginalWidth = tkrModal ? tkrModal.style.width : '';

			const TKR_PAD = [30, 15, 50, 95]; // T R B L

			const tkrNiceMax = raw => {
				if (raw <= 0) return 1;
				const mag = Math.pow(10, Math.floor(Math.log10(raw)));
				const n = raw / mag;
				if (n <= 1.2) return 1.2 * mag;
				if (n <= 1.5) return 1.5 * mag;
				if (n <= 2) return 2 * mag;
				if (n <= 2.5) return 2.5 * mag;
				if (n <= 3) return 3 * mag;
				if (n <= 4) return 4 * mag;
				if (n <= 5) return 5 * mag;
				if (n <= 8) return 8 * mag;
				return 10 * mag;
			};

			const tkrFmt = v => {
				const a = Math.abs(v);
				const fmt = (n, s) => { const str = n.toFixed(1); return (str.endsWith('.0') ? n.toFixed(0) : str) + s; };
				if (a >= 1e9) return fmt(v / 1e9, 'B');
				if (a >= 1e6) return fmt(v / 1e6, 'M');
				if (a >= 1e3) return fmt(v / 1e3, 'K');
				return v.toLocaleString();
			};

			window.tkrSetRange = r => {
				tkrRange = r;
				['all', 'year', 'month', 'week'].forEach(x => {
					const el = document.getElementById('tkr-range-' + x);
					if (el) el.style.borderColor = x === r ? '#DCC343' : '#9F9FB0';
				});
				tkrDrawGraph();
			};

			window.tkrShowGrid = () => {
				document.getElementById('tkr-graph-grid').style.display = '';
				document.getElementById('tkr-graph-panel').style.display = 'none';
				tkrMtype = null;
				if (tkrModal) tkrModal.style.width = tkrOriginalWidth;
			};

			window.tkrShowGraph = mtype => {
				tkrMtype = mtype;
				document.getElementById('tkr-graph-grid').style.display = 'none';
				document.getElementById('tkr-graph-panel').style.display = '';
				document.getElementById('tkr-graph-title').textContent = mtype;
				if (tkrModal) tkrModal.style.width = '1200px';
				tkrDrawGraph();
			};

			const tkrDrawGraph = () => {
				if (!tkrMtype) return;
				const all = parent.KH?.s?.d?.[tkrMtype] || [];
				const canvas = document.getElementById('tkr-graph-canvas');
				if (!canvas) return;
				const ctx = canvas.getContext('2d');
				const rect = canvas.getBoundingClientRect();
				if (canvas.width !== rect.width || canvas.height !== rect.height) { canvas.width = rect.width; canvas.height = rect.height; }
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				const nowDay = Math.floor(Date.now() / 86400000);
				const cutoff = ({ all: 0, year: nowDay - 365, month: nowDay - 30, week: nowDay - 7 })[tkrRange] ?? 0;
				const data = all.filter(r => r[0] >= cutoff);

				if (data.length < 2) {
					ctx.fillStyle = '#9F9FB0'; ctx.font = '18px pixel,monospace'; ctx.textAlign = 'center';
					ctx.fillText('Not enough data for this range', canvas.width / 2, canvas.height / 2);
					return;
				}

				const [PT, PR, PB, PL] = TKR_PAD;
				const cw = canvas.width - PL - PR, ch = canvas.height - PT - PB;
				const firstDay = data[0][0], lastDay = data[data.length - 1][0];
				const span = Math.max(1, lastDay - firstDay);
				const xd = d => PL + cw * (d - firstDay) / span;
				const yMax = tkrNiceMax(Math.max(data[data.length - 1][1], data[data.length - 1][2]) * 1.08);
				const yv = v => PT + ch - ch * v / yMax;

				// Grid + Y labels
				ctx.font = '18px pixel,monospace';
				for (let i = 0; i <= 8; i++) {
					const y = PT + ch * i / 8;
					ctx.strokeStyle = i % 2 === 0 ? 'rgba(159,159,176,0.2)' : 'rgba(159,159,176,0.08)';
					ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PL + cw, y); ctx.stroke();
					if (i % 2 === 0) {
						ctx.fillStyle = 'rgba(159,159,176,0.8)'; ctx.textAlign = 'right';
						ctx.fillText(tkrFmt(yMax * (8 - i) / 8), PL - 6, y + 5);
					}
				}

				// X labels
				ctx.fillStyle = 'rgba(159,159,176,0.8)'; ctx.font = '18px pixel,monospace'; ctx.textAlign = 'center';
				const totalDays = lastDay - firstDay || 1;
				let tickInterval;
				if (tkrRange === 'week') tickInterval = 1;
				else if (tkrRange === 'month') tickInterval = 3;
				else if (tkrRange === 'year') tickInterval = 30;
				else tickInterval = Math.ceil(totalDays / 10 / 30) * 30 || 30;

				const tickStart = Math.ceil(firstDay / tickInterval) * tickInterval;
				for (let t = tickStart; t <= lastDay; t += tickInterval) {
					const x = xd(t);
					const dt = new Date(t * 86400000);
					const lbl = tkrRange === 'week' || tkrRange === 'month'
						? (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate()
						: (dt.getUTCMonth() + 1) + '/' + dt.getUTCFullYear().toString().slice(2);
					ctx.fillText(lbl, x, PT + ch + 18);
					ctx.strokeStyle = 'rgba(159,159,176,0.15)'; ctx.lineWidth = 1;
					ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, PT + ch); ctx.stroke();
				}

				// Axes
				ctx.strokeStyle = 'rgba(159,159,176,0.5)'; ctx.lineWidth = 1;
				ctx.beginPath(); ctx.moveTo(PL, PT); ctx.lineTo(PL, PT + ch); ctx.lineTo(PL + cw, PT + ch); ctx.stroke();

				// Area + line — kills
				const gradK = ctx.createLinearGradient(0, PT, 0, PT + ch);
				gradK.addColorStop(0, 'rgba(80,173,221,0.25)'); gradK.addColorStop(1, 'rgba(80,173,221,0.02)');
				ctx.fillStyle = gradK;
				ctx.beginPath();
				ctx.moveTo(xd(data[0][0]), PT + ch);
				for (const r of data) ctx.lineTo(xd(r[0]), yv(r[1]));
				ctx.lineTo(xd(data[data.length - 1][0]), PT + ch);
				ctx.closePath(); ctx.fill();

				ctx.strokeStyle = '#50ADDD'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
				ctx.beginPath();
				for (let i = 0; i < data.length; i++) i === 0 ? ctx.moveTo(xd(data[i][0]), yv(data[i][1])) : ctx.lineTo(xd(data[i][0]), yv(data[i][1]));
				ctx.stroke();

				// Area + line — max score
				const gradM = ctx.createLinearGradient(0, PT, 0, PT + ch);
				gradM.addColorStop(0, 'rgba(220,195,67,0.18)'); gradM.addColorStop(1, 'rgba(220,195,67,0.01)');
				ctx.fillStyle = gradM;
				ctx.beginPath();
				ctx.moveTo(xd(data[0][0]), PT + ch);
				for (const r of data) ctx.lineTo(xd(r[0]), yv(r[2]));
				ctx.lineTo(xd(data[data.length - 1][0]), PT + ch);
				ctx.closePath(); ctx.fill();

				ctx.strokeStyle = '#DCC343'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.setLineDash([6, 3]);
				ctx.beginPath();
				for (let i = 0; i < data.length; i++) i === 0 ? ctx.moveTo(xd(data[i][0]), yv(data[i][2])) : ctx.lineTo(xd(data[i][0]), yv(data[i][2]));
				ctx.stroke(); ctx.setLineDash([]);

				// Dots if sparse
				if (data.length <= 60) {
					for (const r of data) {
						ctx.fillStyle = '#50ADDD'; ctx.beginPath(); ctx.arc(xd(r[0]), yv(r[1]), 3, 0, 6.283); ctx.fill();
						ctx.fillStyle = '#DCC343'; ctx.beginPath(); ctx.arc(xd(r[0]), yv(r[2]), 3, 0, 6.283); ctx.fill();
					}
				}

				canvas._tkrDraw = tkrDrawGraph;
				canvas._tkrData = data;
				canvas._tkrMeta = { xd, yv, PL, PR, PT, PB, cw, ch, span, firstDay };

				// Stats in header
				const statEl1 = document.getElementById('tkr-stat-kills');
				const statEl2 = document.getElementById('tkr-stat-score');
				if (statEl1 && statEl2 && data.length >= 2) {
					const spanD = Math.max(1, data[data.length - 1][0] - data[0][0]);
					const killDelta = data[data.length - 1][1] - data[0][1];
					const scoreDelta = data[data.length - 1][2] - data[0][2];
					const rangeLabel = { all: 'All Time', year: 'Past Year', month: 'Past Month', week: 'Past Week' }[tkrRange];
					const divisor = { all: 365, year: 30, month: 7, week: 1 }[tkrRange];
					const unit = { all: '/yr', year: '/mo', month: '/wk', week: '/day' }[tkrRange];
					const avg = v => tkrFmt(((v / spanD) * divisor) | 0);
					statEl1.textContent = 'Kills (' + rangeLabel + '): avg ' + avg(killDelta) + unit;
					statEl2.textContent = 'Score (' + rangeLabel + '): avg ' + avg(scoreDelta) + unit;
				}
			};

			// Tooltip on hover
			const ghCanvas = document.getElementById('tkr-graph-canvas');
			if (ghCanvas) {
				ghCanvas.onmousemove = function (e) {
					const data = this._tkrData, meta = this._tkrMeta;
					if (!data || !meta) return;
					tkrDrawGraph();
					const rect = this.getBoundingClientRect();
					const mx = (e.clientX - rect.left) * (this.width / rect.width);
					const { xd, yv, PL, PT, cw, ch } = meta;
					let near = null, nd = Infinity;
					for (const r of data) { const dx = Math.abs(mx - xd(r[0])); if (dx < nd) { nd = dx; near = r; } }
					if (!near || nd > cw / data.length * 1.5) return;

					const ctx = this.getContext('2d');
					const x = xd(near[0]);

					ctx.strokeStyle = 'rgba(159,159,176,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
					ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, PT + ch); ctx.stroke(); ctx.setLineDash([]);

					ctx.fillStyle = '#50ADDD'; ctx.beginPath(); ctx.arc(x, yv(near[1]), 5, 0, 6.283); ctx.fill();
					ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
					ctx.fillStyle = '#DCC343'; ctx.beginPath(); ctx.arc(x, yv(near[2]), 5, 0, 6.283); ctx.fill();
					ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();

					const dt = new Date(near[0] * 86400000);
					const l1 = (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate() + '/' + dt.getUTCFullYear();
					const l2 = 'Kills: ' + near[1].toLocaleString(), l3 = 'Max: ' + near[2].toLocaleString();
					ctx.font = 'bold 18px pixel,monospace';
					const tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width, ctx.measureText(l3).width) + 24;
					let tx = x + 12, ty = yv(near[1]) - 50;
					if (tx + tw > this.width - 15) tx = x - tw - 12;
					if (ty < PT) ty = PT;

					ctx.fillStyle = 'rgba(20,20,30,0.95)'; ctx.strokeStyle = '#9F9FB0'; ctx.lineWidth = 1;
					ctx.beginPath(); ctx.roundRect(tx, ty, tw, 85, 4); ctx.fill(); ctx.stroke();

					ctx.textAlign = 'left';
					ctx.fillStyle = 'rgba(159,159,176,0.9)'; ctx.fillText(l1, tx + 10, ty + 24);
					ctx.fillStyle = '#50ADDD'; ctx.fillText(l2, tx + 10, ty + 50);
					ctx.fillStyle = '#DCC343'; ctx.fillText(l3, tx + 10, ty + 70);
				};
				ghCanvas.onmouseleave = () => tkrDrawGraph();
			}

			window.toggleDropdown = key => { const d = document.getElementById('dropdown-' + key); d.style.display = d.style.display === 'block' ? 'none' : 'block'; };
		};
	};

	const s = tracker_function.toString();
	parent.smart_eval(s.slice(s.indexOf('{') + 1, s.lastIndexOf('}')));
}

modify_tracker();

// ========== TRACKING STATE ==========
let sumGold = 0, largestGoldDrop = 0;
const goldStartTime = performance.now();
let goldInterval = 'hour';
const goldHistory = [];

const xpStartTime = performance.now();
const startXP = character.xp;
let xpInterval = 'second';
const xpHistory = [];

let playerDamageSums = {};
const dpsStartTime = performance.now();
const dpsHistory = {};

// Kill tracking state
const killStartTime = performance.now();
let totalKills = 0;
let mobKills = {};
let killInterval = 'day';
const killHistory = {};

// Co-op tracking state
const coopHistory = {};
let lastCoopUpdate = 0;

// Multi-select damage types - default to DPS only
let selectedDamageTypes = ['DPS'];

// Toggle variables for overheal and over-manasteal
let includeOverheal = false;
let includeOverMana = false;

// Chart config
const MAX_HISTORY = 60;
const HISTORY_INTERVAL = 5000;
let lastGoldUpdate = 0;
let lastXpUpdate = 0;
let lastDpsUpdate = 0;
let lastKillUpdate = 0;

const classColors = {
	mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF',
	ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D', default: '#FFFFFF'
};

const sectionColors = {
	gold: { primary: '#FFD700', rgba: 'rgba(255, 215, 0, 0.3)', axis: 'rgba(255, 215, 0, 0.1)' },
	xp: { primary: '#87CEEB', rgba: 'rgba(135, 206, 235, 0.3)', axis: 'rgba(135, 206, 235, 0.2)' },
	dps: { primary: '#FF6B6B', rgba: 'rgba(255, 107, 107, 0.3)', axis: 'rgba(255, 107, 107, 0.2)' },
	kills: { primary: '#9D4EDD', rgba: 'rgba(157, 78, 221, 0.3)', axis: 'rgba(157, 78, 221, 0.1)' },
	coop: { primary: '#FF9500', rgba: 'rgba(255, 149, 0, 0.3)', axis: 'rgba(255, 149, 0, 0.1)' }
};

// Mob type colors
const mobColors = [
	'#FF6B9D', '#4ECDC4', '#FFE66D', '#95E1D3', '#FF8B94',
	'#A8E6CF', '#FFD3B6', '#FFAAA5', '#AA96DA', '#FCBAD3'
];
let mobColorMap = {};

const damageTypeLabels = {
	DPS: 'Total DPS',
	Base: 'Base Damage',
	Cleave: 'Cleave Damage',
	Blast: 'Blast Damage',
	Burn: 'Burn Damage',
	HPS: 'Healing',
	MPS: 'Mana Steal',
	DR: 'Damage Return',
	Reflect: 'Reflection'
};

const damageTypeColors = {
	DPS: '#E53935',
	Base: '#6D1B7B',
	Cleave: '#8D6E63',
	Blast: '#FB8C00',
	Burn: '#FDD835',
	HPS: '#43A047',
	MPS: '#1E88E5',
	DR: '#546E7A',
	Reflect: '#26A69A'
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
		sumBlastDamage: 0, sumBaseDamage: 0, sumCleaveDamage: 0,
		sumHeal: 0, sumManaSteal: 0,
		sumDamageReturn: 0, sumReflection: 0,
	});
}

function calculateDamageTypeValue(id, now, damageType) {
	const entry = playerDamageSums[id];
	if (!entry) return 0;
	const elapsed = now - entry.startTime;
	if (elapsed <= 0) return 0;

	switch (damageType) {
		case 'DPS':
			return Math.floor((entry.sumDamage + entry.sumDamageReturn + entry.sumReflection) * 1000 / elapsed);
		case 'Base':
			return Math.floor(entry.sumBaseDamage * 1000 / elapsed);
		case 'Cleave':
			return Math.floor(entry.sumCleaveDamage * 1000 / elapsed);
		case 'Blast':
			return Math.floor(entry.sumBlastDamage * 1000 / elapsed);
		case 'Burn':
			return Math.floor(entry.sumBurnDamage * 1000 / elapsed);
		case 'HPS':
			return Math.floor(entry.sumHeal * 1000 / elapsed);
		case 'MPS':
			return Math.floor(entry.sumManaSteal * 1000 / elapsed);
		case 'DR':
			return Math.floor(entry.sumDamageReturn * 1000 / elapsed);
		case 'Reflect':
			return Math.floor(entry.sumReflection * 1000 / elapsed);
		default:
			return 0;
	}
}

function calculateTotalDamageType(damageType, now) {
	let total = 0;
	for (const id in playerDamageSums) {
		total += calculateDamageTypeValue(id, now, damageType);
	}
	return total;
}

// ========== UI CREATION ==========
const createMetricsDashboard = () => {
	const $ = parent.$;
	$('#metricsDashboard').remove();
	$('#metricsBackdrop').remove();

	const metricCard = (label, valueId) =>
		`<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value" id="${valueId}">0</div></div>`;

	const intervalButtons = (type, buttons) =>
		buttons.map(b => `<button class="interval-btn ${b.active ? 'active' : ''}" data-interval="${b.interval}" data-type="${type}">${b.label}</button>`).join('');

	const damageButtons = (buttons) =>
		buttons.map(b => `<button class="damage-type-btn ${b.active ? 'active' : ''}" data-damage-type="${b.type}" data-color="${b.color}">${b.label}</button>`).join('');

	const backdrop = $('<div id="metricsBackdrop"></div>').css({
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		background: 'rgba(0, 0, 0, 0.5)',
		zIndex: 9998,
		display: 'none'
	});

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
						${metricCard('Party Total', 'partyDPS')}
						${metricCard('Your Total', 'yourDPS')}
						${metricCard('Session Time', 'sessionTime')}
					</div>
					<div class="damage-type-selector">
						${damageButtons([
		{ type: 'DPS', label: 'Total', color: damageTypeColors.DPS, active: true },
		{ type: 'Base', label: 'Base', color: damageTypeColors.Base },
		{ type: 'Cleave', label: 'Cleave', color: damageTypeColors.Cleave },
		{ type: 'Blast', label: 'Blast', color: damageTypeColors.Blast },
		{ type: 'Burn', label: 'Burn', color: damageTypeColors.Burn },
		{ type: 'HPS', label: 'Heal', color: damageTypeColors.HPS },
		{ type: 'MPS', label: 'Mana', color: damageTypeColors.MPS },
		{ type: 'DR', label: 'Return', color: damageTypeColors.DR },
		{ type: 'Reflect', label: 'Reflect', color: damageTypeColors.Reflect }
	])}
					</div>
					<canvas id="dpsChart" class="metric-chart"></canvas>
				</div>

				<div class="metrics-section" data-section="kills">
					<h3>Kill Tracking</h3>
					<div class="metrics-grid">
						${metricCard('Kills/Day', 'killRate')}
						${metricCard('Total Kills', 'totalKillCount')}
					</div>
					<div class="interval-selector" id="killIntervalSelector">
						${intervalButtons('kills', [
		{ interval: 'minute', label: 'Minute' },
		{ interval: 'hour', label: 'Hour' },
		{ interval: 'day', label: 'Day', active: true }
	])}
					</div>
					<canvas id="killChart" class="metric-chart"></canvas>
					<div id="mobBreakdown"></div>
				</div>

				<div class="metrics-section" data-section="coop">
					<h3>Boss Contribution</h3>
					<div class="metrics-grid">
						${metricCard('Party Total', 'partyCoop')}
						${metricCard('Party Total %', 'yourCoopPct')}
					</div>
					<canvas id="coopChart" class="metric-chart"></canvas>
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

	$('body').append(backdrop);
	$('body').append(dashboard);
	applyStyles($);
	attachEventHandlers($);
};

const applyStyles = ($) => {
	const styles = {
		'#metricsHeader': {
			background: 'linear-gradient(to right, #1a1a2e, #16213e)', padding: '12px 15px',
			borderBottom: '2px solid #3436a0ff', display: 'flex', justifyContent: 'space-between',
			alignItems: 'center', borderRadius: '7px 7px 0 0', userSelect: 'none'
		},
		'#metricsTitle': { color: '#3436a0ff', fontSize: '34px', fontWeight: 'bold', textShadow: '0 0 10px rgba(99, 102, 241, 0.5)' },
		'#closeBtn': { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #6366F1', color: '#6366F1', fontSize: '25px', width: '30px', height: '30px', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s', fontFamily: 'inherit' },
		'#metricsContent': { padding: '15px', color: 'white', height: 'calc(90vh - 70px)', overflowY: 'auto', overflowX: 'hidden' },
		'.metrics-section': { marginBottom: '20px', padding: '15px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' },
		'.metrics-section h3': { marginTop: '0', marginBottom: '15px', fontSize: '28px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' },
		'.metrics-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' },
		'.metric-card': { background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '8px', textAlign: 'center' },
		'.metric-label': { fontSize: '20px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' },
		'.metric-value': { fontSize: '24px', fontWeight: 'bold' },
		'.interval-selector': { display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'center', flexWrap: 'wrap' },
		'.interval-btn': { padding: '8px 15px', minWidth: '70px', minHeight: '40px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', borderRadius: '5px', transition: 'all 0.2s', fontSize: '20px', fontFamily: 'inherit', border: 'none' },
		'.damage-type-selector': { display: 'flex', gap: '5px', marginBottom: '10px', justifyContent: 'center', flexWrap: 'wrap' },
		'.damage-type-btn': { padding: '8px 15px', minWidth: '70px', minHeight: '40px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', borderRadius: '5px', transition: 'all 0.2s', fontSize: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', fontFamily: 'inherit' },
		'.damage-type-btn.active': { boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)' },
		'.metric-chart': { width: '100%', height: '550px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', display: 'block' },
		'#mobBreakdown': { marginTop: '15px', padding: '15px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' },
		'.mob-breakdown-title': { color: '#9D4EDD', fontSize: '20px', marginBottom: '15px', textAlign: 'center' },
		'.mob-breakdown-grid': { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' },
		'.mob-stat': { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', minWidth: '120px' },
		'.mob-stat-name': { fontSize: '18px', marginBottom: '5px', textTransform: 'capitalize', fontWeight: 'bold' },
		'.mob-stat-count': { fontSize: '16px', color: '#FFF' }
	};

	Object.entries(styles).forEach(([sel, style]) => $(sel).css(style));

	$('.metrics-section').each(function () {
		const section = $(this).data('section');
		const color = sectionColors[section]?.rgba || 'rgba(255,255,255,0.2)';
		$(this).css('border', `2px solid ${color}`);
		$(this).find('h3').css('color', sectionColors[section]?.primary || '#FFF');
	});

	Object.entries(sectionColors).forEach(([section, colors]) => {
		$(`[data-section="${section}"] .metric-card`).css('border', `1px solid ${colors.rgba}`);
		$(`[data-section="${section}"] .metric-value`).css('color', colors.primary);
		$(`[data-section="${section}"] .interval-btn`).css('border', `1px solid ${colors.primary}`);
		$(`[data-section="${section}"] .metric-chart`).css('border', `1px solid ${colors.rgba}`);
	});

	$('.damage-type-btn').each(function () {
		const color = $(this).data('color');
		if (color) {
			$(this).css('border-color', color);
			if ($(this).hasClass('active')) {
				const hexToRgba = (hex, a) =>
					`rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
				$(this).css('background', hexToRgba(color, 0.4));
			}
		}
	});
};

const attachEventHandlers = ($) => {
	const closeDashboard = () => {
		$('#metricsDashboard').hide();
		$('#metricsBackdrop').hide();
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}
	}

	$('#closeBtn').on('click', closeDashboard);
	$('#metricsBackdrop').on('click', closeDashboard);
	parent.$(parent.document).on('keydown.metricsDashboard', function (e) {
		if (e.key === 'Escape' && $('#metricsDashboard').is(':visible')) {
			closeDashboard();
		}
	});

	$('.interval-btn').on('click', function () {
		const type = $(this).data('type');
		const interval = $(this).data('interval');
		const sectionMap = { gold: 'gold', xp: 'xp', damage: 'dps', kills: 'kills', killtype: 'kills' };
		const color = sectionColors[sectionMap[type]]?.primary || '#FFF';

		$(`[data-type="${type}"]`).removeClass('active').css('background', 'rgba(255, 255, 255, 0.1)');
		const hexToRgba = (hex, a) =>
			`rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
		$(this).addClass('active').css('background', hexToRgba(color, 0.2));

		if (type === 'kills') {
			if (killInterval !== interval) {
				killInterval = interval;
				resetKillHistory();
			}
			$('[data-section="kills"] .metric-label').first().text(`Kills/${interval.charAt(0).toUpperCase() + interval.slice(1)}`);
		} else {
			const intervalState = {
				gold: { get: () => goldInterval, set: v => goldInterval = v, reset: resetGoldHistory },
				xp: { get: () => xpInterval, set: v => xpInterval = v, reset: resetXpHistory }
			};

			const s = intervalState[type];
			if (s && s.get() !== interval) {
				s.set(interval);
				s.reset();
			}
		}

		updateMetricsDashboard();
	});

	$('.damage-type-btn').on('click', function () {
		const $ = parent.$;
		const damageType = $(this).data('damage-type');
		const color = $(this).data('color');

		if ($(this).hasClass('active')) {
			$(this).removeClass('active').css('background', 'rgba(255, 255, 255, 0.1)');
			selectedDamageTypes = selectedDamageTypes.filter(t => t !== damageType);
		} else {
			$(this).addClass('active');
			const hexToRgba = (hex, a) =>
				`rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
			$(this).css('background', hexToRgba(color, 0.3));
			if (!selectedDamageTypes.includes(damageType)) {
				selectedDamageTypes.push(damageType);
			}
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
let $killRate, $totalKillCount, $mobBreakdown;
let $yourCoop, $partyCoop, $yourCoopPct;

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

		$killRate = $('#killRate');
		$totalKillCount = $('#totalKillCount');
		$mobBreakdown = $('#mobBreakdown');

		$yourCoop = $('#yourCoop');
		$partyCoop = $('#partyCoop');
		$yourCoopPct = $('#yourCoopPct');
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
		$timeToLevel.css('fontSize', '24px').text(formatTime(secondsToLevel));
	} else {
		$timeToLevel.text('--');
	}

	$xpLabel.text(`XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}`);

	if (now - lastXpUpdate >= HISTORY_INTERVAL) {
		xpHistory.push({ time: now, value: avgXP });
		if (xpHistory.length > MAX_HISTORY) xpHistory.shift();
		lastXpUpdate = now;
	}

	const totalPartyDPS = calculateTotalDamageType('DPS', now);
	const totalYourDPS = calculateDamageTypeValue(character.id, now, 'DPS');

	$partyDPS.text(totalPartyDPS.toLocaleString('en'));
	$yourDPS.text(totalYourDPS.toLocaleString('en'));

	const elapsedMs = now - dpsStartTime;
	const hours = Math.floor(elapsedMs / 3600000);
	const minutes = Math.floor((elapsedMs % 3600000) / 60000);
	$sessionTime.text(hours ? `${hours}h ${minutes}m` : `${minutes}m`);

	if (now - lastDpsUpdate >= HISTORY_INTERVAL) {
		for (const id in playerDamageSums) {
			if (!dpsHistory[id]) dpsHistory[id] = {};

			for (const damageType of Object.keys(damageTypeLabels)) {
				if (!dpsHistory[id][damageType]) dpsHistory[id][damageType] = [];

				const value = calculateDamageTypeValue(id, now, damageType);
				dpsHistory[id][damageType].push({ time: now, value });

				if (dpsHistory[id][damageType].length > MAX_HISTORY) {
					dpsHistory[id][damageType].shift();
				}
			}
		}
		lastDpsUpdate = now;
	}

	const avgKills = calculateAverageKills('Total');
	$killRate.text(Math.round(avgKills).toLocaleString('en'));
	$totalKillCount.text(totalKills.toLocaleString('en'));

	if (now - lastKillUpdate >= HISTORY_INTERVAL) {
		if (!killHistory['Total']) killHistory['Total'] = [];
		const totalAvg = calculateAverageKills('Total');
		killHistory['Total'].push({ time: now, value: totalAvg });
		if (killHistory['Total'].length > MAX_HISTORY) killHistory['Total'].shift();

		for (const mobType in mobKills) {
			if (!killHistory[mobType]) killHistory[mobType] = [];
			const mobAvg = calculateAverageKills(mobType);
			killHistory[mobType].push({ time: now, value: mobAvg });
			if (killHistory[mobType].length > MAX_HISTORY) killHistory[mobType].shift();
		}

		lastKillUpdate = now;
	}

	updateMobBreakdown($);
	updateCoopMetrics($, now);

	drawChart('goldChart', [{ history: goldHistory, color: sectionColors.gold.primary }], sectionColors.gold.primary);
	drawChart('xpChart', [{ history: xpHistory, color: sectionColors.xp.primary }], sectionColors.xp.primary);
	drawDPSBarChart();
	drawKillBarChart();
	drawCoopBarChart();
};

// ========== CO-OP TRACKING ==========
const updateCoopMetrics = ($, now) => {
	const yourDmg = character?.s?.coop?.p || 0;
	let partyTotal = yourDmg;
	let overallTotal = yourDmg;

	const partyIds = new Set(parent.party_list);

	for (let id in parent.entities) {
		const e = parent.entities[id];
		if (!e.npc && e.s?.coop?.p) {
			overallTotal += e.s.coop.p;
			if (partyIds.has(id)) {
				partyTotal += e.s.coop.p;
			}
		}
	}

	const partySharePct = overallTotal > 0 ? (partyTotal / overallTotal) * 100 : 0;

	$yourCoop.text((yourDmg | 0).toLocaleString('en'));
	$partyCoop.text((partyTotal | 0).toLocaleString('en'));
	$yourCoopPct.text(partySharePct.toFixed(2) + '%');

	if (now - lastCoopUpdate >= HISTORY_INTERVAL) {
		if (!coopHistory[character.id]) coopHistory[character.id] = [];
		coopHistory[character.id].push({ time: now, value: yourDmg });
		if (coopHistory[character.id].length > MAX_HISTORY) coopHistory[character.id].shift();

		for (let id in parent.entities) {
			const e = parent.entities[id];
			if (!e.npc && e.s?.coop?.p) {
				if (!coopHistory[id]) coopHistory[id] = [];
				coopHistory[id].push({ time: now, value: e.s.coop.p });
				if (coopHistory[id].length > MAX_HISTORY) coopHistory[id].shift();
			}
		}

		lastCoopUpdate = now;
	}
};

const drawCoopBarChart = () => {
	const $ = parent.$;
	const canvas = parent.document.getElementById('coopChart');
	if (!canvas || !$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let entities = [], max = 1, total = 0;

	if (character?.s?.coop?.p) {
		let p = character.s.coop.p;
		entities.push({ id: character.id, name: character.name, dmg: p, ctype: character.ctype });
		if (p > max) max = p;
		total += p;
	}

	for (let id in parent.entities) {
		let e = parent.entities[id];
		if (!e.npc && e.s?.coop?.p) {
			let p = e.s.coop.p;
			entities.push({ id, name: e.name || e.mtype, dmg: p, ctype: e.ctype });
			if (p > max) max = p;
			total += p;
		}
	}

	if (!entities.length) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('No boss damage yet...', canvas.width / 2, canvas.height / 2);
		return;
	}

	entities.sort((a, b) => b.dmg - a.dmg);
	max *= 1.1;

	const padding = 60;
	const labelHeight = 40;
	const chartHeight = canvas.height - padding - labelHeight;
	const chartWidth = canvas.width - 2 * padding;

	ctx.strokeStyle = sectionColors.coop.axis;
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + chartHeight * (1 - i / 5);
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();

		ctx.fillStyle = sectionColors.coop.primary;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'right';
		const value = Math.round(max * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 10, y + 5);
	}

	const groupWidth = chartWidth / entities.length;
	const barWidth = Math.min(groupWidth - 20, 80);

	for (let i = 0; i < entities.length; i++) {
		const e = entities[i];
		const groupX = padding + i * groupWidth;
		const color = classColors[e.ctype.toLowerCase()] || classColors.default;

		const barHeight = (e.dmg / max) * chartHeight;
		const barX = groupX + (groupWidth - barWidth) / 2;
		const barY = padding + chartHeight - barHeight;

		const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, color + '80');
		ctx.fillStyle = gradient;
		ctx.fillRect(barX, barY, barWidth, barHeight);

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
		ctx.lineWidth = 2;
		ctx.strokeRect(barX, barY, barWidth, barHeight);

		const pct = ((e.dmg / total) * 100).toFixed(1);
		const dmgText = (e.dmg | 0).toLocaleString();
		const pctText = `${pct}%`;

		// Draw percentage above bar (always visible)
		ctx.font = '22px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'black';
		ctx.strokeText(pctText, barX + barWidth / 2, barY - 5);
		ctx.fillStyle = color;
		ctx.fillText(pctText, barX + barWidth / 2, barY - 5);

		// Draw damage value inside bar (if tall enough)
		if (barHeight > 20) {
			ctx.font = '16px pixel, monospace';
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'black';
			ctx.strokeText(dmgText, barX + barWidth / 2, barY + 18);
			ctx.fillStyle = 'white';
			ctx.fillText(dmgText, barX + barWidth / 2, barY + 18);
		}

		ctx.fillStyle = color;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(e.name, groupX + groupWidth / 2, canvas.height - 20);
	}
};

// ========== CHART DRAWING ==========
const drawDPSBarChart = () => {
	const $ = parent.$;
	const canvas = parent.document.getElementById('dpsChart');
	if (!canvas || !$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const now = performance.now();
	const players = [];

	for (const id in playerDamageSums) {
		const player = get_player(id);
		if (!player) continue;

		const values = {};
		for (const type of selectedDamageTypes) {
			values[type] = calculateDamageTypeValue(id, now, type);
		}

		players.push({ id, name: player.name, ctype: player.ctype, values });
	}

	if (players.length === 0) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
		return;
	}

	if (selectedDamageTypes.length === 0) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Select a damage type to display', canvas.width / 2, canvas.height / 2);
		return;
	}

	players.sort((a, b) => {
		const sumA = Object.values(a.values).reduce((s, v) => s + v, 0);
		const sumB = Object.values(b.values).reduce((s, v) => s + v, 0);
		return sumB - sumA;
	});

	const padding = 60;
	const labelHeight = 40;
	const chartHeight = canvas.height - padding - labelHeight;
	const chartWidth = canvas.width - 2 * padding;

	let maxValue = 1;
	for (const player of players) {
		for (const type of selectedDamageTypes) {
			if (player.values[type] > maxValue) maxValue = player.values[type];
		}
	}
	maxValue *= 1.1;

	ctx.strokeStyle = sectionColors.dps.axis;
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + chartHeight * (1 - i / 5);
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();

		ctx.fillStyle = sectionColors.dps.primary;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'right';
		const value = Math.round(maxValue * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 10, y + 5);
	}

	const groupWidth = chartWidth / players.length;
	const barWidth = Math.min(groupWidth / selectedDamageTypes.length - 10, 60);
	const groupPadding = (groupWidth - barWidth * selectedDamageTypes.length) / 2;

	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		const groupX = padding + i * groupWidth;

		for (let j = 0; j < selectedDamageTypes.length; j++) {
			const type = selectedDamageTypes[j];
			const value = player.values[type];
			const barHeight = (value / maxValue) * chartHeight;
			const barX = groupX + groupPadding + j * barWidth;
			const barY = padding + chartHeight - barHeight;

			const baseColor = type === 'DPS'
				? (classColors[player.ctype] || damageTypeColors.DPS)
				: damageTypeColors[type];

			ctx.fillStyle = getDamageBarFill(ctx, type, barX, barY, barWidth, barHeight, baseColor);
			ctx.fillRect(barX, barY, barWidth, barHeight);

			ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.lineWidth = 1;
			ctx.strokeRect(barX, barY, barWidth, barHeight);

			if (barHeight > 30) {
				ctx.font = '18px pixel, monospace';
				ctx.textAlign = 'center';

				const text = value.toLocaleString();
				const x = barX + barWidth / 2;
				const y = barY + 15;

				ctx.lineWidth = 3;
				ctx.strokeStyle = 'black';
				ctx.strokeText(text, x, y);

				ctx.fillStyle = 'white';
				ctx.fillText(text, x, y);
			}
		}

		ctx.fillStyle = classColors[player.ctype] || '#FFF';
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(player.name, groupX + groupWidth / 2, canvas.height - 20);
	}

	if (selectedDamageTypes.length > 0) {
		const legendY = 10;
		let legendX = padding;

		for (const type of selectedDamageTypes) {
			if (type === 'DPS' && players.length === 1) {
				const player = players[0];
				ctx.fillStyle = classColors[player.ctype] || damageTypeColors.DPS;
			} else {
				ctx.fillStyle = damageTypeColors[type];
			}
			ctx.fillRect(legendX, legendY, 15, 15);

			ctx.fillStyle = 'white';
			ctx.font = '16px pixel, monospace';
			ctx.textAlign = 'left';
			const label = type === 'DPS' && players.length === 1 ? damageTypeLabels[type] : damageTypeLabels[type];
			ctx.fillText(label, legendX + 20, legendY + 12);

			legendX += ctx.measureText(label).width + 40;
		}
	}
};

const updateMobBreakdown = ($) => {
	const sortedMobs = Object.entries(mobKills).sort((a, b) => b[1] - a[1]);

	if (sortedMobs.length === 0) {
		$mobBreakdown.html('<div style="text-align: center; color: #999; padding: 20px;">No kills yet...</div>');
		return;
	}

	let html = `<div class="mob-breakdown-title" style=" text-align: center; color: #9D4EDD; font-weight: bold; font-size: 22px; margin-bottom: 10px;">Mob Breakdown</div><div class="mob-breakdown-grid" style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">`;

	sortedMobs.forEach(([mobType, count]) => {
		const percentage = ((count / totalKills) * 100).toFixed(1);
		const color = getMobColor(mobType);

		html += `
			<div class="mob-stat" style="text-align: center; font-size: 18px;">
				<span class="mob-stat-name" style="color: ${color}; display: block; font-weight: bold;">${mobType}</span>
				<span class="mob-stat-count" style="display: block;">${count.toLocaleString()} (${percentage}%)</span>
			</div>
		`;
	});

	html += '</div>';
	$mobBreakdown.html(html);
};

const drawKillBarChart = () => {
	const $ = parent.$;
	const canvas = parent.document.getElementById('killChart');
	if (!canvas || !$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const mobData = [];
	const allMobTypes = Object.keys(mobKills);

	for (const mobType of allMobTypes) {
		const value = calculateAverageKills(mobType);
		mobData.push({ type: mobType, displayName: mobType.charAt(0).toUpperCase() + mobType.slice(1), value });
	}

	if (mobData.length === 0) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('No kills yet...', canvas.width / 2, canvas.height / 2);
		return;
	}

	mobData.sort((a, b) => b.value - a.value);

	const padding = 60;
	const labelHeight = 40;
	const chartHeight = canvas.height - padding - labelHeight;
	const chartWidth = canvas.width - 2 * padding;

	let maxValue = 1;
	for (const mob of mobData) {
		if (mob.value > maxValue) maxValue = mob.value;
	}
	maxValue *= 1.1;

	ctx.strokeStyle = sectionColors.kills.axis;
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + chartHeight * (1 - i / 5);
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();

		ctx.fillStyle = sectionColors.kills.primary;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'right';
		const value = Math.round(maxValue * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 10, y + 5);
	}

	const groupWidth = chartWidth / mobData.length;
	const barWidth = Math.min(groupWidth - 20, 60);

	for (let i = 0; i < mobData.length; i++) {
		const mob = mobData[i];
		const groupX = padding + i * groupWidth;
		const mobColor = getMobColor(mob.type);

		const value = mob.value;
		const barHeight = (value / maxValue) * chartHeight;
		const barX = groupX + (groupWidth - barWidth) / 2;
		const barY = padding + chartHeight - barHeight;

		ctx.fillStyle = mobColor;
		ctx.fillRect(barX, barY, barWidth, barHeight);

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 1;
		ctx.strokeRect(barX, barY, barWidth, barHeight);

		if (barHeight > 30) {
			ctx.font = '18px pixel, monospace';
			ctx.textAlign = 'center';

			const text = Math.round(value).toLocaleString();
			const x = barX + barWidth / 2;
			const y = barY + 15;

			ctx.lineWidth = 3;
			ctx.strokeStyle = 'black';
			ctx.strokeText(text, x, y);

			ctx.fillStyle = 'white';
			ctx.fillText(text, x, y);
		}

		ctx.fillStyle = mobColor;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(mob.displayName, groupX + groupWidth / 2, canvas.height - 20);
	}
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

const calculateAverageKills = (killType = 'Total') => {
	const elapsed = (performance.now() - killStartTime) / 1000;
	const divisor = elapsed / intervalSeconds[killInterval];
	if (divisor <= 0) return 0;

	if (killType === 'Total') {
		return totalKills / divisor;
	} else {
		return (mobKills[killType] || 0) / divisor;
	}
};

const formatTime = (seconds) => {
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${d}d ${h}h ${m}m`;
};

function getMobColor(mobType) {
	if (!mobColorMap[mobType]) {
		const colorIndex = Object.keys(mobColorMap).length % mobColors.length;
		mobColorMap[mobType] = mobColors[colorIndex];
	}
	return mobColorMap[mobType];
}

const resetGoldHistory = () => {
	goldHistory.length = 0;
	lastGoldUpdate = 0;
};

const resetXpHistory = () => {
	xpHistory.length = 0;
	lastXpUpdate = 0;
};

const resetKillHistory = () => {
	for (const key in killHistory) {
		killHistory[key].length = 0;
	}
	lastKillUpdate = 0;
};

const barGradientCache = {};

function getDamageBarFill(ctx, type, barX, barY, barWidth, barHeight, fallbackColor) {
	if (type !== 'Burn' && type !== 'Blast') {
		return fallbackColor;
	}

	const key = `${type}_${barWidth}_${barHeight}`;
	if (barGradientCache[key]) return barGradientCache[key];

	const g = ctx.createLinearGradient(barX, barY + barHeight, barX, barY);

	switch (type) {
		case 'Burn':
			g.addColorStop(0.0, '#8B1A1A');
			g.addColorStop(0.5, '#F4511E');
			g.addColorStop(1.0, '#FFD54F');
			break;

		case 'Blast':
			g.addColorStop(0.0, '#6D2C00');
			g.addColorStop(1.0, '#FF9800');
			break;
	}

	barGradientCache[key] = g;
	return g;
}

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
		$('#metricsBackdrop').hide();
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}
	} else {
		$('#metricsBackdrop').show();
		dashboard.show();
		updateMetricsDashboard();
		if (!updateInterval) {
			updateInterval = setInterval(updateMetricsDashboard, 1000);
		}
	}
};

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
		if (get_player(data.hid) && isParty(data.hid) && (data.heal || data.lifesteal)) {
			const e = getPlayerEntry(data.hid);
			const healer = get_player(data.hid);
			const target = get_player(data.id);

			const totalHeal = (data.heal ?? 0) + (data.lifesteal ?? 0);
			if (includeOverheal) {
				e.sumHeal += totalHeal;
			} else {
				const actualHeal = (data.heal
					? Math.min(data.heal, (target?.max_hp ?? 0) - (target?.hp ?? 0))
					: 0
				) + (data.lifesteal
					? Math.min(data.lifesteal, healer.max_hp - healer.hp)
					: 0
					);
				e.sumHeal += actualHeal;
			}
		}
		if (get_player(data.hid) && isParty(data.hid) && data.manasteal) {
			const e = getPlayerEntry(data.hid);
			const p = get_entity(data.hid);
			if (includeOverMana) {
				e.sumManaSteal += data.manasteal;
			} else {
				e.sumManaSteal += Math.min(data.manasteal, p.max_mp - p.mp);
			}
		}
		if (data.damage && get_player(data.hid)) {
			const e = getPlayerEntry(data.hid);
			e.sumDamage += data.damage;
			if (data.source === 'burn') {
				e.sumBurnDamage += data.damage;
			} else if (data.splash) {
				e.sumBlastDamage += data.damage;
			} else if (data.source === 'cleave') {
				e.sumCleaveDamage += data.damage;
			} else {
				e.sumBaseDamage += data.damage;
			}
		}
	} catch (err) {
		console.error('hit handler error', err);
	}
});

parent.socket.on("kill_credit", async (data) => {
	const { mtype } = data;
	if (!mtype) return;

	totalKills++;
	mobKills[mtype] = (mobKills[mtype] || 0) + 1;
	getMobColor(mtype);

	if (CONFIG.equipment.temporal.enabled && mtype === CONFIG.equipment.temporal.targetMob) {
		if (!is_on_cooldown("temporalsurge")) {
			await handleTemporalSurge();
		}
	}
});

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
