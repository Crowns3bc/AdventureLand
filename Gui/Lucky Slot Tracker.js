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
	updateSlotDashboard();
}

parent.socket.on("q_data", q_data_handler);

setTimeout(() => {
	const $ = parent.$;
	$("#slotLuckDashboard").remove();
	if (parent.buttons?.slotLuck) delete parent.buttons.slotLuck;
	$(".codebuttonslotLuck").remove();
	add_top_button("slotLuck", "Luck", toggleSlotDashboard);
}, 100);

function createSlotDashboard() {
	const $ = parent.$;
	$("#slotLuckDashboard").remove();
	const font = $("#bottomrightcorner").css("font-family") || "pixel, monospace";

	const dashboard = $(`
		<div id="slotLuckDashboard">
			<div class="sl-title cbold">Lucky Slots</div>
			<div class="sl-legend">
				<span class="sl-legend-item"><b class="sl-badge-zero">00</b></span></span>
				<span class="sl-legend-item"><b class="sl-badge-high">&gt;96</b></span></span>
			</div>
			<div class="sl-lucky">
				<div class="sl-lucky-label">CURRENT LUCKY SLOT</div>
				<div class="sl-lucky-slot">--</div>
				<div class="sl-lucky-stats">Waiting for rolls...</div>
			</div>
			<div class="sl-grid"></div>
		</div>
	`).css({
		position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
		background:"black", border:"5px solid gray", zIndex:9999, display:"none",
		color:"#E4E4E4", fontFamily:font, fontSize:"28px", padding:"24px", lineHeight:"30px"
	});

	$("body").append(dashboard);

	$("<style id='slotLuckStyles'>").text(`
		#slotLuckDashboard *{box-sizing:border-box}
		#slotLuckDashboard .sl-title{text-align:center;color:#f1c054;font-size:40px;margin-bottom:20px}
		#slotLuckDashboard .sl-legend{display:flex;justify-content:center;gap:44px;padding-bottom:18px;margin-bottom:20px;border-bottom:2px solid gray}
		#slotLuckDashboard .sl-legend-item{display:flex;align-items:center;gap:12px}
		#slotLuckDashboard .sl-legend-item b{display:inline-flex;align-items:center;justify-content:center;width:52px;height:38px;border:2px solid gray;font-size:22px!important;background:black}
		#slotLuckDashboard .sl-legend-text{color:#E4E4E4!important;font-size:26px!important;line-height:32px!important;font-family:inherit!important}
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

	dashboard.find(".sl-close").on("click", () => dashboard.hide());
}

function updateSlotDashboard() {
	const $ = parent.$;
	let dashboard = $("#slotLuckDashboard");
	if (!dashboard.length) {
		createSlotDashboard();
		dashboard = $("#slotLuckDashboard");
	}

	const grid = dashboard.find(".sl-grid").empty();
	let maxZero = -1, luckySlot = null, minHigh = Infinity;

	for (let i = 0; i < 42; i++) maxZero = Math.max(maxZero, slotData[i].zero);
	for (let i = 0; i < 42; i++) {
		const d = slotData[i];
		if (d.zero === maxZero && d.high < minHigh) minHigh = d.high, luckySlot = i;
		grid.append(`<div class="sl-slot${i === luckySlot ? " sl-lucky-tile" : ""}"><div class="sl-slot-num">${i}</div><div class="sl-corner sl-corner-zero">${d.zero}</div><div class="sl-corner sl-corner-high">${d.high}</div></div>`);
	}

	if (luckySlot !== null) {
		const d = slotData[luckySlot];
		dashboard.find(".sl-lucky-slot").text(`SLOT ${luckySlot}`);
		dashboard.find(".sl-lucky-stats").text(`${d.zero} × 00.00  •  ${d.high} × >96.3`);
	}
}

function toggleSlotDashboard() {
	const $ = parent.$;
	if (!$("#slotLuckDashboard").length) createSlotDashboard();
	const d = $("#slotLuckDashboard");
	d.is(":visible") ? d.hide() : (d.show(), updateSlotDashboard());
}

console.log("Lucky Slots loaded.");
