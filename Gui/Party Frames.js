if (parent.party_style_prepared) parent.$('#style-party-frames').remove();

parent.$('head').append(`<style id="style-party-frames">
.party-container {position: absolute; top: 55px; left: -25%; width: 1000px; height: 300px; font-family: 'pixel';}
</style>`);
parent.party_style_prepared = true;

const DISPLAY_BARS = ['hp', 'mp', 'xp']; // <-- Add 'cc', 'ping', 'share' as needed
const FRAME_WIDTH = 80;
const INCLUDE = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'xp', 'level', 'share', 'cc', 'max_cc'];
const SHOW_IMG = true;

const extractInfo = (char) => {
	const info = {};
	for (const key of INCLUDE) if (key in char) info[key] = char[key];
	for (const key of character.read_only) if (key in char) info[key] = char[key];
	return info;
};

setInterval(() => set(character.name + '_newparty_info', { ...extractInfo(character), lastSeen: Date.now() }), 200);

const getIFramedChar = (name) => {
	for (const iframe of top.$('iframe')) {
		const char = iframe.contentWindow.character;
		if (char?.name === name) return char;
	}
};

const barHTML = (text, val, width, color) =>
	`<div style="position:relative;width:100%;height:20px;text-align:center;margin-top:3px;">
<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;font-size:17px;z-index:1;white-space:nowrap;text-shadow:-1px 0 black,0 2px black,2px 0 black,0 -1px black;">${text}: ${val}</div>
<div style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${color};width:${width}%;height:20px;border:1px solid grey;"></div>
</div>`;

const barConfigs = {
	hp: { color: 'red', calc: (i) => ({ val: i.hp, width: i.hp / i.max_hp * 100 }) },
	mp: { color: 'blue', calc: (i) => ({ val: i.mp, width: i.mp / i.max_mp * 100 }) },
	xp: {color: 'green', calc: (i) => {
			const pct = i.xp / G.levels[i.level] * 100;
			return { val: pct.toFixed(2) + '%', width: pct };
		}
	},
	cc: { color: 'grey', calc: (i) => ({ val: i.cc?.toFixed(2) ?? i.cc, width: i.cc / (i.max_cc || 200) * 100 }) },
	ping: { color: 'black', calc: () => ({ val: character.ping?.toFixed(0) ?? '??', width: 0 }) },
	share: {color: 'teal', calc: (i, partyData) => {
			const share = partyData?.share;
			return share != null ? { val: (share * 100).toFixed(2) + '%', width: share * 300 } : { val: '??', width: 0 };
		}
	}
};

setInterval(() => {
	const partyFrame = parent.$('#newparty').addClass('party-container');
	if (!partyFrame.length) return;

	const members = Object.keys(parent.party);
	partyFrame.children().each((x, el) => {
		const name = members[x];
		let info = get(name + '_newparty_info');

		if (!info || Date.now() - info.lastSeen > 1000) {
			const iframed = getIFramedChar(name);
			info = iframed ? extractInfo(iframed) : (get_player(name) || { name });
		}

		const partyData = parent.party[name];
		let html = `<div style="width:${FRAME_WIDTH}px;height:20px;margin-top:3px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${info.name}</div>`;

		for (const key of DISPLAY_BARS) {
			const cfg = barConfigs[key];
			const { val, width } = cfg.calc(info, partyData);
			if (val !== undefined && val !== '??') {
				html += barHTML(key.toUpperCase(), val, width, cfg.color);
			}
		}

		parent.$(el).children().first().css('display', SHOW_IMG ? 'inherit' : 'none');
		parent.$(el).children().last().html(`<div style="font-size:22px;" onclick='pcs(event);party_click("${name}");'>${html}</div>`);
	});
}, 250);

parent.$('#party-props-toggles').remove();
