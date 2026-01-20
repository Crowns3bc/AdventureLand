// All currently supported damageTypes: "Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF" "DPS"
// The order of the array will be the order of the display
// Displaying too many "Types" will result in a really wide meter that will effect the game_log window. i reccomend only tracking 4/5 things at a time for general use
const damageTypes = ["Base", "Blast", "HPS", "DPS"];
let displayClassTypeColors = true, displayDamageTypeColors = true, showOverheal = false, showOverManasteal = true;

const damageTypeColors = { Base: '#A92000', Blast: '#782D33', Burn: '#FF7F27', HPS: '#9A1D27', MPS: '#353C9C', DR: '#E94959', RF: '#D880F0', DPS: '#FFD700', "Dmg Taken": '#FF4C4C' };
const classColors = { mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF', ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D' };

const METER_START = performance.now();
const playerData = {};

const getEntry = id => playerData[id] || (playerData[id] = { t: performance.now(), bD: 0, blD: 0, baD: 0, h: 0, m: 0, dr: 0, rf: 0, dtP: 0, dtM: 0 });

const fmt = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

parent.$('#bottomrightcorner').find('#dpsmeter').remove();
const container = parent.$("<div id='dpsmeter'></div>").css({ fontSize: '20px', color: 'white', textAlign: 'center', display: 'table', overflow: 'hidden', marginBottom: '-3px', width: '100%', backgroundColor: 'rgba(0,0,0,1)' });
container.append(parent.$("<div id='dpsmetercontent'></div>").css({ display: 'table-cell', verticalAlign: 'middle', padding: '2px', border: '4px solid grey' }));
parent.$('#bottomrightcorner').children().first().after(container);

parent.socket.on('hit', d => {
	const inParty = id => parent.party_list.includes(id);
	if (!inParty(d.hid) && !inParty(d.id)) return;

	try {
		const dmg = d.damage || 0, isPlayer = get_player(d.id), isAttacker = get_player(d.hid);

		// Damage taken tracking
		if (dmg && isPlayer) {
			const e = getEntry(d.id);
			d.damage_type === 'physical' ? e.dtP += dmg : e.dtM += dmg;
		}
		if (d.dreturn && isAttacker) getEntry(d.hid).dtP += d.dreturn;
		if (d.reflect && isAttacker) getEntry(d.hid).dtM += d.reflect;

		// DR/RF attribution (only mob→player)
		if (d.dreturn && isPlayer && !get_player(d.hid)) getEntry(d.id).dr += d.dreturn;
		if (d.reflect && isPlayer && !get_player(d.hid)) getEntry(d.id).rf += d.reflect;

		// Attacker actions
		if (isAttacker) {
			const e = getEntry(d.hid);

			// Damage breakdown
			if (dmg) {
				d.source === 'burn' ? e.bD += dmg : d.splash ? e.blD += dmg : e.baD += dmg;
			}

			// Healing
			if (d.heal || d.lifesteal) {
				const target = get_player(d.id);
				e.h += showOverheal ? (d.heal || 0) + (d.lifesteal || 0) :
					(d.heal ? Math.min(d.heal, (target?.max_hp || 0) - (target?.hp || 0)) : 0) +
					(d.lifesteal ? Math.min(d.lifesteal, isAttacker.max_hp - isAttacker.hp) : 0);
			}

			// Mana steal
			if (d.manasteal) {
				e.m += showOverManasteal ? d.manasteal : Math.min(d.manasteal, isAttacker.max_mp - isAttacker.mp);
			}
		}
	} catch (err) {
		console.error('hit handler error', err);
	}
});

const calcVal = (type, e, elapsed) => {
	const r = 1000 / elapsed;
	const vals = {
		DPS: (e.baD + e.blD + e.bD + e.dr + e.rf) * r,
		Burn: e.bD * r,
		Blast: e.blD * r,
		Base: e.baD * r,
		HPS: e.h * r,
		MPS: e.m * r,
		DR: e.dr * r,
		RF: e.rf * r,
		'Dmg Taken': { phys: e.dtP * r | 0, mag: e.dtM * r | 0 }
	};
	return type === 'Dmg Taken' ? vals[type] : vals[type] | 0;
};

setInterval(() => {
	const $ = parent.$, c = $('#dpsmetercontent');
	if (!c.length) return;

	const now = performance.now(), elapsed = now - METER_START;
	const hrs = elapsed / 3600000 | 0, mins = (elapsed % 3600000) / 60000 | 0;

	let html = `<div>👑 Elapsed Time: ${hrs}h ${mins}m 👑</div><table border="1" style="width:100%"><tr><th></th>`;
	damageTypes.forEach(t => html += `<th style='color:${displayDamageTypeColors ? damageTypeColors[t] || 'white' : 'white'}'>${t}</th>`);
	html += '</tr>';

	// Sort by DPS
	const sorted = Object.entries(playerData).map(([id, e]) => ({ id, e, dps: calcVal('DPS', e, now - e.t) })).sort((a, b) => b.dps - a.dps);

	sorted.forEach(({ id, e }) => {
		const p = get_player(id);
		if (!p) return;
		html += `<tr><td style='color:${displayClassTypeColors ? classColors[p.ctype.toLowerCase()] || '#FFF' : '#FFF'}'>${p.name}</td>`;
		damageTypes.forEach(t => {
			const v = calcVal(t, e, now - e.t);
			html += t === 'Dmg Taken' ? `<td><span style='color:#F44'>${fmt(v.phys)}</span> | <span style='color:#6CF'>${fmt(v.mag)}</span></td>` : `<td>${fmt(v)}</td>`;
		});
		html += '</tr>';
	});

	// Totals
	html += `<tr><td style='color:${damageTypeColors.DPS}'>Total DPS</td>`;
	damageTypes.forEach(t => {
		if (t === 'Dmg Taken') {
			let totP = 0, totM = 0;
			Object.values(playerData).forEach(e => {
				const v = calcVal(t, e, now - e.t);
				totP += v.phys; totM += v.mag;
			});
			html += `<td><span style='color:#F44'>${fmt(totP)}</span> | <span style='color:#6CF'>${fmt(totM)}</span></td>`;
		} else {
			let tot = 0;
			Object.values(playerData).forEach(e => tot += calcVal(t, e, now - e.t));
			html += `<td>${fmt(tot)}</td>`;
		}
	});
	html += '</tr></table>';
	c.html(html);
}, 250);
