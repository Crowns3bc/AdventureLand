parent.socket.emit("tracker");
setTimeout(() => parent.hide_modal(), 1000);

const KH = {
	_s: null,
	get s() {
		if (!this._s) {
			try { this._s = JSON.parse(localStorage.killHistory); } catch { }
			if (!this._s || typeof this._s.d !== 'object') this._s = { d: {} };
		}
		return this._s;
	},
	save() { localStorage.killHistory = JSON.stringify(this._s); }
};

parent.KH = KH;

function saveKills() {
	const day = Math.floor(Date.now() / 86400000);
	const d = KH.s.d;
	let dirty = false;
	const monsters = parent.tracker?.monsters || {};
	const maxM = parent.tracker?.max?.monsters || {};
	const allTypes = new Set([...Object.keys(monsters), ...Object.keys(maxM)]);
	for (const mtype of allTypes) {
		const kills = monsters[mtype] | 0;
		const score = maxM[mtype]?.[0] | 0 || 0;
		if (!kills && !score) continue;
		const arr = d[mtype] ??= [];
		const last = arr[arr.length - 1];
		if (!last) { arr.push([day, kills, score]); dirty = true; continue; }
		if (last[1] === kills && last[2] === score) continue;
		if (last[0] === day) { last[1] = kills; last[2] = score; }
		else arr.push([day, kills, score]);
		dirty = true;
	}
	if (dirty) KH.save();
}

saveKills();
setInterval(saveKills, 10 * 60 * 1000);

function modify_tracker() {
	const tracker_function = function () {
		this.render_tracker = function () {
			let html = "<div style='font-size:32px'>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerm\").show()'>Monsters</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackere\").show()'>Exchanges and Quests</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerx\").show()'>Stats</div>"
				+ "<div style='background-color:#575983;border:2px solid #9F9FB0;display:inline-block;margin:2px;padding:6px' class='clickable' onclick='pcs(event);$(\".trackers\").hide();$(\".trackerg\").show()'>Graphs</div>"
				+ "</div>";

			// Monsters tab
			html += "<div class='trackers trackerm'>";
			object_sort(G.monsters, "hpsort").forEach(function (e) {
				if (e[1].cute && !e[1].achievements || e[1].unlist) return;
				let count = (tracker.monsters[e[0]] || 0) + (tracker.monsters_diff[e[0]] || 0), color = "#50ADDD";
				if (tracker.max.monsters[e[0]] && tracker.max.monsters[e[0]][0] > count) { count = tracker.max.monsters[e[0]][0]; color = "#DCC343"; }
				html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:relative;display:inline-block;margin:2px' class='clickable' onclick='pcs(event);render_monster_info(\"" + e[0] + "\")'>"
					+ sprite(e[0], { scale: 1.5 });
				if (count) html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:absolute;top:-2px;left:-2px;color:" + color + ";display:inline-block;padding:1px 1px 1px 3px'>" + to_shrinked_num(count) + "</div>";
				if (tracker.drops?.[e[0]]?.length) html += "<div style='background-color:#FD79B0;border:2px solid #9F9FB0;position:absolute;bottom:-2px;right:-2px;display:inline-block;padding:1px;height:2px;width:2px'></div>";
				html += "</div>";
			});
			html += "</div>";

			// Exchanges tab
			html += "<div class='trackers trackere hidden' style='margin-top:3px'>";
			object_sort(G.items).forEach(function (e) {
				if (!e[1].e || e[1].ignore) return;
				let list = [[e[0], e[0], undefined]];
				if (e[1].upgrade || e[1].compound) { list = []; for (let i = 0; i < 13; i++) if (G.drops[e[0] + i]) list.push([e[0], e[0] + i, i]); }
				list.forEach(function (d) {
					html += "<div style='margin-right:3px;margin-bottom:3px;display:inline-block;position:relative'" + (G.drops[d[1]] ? " class='clickable' onclick='pcs(event);render_exchange_info(\"" + d[1] + "\"," + (tracker.exchanges[d[1]] || 0) + ")'" : "") + ">"
						+ item_container({ skin: G.items[d[0]].skin }, { name: d[0], level: d[2] });
					if (tracker.exchanges[d[1]]) html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:absolute;top:-2px;left:-2px;color:#ED901C;font-size:16px;display:inline-block;padding:1px 1px 1px 3px'>" + to_shrinked_num(tracker.exchanges[d[1]]) + "</div>";
					html += "</div>";
				});
			});
			html += "</div>";

			// Stats tab
			html += "<div class='trackers trackerx hidden' style='margin-top:3px;padding:10px'><div style='font-size:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px'>";

			const ac = {}, kills = parent.tracker.max.monsters;
			for (const mtype in kills) {
				if (!G.monsters[mtype]?.achievements) continue;
				const n = kills[mtype][0];
				for (const [needed, type, reward, amount] of G.monsters[mtype].achievements) {
					if (type !== "stat") continue;
					(ac[reward] ??= { value: 0, maxvalue: 0, monsters: [] }).monsters.push({ mtype, needed, amount });
					ac[reward].maxvalue += amount;
					if (n >= needed) ac[reward].value += amount;
				}
			}

			for (const key of Object.keys(ac).sort()) {
				const a = ac[key], pct = (a.value / a.maxvalue * 100).toFixed(1);
				html += "<div style='background-color:#575983;border:2px solid " + (a.value >= a.maxvalue ? '#22c725' : '#9F9FB0') + ";padding:5px;text-align:center;cursor:pointer;position:relative' onclick='toggleDropdown(\"" + key + "\")'>"
					+ "<div style='font-weight:bold;font-size:28px;margin-bottom:3px'>" + key + "</div>"
					+ "<div style='font-size:25px;margin-bottom:1px'>" + a.value.toFixed(2) + " / " + a.maxvalue.toFixed(2) + "</div>"
					+ "<div style='font-size:22px;color:#DCC343'>(" + pct + "%)</div>"
					+ "<div id='dropdown-" + key + "' style='display:none;background-color:#1a1a1a;border:2px solid #9F9FB0;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;max-height:70vh;overflow-y:auto;padding:15px;z-index:10000;box-shadow:0 0 20px rgba(0,0,0,.8)'>"
					+ "<div style='position:sticky;top:0;background-color:#1a1a1a;padding-bottom:10px;margin-bottom:10px;border-bottom:2px solid #9F9FB0;font-size:22px;font-weight:bold'>" + key + " Progress</div>";
				for (const m of a.monsters.sort((x, y) => x.needed - y.needed || x.mtype.localeCompare(y.mtype))) {
					const cur = kills[m.mtype] ? Math.floor(kills[m.mtype][0]) : 0, done = cur >= m.needed;
					html += "<div style='background-color:" + (done ? '#1a3d1a' : '#2a2a3a') + ";margin:5px 0;padding:8px;border-radius:4px;display:flex;justify-content:space-between;align-items:center'>"
						+ "<div style='color:" + (done ? '#22c725' : 'white') + ";flex:1'>" + m.mtype + "</div>"
						+ "<div style='color:" + (done ? '#22c725' : 'white') + ";font-size:19px'>" + cur.toLocaleString() + " / " + m.needed.toLocaleString() + " (+" + m.amount.toLocaleString() + ")</div>"
						+ "</div>";
				}
				html += "</div></div>";
			}
			html += "</div></div>";

			// Graphs tab
			html += "<div class='trackers trackerg hidden' style='margin-top:3px;'>";
			html += "<div id='tkr-graph-grid'>";
			object_sort(G.monsters, "hpsort").forEach(function (e) {
				if (e[1].cute && !e[1].achievements || e[1].unlist) return;
				const kh = parent.KH?.s?.d?.[e[0]];
				if (!kh?.length) return;
				html += "<div style='background-color:#575983;border:2px solid #9F9FB0;position:relative;display:inline-block;margin:2px' class='clickable' onclick='pcs(event);tkrShowGraph(\"" + e[0] + "\")'>"
					+ sprite(e[0], { scale: 1.5 })
					+ "</div>";
			});
			html += "</div>";
			html += "<div id='tkr-graph-panel' style='display:none;margin-top:6px;'>"
				+ "<div style='display:flex;align-items:center;gap:6px;margin-bottom:6px;'>"
				+ "<div id='tkr-graph-back' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:22px' class='clickable' onclick='pcs(event);tkrShowGrid()'>← Back</div>"
				+ "<div id='tkr-graph-title' style='font-size:26px;font-weight:bold;color:#DCC343;white-space:nowrap'></div>"
				+ "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:2px;'>"
				+ "<div id='tkr-stat-kills' style='font-size:20px;color:#50ADDD;text-align:center'></div>"
				+ "<div id='tkr-stat-score' style='font-size:20px;color:#DCC343;text-align:center'></div>"
				+ "</div>"
				+ "<div style='display:flex;gap:4px'>"
				+ "<div id='tkr-range-all' style='background-color:#575983;border:2px solid #DCC343;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"all\")'>All</div>"
				+ "<div id='tkr-range-year' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"year\")'>Year</div>"
				+ "<div id='tkr-range-month' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"month\")'>Month</div>"
				+ "<div id='tkr-range-week' style='background-color:#575983;border:2px solid #9F9FB0;padding:4px 10px;cursor:pointer;font-size:20px' class='clickable' onclick='pcs(event);tkrSetRange(\"week\")'>Week</div>"
				+ "</div></div>"
				+ "<div style='display:flex;gap:12px;font-size:18px;margin-bottom:4px;'>"
				+ "<span style='color:#50ADDD'>— Kills</span>"
				+ "<span style='color:#DCC343'>— Max Score</span>"
				+ "</div>"
				+ "<canvas id='tkr-graph-canvas' style='width:100%;height:600px;background:rgba(0,0,0,0.3);border:2px solid #9F9FB0;border-radius:4px;display:block;'></canvas>"
				+ "</div>";
			html += "</div>";

			show_modal(html, { wwidth: 578, hideinbackground: true });

			// Graph tab logic
			let tkrMtype = null, tkrRange = 'all';
			const tkrModal = parent.document.querySelector('.imodal');
			const tkrOriginalWidth = tkrModal ? tkrModal.style.width : '';

			const TKR_PAD = [30, 15, 50, 95]; // T R B L

			const tkrNiceMax = raw => {
				if (raw <= 0) return 1;
				const mag = Math.pow(10, Math.floor(Math.log10(raw)));
				const n = raw / mag;
				if (n <= 1.2) return 1.2 * mag;
				if (n <= 1.5) return 1.5 * mag;
				if (n <= 2) return 2 * mag;
				if (n <= 2.5) return 2.5 * mag;
				if (n <= 3) return 3 * mag;
				if (n <= 4) return 4 * mag;
				if (n <= 5) return 5 * mag;
				if (n <= 8) return 8 * mag;
				return 10 * mag;
			};

			const tkrFmt = v => {
				const a = Math.abs(v);
				const fmt = (n, s) => { const str = n.toFixed(1); return (str.endsWith('.0') ? n.toFixed(0) : str) + s; };
				if (a >= 1e9) return fmt(v / 1e9, 'B');
				if (a >= 1e6) return fmt(v / 1e6, 'M');
				if (a >= 1e3) return fmt(v / 1e3, 'K');
				return v.toLocaleString();
			};

			window.tkrSetRange = r => {
				tkrRange = r;
				['all', 'year', 'month', 'week'].forEach(x => {
					const el = document.getElementById('tkr-range-' + x);
					if (el) el.style.borderColor = x === r ? '#DCC343' : '#9F9FB0';
				});
				tkrDrawGraph();
			};

			window.tkrShowGrid = () => {
				document.getElementById('tkr-graph-grid').style.display = '';
				document.getElementById('tkr-graph-panel').style.display = 'none';
				tkrMtype = null;
				if (tkrModal) tkrModal.style.width = tkrOriginalWidth;
			};

			window.tkrShowGraph = mtype => {
				tkrMtype = mtype;
				document.getElementById('tkr-graph-grid').style.display = 'none';
				document.getElementById('tkr-graph-panel').style.display = '';
				document.getElementById('tkr-graph-title').textContent = mtype;
				if (tkrModal) tkrModal.style.width = '1200px';
				tkrDrawGraph();
			};

			const tkrDrawGraph = () => {
				if (!tkrMtype) return;
				const all = parent.KH?.s?.d?.[tkrMtype] || [];
				const canvas = document.getElementById('tkr-graph-canvas');
				if (!canvas) return;
				const ctx = canvas.getContext('2d');
				const rect = canvas.getBoundingClientRect();
				if (canvas.width !== rect.width || canvas.height !== rect.height) { canvas.width = rect.width; canvas.height = rect.height; }
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				const nowDay = Math.floor(Date.now() / 86400000);
				const cutoff = ({ all: 0, year: nowDay - 365, month: nowDay - 30, week: nowDay - 7 })[tkrRange] ?? 0;
				const data = all.filter(r => r[0] >= cutoff);

				if (data.length < 2) {
					ctx.fillStyle = '#9F9FB0'; ctx.font = '18px pixel,monospace'; ctx.textAlign = 'center';
					ctx.fillText('Not enough data for this range', canvas.width / 2, canvas.height / 2);
					return;
				}

				const [PT, PR, PB, PL] = TKR_PAD;
				const cw = canvas.width - PL - PR, ch = canvas.height - PT - PB;
				const firstDay = data[0][0], lastDay = data[data.length - 1][0];
				const span = Math.max(1, lastDay - firstDay);
				const xd = d => PL + cw * (d - firstDay) / span;
				const yMax = tkrNiceMax(Math.max(data[data.length - 1][1], data[data.length - 1][2]) * 1.08);
				const yv = v => PT + ch - ch * v / yMax;

				// Grid + Y labels
				ctx.font = '18px pixel,monospace';
				for (let i = 0; i <= 8; i++) {
					const y = PT + ch * i / 8;
					ctx.strokeStyle = i % 2 === 0 ? 'rgba(159,159,176,0.2)' : 'rgba(159,159,176,0.08)';
					ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PL + cw, y); ctx.stroke();
					if (i % 2 === 0) {
						ctx.fillStyle = 'rgba(159,159,176,0.8)'; ctx.textAlign = 'right';
						ctx.fillText(tkrFmt(yMax * (8 - i) / 8), PL - 6, y + 5);
					}
				}

				// X labels
				ctx.fillStyle = 'rgba(159,159,176,0.8)'; ctx.font = '18px pixel,monospace'; ctx.textAlign = 'center';
				const totalDays = lastDay - firstDay || 1;
				let tickInterval;
				if (tkrRange === 'week') tickInterval = 1;
				else if (tkrRange === 'month') tickInterval = 3;
				else if (tkrRange === 'year') tickInterval = 30;
				else tickInterval = Math.ceil(totalDays / 10 / 30) * 30 || 30;

				const tickStart = Math.ceil(firstDay / tickInterval) * tickInterval;
				for (let t = tickStart; t <= lastDay; t += tickInterval) {
					const x = xd(t);
					const dt = new Date(t * 86400000);
					const lbl = tkrRange === 'week' || tkrRange === 'month'
						? (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate()
						: (dt.getUTCMonth() + 1) + '/' + dt.getUTCFullYear().toString().slice(2);
					ctx.fillText(lbl, x, PT + ch + 18);
					ctx.strokeStyle = 'rgba(159,159,176,0.15)'; ctx.lineWidth = 1;
					ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, PT + ch); ctx.stroke();
				}

				// Axes
				ctx.strokeStyle = 'rgba(159,159,176,0.5)'; ctx.lineWidth = 1;
				ctx.beginPath(); ctx.moveTo(PL, PT); ctx.lineTo(PL, PT + ch); ctx.lineTo(PL + cw, PT + ch); ctx.stroke();

				// Area + line — kills
				const gradK = ctx.createLinearGradient(0, PT, 0, PT + ch);
				gradK.addColorStop(0, 'rgba(80,173,221,0.25)'); gradK.addColorStop(1, 'rgba(80,173,221,0.02)');
				ctx.fillStyle = gradK;
				ctx.beginPath();
				ctx.moveTo(xd(data[0][0]), PT + ch);
				for (const r of data) ctx.lineTo(xd(r[0]), yv(r[1]));
				ctx.lineTo(xd(data[data.length - 1][0]), PT + ch);
				ctx.closePath(); ctx.fill();

				ctx.strokeStyle = '#50ADDD'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
				ctx.beginPath();
				for (let i = 0; i < data.length; i++) i === 0 ? ctx.moveTo(xd(data[i][0]), yv(data[i][1])) : ctx.lineTo(xd(data[i][0]), yv(data[i][1]));
				ctx.stroke();

				// Area + line — max score
				const gradM = ctx.createLinearGradient(0, PT, 0, PT + ch);
				gradM.addColorStop(0, 'rgba(220,195,67,0.18)'); gradM.addColorStop(1, 'rgba(220,195,67,0.01)');
				ctx.fillStyle = gradM;
				ctx.beginPath();
				ctx.moveTo(xd(data[0][0]), PT + ch);
				for (const r of data) ctx.lineTo(xd(r[0]), yv(r[2]));
				ctx.lineTo(xd(data[data.length - 1][0]), PT + ch);
				ctx.closePath(); ctx.fill();

				ctx.strokeStyle = '#DCC343'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.setLineDash([6, 3]);
				ctx.beginPath();
				for (let i = 0; i < data.length; i++) i === 0 ? ctx.moveTo(xd(data[i][0]), yv(data[i][2])) : ctx.lineTo(xd(data[i][0]), yv(data[i][2]));
				ctx.stroke(); ctx.setLineDash([]);

				// Dots if sparse
				if (data.length <= 60) {
					for (const r of data) {
						ctx.fillStyle = '#50ADDD'; ctx.beginPath(); ctx.arc(xd(r[0]), yv(r[1]), 3, 0, 6.283); ctx.fill();
						ctx.fillStyle = '#DCC343'; ctx.beginPath(); ctx.arc(xd(r[0]), yv(r[2]), 3, 0, 6.283); ctx.fill();
					}
				}

				canvas._tkrDraw = tkrDrawGraph;
				canvas._tkrData = data;
				canvas._tkrMeta = { xd, yv, PL, PR, PT, PB, cw, ch, span, firstDay };

				// Stats in header
				const statEl1 = document.getElementById('tkr-stat-kills');
				const statEl2 = document.getElementById('tkr-stat-score');
				if (statEl1 && statEl2 && data.length >= 2) {
					const spanD = Math.max(1, data[data.length - 1][0] - data[0][0]);
					const killDelta = data[data.length - 1][1] - data[0][1];
					const scoreDelta = data[data.length - 1][2] - data[0][2];
					const rangeLabel = { all: 'All Time', year: 'Past Year', month: 'Past Month', week: 'Past Week' }[tkrRange];
					const divisor = { all: 365, year: 30, month: 7, week: 1 }[tkrRange];
					const unit = { all: '/yr', year: '/mo', month: '/wk', week: '/day' }[tkrRange];
					const avg = v => tkrFmt(((v / spanD) * divisor) | 0);
					statEl1.textContent = 'Kills (' + rangeLabel + '): avg ' + avg(killDelta) + unit;
					statEl2.textContent = 'Score (' + rangeLabel + '): avg ' + avg(scoreDelta) + unit;
				}
			};

			// Tooltip on hover
			const ghCanvas = document.getElementById('tkr-graph-canvas');
			if (ghCanvas) {
				ghCanvas.onmousemove = function (e) {
					const data = this._tkrData, meta = this._tkrMeta;
					if (!data || !meta) return;
					tkrDrawGraph();
					const rect = this.getBoundingClientRect();
					const mx = (e.clientX - rect.left) * (this.width / rect.width);
					const { xd, yv, PL, PT, cw, ch } = meta;
					let near = null, nd = Infinity;
					for (const r of data) { const dx = Math.abs(mx - xd(r[0])); if (dx < nd) { nd = dx; near = r; } }
					if (!near || nd > cw / data.length * 1.5) return;

					const ctx = this.getContext('2d');
					const x = xd(near[0]);

					ctx.strokeStyle = 'rgba(159,159,176,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
					ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, PT + ch); ctx.stroke(); ctx.setLineDash([]);

					ctx.fillStyle = '#50ADDD'; ctx.beginPath(); ctx.arc(x, yv(near[1]), 5, 0, 6.283); ctx.fill();
					ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
					ctx.fillStyle = '#DCC343'; ctx.beginPath(); ctx.arc(x, yv(near[2]), 5, 0, 6.283); ctx.fill();
					ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();

					const dt = new Date(near[0] * 86400000);
					const l1 = (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate() + '/' + dt.getUTCFullYear();
					const l2 = 'Kills: ' + near[1].toLocaleString(), l3 = 'Max: ' + near[2].toLocaleString();
					ctx.font = 'bold 18px pixel,monospace';
					const tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width, ctx.measureText(l3).width) + 24;
					let tx = x + 12, ty = yv(near[1]) - 50;
					if (tx + tw > this.width - 15) tx = x - tw - 12;
					if (ty < PT) ty = PT;

					ctx.fillStyle = 'rgba(20,20,30,0.95)'; ctx.strokeStyle = '#9F9FB0'; ctx.lineWidth = 1;
					ctx.beginPath(); ctx.roundRect(tx, ty, tw, 85, 4); ctx.fill(); ctx.stroke();

					ctx.textAlign = 'left';
					ctx.fillStyle = 'rgba(159,159,176,0.9)'; ctx.fillText(l1, tx + 10, ty + 24);
					ctx.fillStyle = '#50ADDD'; ctx.fillText(l2, tx + 10, ty + 50);
					ctx.fillStyle = '#DCC343'; ctx.fillText(l3, tx + 10, ty + 70);
				};
				ghCanvas.onmouseleave = () => tkrDrawGraph();
			}

			window.toggleDropdown = key => { const d = document.getElementById('dropdown-' + key); d.style.display = d.style.display === 'block' ? 'none' : 'block'; };
		};
	};

	const s = tracker_function.toString();
	parent.smart_eval(s.slice(s.indexOf('{') + 1, s.lastIndexOf('}')));
}

modify_tracker();
