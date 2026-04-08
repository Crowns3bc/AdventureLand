let sumGold = 0, largestGoldDrop = 0, interval = 'hour';
const startTime = performance.now();
const intervals = { minute: 60000, hour: 3600000, day: 86400000 };

const init = () => {
	const $ = parent.$;
	$('#bottomrightcorner').find('#goldtimer').remove();
	const container = $('<div id="goldtimer"></div>').css({ fontSize: '25px', color: 'white', textAlign: 'center', display: 'table', overflow: 'hidden', marginBottom: '-5px', width: "100%" });
	$('<div id="goldtimercontent"></div>').css({ display: 'table-cell', verticalAlign: 'middle' }).appendTo(container);
	$('#bottomrightcorner').children().first().after(container);

	const countPartyChars = () => {
		let count = 0;
		for (const name in parent.party) {
			if (name === character.name || parent.entities[name]?.owner === character.owner) count++;
		}
		return count;
	};

	character.on("loot", d => {
		if (d.gold && typeof d.gold === 'number' && !Number.isNaN(d.gold)) {
			const myGold = Math.round(d.gold * countPartyChars());
			sumGold += myGold;
			if (myGold > largestGoldDrop) largestGoldDrop = myGold;
		}
	});

	setInterval(() => {
		const elapsed = performance.now() - startTime;
		const divisor = elapsed / intervals[interval];
		const avg = divisor > 0 ? (sumGold / divisor | 0) : 0;
		$('#goldtimercontent').html(`<div>${avg.toLocaleString('en')} Gold/${interval[0].toUpperCase() + interval.slice(1)}</div><div>${largestGoldDrop.toLocaleString('en')} Jackpot</div>`).css({ backgroundColor: 'rgba(0,0,0,1)', border: 'solid gray', borderWidth: '4px 4px', height: '50px', lineHeight: '25px', fontSize: '25px', color: '#FFD700', textAlign: 'center' });
	}, 500);
};

const setGoldInterval = i => ['minute', 'hour', 'day'].includes(i) ? interval = i : console.warn("Invalid interval. Use 'minute', 'hour', or 'day'.");
setTimeout(init, 1000);
