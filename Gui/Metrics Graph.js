// ========== GOLD TRACKING ==========
let sumGold = 0;
let largestGoldDrop = 0;
const goldStartTime = new Date();
let goldInterval = 'hour';
const goldHistory = [];
const MAX_GOLD_HISTORY = 60;
let lastGoldHistoryUpdate = Date.now();
const GOLD_HISTORY_INTERVAL = 1000;

// ========== XP TRACKING ==========
let sumXP = 0;
let largestXPGain = 0;
const xpStartTime = new Date();
const startXP = character.xp;
let xpInterval = 'second';
const xpHistory = [];
const MAX_XP_HISTORY = 60;
let lastXpHistoryUpdate = Date.now();
const XP_HISTORY_INTERVAL = 1000;

// ========== DPS TRACKING ==========
let playerDamageSums = {};
const dpsStartTime = performance.now();
const dpsHistory = {}; // Now stores per-player history
const MAX_DPS_HISTORY = 60;
let lastDpsHistoryUpdate = Date.now();
const DPS_HISTORY_INTERVAL = 1000;

// Class colors for DPS lines
const classColors = {
	mage: '#3FC7EB',
	paladin: '#F48CBA',
	priest: '#FFFFFF',
	ranger: '#AAD372',
	rogue: '#FFF468',
	warrior: '#C69B6D'
};

let graphWindowMinutes = 5;

// CLEANUP: Remove any existing dashboard and button from previous script runs
setTimeout(() => {
	const $ = parent.$;
	$('#metricsDashboard').remove();
	if (parent.buttons && parent.buttons['metrics']) {
		delete parent.buttons['metrics'];
		$('.codebuttonmetrics').remove();
	}

	// Add the top button
	add_top_button('metrics', 'Metrics', () => {
		toggleMetricsDashboard();
	});
}, 100);

// Add the top button
add_top_button('metrics', 'Metrics', () => {
	toggleMetricsDashboard();
});

// DPS Helper Functions
function getPlayerEntry(id) {
	if (!playerDamageSums[id]) {
		playerDamageSums[id] = {
			startTime: performance.now(),
			sumDamage: 0,
			sumBurnDamage: 0,
			sumBlastDamage: 0,
			sumBaseDamage: 0,
			sumHeal: 0,
			sumLifesteal: 0,
			sumManaSteal: 0,
			sumDamageReturn: 0,
			sumReflection: 0,
			sumDamageTakenPhys: 0,
			sumDamageTakenMag: 0
		};
	}
	return playerDamageSums[id];
}

function calculateTotalDPS() {
	let totalDmg = 0;
	Object.values(playerDamageSums).forEach(e => {
		totalDmg += e.sumDamage + e.sumDamageReturn + e.sumReflection;
	});
	const elapsed = performance.now() - dpsStartTime;
	return Math.floor(totalDmg * 1000 / Math.max(elapsed, 1));
}

function calculateCharacterDPS(id) {
	const entry = playerDamageSums[id];
	if (!entry) return 0;
	const elapsed = performance.now() - entry.startTime;
	if (elapsed <= 0) return 0;
	const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
	return Math.floor(total * 1000 / elapsed);
}

// Listen to hit events for DPS tracking
parent.socket.on('hit', data => {
	const isParty = id => parent.party_list.includes(id);
	try {
		const attackerInParty = isParty(data.hid);
		const targetInParty = isParty(data.id);
		if (!attackerInParty && !targetInParty) return;

		// Damage Return
		if (data.dreturn && get_player(data.id) && !get_player(data.hid)) {
			const e = getPlayerEntry(data.id);
			e.sumDamageReturn = (e.sumDamageReturn || 0) + data.dreturn;
		}

		// Reflection
		if (data.reflect && get_player(data.id) && !get_player(data.hid)) {
			const e = getPlayerEntry(data.id);
			e.sumReflection = (e.sumReflection || 0) + data.reflect;
		}

		// Damage taken
		if (data.damage && get_player(data.id)) {
			const e = getPlayerEntry(data.id);
			if (data.damage_type === 'physical') e.sumDamageTakenPhys += data.damage;
			else e.sumDamageTakenMag += data.damage;
		}

		// Heal / Lifesteal
		if (get_player(data.hid) && (data.heal || data.lifesteal)) {
			const e = getPlayerEntry(data.hid);
			const totalHeal = (data.heal || 0) + (data.lifesteal || 0);
			e.sumHeal += totalHeal;
		}

		// Mana steal
		if (get_player(data.hid) && data.manasteal) {
			const e = getPlayerEntry(data.hid);
			e.sumManaSteal += data.manasteal;
		}

		// Damage done
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

// Create the metrics dashboard window
const createMetricsDashboard = () => {
	const $ = parent.$;
	$('#metricsDashboard').remove();

	const dashboard = $(`
		<div id="metricsDashboard">
			<div id="metricsHeader">
				<span id="metricsTitle">Performance Metrics</span>
				<button id="closeBtn">×</button>
			</div>
			<div id="metricsContent">
				<div class="metrics-section">
					<h3>Gold Tracking</h3>
					<div id="goldMetrics" class="metrics-grid">
						<div class="metric-card">
							<div class="metric-label">Gold/${goldInterval}</div>
							<div class="metric-value" id="goldRate">0</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Largest Drop</div>
							<div class="metric-value" id="jackpotValue">0</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Total Gold</div>
							<div class="metric-value" id="totalGold">0</div>
						</div>
					</div>
					<div id="goldIntervalSelector" class="interval-selector">
						<button class="interval-btn" data-interval="minute" data-type="gold">Minute</button>
						<button class="interval-btn active" data-interval="hour" data-type="gold">Hour</button>
						<button class="interval-btn" data-interval="day" data-type="gold">Day</button>
					</div>
					<canvas id="goldChart" class="metric-chart"></canvas>
				</div>
				
				<div class="metrics-section">
					<h3>XP Tracking</h3>
					<div id="xpMetrics" class="metrics-grid">
						<div class="metric-card">
							<div class="metric-label">XP/${xpInterval}</div>
							<div class="metric-value" id="xpRate">0</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Time to Level</div>
							<div class="metric-value" id="timeToLevel">--</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Total XP Gained</div>
							<div class="metric-value" id="totalXP">0</div>
						</div>
					</div>
					<div id="xpIntervalSelector" class="interval-selector">
						<button class="interval-btn active" data-interval="second" data-type="xp">Second</button>
						<button class="interval-btn" data-interval="minute" data-type="xp">Minute</button>
						<button class="interval-btn" data-interval="hour" data-type="xp">Hour</button>
						<button class="interval-btn" data-interval="day" data-type="xp">Day</button>
					</div>
					<canvas id="xpChart" class="metric-chart"></canvas>
				</div>

				<div class="metrics-section">
					<h3>DPS Tracking</h3>
					<div id="dpsMetrics" class="metrics-grid">
						<div class="metric-card">
							<div class="metric-label">Party DPS</div>
							<div class="metric-value" id="partyDPS">0</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Your DPS</div>
							<div class="metric-value" id="yourDPS">0</div>
						</div>
						<div class="metric-card">
							<div class="metric-label">Session Time</div>
							<div class="metric-value" id="sessionTime">00:00</div>
						</div>
					</div>
					<canvas id="dpsChart" class="metric-chart"></canvas>
				</div>
			</div>
		</div>
	`).css({
		position: 'fixed',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '1250px',
		maxHeight: '120vh',
		background: 'rgba(20, 20, 30, 0.98)',
		border: '3px solid #6366F1',
		borderRadius: '10px',
		zIndex: 9999,
		display: 'none',
		boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
		overflow: 'hidden',
		fontFamily: $('#bottomrightcorner').css('font-family') || 'pixel'
	});

	$('body').append(dashboard);

	// Styling
	$('#metricsHeader').css({
		background: 'linear-gradient(to right, #1a1a2e, #16213e)',
		padding: '12px 15px',
		borderBottom: '2px solid #6366F1',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: '7px 7px 0 0',
		userSelect: 'none'
	});

	$('#metricsTitle').css({
		color: '#6366F1',
		fontSize: '24px',
		fontWeight: 'bold',
		textShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
	});

	$('#closeBtn').css({
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid #6366F1',
		color: '#6366F1',
		fontSize: '20px',
		width: '30px',
		height: '30px',
		cursor: 'pointer',
		borderRadius: '3px',
		transition: 'all 0.2s'
	});

	$('#metricsContent').css({
		padding: '15px',
		color: 'white',
		height: 'calc(90vh - 70px)',
		overflowY: 'auto',
		overflowX: 'hidden'
	});

	$('.metrics-section').css({
		marginBottom: '20px',
		padding: '15px',
		background: 'rgba(0, 0, 0, 0.3)',
		borderRadius: '8px',
		border: '1px solid rgba(255, 215, 0, 0.2)'
	});

	$('.metrics-section h3').css({
		marginTop: '0',
		marginBottom: '15px',
		fontSize: '28px',
		textAlign: 'center',
		textTransform: 'uppercase',
		letterSpacing: '1px'
	});

	$('.metrics-section').eq(0).find('h3').css('color', '#FFD700');
	$('.metrics-section').eq(1).find('h3').css('color', '#87CEEB');
	$('.metrics-section').eq(2).find('h3').css('color', '#FF6B6B');

	$('.metrics-grid').css({
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: '10px',
		marginBottom: '15px'
	});

	$('.metric-card').css({
		background: 'rgba(0, 0, 0, 0.4)',
		padding: '15px',
		borderRadius: '8px',
		textAlign: 'center'
	});

	$('#goldMetrics .metric-card').css('border', '1px solid rgba(255, 215, 0, 0.3)');
	$('#goldMetrics .metric-value').css('color', '#FFD700');
	$('#xpMetrics .metric-card').css('border', '1px solid rgba(135, 206, 235, 0.3)');
	$('#xpMetrics .metric-value').css('color', '#87CEEB');
	$('#dpsMetrics .metric-card').css('border', '1px solid rgba(255, 107, 107, 0.3)');
	$('#dpsMetrics .metric-value').css('color', '#FF6B6B');

	$('.metric-label').css({
		fontSize: '20px',
		color: '#aaa',
		marginBottom: '8px',
		textTransform: 'uppercase'
	});

	$('.metric-value').css({
		fontSize: '24px',
		fontWeight: 'bold'
	});

	$('.interval-selector').css({
		display: 'flex',
		gap: '5px',
		marginBottom: '15px',
		justifyContent: 'center'
	});

	$('.interval-btn').css({
		padding: '8px 15px',
		background: 'rgba(255, 255, 255, 0.1)',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '5px',
		transition: 'all 0.2s',
		fontSize: '12px'
	});

	$('#goldIntervalSelector .interval-btn').css('border', '1px solid #FFD700');
	$('#xpIntervalSelector .interval-btn').css('border', '1px solid #87CEEB');

	$('.metric-chart').css({
		width: '100%',
		height: '550px',
		background: 'rgba(0, 0, 0, 0.3)',
		borderRadius: '8px',
		display: 'block'
	});

	$('#goldChart').css('border', '1px solid rgba(255, 215, 0, 0.3)');
	$('#xpChart').css('border', '1px solid rgba(135, 206, 235, 0.3)');
	$('#dpsChart').css('border', '1px solid rgba(255, 107, 107, 0.3)');

	// Event handlers
	$('#closeBtn').on('click', () => dashboard.hide());

	$('.interval-btn').on('click', function () {
		const type = $(this).data('type');
		const interval = $(this).data('interval');

		// Highlight active button
		const selector = `[data-type="${type}"]`;
		$(selector).removeClass('active').css('background', 'rgba(255, 255, 255, 0.1)');
		$(this).addClass('active');
		if (type === 'gold') {
			$(this).css('background', 'rgba(255, 215, 0, 0.2)');
			goldInterval = interval;
			// Clear graph history to force Y-axis recalculation when switching time intervals
			goldHistory.length = 0;
		} else if (type === 'xp') {
			$(this).css('background', 'rgba(135, 206, 235, 0.2)');
			xpInterval = interval;
			xpHistory.length = 0;
		}

		updateMetricsDashboard();
	});


	$('#closeBtn').hover(
		function () { $(this).css('background', 'rgba(99, 102, 241, 0.3)'); },
		function () { $(this).css('background', 'rgba(255, 255, 255, 0.1)'); }
	);

	$('.interval-btn').hover(
		function () { if (!$(this).hasClass('active')) $(this).css('background', 'rgba(255, 255, 255, 0.15)'); },
		function () { if (!$(this).hasClass('active')) $(this).css('background', 'rgba(255, 255, 255, 0.1)'); }
	);
	$('.window-btn').on('click', function () {
		graphWindowMinutes = Number($(this).data('window'));

		$('.window-btn').removeClass('active');
		$(this).addClass('active');
	});
};

const toggleMetricsDashboard = () => {
	const $ = parent.$;
	let dashboard = $('#metricsDashboard');
	if (dashboard.length === 0) {
		createMetricsDashboard();
		dashboard = $('#metricsDashboard');
	}
	if (dashboard.is(':visible')) {
		dashboard.hide();
	} else {
		dashboard.show();
		updateMetricsDashboard();
	}
};

const updateMetricsDashboard = () => {
	const $ = parent.$;
	const now = Date.now();

	// Gold
	const averageGold = calculateAverageGold();
	$('#goldRate').text(averageGold.toLocaleString('en'));
	$('#jackpotValue').text(largestGoldDrop.toLocaleString('en'));
	$('#totalGold').text(sumGold.toLocaleString('en'));
	$('#goldMetrics .metric-label').first().text(`Gold/${goldInterval.charAt(0).toUpperCase() + goldInterval.slice(1)}`);

	if (now - lastGoldHistoryUpdate >= GOLD_HISTORY_INTERVAL) {
		goldHistory.push({ time: new Date(), value: averageGold });
		if (goldHistory.length > MAX_GOLD_HISTORY) goldHistory.shift();
		lastGoldHistoryUpdate = now;
	}

	// XP
	const xpGained = character.xp - startXP;
	const averageXP = calculateAverageXP();
	$('#xpRate').text(averageXP.toLocaleString('en'));
	$('#totalXP').text(xpGained.toLocaleString('en'));

	const xpMissing = parent.G.levels[character.level] - character.xp;
	const elapsedTime = Math.round((new Date() - xpStartTime) / 1000);
	if (elapsedTime > 0 && xpGained > 0) {
		const xpPerSecond = xpGained / elapsedTime;
		const secondsToLevel = Math.round(xpMissing / xpPerSecond);
		$('#timeToLevel').text(formatTime(secondsToLevel)).css('fontSize', '24px');
	} else {
		$('#timeToLevel').text('--');
	}

	$('#xpMetrics .metric-label').first().text(`XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}`);

	if (now - lastXpHistoryUpdate >= XP_HISTORY_INTERVAL) {
		xpHistory.push({ time: new Date(), value: averageXP });
		if (xpHistory.length > MAX_XP_HISTORY) xpHistory.shift();
		lastXpHistoryUpdate = now;
	}

	// DPS
	const totalDPS = calculateTotalDPS();
	const yourDPS = calculateCharacterDPS(character.id);
	$('#partyDPS').text(totalDPS.toLocaleString('en'));
	$('#yourDPS').text(yourDPS.toLocaleString('en'));

	const elapsedMs = performance.now() - dpsStartTime;
	const hours = Math.floor(elapsedMs / 3600000);
	const minutes = Math.floor((elapsedMs % 3600000) / 60000);
	$('#sessionTime').text(`${hours}h ${minutes}m`);

	if (now - lastDpsHistoryUpdate >= DPS_HISTORY_INTERVAL) {
		// Store DPS for each party member
		for (const id in playerDamageSums) {
			if (!dpsHistory[id]) dpsHistory[id] = [];
			const dps = calculateCharacterDPS(id);
			dpsHistory[id].push({ time: new Date(), value: dps });
			if (dpsHistory[id].length > MAX_DPS_HISTORY) dpsHistory[id].shift();
		}
		lastDpsHistoryUpdate = now;
	}

	drawChart('goldChart', goldHistory, '#FFD700');
	drawChart('xpChart', xpHistory, '#87CEEB');
	drawDPSChart();
};

const drawChart = (canvasId, history, color) => {
	const canvas = parent.document.getElementById(canvasId);
	if (!canvas || !parent.$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;
	const width = canvas.width;
	const height = canvas.height;

	ctx.clearRect(0, 0, width, height);

	const cutoff = Date.now() - graphWindowMinutes * 60_000;
	const visible = history.filter(p => p.time.getTime() >= cutoff);

	if (visible.length < 2) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Collecting data...', width / 2, height / 2);
		return;
	}

	const values = visible.map(d => d.value);
	const rawMax = Math.max(...values, 1);
	const maxValue = rawMax * 1.2;
	const minValue = 0;
	const range = maxValue - minValue || 1;
	ctx.font = '18px pixel, monospace';
	const maxLabel = Math.max(...values).toLocaleString();
	const labelWidth = ctx.measureText(maxLabel).width;
	const padding = Math.ceil(labelWidth) + 15;
	const graphWidth = width - 2 * padding;
	const graphHeight = height - 2 * padding;

	// Grid
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + graphHeight * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(width - padding, y);
		ctx.stroke();
	}

	// Axes
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, height - padding);
	ctx.lineTo(width - padding, height - padding);
	ctx.stroke();

	// Fill
	const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
	gradient.addColorStop(0, color + '4D');
	gradient.addColorStop(1, color + '0D');
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(padding, height - padding);
	history.forEach((point, i) => {
		const x = padding + graphWidth * i / (history.length - 1);
		const y = height - padding - graphHeight * (point.value - minValue) / range;
		ctx.lineTo(x, y);
	});
	ctx.lineTo(padding + graphWidth, height - padding);
	ctx.closePath();
	ctx.fill();

	// Line
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	history.forEach((point, i) => {
		const x = padding + graphWidth * i / (history.length - 1);
		const y = height - padding - graphHeight * (point.value - minValue) / range;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.stroke();

	// Points
	ctx.fillStyle = color;
	history.forEach((point, i) => {
		const x = padding + graphWidth * i / (history.length - 1);
		const y = height - padding - graphHeight * (point.value - minValue) / range;
		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI);
		ctx.fill();
	});

	// Labels
	ctx.fillStyle = color;
	ctx.font = '18px pixel, monospace';
	ctx.textAlign = 'right';
	const ticks = 5;

	for (let i = 0; i <= ticks; i++) {
		const value = Math.round(minValue + (range * i / ticks));
		const y = height - padding - (graphHeight * i / ticks);
		ctx.fillText(value.toLocaleString(), padding - 6, y + 4);
	}
	ctx.textAlign = 'center';
	ctx.fillText(`Last ${graphWindowMinutes} minutes`, width / 2, height - 10);
};

const drawDPSChart = () => {
	const canvas = parent.document.getElementById('dpsChart');
	if (!canvas || !parent.$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;
	const width = canvas.width;
	const height = canvas.height;

	ctx.clearRect(0, 0, width, height);

	const playerIds = Object.keys(dpsHistory);
	if (playerIds.length === 0 || !dpsHistory[playerIds[0]] || dpsHistory[playerIds[0]].length < 2) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Collecting data...', width / 2, height / 2);
		return;
	}

	// Find max across all players
	const cutoff = Date.now() - graphWindowMinutes * 60_000;

	const allValues = [];
	playerIds.forEach(id => {
		if (dpsHistory[id]) {
			dpsHistory[id].forEach(p => allValues.push(p.value));
		}
	});

	const rawMax = Math.max(...allValues, 1);
	const maxValue = rawMax * 1.2;
	const minValue = 0;

	const range = maxValue - minValue || 1;
	ctx.font = '18px pixel, monospace';
	const maxLabel = maxValue.toLocaleString();
	const labelWidth = ctx.measureText(maxLabel).width;
	const padding = Math.ceil(labelWidth) + 15;
	const labelSpace = 90; // room for names
	const graphWidth = width - 2 * padding - labelSpace;
	const graphHeight = height - 2 * padding;

	// Grid
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + graphHeight * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(width - padding, y);
		ctx.stroke();
	}

	// Axes
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, height - padding);
	ctx.lineTo(width - padding, height - padding);
	ctx.stroke();

	// Draw line for each player
	playerIds.forEach(id => {
		const player = get_player(id);
		if (!player || !dpsHistory[id] || dpsHistory[id].length < 2) return;

		const color = classColors[player.ctype.toLowerCase()] || '#FFFFFF';
		const history = dpsHistory[id].filter(p => p.time.getTime() >= cutoff);
		if (history.length < 2) return;

		// Line
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		history.forEach((point, i) => {
			const x = padding + graphWidth * i / (history.length - 1);
			const y = height - padding - graphHeight * (point.value - minValue) / range;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		// Points
		ctx.fillStyle = color;
		history.forEach((point, i) => {
			const x = padding + graphWidth * i / (history.length - 1);
			const y = height - padding - graphHeight * (point.value - minValue) / range;
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI);
			ctx.fill();
		});
		// Player name at end of line
		const last = history[history.length - 1];
		const lastX = padding + graphWidth + 6;
		const lastY = height - padding - graphHeight * (last.value - minValue) / range;

		ctx.font = '16px pixel, monospace';
		ctx.fillStyle = color;
		ctx.textAlign = 'left';
		ctx.fillText(player.name, lastX + 6, lastY + 4);
	});

	// Labels
	ctx.fillStyle = '#FF6B6B';
	ctx.font = '18px pixel, monospace';
	ctx.textAlign = 'right';
	const ticks = 5;

	for (let i = 0; i <= ticks; i++) {
		const value = Math.round(minValue + (range * i / ticks));
		const y = height - padding - (graphHeight * i / ticks);
		ctx.fillText(value.toLocaleString(), padding - 6, y + 4);
	}
	ctx.textAlign = 'center';
	ctx.fillText(`Last ${graphWindowMinutes} minutes`, width / 2, height - 10);
};

const calculateAverageGold = () => {
	const elapsedTime = (new Date() - goldStartTime) / 1000;
	const divisor = elapsedTime / (goldInterval === 'minute' ? 60 : goldInterval === 'hour' ? 3600 : 86400);
	if (divisor <= 0) return 0;
	return Math.round(sumGold / divisor);
};

const calculateAverageXP = () => {
	const elapsedTime = (new Date() - xpStartTime) / 1000;
	const xpGained = character.xp - startXP;
	const divisor = elapsedTime / (xpInterval === 'second' ? 1 : xpInterval === 'minute' ? 60 : xpInterval === 'hour' ? 3600 : 86400);
	if (divisor <= 0) return 0;
	return Math.round(xpGained / divisor);
};

const formatTime = (seconds) => {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${days}d ${hours}h ${minutes}m`;
};

function countMyPartyCharacters() {
	let count = 0;
	for (const name in parent.party) {
		if (name === character.name || (parent.entities[name]?.owner === character.owner)) {
			count++;
		}
	}
	return count;
}

setInterval(() => {
	const $ = parent.$;
	if ($('#metricsDashboard').is(':visible')) {
		updateMetricsDashboard();
	}
}, 500);

// Loot event handler
character.on("loot", (data) => {
	if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
		const myCharCount = countMyPartyCharacters();
		const myGold = Math.round(data.gold * myCharCount);
		sumGold += myGold;
		if (myGold > largestGoldDrop) {
			largestGoldDrop = myGold;
		}
	}
});
