const GH = {
	_s: null,
	get s() {
		if (!this._s) {
			try {
				this._s = JSON.parse(localStorage.goldHistory);
			} catch { }
			if (!this._s || !Array.isArray(this._s.d)) {
				this._s = { d: [] };
			}
		}
		return this._s;
	},
	save() {
		localStorage.goldHistory = JSON.stringify(this._s);
	}
};

function saveGold(gold) {
	const day = Math.floor(Date.now() / 86400000);
	const d = GH.s.d;
	const last = d[d.length - 1];

	if (!last || last[0] !== day) {
		d.push([day, gold]);
		GH.save();
	} else if (last[1] !== gold) {
		last[1] = gold;
		GH.save();
	}
}

const getGoldHistory = () => GH.s.d.slice();

// ========== GOLD HISTORY DASHBOARD ==========
setTimeout(() => {
	const $ = parent.$;
	$('#goldHistoryDashboard').remove();
	if (parent.buttons?.['goldHistory']) {
		delete parent.buttons['goldHistory'];
		$('.codebuttongoldHistory').remove();
	}
	add_top_button('goldHistory', '💰', toggleGoldHistoryDashboard);
}, 250);

let ghRange = 'all'; // all, year, month, week. whatever time frame you want the UI to load at
let ghFullNumbers = true; // false to default the metric cards to abbreviated numbers
let ghUpdateInterval = null;

const toggleGoldHistoryDashboard = () => {
	const $ = parent.$;
	let dash = $('#goldHistoryDashboard');
	if (dash.length === 0) {
		createGoldHistoryDashboard();
		dash = $('#goldHistoryDashboard');
	}
	if (dash.is(':visible')) {
		dash.hide();
		$('#goldHistoryBackdrop').hide();
		clearInterval(ghUpdateInterval);
		ghUpdateInterval = null;
	} else {
		dash.show();
		$('#goldHistoryBackdrop').show();
		drawGoldHistoryDashboard();
		ghUpdateInterval = setInterval(drawGoldHistoryDashboard, 60000);
	}
};

const createGoldHistoryDashboard = () => {
	const $ = parent.$;
	$('#goldHistoryDashboard').remove();
	$('#goldHistoryBackdrop').remove();

	const backdrop = $('<div id="goldHistoryBackdrop"></div>').css({
		position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
		background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'none'
	});

	const rangeBtn = (interval, label, active = false) =>
		`<button class="gh-range-btn ${active ? 'active' : ''}" data-interval="${interval}"
            style="padding:8px 15px;min-width:70px;min-height:40px;background:${active ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)'};
            color:white;cursor:pointer;border-radius:5px;font-size:20px;font-family:inherit;
            border:1px solid #FFD700;transition:all 0.2s;">${label}</button>`;

	const metricCard = (label, id) =>
		`<div style="background:rgba(0,0,0,0.4);padding:15px;border-radius:8px;text-align:center;border:1px solid rgba(255,215,0,0.3);">
            <div style="font-size:20px;color:#aaa;margin-bottom:8px;text-transform:uppercase;">${label}</div>
            <div id="${id}" style="font-size:24px;font-weight:bold;color:#FFD700;">--</div>
        </div>`;

	const dash = $(`
        <div id="goldHistoryDashboard">
            <div id="ghHeader" style="background:linear-gradient(to right,#1a1a2e,#16213e);padding:12px 15px;
                border-bottom:2px solid rgba(255,215,0,0.4);display:flex;justify-content:space-between;
                align-items:center;border-radius:7px 7px 0 0;user-select:none;">
                <span style="color:#FFD700;font-size:34px;font-weight:bold;text-shadow:0 0 10px rgba(255,215,0,0.4);">Gold History</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button id="ghNumToggle" style="background:rgba(255,255,255,0.1);border:1px solid #FFD700;color:#FFD700;
                        font-size:16px;padding:0 10px;height:30px;cursor:pointer;border-radius:3px;font-family:inherit;">Full #s</button>
                    <button id="ghCloseBtn" style="background:rgba(255,255,255,0.1);border:1px solid #FFD700;color:#FFD700;
                        font-size:25px;width:30px;height:30px;cursor:pointer;border-radius:3px;font-family:inherit;">×</button>
                </div>
            </div>
            <div style="padding:15px;color:white;">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
                    ${metricCard('Peak Gold', 'ghPeak')}
                    ${metricCard('Current Gold', 'ghCurrent')}
                    ${metricCard('Avg Daily Change', 'ghAvgChange')}
                </div>
                <div style="display:flex;gap:5px;margin-bottom:15px;justify-content:center;">
                    ${rangeBtn('all', 'All', true)}
                    ${rangeBtn('year', 'Year')}
                    ${rangeBtn('month', 'Month')}
                    ${rangeBtn('week', 'Week')}
                </div>
                <canvas id="ghChart" style="width:100%;height:680px;background:rgba(0,0,0,0.3);border-radius:8px;
                    display:block;border:1px solid rgba(255,215,0,0.2);"></canvas>
            </div>
        </div>
    `).css({
		position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
		width: '1800px', maxHeight: '96vh', background: 'rgba(20,20,30,0.98)', border: '3px solid #FFD700',
		borderRadius: '10px', zIndex: 9999, display: 'none',
		boxShadow: '0 0 30px rgba(255,215,0,0.3)', overflow: 'hidden',
		fontFamily: parent.$('#bottomrightcorner').css('font-family') || 'pixel'
	});

	$('body').append(backdrop);
	$('body').append(dash);

	const closeDash = () => {
		dash.hide();
		backdrop.hide();
		clearInterval(ghUpdateInterval);
		ghUpdateInterval = null;
	};

	$('#ghCloseBtn').on('click', closeDash);
	backdrop.on('click', closeDash);
	parent.$(parent.document).off('keydown.goldHistory');
	parent.$(parent.document).on('keydown.goldHistory', e => {
		if (e.key === 'Escape' && dash.is(':visible')) closeDash();
	});

	$('#ghNumToggle').on('click', function () {
		ghFullNumbers = !ghFullNumbers;
		$(this).css('background', ghFullNumbers ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)');
		drawGoldHistoryDashboard();
	});

	$('.gh-range-btn').on('click', function () {
		$('.gh-range-btn').css('background', 'rgba(255,255,255,0.1)');
		$(this).css('background', 'rgba(255,215,0,0.2)');
		ghRange = $(this).data('interval');
		drawGoldHistoryDashboard();
	});

	const ghCanvas = parent.document.getElementById('ghChart');
	ghCanvas.addEventListener('mousemove', function (e) {
		drawGoldHistoryDashboard();

		const store = GH.s;
		const all = store.d;
		if (!all.length) return;
		const nowDay = Math.floor(Date.now() / 86400000);
		const cutoffs = { all: 0, year: nowDay - 365, month: nowDay - 30, week: nowDay - 7 };
		const cutoff = cutoffs[ghRange] ?? 0;
		const data = all.filter(r => r[0] >= cutoff);
		if (data.length < 2) return;

		const rect = ghCanvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const scaleX = ghCanvas.width / rect.width;
		const mx = mouseX * scaleX;

		const PAD_L = 90, PAD_R = 30, PAD_T = 30, PAD_B = 50;
		const cw = ghCanvas.width - PAD_L - PAD_R;
		const ch = ghCanvas.height - PAD_T - PAD_B;
		const firstDay = data[0][0], lastDay = data[data.length - 1][0];
		const spanDays = Math.max(1, lastDay - firstDay);
		const xForDay = d => PAD_L + cw * (d - firstDay) / spanDays;
		const maxRaw = data.reduce((m, r) => r[1] > m ? r[1] : m, 0) * 1.08;
		const yMax = ghNiceMax(maxRaw);

		let nearest = null, nearestDist = Infinity;
		for (const [day, gold] of data) {
			const x = xForDay(day);
			const dist = Math.abs(mx - x);
			if (dist < nearestDist) { nearestDist = dist; nearest = [day, gold]; }
		}
		if (!nearest || nearestDist > cw / data.length) return;

		const [day, gold] = nearest;
		const x = xForDay(day);
		const y = PAD_T + ch - ch * gold / yMax;
		const ctx = ghCanvas.getContext('2d');

		ctx.strokeStyle = 'rgba(255,215,0,0.4)';
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(x, PAD_T);
		ctx.lineTo(x, PAD_T + ch);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = '#FFD700';
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, 2 * Math.PI);
		ctx.fill();
		ctx.strokeStyle = 'rgba(255,255,255,0.8)';
		ctx.lineWidth = 2;
		ctx.stroke();

		const dt = new Date(day * 86400000);
		const dateStr = (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate() + '/' + dt.getUTCFullYear();
		const goldStr = gold.toLocaleString();
		const line1 = dateStr, line2 = goldStr;

		ctx.font = 'bold 16px pixel, monospace';
		const w = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width) + 20;
		const h = 52;
		let tx = x + 12, ty = y - 30;
		if (tx + w > ghCanvas.width - PAD_R) tx = x - w - 12;
		if (ty < PAD_T) ty = PAD_T;

		ctx.fillStyle = 'rgba(20,20,30,0.95)';
		ctx.strokeStyle = '#FFD700';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.roundRect(tx, ty, w, h, 4);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#FFD700';
		ctx.textAlign = 'left';
		ctx.fillText(line1, tx + 10, ty + 18);
		ctx.fillStyle = 'white';
		ctx.fillText(line2, tx + 10, ty + 38);
	});

	ghCanvas.addEventListener('mouseleave', () => drawGoldHistoryDashboard());
};

const ghFormatGold = (v) => {
	const abs = Math.abs(v);
	const fmt = (n) => parseFloat(n.toFixed(2)).toString();
	if (abs >= 1e12) return fmt(v / 1e12) + 'T';
	if (abs >= 1e9) return fmt(v / 1e9) + 'B';
	if (abs >= 1e6) return fmt(v / 1e6) + 'M';
	if (abs >= 1e3) return fmt(v / 1e3) + 'K';
	return v.toLocaleString();
};

const ghNiceMax = (raw) => {
	if (raw <= 0) return 1;
	const steps = [1, 2, 2.5, 5, 10];
	const mag = Math.pow(10, Math.floor(Math.log10(raw)));
	for (const s of steps) {
		const candidate = Math.ceil(raw / (mag * s)) * mag * s;
		if (candidate >= raw) return candidate;
	}
	return Math.ceil(raw / mag) * mag;
};

const drawGoldHistoryDashboard = () => {
	const $ = parent.$;
	const all = GH.s.d;
	if (!all.length) return;

	const nowDay = Math.floor(Date.now() / 86400000);
	const cutoffs = { all: 0, year: nowDay - 365, month: nowDay - 30, week: nowDay - 7 };
	const cutoff = cutoffs[ghRange] || 0;
	const data = all.filter(r => r[0] >= cutoff);
	if (!data.length) return;

	const current = data[data.length - 1][1];
	const peak = all.reduce((m, r) => r[1] > m ? r[1] : m, 0);
	const window30 = Math.min(data.length - 1, 30);
	let avgChange = 0;
	if (window30 > 0) {
		let sum = 0;
		for (let i = data.length - window30; i < data.length; i++)
			sum += data[i][1] - data[i - 1][1];
		avgChange = Math.round(sum / window30);
	}

	const fmt = v => ghFullNumbers ? v.toLocaleString() : ghFormatGold(v);

	$('#ghCurrent').text(fmt(current));
	$('#ghPeak').text(fmt(peak));
	const sign = avgChange >= 0 ? '+' : '';
	$('#ghAvgChange').text(sign + fmt(avgChange)).css('color', avgChange >= 0 ? '#4CAF50' : '#FF5252');

	const canvas = parent.document.getElementById('ghChart');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const rect = canvas.getBoundingClientRect();
	if (canvas.width !== rect.width || canvas.height !== rect.height) {
		canvas.width = rect.width;
		canvas.height = rect.height;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (data.length < 2) {
		ctx.fillStyle = '#999';
		ctx.font = '24px pixel, monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Not enough data for this range', canvas.width / 2, canvas.height / 2);
		return;
	}

	const PAD_L = 90, PAD_R = 30, PAD_T = 30, PAD_B = 50;
	const cw = canvas.width - PAD_L - PAD_R;
	const ch = canvas.height - PAD_T - PAD_B;

	const maxRaw = data.reduce((m, r) => r[1] > m ? r[1] : m, 0) * 1.08;
	const yMax = ghNiceMax(maxRaw);
	const Y_STEPS = 12;

	ctx.font = '15px pixel, monospace';
	for (let i = 0; i <= Y_STEPS; i++) {
		const val = yMax * i / Y_STEPS;
		const y = PAD_T + ch - ch * i / Y_STEPS;
		const isMajor = i % 2 === 0;

		ctx.strokeStyle = isMajor ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.08)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(PAD_L, y);
		ctx.lineTo(PAD_L + cw, y);
		ctx.stroke();

		if (isMajor) {
			ctx.fillStyle = 'rgba(255,215,0,0.7)';
			ctx.textAlign = 'right';
			ctx.fillText(ghFormatGold(val), PAD_L - 8, y + 5);
		}
	}

	const firstDay = data[0][0];
	const lastDay = data[data.length - 1][0];
	const spanDays = lastDay - firstDay;
	const xForDay = d => PAD_L + cw * (d - firstDay) / spanDays;

	let labelInterval, labelFmt;
	if (ghRange === 'week') {
		labelInterval = 1;
		labelFmt = d => {
			const dt = new Date(d * 86400000);
			return (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate();
		};
	} else if (ghRange === 'month') {
		labelInterval = 7;
		labelFmt = d => {
			const dt = new Date(d * 86400000);
			return (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate();
		};
	} else if (ghRange === 'year') {
		labelFmt = null;
	} else {
		labelFmt = null;
	}

	ctx.fillStyle = 'rgba(255,215,0,0.7)';
	ctx.font = '14px pixel, monospace';
	ctx.textAlign = 'center';

	if (labelFmt) {
		for (let i = 0; i < data.length; i += labelInterval) {
			const x = xForDay(data[i][0]);
			ctx.fillText(labelFmt(data[i][0]), x, PAD_T + ch + 20);

			ctx.strokeStyle = 'rgba(255,215,0,0.15)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, PAD_T);
			ctx.lineTo(x, PAD_T + ch);
			ctx.stroke();
		}
	} else {
		const seen = new Set();
		for (const [day] of data) {
			const dt = new Date(day * 86400000);
			const dom = dt.getUTCDate();
			if (dom !== 1) continue;
			const key = dt.getUTCFullYear() * 100 + dt.getUTCMonth();
			if (seen.has(key)) continue;
			seen.add(key);
			const x = xForDay(day);
			const lbl = (dt.getUTCMonth() + 1) + '/' + dt.getUTCFullYear().toString().slice(2);
			ctx.fillText(lbl, x, PAD_T + ch + 20);

			ctx.strokeStyle = 'rgba(255,215,0,0.15)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, PAD_T);
			ctx.lineTo(x, PAD_T + ch);
			ctx.stroke();
		}
	}

	const grad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + ch);
	grad.addColorStop(0, 'rgba(255,215,0,0.35)');
	grad.addColorStop(1, 'rgba(255,215,0,0.02)');
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.moveTo(xForDay(data[0][0]), PAD_T + ch);
	for (const [day, gold] of data) {
		ctx.lineTo(xForDay(day), PAD_T + ch - ch * gold / yMax);
	}
	ctx.lineTo(xForDay(data[data.length - 1][0]), PAD_T + ch);
	ctx.closePath();
	ctx.fill();

	ctx.strokeStyle = '#FFD700';
	ctx.lineWidth = 2;
	ctx.lineJoin = 'round';
	ctx.beginPath();
	for (let i = 0; i < data.length; i++) {
		const x = xForDay(data[i][0]);
		const y = PAD_T + ch - ch * data[i][1] / yMax;
		i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
	}
	ctx.stroke();

	if (data.length <= 60) {
		ctx.fillStyle = '#FFD700';
		for (const [day, gold] of data) {
			const x = xForDay(day);
			const y = PAD_T + ch - ch * gold / yMax;
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI);
			ctx.fill();
		}
	}

	ctx.strokeStyle = 'rgba(255,215,0,0.3)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(PAD_L, PAD_T);
	ctx.lineTo(PAD_L, PAD_T + ch);
	ctx.lineTo(PAD_L + cw, PAD_T + ch);
	ctx.stroke();
};

saveGold(character.gold);
setInterval(() => saveGold(character.gold), 10 * 60 * 1000);
