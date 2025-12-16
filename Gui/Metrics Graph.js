// ========== TRACKING STATE ==========
let sumGold = 0, largestGoldDrop = 0;
const goldStartTime = new Date();
let goldInterval = 'hour';
const goldHistory = [];

let sumXP = 0, largestXPGain = 0;
const xpStartTime = new Date();
const startXP = character.xp;
let xpInterval = 'second';
const xpHistory = [];

let playerDamageSums = {};
const dpsStartTime = performance.now();
const dpsHistory = {};
let dpsMaxValueSmoothed = 100; // Smoothed max for stable Y-axis

// Chart config
const MAX_HISTORY = 300; // 5 minutes
const HISTORY_INTERVAL = 1000; // 1 second
let lastGoldUpdate = Date.now();
let lastXpUpdate = Date.now();
let lastDpsUpdate = Date.now();

const classColors = {
	mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF',
	ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D'
};

const sectionColors = {
	gold: { primary: '#FFD700', rgba: 'rgba(255, 215, 0, 0.3)' },
	xp: { primary: '#87CEEB', rgba: 'rgba(135, 206, 235, 0.3)' },
	dps: { primary: '#FF6B6B', rgba: 'rgba(255, 107, 107, 0.3)' }
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
	if (!playerDamageSums[id]) {
		playerDamageSums[id] = {
			startTime: performance.now(), sumDamage: 0, sumBurnDamage: 0,
			sumBlastDamage: 0, sumBaseDamage: 0, sumHeal: 0, sumLifesteal: 0,
			sumManaSteal: 0, sumDamageReturn: 0, sumReflection: 0,
			sumDamageTakenPhys: 0, sumDamageTakenMag: 0
		};
	}
	return playerDamageSums[id];
}

function calculateDPS(id) {
	const entry = playerDamageSums[id];
	if (!entry) return 0;
	const elapsed = performance.now() - entry.startTime;
	if (elapsed <= 0) return 0;
	const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
	return Math.floor(total * 1000 / elapsed);
}

function calculateTotalDPS() {
	let totalDmg = 0;
	Object.values(playerDamageSums).forEach(e => {
		totalDmg += e.sumDamage + e.sumDamageReturn + e.sumReflection;
	});
	const elapsed = performance.now() - dpsStartTime;
	return Math.floor(totalDmg * 1000 / Math.max(elapsed, 1));
}

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
		if (data.damage && get_player(data.id)) {
			const e = getPlayerEntry(data.id);
			if (data.damage_type === 'physical') e.sumDamageTakenPhys += data.damage;
			else e.sumDamageTakenMag += data.damage;
		}
		if (get_player(data.hid) && (data.heal || data.lifesteal)) {
			getPlayerEntry(data.hid).sumHeal += (data.heal || 0) + (data.lifesteal || 0);
		}
		if (get_player(data.hid) && data.manasteal) {
			getPlayerEntry(data.hid).sumManaSteal += data.manasteal;
		}
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

// ========== UI CREATION ==========
const createMetricsDashboard = () => {
	const $ = parent.$;
	$('#metricsDashboard').remove();

	const metricCard = (label, valueId) =>
		`<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value" id="${valueId}">0</div></div>`;

	const intervalButtons = (type, buttons) =>
		buttons.map(b => `<button class="interval-btn ${b.active ? 'active' : ''}" data-interval="${b.interval}" data-type="${type}">${b.label}</button>`).join('');

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
                        ${metricCard('Party DPS', 'partyDPS')}
                        ${metricCard('Your DPS', 'yourDPS')}
                        ${metricCard('Session Time', 'sessionTime')}
                    </div>
                    <canvas id="dpsChart" class="metric-chart"></canvas>
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

	$('body').append(dashboard);
	applyStyles($);
	attachEventHandlers($);
};

const applyStyles = ($) => {
	const styles = {
		'#metricsHeader': {
			background: 'linear-gradient(to right, #1a1a2e, #16213e)', padding: '12px 15px',
			borderBottom: '2px solid #6366F1', display: 'flex', justifyContent: 'space-between',
			alignItems: 'center', borderRadius: '7px 7px 0 0', userSelect: 'none'
		},
		'#metricsTitle': { color: '#6366F1', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(99, 102, 241, 0.5)' },
		'#closeBtn': { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #6366F1', color: '#6366F1', fontSize: '20px', width: '30px', height: '30px', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s' },
		'#metricsContent': { padding: '15px', color: 'white', height: 'calc(90vh - 70px)', overflowY: 'auto', overflowX: 'hidden' },
		'.metrics-section': { marginBottom: '20px', padding: '15px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)' },
		'.metrics-section h3': { marginTop: '0', marginBottom: '15px', fontSize: '28px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' },
		'.metrics-grid': { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' },
		'.metric-card': { background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '8px', textAlign: 'center' },
		'.metric-label': { fontSize: '20px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' },
		'.metric-value': { fontSize: '24px', fontWeight: 'bold' },
		'.interval-selector': { display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'center' },
		'.interval-btn': { padding: '8px 15px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', borderRadius: '5px', transition: 'all 0.2s', fontSize: '12px' },
		'.metric-chart': { width: '100%', height: '550px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', display: 'block' }
	};

	Object.entries(styles).forEach(([sel, style]) => $(sel).css(style));

	// Section-specific colors
	Object.entries(sectionColors).forEach(([section, colors]) => {
		$(`[data-section="${section}"] h3`).css('color', colors.primary);
		$(`[data-section="${section}"] .metric-card`).css('border', `1px solid ${colors.rgba}`);
		$(`[data-section="${section}"] .metric-value`).css('color', colors.primary);
		$(`[data-section="${section}"] .metric-chart`).css('border', `1px solid ${colors.rgba}`);
		$(`[data-section="${section}"] .interval-btn`).css('border', `1px solid ${colors.primary}`);
	});
};

const attachEventHandlers = ($) => {
	$('#closeBtn').on('click', () => $('#metricsDashboard').hide());

	$('.interval-btn').on('click', function () {
		const type = $(this).data('type');
		const interval = $(this).data('interval');
		const color = sectionColors[type].primary;

		$(`[data-type="${type}"]`).removeClass('active').css('background', 'rgba(255, 255, 255, 0.1)');
		$(this).addClass('active').css('background', color.replace('#', 'rgba(') + ', 0.2)'.replace(')', ''));

		if (type === 'gold') goldInterval = interval;
		else if (type === 'xp') xpInterval = interval;

		updateMetricsDashboard();
	});

	$('#closeBtn').hover(
		function () { $(this).css('background', 'rgba(99, 102, 241, 0.3)'); },
		function () { $(this).css('background', 'rgba(255, 255, 255, 0.1)'); }
	);
};

const toggleMetricsDashboard = () => {
	const $ = parent.$;
	let dashboard = $('#metricsDashboard');
	if (dashboard.length === 0) {
		createMetricsDashboard();
		dashboard = $('#metricsDashboard');
	}
	dashboard.is(':visible') ? dashboard.hide() : (dashboard.show(), updateMetricsDashboard());
};

// ========== UPDATE LOGIC ==========
const updateMetricsDashboard = () => {
	const $ = parent.$;
	const now = Date.now();

	// Gold
	const avgGold = calculateAverageGold();
	$('#goldRate').text(avgGold.toLocaleString('en'));
	$('#jackpotValue').text(largestGoldDrop.toLocaleString('en'));
	$('#totalGold').text(sumGold.toLocaleString('en'));
	$('#goldMetrics .metric-label').first().text(`Gold/${goldInterval.charAt(0).toUpperCase() + goldInterval.slice(1)}`);

	if (now - lastGoldUpdate >= HISTORY_INTERVAL) {
		goldHistory.push({ time: new Date(), value: avgGold });
		if (goldHistory.length > MAX_HISTORY) goldHistory.shift();
		lastGoldUpdate = now;
	}

	// XP
	const xpGained = character.xp - startXP;
	const avgXP = calculateAverageXP();
	$('#xpRate').text(avgXP.toLocaleString('en'));
	$('#totalXP').text(xpGained.toLocaleString('en'));

	const xpMissing = parent.G.levels[character.level] - character.xp;
	const elapsedSec = Math.round((new Date() - xpStartTime) / 1000);
	if (elapsedSec > 0 && xpGained > 0) {
		const secondsToLevel = Math.round(xpMissing / (xpGained / elapsedSec));
		$('#timeToLevel').text(formatTime(secondsToLevel)).css('fontSize', '24px');
	} else {
		$('#timeToLevel').text('--');
	}

	$('#xpMetrics .metric-label').first().text(`XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}`);

	if (now - lastXpUpdate >= HISTORY_INTERVAL) {
		xpHistory.push({ time: new Date(), value: avgXP });
		if (xpHistory.length > MAX_HISTORY) xpHistory.shift();
		lastXpUpdate = now;
	}

	// DPS
	const totalDPS = calculateTotalDPS();
	const yourDPS = calculateDPS(character.id);
	$('#partyDPS').text(totalDPS.toLocaleString('en'));
	$('#yourDPS').text(yourDPS.toLocaleString('en'));

	const elapsedMs = performance.now() - dpsStartTime;
	const hours = Math.floor(elapsedMs / 3600000);
	const minutes = Math.floor((elapsedMs % 3600000) / 60000);
	$('#sessionTime').text(`${hours}h ${minutes}m`);

	if (now - lastDpsUpdate >= HISTORY_INTERVAL) {
		for (const id in playerDamageSums) {
			if (!dpsHistory[id]) dpsHistory[id] = [];
			const dps = calculateDPS(id);
			dpsHistory[id].push({ time: new Date(), value: dps });
			if (dpsHistory[id].length > MAX_HISTORY) dpsHistory[id].shift();
		}
		lastDpsUpdate = now;
	}

	drawChart('goldChart', goldHistory, sectionColors.gold.primary);
	drawChart('xpChart', xpHistory, sectionColors.xp.primary);
	drawDPSChart();
};

// ========== CHART DRAWING ==========
const drawChart = (canvasId, history, color) => {
	const canvas = parent.document.getElementById(canvasId);
	if (!canvas || !parent.$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	// Only resize canvas if dimensions actually changed
	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (history.length < 2) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Collecting data...', canvas.width / 2, canvas.height / 2);
		return;
	}

	const values = history.map(d => d.value);
	const maxValue = Math.max(...values, 1) * 1.2;
	const minValue = 0;
	const range = maxValue || 1;

	ctx.font = '18px pixel, monospace';
	const padding = ctx.measureText(maxValue.toLocaleString()).width + 15;
	const gw = canvas.width - 2 * padding;
	const gh = canvas.height - 2 * padding;

	// Grid & axes
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + gh * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();
	}

	ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, canvas.height - padding);
	ctx.lineTo(canvas.width - padding, canvas.height - padding);
	ctx.stroke();

	// Gradient fill
	const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
	gradient.addColorStop(0, color + '4D');
	gradient.addColorStop(1, color + '0D');
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(padding, canvas.height - padding);
	history.forEach((p, i) => {
		const x = padding + gw * i / (history.length - 1);
		const y = canvas.height - padding - gh * p.value / range;
		ctx.lineTo(x, y);
	});
	ctx.lineTo(padding + gw, canvas.height - padding);
	ctx.closePath();
	ctx.fill();

	// Line & points
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	history.forEach((p, i) => {
		const x = padding + gw * i / (history.length - 1);
		const y = canvas.height - padding - gh * p.value / range;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.stroke();

	ctx.fillStyle = color;
	history.forEach((p, i) => {
		const x = padding + gw * i / (history.length - 1);
		const y = canvas.height - padding - gh * p.value / range;
		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI);
		ctx.fill();
	});

	// Y-axis labels
	ctx.fillStyle = color;
	ctx.font = '18px pixel, monospace';
	ctx.textAlign = 'right';
	for (let i = 0; i <= 5; i++) {
		const value = Math.round(range * i / 5);
		const y = canvas.height - padding - (gh * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 6, y + 4);
	}
	ctx.textAlign = 'center';
	ctx.fillText('Last 5 minutes', canvas.width / 2, canvas.height - 10);
};

const drawDPSChart = () => {
	const canvas = parent.document.getElementById('dpsChart');
	if (!canvas || !parent.$('#metricsDashboard').is(':visible')) return;

	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();

	// Only resize canvas if dimensions actually changed
	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const playerIds = Object.keys(dpsHistory);
	if (playerIds.length === 0 || !dpsHistory[playerIds[0]] || dpsHistory[playerIds[0]].length < 2) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Collecting data...', canvas.width / 2, canvas.height / 2);
		return;
	}

	// Smooth max value to prevent jumpy scaling
	const currentMax = Math.max(...playerIds.flatMap(id => dpsHistory[id]?.map(p => p.value) || []), 1);
	dpsMaxValueSmoothed = dpsMaxValueSmoothed * 0.95 + currentMax * 0.05;
	const maxValue = Math.max(dpsMaxValueSmoothed, currentMax) * 1.2;
	const range = maxValue || 1;

	ctx.font = '18px pixel, monospace';
	const padding = ctx.measureText(maxValue.toLocaleString()).width + 15;
	const labelSpace = 90;
	const gw = canvas.width - 2 * padding - labelSpace;
	const gh = canvas.height - 2 * padding;

	// Grid & axes
	ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
	ctx.lineWidth = 1;
	for (let i = 0; i <= 5; i++) {
		const y = padding + gh * i / 5;
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();
	}

	ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, canvas.height - padding);
	ctx.lineTo(canvas.width - padding, canvas.height - padding);
	ctx.stroke();

	// Draw lines per player
	playerIds.forEach(id => {
		const player = get_player(id);
		if (!player || !dpsHistory[id] || dpsHistory[id].length < 2) return;

		const color = classColors[player.ctype.toLowerCase()] || '#FFFFFF';
		const history = dpsHistory[id];

		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		history.forEach((p, i) => {
			const x = padding + gw * i / (history.length - 1);
			const y = canvas.height - padding - gh * p.value / range;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		ctx.fillStyle = color;
		history.forEach((p, i) => {
			const x = padding + gw * i / (history.length - 1);
			const y = canvas.height - padding - gh * p.value / range;
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI);
			ctx.fill();
		});

		// Player name
		const last = history[history.length - 1];
		const lastY = canvas.height - padding - gh * last.value / range;
		ctx.font = '16px pixel, monospace';
		ctx.textAlign = 'left';
		ctx.fillText(player.name, padding + gw + 6, lastY + 4);
	});

	// Y-axis labels
	ctx.fillStyle = sectionColors.dps.primary;
	ctx.font = '18px pixel, monospace';
	ctx.textAlign = 'right';
	for (let i = 0; i <= 5; i++) {
		const value = Math.round(range * i / 5);
		const y = canvas.height - padding - (gh * i / 5);
		ctx.fillText(value.toLocaleString(), padding - 6, y + 4);
	}
	ctx.textAlign = 'center';
	ctx.fillText('Last 5 minutes', canvas.width / 2, canvas.height - 10);
};

// ========== HELPER FUNCTIONS ==========
const calculateAverageGold = () => {
	const elapsed = (new Date() - goldStartTime) / 1000;
	const divisor = elapsed / (goldInterval === 'minute' ? 60 : goldInterval === 'hour' ? 3600 : 86400);
	return divisor > 0 ? Math.round(sumGold / divisor) : 0;
};

const calculateAverageXP = () => {
	const elapsed = (new Date() - xpStartTime) / 1000;
	const xpGained = character.xp - startXP;
	const divisor = elapsed / (xpInterval === 'second' ? 1 : xpInterval === 'minute' ? 60 : xpInterval === 'hour' ? 3600 : 86400);
	return divisor > 0 ? Math.round(xpGained / divisor) : 0;
};

const formatTime = (seconds) => {
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${d}d ${h}h ${m}m`;
};

function countMyPartyCharacters() {
	let count = 0;
	for (const name in parent.party) {
		if (name === character.name || (parent.entities[name]?.owner === character.owner)) count++;
	}
	return count;
}

// ========== EVENT LISTENERS ==========
setInterval(() => {
	if (parent.$('#metricsDashboard').is(':visible')) updateMetricsDashboard();
}, 500);

character.on("loot", (data) => {
	if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
		const myGold = Math.round(data.gold * countMyPartyCharacters());
		sumGold += myGold;
		if (myGold > largestGoldDrop) largestGoldDrop = myGold;
	}
});
