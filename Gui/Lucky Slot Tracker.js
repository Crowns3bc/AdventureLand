let slotData = get("slot_roll_data") || {};
let lastLoggedRoll = null;

for (let i = 0; i < 42; i++) {
	const old = slotData[i] || slotData[String(i)];
	slotData[i] = { zero: old?.zero ?? old?.perfectRolls ?? 0, high: old?.high ?? old?.rollsAbove96_3 ?? 0 };
}
set("slot_roll_data", slotData);

async function q_data_handler(event) {
	if (event.p.nums.length !== 4) return;
	const rolled = (event.p.nums[3] * 1000 + event.p.nums[2] * 100 + event.p.nums[1] * 10 + event.p.nums[0]) / 10000;
	const slot = event.num;
	if (slot < 0 || slot >= 42) return;

	const now = Date.now();
	if (lastLoggedRoll && lastLoggedRoll.slot === slot && lastLoggedRoll.rolled === rolled && now - lastLoggedRoll.time < 100) return;

	if (rolled === 0) slotData[slot].zero++;
	else if (rolled > 0.963) slotData[slot].high++;

	set("slot_roll_data", slotData);
	lastLoggedRoll = { slot, rolled, time: now };
	if (parent.$("#slotLuckDashboard").is(":visible")) renderSlotDashboard();
}

parent.socket.on("q_data", q_data_handler);

setTimeout(() => {
	const $ = parent.$;
	if (parent.buttons?.slotLuck) delete parent.buttons.slotLuck;
	$(".codebuttonslotLuck").remove();
	add_top_button("slotLuck", "Lucky Slots", renderSlotDashboard);
}, 100);

function ensureSlotDashboardStyles() {
	const $ = parent.$;
	if ($("#slotLuckStyles").length) return;
	$("<style id='slotLuckStyles'>").text(`
		#slotLuckDashboard *{box-sizing:border-box}
		#slotLuckDashboard .sl-title{text-align:center;color:#f1c054;font-size:40px;margin-bottom:20px}
		#slotLuckDashboard .sl-legend{display:flex;justify-content:center;gap:44px;padding-bottom:18px;margin-bottom:20px;border-bottom:2px solid gray}
		#slotLuckDashboard .sl-legend-item{display:flex;align-items:center;gap:12px}
		#slotLuckDashboard .sl-legend-item b{display:inline-flex;align-items:center;justify-content:center;width:52px;height:38px;border:2px solid gray;font-size:22px!important;background:black}
		#slotLuckDashboard .sl-badge-zero{color:#5DE376!important;border-color:#5DE376!important}
		#slotLuckDashboard .sl-badge-high{color:#D95A55!important;border-color:#D95A55!important}
		#slotLuckDashboard .sl-lucky{margin:0 auto 24px;padding:12px 24px;text-align:center;width:400px;border:2px solid #f1c054}
		#slotLuckDashboard .sl-lucky-label{color:gray;font-size:20px}
		#slotLuckDashboard .sl-lucky-slot{color:#f1c054;font-size:40px;font-weight:bold}
		#slotLuckDashboard .sl-lucky-stats{color:#C3C3C3;font-size:24px}
		#slotLuckDashboard .sl-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
		#slotLuckDashboard .sl-slot{position:relative;width:82px;height:82px;background:black;border:2px solid gray;display:flex;align-items:center;justify-content:center}
		#slotLuckDashboard .sl-slot.sl-lucky-tile{border-color:#f1c054;box-shadow:inset 0 0 0 1px rgba(241,192,84,.25),0 0 6px rgba(241,192,84,.4)}
		#slotLuckDashboard .sl-slot-num{color:gray;font-size:22px}
		#slotLuckDashboard .sl-corner{position:absolute;background:black;border:2px solid gray;font-size:20px;line-height:20px;padding:3px 6px;min-width:20px;text-align:center}
		#slotLuckDashboard .sl-corner-zero{bottom:-2px;left:-2px;color:#5DE376;border-color:#5DE376}
		#slotLuckDashboard .sl-corner-high{bottom:-2px;right:-2px;color:#D95A55;border-color:#D95A55}
	`).appendTo("head");
}

function renderSlotDashboard() {
	ensureSlotDashboardStyles();

	let maxZero = -1, luckySlot = null, minHigh = Infinity;
	for (let i = 0; i < 42; i++) maxZero = Math.max(maxZero, slotData[i].zero);
	for (let i = 0; i < 42; i++) {
		const d = slotData[i];
		if (d.zero === maxZero && d.high < minHigh) minHigh = d.high, luckySlot = i;
	}

	const grid = [];
	for (let i = 0; i < 42; i++) {
		const d = slotData[i];
		grid.push(`<div class="sl-slot${i === luckySlot ? " sl-lucky-tile" : ""}"><div class="sl-slot-num">${i}</div><div class="sl-corner sl-corner-zero">${d.zero}</div><div class="sl-corner sl-corner-high">${d.high}</div></div>`);
	}

	const luckyText = luckySlot !== null
		? `<div class="sl-lucky-slot">SLOT ${luckySlot}</div><div class="sl-lucky-stats">${slotData[luckySlot].zero} × 00.00  •  ${slotData[luckySlot].high} × >96.3</div>`
		: `<div class="sl-lucky-slot">--</div><div class="sl-lucky-stats">Waiting for rolls...</div>`;

	const html = `<div id="slotLuckDashboard" style="border:5px solid gray;background:black;padding:24px;color:#E4E4E4;font-size:28px;line-height:30px;">
		<div class="sl-title cbold">Lucky Slots</div>
		<div class="sl-legend">
			<span class="sl-legend-item"><b class="sl-badge-zero">00</b></span>
			<span class="sl-legend-item"><b class="sl-badge-high">&gt;96</b></span>
		</div>
		<div class="sl-lucky">
			<div class="sl-lucky-label">POTENTIAL LUCKY SLOT</div>
			${luckyText}
		</div>
		<div class="sl-grid">${grid.join('')}</div>
	</div>`;

	parent.show_modal(html, { wrap: false, hideinbackground: true, title: "Lucky Slots" });
}
