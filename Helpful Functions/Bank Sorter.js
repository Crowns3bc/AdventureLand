al_items = {};
const order = {};
al_items.order = order;

order.names = ["Helmets", "Armors", "Underarmors", "Gloves", "Shoes", "Capes", "Rings", "Earrings", "Amulets", "Belts", "Orbs", "Weapons", "Shields", "Offhands", "Elixirs", "Potions", "Scrolls", "Crafting and Collecting", "Exchangeables", "Others"];
order.ids = ["helmet", "chest", "pants", "gloves", "shoes", "cape", "ring", "earring", "amulet", "belt", "orb", "weapon", "shield", "offhand", "elixir", "pot", "scroll", "material", "exchange", ""];

const offhandTypes = new Set(["source", "quiver", "misc_offhand"]);
const scrollTypes = new Set(["cscroll", "uscroll", "pscroll", "offering"]);

order.item_ids = order.ids.map(() => []);
object_sort(G.items, "gold_value").forEach(([id, item]) => {
	if (item.ignore) return;
	for (let c = 0; c < order.ids.length; c++) {
		const cat = order.ids[c];
		if (!cat || item.type === cat ||
			(cat === "offhand" && offhandTypes.has(item.type)) ||
			(cat === "scroll" && scrollTypes.has(item.type)) ||
			(cat === "exchange" && item.e)) {
			order.item_ids[c].push(id); break;
		}
	}
});

const rank = new Map(order.ids.flatMap((_, c) => order.item_ids[c]).map((id, i) => [id, i]));
order.comparator = (a, b) =>
	(a == null) - (b == null) ||
	(a != null && (
		(rank.get(a.name) ?? 1e9) - (rank.get(b.name) ?? 1e9) ||
		(a.name < b.name ? -1 : a.name > b.name ? 1 : 0) ||
		b.level - a.level
	));

const getPacksOnFloor = () =>
	Object.keys(bank_packs).filter(k => k !== "gold" && bank_packs[k][0] === character.map);

function sortAllBank(invSlots, sortedBank, cursor) {
	if (!character.bank) return game_log("Not inside the bank");

	const packs = getPacksOnFloor();
	const cmp = order.comparator;

	if (!invSlots) {
		invSlots = [];
		for (let i = 0; i < 42; i++) if (!character.items[i]) invSlots.push(i);
	}
	if (!invSlots.length) return game_log("Make some space in inventory");

	if (!sortedBank) {
		let arr = [];
		for (const pack of packs) arr = arr.concat(character.bank[pack]);
		arr.sort(cmp);
		sortedBank = {}; let off = 0;
		for (const pack of packs) { sortedBank[pack] = arr.slice(off, off + 42); off += 42; }
	}

	cursor = cursor == null ? 0 : (cursor + 1) % invSlots.length;
	const slot = invSlots[cursor];
	const item = character.items[slot];
	const next = () => sortAllBank(invSlots, sortedBank, cursor);

	if (!item) {
		for (const pack of packs)
			for (let i = 0; i < 42; i++)
				if (character.bank[pack][i] && cmp(character.bank[pack][i], sortedBank[pack][i]))
					return bank_retrieve(pack, i, slot).then(next);
		invSlots.splice(cursor, 1);
		return sleep(50).then(next);
	}
	for (const pack of packs)
		for (let i = 0; i < 42; i++)
			if (!cmp(item, sortedBank[pack][i]) && cmp(character.bank[pack][i], sortedBank[pack][i]))
				return bank_store(slot, pack, i).then(next);

	return Promise.resolve(sortedBank);
}

async function runLimited(entries, worker, cap = 180) {
	const inflight = [];
	for (const entry of entries) {
		while (character.cc > cap) await sleep(50);
		inflight.push(worker(entry));
	}
	return Promise.allSettled(inflight);
}

const FLOOR_ENTRY = {
	bank: { bank: [1, -436], bank_b: [1, -436], bank_u: [1, -436] },
	bank_b: { bank: [-264, -412], bank_u: [-104, -171] },
	bank_u: { bank: [0, -41], bank_b: [0, -41] },
};

async function sortGlobalBank() {
	if (!character.bank) return game_log("Not inside the bank");
	if (!character.esize) return game_log("Need at least 1 empty inventory slot!");

	const allPacks = Object.keys(character.bank)
		.filter(k => k !== "gold" && bank_packs[k])
		.sort((a, b) => +a.replace("items", "") - +b.replace("items", ""));

	const packFloor = pack => bank_packs[pack]?.[0];
	const nm = it => it.level != null ? `${it.name} lv${it.level}` : it.name;

	const flat = [];
	for (const pack of allPacks)
		for (let i = 0; i < 42; i++)
			if (character.bank[pack]?.[i])
				flat.push({ item: character.bank[pack][i], curPack: pack, curSlot: i, targetPack: null, targetSlot: null });

	flat.sort((a, b) => order.comparator(a.item, b.item));
	for (let i = 0; i < flat.length; i++) {
		flat[i].targetPack = allPacks[Math.floor(i / 42)];
		flat[i].targetSlot = i % 42;
	}

	for (let i = 0, j; i < flat.length; i = j) {
		for (j = i + 1; j < flat.length && !order.comparator(flat[i].item, flat[j].item); j++);
		if (j - i < 2) continue;
		const tgt = new Set(), cur = new Set();
		for (let k = i; k < j; k++) { tgt.add(flat[k].targetPack + ":" + flat[k].targetSlot); cur.add(flat[k].curPack + ":" + flat[k].curSlot); }
		const free = [...tgt].filter(t => !cur.has(t));
		for (let k = i, fi = 0; k < j; k++) {
			const c = flat[k].curPack + ":" + flat[k].curSlot;
			if (tgt.has(c)) { flat[k].targetPack = flat[k].curPack; flat[k].targetSlot = flat[k].curSlot; }
			else { const [p, s] = free[fi++].split(":"); flat[k].targetPack = p; flat[k].targetSlot = +s; }
		}
	}

	const loc = new Map();
	for (const e of flat) loc.set(`${e.curPack}:${e.curSlot}`, e);

	const placed = e => e.curPack === e.targetPack && e.curSlot === e.targetSlot;
	const inInv = e => e.curPack === "__inv__";

	game_log(`Sorting ${flat.length} items across ${allPacks.length} packs`);

	const misplaced = flat.filter(e => !placed(e));
	game_log(`${misplaced.length} items are out of position`);
	const misplacedByName = {};
	for (const e of misplaced) (misplacedByName[e.item.name] ??= []).push(e);
	for (const [name, entries] of Object.entries(misplacedByName)) {
		if (entries.length === 1) {
			const e = entries[0];
			game_log(`  ${nm(e.item)}: ${e.curPack}[${e.curSlot}] -> ${e.targetPack}[${e.targetSlot}]`);
		} else {
			const first = entries[0], last = entries[entries.length - 1];
			game_log(`  ${name} x${entries.length}: ${first.curPack}[${first.curSlot}]..${last.curPack}[${last.curSlot}] -> ${first.targetPack}[${first.targetSlot}]..${last.targetPack}[${last.targetSlot}]`);
		}
	}

	let curFloor = character.map;
	const go = async to => {
		if (!to || curFloor === to) return;
		game_log(`  [travel] ${curFloor} -> ${to}`);
		const [x, y] = FLOOR_ENTRY[to][curFloor];
		await smart_move({ map: to, x, y });
		curFloor = to;
	};

	const moveToInv = (e, invSlot) => {
		loc.delete(`${e.curPack}:${e.curSlot}`);
		e.curPack = "__inv__";
		e.curSlot = invSlot;
		loc.set(`__inv__:${invSlot}`, e);
	};

	const moveToBank = (e, pack, slot) => {
		loc.delete(`${e.curPack}:${e.curSlot}`);
		e.curPack = pack;
		e.curSlot = slot;
		loc.set(`${pack}:${slot}`, e);
	};

	let iters = 0;
	while (iters++ < 500) {
		const held = flat.filter(inInv);
		const unplaced = flat.filter(e => !placed(e) && !inInv(e));
		if (!held.length && !unplaced.length) break;

		game_log(`Pass ${iters}: ${unplaced.length} unplaced, ${held.length} held`);
		let progress = false;

		if (held.length) {
			console.log(`[phase 1] depositing ${held.length} held items`);
			const byFloor = new Map();
			for (const e of held) { const f = packFloor(e.targetPack); (byFloor.get(f) ?? byFloor.set(f, []).get(f)).push(e); }
			for (const [floor, entries] of byFloor) {
				await go(floor);
				const results = await runLimited(entries, entry => {
					const occupant = loc.get(`${entry.targetPack}:${entry.targetSlot}`);
					const invSlot = entry.curSlot;
					const dest = `${entry.targetPack}[${entry.targetSlot}]`;
					console.log(occupant && occupant !== entry
						? `  storing ${nm(entry.item)} -> ${dest} (displacing ${nm(occupant.item)})`
						: `  storing ${nm(entry.item)} -> ${dest}`);
					return bank_store(entry.curSlot, entry.targetPack, entry.targetSlot).then(() => {
						moveToBank(entry, entry.targetPack, entry.targetSlot);
						if (occupant && occupant !== entry) moveToInv(occupant, invSlot);
					});
				});
				results.forEach((r, i) => { if (r.status === "fulfilled") progress = true; else console.log(`  failed: ${nm(entries[i].item)} - ${r.reason?.reason ?? r.reason}`); });
			}
		}

		const stillUnplaced = flat.filter(e => !placed(e) && !inInv(e));
		if (stillUnplaced.length) {
			const freeSlots = [];
			for (let i = 0; i < 42; i++) if (!character.items[i]) freeSlots.push(i);
			const batch = stillUnplaced.slice(0, freeSlots.length);
			console.log(`[phase 2] picking up ${batch.length} unplaced items`);
			const byFloor = new Map();
			for (const e of batch) { const f = packFloor(e.curPack); (byFloor.get(f) ?? byFloor.set(f, []).get(f)).push(e); }
			for (const [floor, entries] of byFloor) {
				await go(floor);
				const results = await runLimited(batch, entry => {
					const fi = freeSlots.pop();
					console.log(`  retrieving ${nm(entry.item)} from ${entry.curPack}[${entry.curSlot}]`);
					return bank_retrieve(entry.curPack, entry.curSlot, fi).then(() => moveToInv(entry, fi));
				});
				results.forEach((r, i) => { if (r.status === "fulfilled") progress = true; else console.log(`  failed: ${nm(entries[i].item)} - ${r.reason?.reason ?? r.reason}`); });
			}
			if (batch.length < stillUnplaced.length) console.log("  inventory full, will deposit next pass");
		}

		if (!progress) { game_log("No progress made, aborting"); break; }
	}

	game_log("Running per-floor fine sort");
	for (const floor of ["bank", "bank_b", "bank_u"]) {
		await go(floor);
		await sortAllBank();
		game_log(`Sorted ${floor}`);
	}
	game_log("Complete!");
}

sortGlobalBank();
