let xpInterval = 'second', targetXpRate = 40000;
const timeStart = performance.now(), startXP = character.xp;
const intervals = { second: 1000, minute: 60000, hour: 3600000, day: 86400000 };
const fmt = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const initXP = () => {
	const $ = parent.$;
	$('#bottomrightcorner').find('#xptimer').remove();
	const container = $('<div id="xptimer"></div>').css({ background: 'black', border: 'solid gray', borderWidth: '4px 4px', width: "98%", height: '66px', fontSize: '25px', color: '#0F0', textAlign: 'center', display: 'table', overflow: 'hidden', marginBottom: '-5px', backgroundColor: 'rgba(0,0,0,0.7)' });
	$('<div id="xptimercontent"></div>').css({ display: 'table-cell', verticalAlign: 'middle' }).html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 30px;">Loading...</span><br><span id="xprate">(Kill something!)</span>').appendTo(container);
	$('#bottomrightcorner').children().first().after(container);

	setInterval(() => {
		const xpGain = character.xp - startXP;
		if (xpGain === 0) return;

		const elapsed = performance.now() - timeStart;
		const elapsedSec = elapsed / 1000;
		if (elapsedSec < 1) return;

		const xpMissing = parent.G.levels[character.level] - character.xp;
		const xpPerSec = xpGain / elapsedSec;
		const secToLevel = xpMissing / xpPerSec | 0;

		const d = secToLevel / 86400 | 0, h = (secToLevel % 86400) / 3600 | 0, m = (secToLevel % 3600) / 60 | 0;
		$('#xpcounter').css('color', '#87CEEB').text(`${d}d ${h}h ${m}min`);

		const avgXP = xpGain / (elapsed / intervals[xpInterval]) | 0;
		const color = avgXP < targetXpRate * 0.5 ? '#F00' : avgXP < targetXpRate ? '#FA0' : avgXP <= targetXpRate * 1.2 ? '#FF0' : avgXP <= targetXpRate * 1.5 ? '#9E9' : '#0F0';
		$('#xprate').css('color', color).html(`<span class="xprate-container">${fmt(avgXP)} XP/${xpInterval[0].toUpperCase() + xpInterval.slice(1)}</span>`);
	}, 500);
};

const setXPInterval = i => ['second', 'minute', 'hour', 'day'].includes(i) ? xpInterval = i : console.warn("Invalid interval. Use 'second', 'minute', 'hour', or 'day'.");
setTimeout(initXP, 1000);
