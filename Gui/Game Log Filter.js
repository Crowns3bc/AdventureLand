/**
 * Enhanced game log with filtering and timestamps
 * Creates a tabbed filter UI above the game log to show/hide different message types
 */
(function () {
	const FILTERS = {
		kills: { show: false, regex: /killed/, label: 'Kills' },
		gold: { show: true, regex: /gold/, label: 'Gold' },
		party: { show: true, regex: /party/, label: 'Party' },
		items: { show: true, regex: /found/, label: 'Items' },
		upgrade: { show: true, regex: /(upgrade|combination)/, label: 'Upgr.' },
		errors: { show: true, regex: /(error|line|column)/i, label: 'Errors' }
	};

	const COLORS = {
		active: ['#151342', '#1D1A5C'],
		inactive: ['#222', '#333'],
		activeText: '#FFF',
		inactiveText: '#999'
	};

	const TRUNCATE_AT = 1000;
	const TRUNCATE_TO = 720;

	function padZero(num, length = 2) {
		return num.toString().padStart(length, '0');
	}

	function getTimestamp() {
		const now = new Date();
		return `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
	}

	function createFilterBar() {
		const existingBar = parent.document.getElementById('gamelog-tab-bar');
		if (existingBar) existingBar.remove();

		const bar = parent.document.createElement('div');
		bar.id = 'gamelog-tab-bar';
		bar.className = 'enableclicks';
		Object.assign(bar.style, {
			border: '5px solid gray',
			height: '24px',
			background: 'black',
			margin: '-5px 0',
			display: 'flex',
			fontSize: '20px',
			fontFamily: 'pixel'
		});

		Object.entries(FILTERS).forEach(([key, filter], index) => {
			const tab = parent.document.createElement('div');
			tab.id = `gamelog-tab-${key}`;
			tab.className = 'gamelog-tab enableclicks';
			tab.textContent = filter.label;

			const colors = filter.show ? COLORS.active : COLORS.inactive;
			const textColor = filter.show ? COLORS.activeText : COLORS.inactiveText;

			Object.assign(tab.style, {
				height: '100%',
				width: `${100 / Object.keys(FILTERS).length}%`,
				textAlign: 'center',
				lineHeight: '24px',
				cursor: 'default',
				background: colors[index % 2],
				color: textColor
			});

			tab.addEventListener('click', () => toggleFilter(key));
			bar.appendChild(tab);
		});

		const gamelog = parent.document.getElementById('gamelog');
		gamelog.parentElement.insertBefore(bar, gamelog);
	}

	function toggleFilter(key) {
		FILTERS[key].show = !FILTERS[key].show;

		const tab = parent.document.getElementById(`gamelog-tab-${key}`);
		const index = Array.from(tab.parentElement.children).indexOf(tab);
		const colors = FILTERS[key].show ? COLORS.active : COLORS.inactive;
		const textColor = FILTERS[key].show ? COLORS.activeText : COLORS.inactiveText;

		tab.style.background = colors[index % 2];
		tab.style.color = textColor;

		filterGamelog();
		scrollGamelogToBottom();
	}

	function filterGamelog() {
		const entries = parent.document.querySelectorAll('.gameentry');
		entries.forEach(entry => {
			let shouldShow = true;
			for (const filter of Object.values(FILTERS)) {
				if (filter.regex.test(entry.innerHTML)) {
					shouldShow = filter.show;
					break;
				}
			}
			entry.style.display = shouldShow ? 'block' : 'none';
		});
	}

	function scrollGamelogToBottom() {
		const gamelog = parent.document.getElementById('gamelog');
		gamelog.scrollTop = gamelog.scrollHeight;
	}

	function addLogEntry(message, color = 'white') {
		if (parent.mode?.dom_tests || parent.inside === 'payments') return;

		const gamelog = parent.document.getElementById('gamelog');

		if (parent.game_logs.length > TRUNCATE_AT) {
			parent.game_logs = parent.game_logs.slice(-TRUNCATE_TO);

			const truncateMsg = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
			const entries = parent.game_logs.map(([msg, clr]) =>
				`<div class='gameentry' style='color: ${clr || 'white'}'>${msg}</div>`
			).join('');

			gamelog.innerHTML = truncateMsg + entries;
		}

		parent.game_logs.push([message, color]);

		let display = 'block';
		for (const filter of Object.values(FILTERS)) {
			if (filter.regex.test(message)) {
				display = filter.show ? 'block' : 'none';
				break;
			}
		}

		const entry = parent.document.createElement('div');
		entry.className = 'gameentry';
		entry.style.color = color;
		entry.style.display = display;
		entry.innerHTML = message;

		gamelog.appendChild(entry);
		scrollGamelogToBottom();
	}

	function initTimestamps() {
		if (parent.socket.hasListeners('game_log')) {
			parent.socket.removeListener('game_log');
		}

		parent.socket.on('game_log', data => {
			parent.draw_trigger(() => {
				const timestamp = getTimestamp();

				if (typeof data === 'string') {
					addLogEntry(`${timestamp} | ${data}`, 'gray');
				} else {
					if (data.sound) sfx(data.sound);
					addLogEntry(`${timestamp} | ${data.message}`, data.color);
				}
			});
		});
	}

	createFilterBar();
	filterGamelog();
	initTimestamps();
})();
