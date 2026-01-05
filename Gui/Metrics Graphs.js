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
	ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D'
};

const sectionColors = {
	gold: { primary: '#FFD700', rgba: 'rgba(255, 215, 0, 0.3)', axis: 'rgba(255, 215, 0, 0.1)' },
	xp: { primary: '#87CEEB', rgba: 'rgba(135, 206, 235, 0.3)', axis: 'rgba(135, 206, 235, 0.2)' },
	dps: { primary: '#FF6B6B', rgba: 'rgba(255, 107, 107, 0.3)', axis: 'rgba(255, 107, 107, 0.2)' },
	kills: { primary: '#9D4EDD', rgba: 'rgba(157, 78, 221, 0.3)', axis: 'rgba(157, 78, 221, 0.1)' }
};

// Mob type colors - vibrant and distinguishable
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
	DPS: '#E53935', // strong red — primary damage output
	Base: '#6D1B7B', // dark purple — underlying/raw damage
	Cleave: '#8D6E63', // steel brown — physical spread
	Blast: '#FB8C00', // orange — burst / explosion
	Burn: '#FDD835', // yellow — fire / DOT
	HPS: '#43A047', // green — healing per second
	MPS: '#1E88E5', // blue — mana resource
	DR: '#546E7A', // slate — mitigation / reduction
	Reflect: '#26A69A'  // teal — reactive damage
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

	const metricCard = (label, valueId) =>
		`<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value" id="${valueId}">0</div></div>`;

	const intervalButtons = (type, buttons) =>
		buttons.map(b => `<button class="interval-btn ${b.active ? 'active' : ''}" data-interval="${b.interval}" data-type="${type}">${b.label}</button>`).join('');

	const damageButtons = (buttons) =>
		buttons.map(b => `<button class="damage-type-btn ${b.active ? 'active' : ''}" data-damage-type="${b.type}" data-color="${b.color}">${b.label}</button>`).join('');

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
	$('#closeBtn').on('click', () => $('#metricsDashboard').hide());

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

	drawChart('goldChart', [{ history: goldHistory, color: sectionColors.gold.primary }], sectionColors.gold.primary);
	drawChart('xpChart', [{ history: xpHistory, color: sectionColors.xp.primary }], sectionColors.xp.primary);
	drawDPSBarChart();
	drawKillBarChart();
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
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}
	} else {
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

game.on('death', data => {
	const mob = parent.entities[data.id];
	const mobTarget = mob.target;
	const party = get_party();
	const partyMembers = party ? Object.keys(party) : [];

	if (mob?.cooperative && (mobTarget === character.name || partyMembers.includes(mobTarget))) {
		totalKills++;
		const mobType = (mob.mtype || 'unknown').charAt(0).toUpperCase() + (mob.mtype || 'unknown').slice(1);
		mobKills[mobType] = (mobKills[mobType] || 0) + 1;
		getMobColor(mobType);
	}
});

parent.socket.on("game_log", data => {
	if (typeof data !== "string") return;

	const match = data.match(/ killed (?:a|an) (.+)$/);
	if (!match) return;

	const mobType = match[1].charAt(0).toUpperCase() + match[1].slice(1);

	totalKills++;
	mobKills[mobType] = (mobKills[mobType] || 0) + 1;
	getMobColor(mobType);
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
});
