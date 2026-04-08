function initscoopMeter() {
	let $ = parent.$;
	$('#bottomrightcorner #scoopmeter').remove();

	let container = $('<div id="scoopmeter"></div>').css({
		fontSize: '20px',
		color: 'white',
		textAlign: 'center',
		width: '100%',
		backgroundColor: 'rgba(0,0,0,0.7)',
		marginBottom: '-3px'
	});

	$('<div id="scoopmetercontent"></div>').css({
		padding: '2px',
		border: '4px solid grey'
	}).appendTo(container);

	$('#bottomrightcorner').children().first().after(container);
}

function updatescoopMeterUI() {
	let $ = parent.$, display = $('#scoopmetercontent');
	if (!display.length) return;

	let entities = [], maxRaw = 1, totalRaw = 0, totalScaled = 0.1;

	if (character?.s?.coop?.p) {
		let p = character.s.coop.p;
		entities.push([character.name, p, character.ctype]);
		if (p > maxRaw) maxRaw = p;
		totalRaw += p;
		totalScaled += Math.pow(Math.max(0, p), 0.65);
	}

	for (let id in parent.entities) {
		let e = parent.entities[id];
		if (!e.npc && e.s?.coop?.p) {
			let p = e.s.coop.p;
			entities.push([e.name || e.mtype, p, e.ctype]);
			if (p > maxRaw) maxRaw = p;
			totalRaw += p;
			totalScaled += Math.pow(Math.max(0, p), 0.65);
		}
	}

	entities.sort((a, b) => b[1] - a[1]);

	let len = entities.length;
	if (!len) {
		display.html('<div>👑 Boss Contribution 👑</div><div>No active damage</div>');
		return;
	}

	let cols = Math.ceil(len / 6);
	let rows = Math.min(6, len);
	let colW = (100 / cols).toFixed(1);

	let html = '<div>👑 Boss Contribution 👑</div><table style="width:100%;border-collapse:collapse"><tbody>';

	for (let r = 0; r < rows; r++) {
		html += '<tr>';
		for (let c = 0; c < cols; c++) {
			let i = r + c * 6;
			if (i >= len) break;

			let [name, dmg, cls] = entities[i];
			let color = classColors[cls.toLowerCase()] || classColors.default;
			let barPct = ((dmg / maxRaw) * 100).toFixed(1);

			let scaledDmg = Math.pow(Math.max(0, dmg), 0.65);
			let actualPct = ((scaledDmg / totalScaled) * 100).toFixed(2);

			let fmt = (dmg | 0).toLocaleString('en-US');

			html += `<td style="color:${color};width:${colW}%;border:1px solid #444;padding:2px">${name}<div style="width:100%;background:#555;border-radius:3px;position:relative;height:14px"><div style="width:${barPct}%;background:${color};height:100%"></div><span style="position:absolute;top:0;left:4px;color:#000;font-weight:bold;font-size:13px;line-height:14px">${fmt}</span><span style="position:absolute;top:0;right:4px;color:#000;font-weight:bold;font-size:13px;line-height:14px">${actualPct}%</span></div></td>`;
		}
		html += '</tr>';
	}

	html += '</tbody></table>';
	display.html(html);
}

initscoopMeter();
setInterval(updatescoopMeterUI, 250);
