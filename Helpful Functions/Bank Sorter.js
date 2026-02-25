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
	if (!character.bank) return console.log("Not inside the bank");

	const packs = getPacksOnFloor();
	const cmp = order.comparator;

	if (!invSlots) {
		invSlots = [];
		for (let i = 0; i < 42; i++) if (!character.items[i]) invSlots.push(i);
	}
	if (!invSlots.length) return console.log("Make some space in inventory");

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
		return sleep(150).then(next);
	}
	for (const pack of packs)
		for (let i = 0; i < 42; i++)
			if (!cmp(item, sortedBank[pack][i]) && cmp(character.bank[pack][i], sortedBank[pack][i]))
				return bank_store(slot, pack, i).then(next);

	return Promise.resolve(sortedBank);
}

const FLOOR_ENTRY = {
	bank: { bank: [1, -436], bank_b: [1, -436], bank_u: [1, -436] },
	bank_b: { bank: [-264, -412], bank_u: [-104, -171] },
	bank_u: { bank: [0, -41], bank_b: [0, -41] },
};

async function sortGlobalBank() {
	if (!character.bank) return console.log("Not inside the bank");
	if (!character.esize) return console.log("Need at least 1 empty inventory slot!");

	const allPacks = Object.keys(character.bank)
		.filter(k => k !== "gold" && bank_packs[k])
		.sort((a, b) => +a.replace("items", "") - +b.replace("items", ""));

	const packFloor = pack => bank_packs[pack][0];

	const flat = [];
	for (const pack of allPacks)
		for (let i = 0; i < 42; i++)
			if (character.bank[pack]?.[i])
				flat.push({ item: character.bank[pack][i], curPack: pack, curSlot: i, targetPack: null, targetSlot: null });

	flat.sort((a, b) => al_items.order.comparator(a.item, b.item));
	for (let i = 0; i < flat.length; i++) {
		flat[i].targetPack = allPacks[Math.floor(i / 42)];
		flat[i].targetSlot = i % 42;
	}

	const loc = new Map();
	for (const e of flat) loc.set(`${e.curPack}:${e.curSlot}`, e);

	const placed = e => e.curPack === e.targetPack && e.curSlot === e.targetSlot;
	const inInv = e => e.curPack === "__inv__";

	let curFloor = character.map;
	const go = async to => {
		if (curFloor === to) return;
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

		console.log(`Pass ${iters}: ${unplaced.length} unplaced, ${held.length} in inv`);
		let progress = false;

		for (const entry of held) {
			if (!inInv(entry)) continue;
			await go(packFloor(entry.targetPack));

			const occupant = loc.get(`${entry.targetPack}:${entry.targetSlot}`);
			await bank_store(entry.curSlot, entry.targetPack, entry.targetSlot);

			const invSlot = entry.curSlot;
			moveToBank(entry, entry.targetPack, entry.targetSlot);

			if (occupant && occupant !== entry) {
				moveToInv(occupant, invSlot);
			}
			progress = true;
		}

		const stillUnplaced = flat.filter(e => !placed(e) && !inInv(e));
		for (const entry of stillUnplaced) {
			const fi = character.items.findIndex(it => !it);
			if (fi === -1) break;
			await go(packFloor(entry.curPack));
			await bank_retrieve(entry.curPack, entry.curSlot, fi);
			moveToInv(entry, fi);
			progress = true;
		}

		if (!progress) { console.log("No progress, aborting"); break; }
	}

	console.log("Global sort done, running per-floor fine sort...");
	for (const floor of ["bank", "bank_b", "bank_u"]) {
		await go(floor);
		await sortAllBank();
		console.log(`Sorted ${floor}`);
	}
	console.log("Complete!");
}

sortGlobalBank();
