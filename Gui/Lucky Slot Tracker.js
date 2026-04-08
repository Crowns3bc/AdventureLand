// Load existing data from storage or initialize empty
let slotData = get("slot_roll_data") || {};
let lastLoggedRoll = null;

// Initialize slot data structure
function initSlotData(slot) {
	if (!slotData[slot]) {
		slotData[slot] = {
			totalRolls: 0,
			sumRolls: 0,
			rollsAbove96_3: 0,
			perfectRolls: 0
		};
	}
}

async function q_data_handler(event) {
	if (event.p.nums.length === 4) {
		// Calculate the rolled value
		const rolled = parseFloat(
			`0.${event.p.nums[3]}${event.p.nums[2]}${event.p.nums[1]}${event.p.nums[0]}`
		);
		const slot = event.num;

		// Prevent duplicate logging (same slot + roll within 100ms)
		if (lastLoggedRoll &&
			lastLoggedRoll.slot === slot &&
			lastLoggedRoll.rolled === rolled &&
			Date.now() - lastLoggedRoll.timestamp < 100) {
			return;
		}

		// Log the roll
		initSlotData(slot);
		slotData[slot].totalRolls++;
		slotData[slot].sumRolls += rolled;
		if (rolled > 0.963) {
			slotData[slot].rollsAbove96_3++;
		}
		if (rolled === 0) {
			slotData[slot].perfectRolls++;
		}

		// Save to storage
		set("slot_roll_data", slotData);

		// Update duplicate tracker
		lastLoggedRoll = { slot: slot, rolled: rolled, timestamp: Date.now() };

		console.log(`Logged roll ${rolled.toFixed(4)} for slot ${slot}`);
	}
}

// Analysis function
function analyzeSlots() {
	const slots = Object.keys(slotData).sort((a, b) => parseInt(a) - parseInt(b));

	if (slots.length === 0) {
		show_json("No data collected yet.");
		return;
	}

	let output = "=".repeat(50) + "\n";
	output += "SLOT ANALYSIS\n";
	output += "=".repeat(50) + "\n\n";

	let bestSlot = null;
	let bestAvg = 1;

	for (const slot of slots) {
		const data = slotData[slot];
		const avgRoll = data.sumRolls / data.totalRolls;
		const highRollPercent = (data.rollsAbove96_3 / data.totalRolls) * 100;

		output += `Slot ${slot}: ${data.totalRolls} rolls | Avg: ${avgRoll.toFixed(4)} | >0.963: ${data.rollsAbove96_3} (${highRollPercent.toFixed(1)}%) | Perfect 0s: ${data.perfectRolls}\n`;

		if (avgRoll < bestAvg) {
			bestAvg = avgRoll;
			bestSlot = slot;
		}
	}

	output += "=".repeat(50) + "\n";
	output += `Best Slot: ${bestSlot} (Avg: ${bestAvg.toFixed(4)})\n`;
	output += "=".repeat(50);

	show_json(output);
}

// Export compact data
function exportSlotData() {
	const compactData = {};

	for (const slot in slotData) {
		const data = slotData[slot];
		compactData[slot] = {
			totalRolls: data.totalRolls,
			avgRoll: parseFloat((data.sumRolls / data.totalRolls).toFixed(4)),
			rollsAbove96_3: data.rollsAbove96_3,
			perfectRolls: data.perfectRolls
		};
	}

	show_json(compactData);
	return compactData;
}

parent.socket.on("q_data", q_data_handler);

window.analyzeSlots = analyzeSlots;
window.exportSlotData = exportSlotData;

// ========== UI CREATION ==========
setTimeout(() => {
	const $ = parent.$;
	$('#slotAnalysisDashboard').remove();
	if (parent.buttons?.['slotAnalysis']) {
		delete parent.buttons['slotAnalysis'];
		$('.codebuttonslotAnalysis').remove();
	}
	add_top_button('slotAnalysis', 'Slots', toggleSlotDashboard);
}, 100);

const createSlotDashboard = () => {
	const $ = parent.$;
	$('#slotAnalysisDashboard').remove();

	const dashboard = $(`
		<div id="slotAnalysisDashboard">
			<div id="slotHeader">
				<span id="slotTitle">Lucky Slot Analysis</span>
				<button id="slotCloseBtn">×</button>
			</div>
			<div id="slotContent">
				<div class="slot-stats">
					<div class="stat-card">
						<div class="stat-label">Total Rolls</div>
						<div class="stat-value" id="totalRollsAll">0</div>
					</div>
					<div class="stat-card">
						<div class="stat-label">Best Slot</div>
						<div class="stat-value" id="bestSlotDisplay">--</div>
					</div>
					<div class="stat-card">
						<div class="stat-label">Worst Slot</div>
						<div class="stat-value" id="worstSlotDisplay">--</div>
					</div>
				</div>
				<canvas id="slotChart"></canvas>
			</div>
		</div>
	`).css({
		position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
		width: '1400px', height: '800px', background: 'rgba(20, 20, 30, 0.98)',
		border: '3px solid #FFD700', borderRadius: '10px', zIndex: 9999, display: 'none',
		boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)', overflow: 'hidden',
		fontFamily: $('#bottomrightcorner').css('font-family') || 'pixel'
	});

	$('body').append(dashboard);
	applySlotStyles($);
	attachSlotHandlers($);
};

const applySlotStyles = ($) => {
	const styles = {
		'#slotHeader': {
			background: 'linear-gradient(to right, #1a1a2e, #16213e)', padding: '12px 15px',
			borderBottom: '2px solid #FFD700', display: 'flex', justifyContent: 'space-between',
			alignItems: 'center', borderRadius: '7px 7px 0 0', userSelect: 'none'
		},
		'#slotTitle': { color: '#FFD700', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' },
		'#slotCloseBtn': { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #FFD700', color: '#FFD700', fontSize: '20px', width: '30px', height: '30px', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s' },
		'#slotContent': { padding: '20px', color: 'white', height: 'calc(100% - 70px)', display: 'flex', flexDirection: 'column' },
		'.slot-stats': { display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' },
		'.stat-card': { background: 'rgba(0, 0, 0, 0.4)', padding: '15px 30px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 215, 0, 0.3)' },
		'.stat-label': { fontSize: '16px', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' },
		'.stat-value': { fontSize: '28px', fontWeight: 'bold', color: '#FFD700' },
		'#slotChart': { width: '100%', height: '600px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)', display: 'block' }
	};

	Object.entries(styles).forEach(([sel, style]) => $(sel).css(style));
};

const attachSlotHandlers = ($) => {
	$('#slotCloseBtn').on('click', () => $('#slotAnalysisDashboard').hide());
	$('#slotCloseBtn').hover(
		function () { $(this).css('background', 'rgba(255, 215, 0, 0.3)'); },
		function () { $(this).css('background', 'rgba(255, 255, 255, 0.1)'); }
	);
};

const updateSlotDashboard = () => {
	const $ = parent.$;
	const slots = Object.keys(slotData).map(Number).sort((a, b) => a - b);

	if (slots.length === 0) return;

	let totalRolls = 0;
	let bestSlot = null;
	let worstSlot = null;
	let bestAvg = 1;
	let worstAvg = 0;

	for (const slot of slots) {
		const data = slotData[slot];
		const avg = data.sumRolls / data.totalRolls;
		totalRolls += data.totalRolls;

		if (avg < bestAvg) {
			bestAvg = avg;
			bestSlot = slot;
		}
		if (avg > worstAvg) {
			worstAvg = avg;
			worstSlot = slot;
		}
	}

	$('#totalRollsAll').text(totalRolls.toLocaleString());
	$('#bestSlotDisplay').text(bestSlot !== null ? `${bestSlot} (${bestAvg.toFixed(4)})` : '--');
	$('#worstSlotDisplay').text(worstSlot !== null ? `${worstSlot} (${worstAvg.toFixed(4)})` : '--');

	drawSlotChart();
};

const drawSlotChart = () => {
	const canvas = parent.document.getElementById('slotChart');
	if (!canvas || !parent.$('#slotAnalysisDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const slots = Object.keys(slotData).map(Number).sort((a, b) => a - b);

	if (slots.length === 0) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('No data collected yet. Start upgrading!', canvas.width / 2, canvas.height / 2);
		return;
	}

	// Calculate averages and find min/max for scaling
	const slotAvgs = {};
	let minAvg = 1;
	let maxAvg = 0;

	for (const slot of slots) {
		const data = slotData[slot];
		const avg = data.sumRolls / data.totalRolls;
		slotAvgs[slot] = avg;
		minAvg = Math.min(minAvg, avg);
		maxAvg = Math.max(maxAvg, avg);
	}

	const padding = 60;
	const bottomPadding = 50;
	const chartWidth = canvas.width - 2 * padding;
	const chartHeight = canvas.height - padding - bottomPadding;
	const barWidth = Math.max(15, chartWidth / slots.length - 5);
	const barSpacing = (chartWidth - barWidth * slots.length) / (slots.length - 1 || 1);

	// Draw grid lines
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + chartHeight * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();
	}

	// Draw axes
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, canvas.height - bottomPadding);
	ctx.lineTo(canvas.width - padding, canvas.height - bottomPadding);
	ctx.stroke();

	// Draw bars
	slots.forEach((slot, idx) => {
		const avg = slotAvgs[slot];
		const x = padding + idx * (barWidth + barSpacing);
		const barHeight = chartHeight * (avg / maxAvg);
		const y = canvas.height - bottomPadding - barHeight;

		// Color based on performance (green = good/low, red = bad/high)
		const normalized = (avg - minAvg) / (maxAvg - minAvg || 1);
		const r = Math.floor(normalized * 255);
		const g = Math.floor((1 - normalized) * 255);
		ctx.fillStyle = `rgb(${r}, ${g}, 50)`;

		ctx.fillRect(x, y, barWidth, barHeight);

		// Draw perfect rolls count inside the bar at the bottom (always show, even if 0)
		const perfectRolls = slotData[slot].perfectRolls || 0;
		ctx.font = 'bold 16px pixel, monospace';
		ctx.textAlign = 'center';

		// Draw black outline
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 3;
		ctx.strokeText(perfectRolls.toString(), x + barWidth / 2, canvas.height - bottomPadding - 8);

		// Draw white text on top
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(perfectRolls.toString(), x + barWidth / 2, canvas.height - bottomPadding - 8);

		// Draw slot number below each bar
		ctx.fillStyle = '#FFD700';
		ctx.font = '14px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(slot.toString(), x + barWidth / 2, canvas.height - bottomPadding + 20);
	});

	// Draw Y-axis labels
	ctx.fillStyle = '#FFD700';
	ctx.font = '16px pixel, monospace';
	ctx.textAlign = 'right';
	for (let i = 0; i <= 5; i++) {
		const value = (maxAvg * i / 5).toFixed(3);
		const y = canvas.height - bottomPadding - (chartHeight * i / 5);
		ctx.fillText(value, padding - 10, y + 4);
	}

	// Draw title
	ctx.font = '20px pixel, monospace';
	ctx.textAlign = 'center';
	ctx.fillText('Average Roll by Slot (Lower = Better)', canvas.width / 2, 30);
};

const toggleSlotDashboard = () => {
	const $ = parent.$;
	let dashboard = $('#slotAnalysisDashboard');
	if (dashboard.length === 0) {
		createSlotDashboard();
		dashboard = $('#slotAnalysisDashboard');
	}

	if (dashboard.is(':visible')) {
		dashboard.hide();
	} else {
		dashboard.show();
		updateSlotDashboard();
	}
};

console.log("Slot Logger loaded. Commands: analyzeSlots() | exportSlotData() | Click 'Slots' button");
