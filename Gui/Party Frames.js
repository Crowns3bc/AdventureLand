if (parent.party_style_prepared) {
	parent.$('#style-party-frames').remove();
}

let css = `
        .party-container {
            position: absolute;
            top: 55px;
            left: -15%;
            width: 1000px; 
            height: 300px;
            transform: translate(0%, 0);
			fontFamily: 'pixel';
        }
    `;
//width normal is 480px, translate 8% normal
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name', 'xp', 'level', 'share', 'cc'];
const partyFrameWidth = 80; // Set the desired width for the party frames

function updatePartyData() {
	let myInfo = Object.fromEntries(Object.entries(character).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
	myInfo.lastSeen = Date.now();
	set(character.name + '_newparty_info', myInfo);
}

setInterval(updatePartyData, 200);

function getIFramedCharacter(name) {
	for (const iframe of top.$('iframe')) {
		const char = iframe.contentWindow.character;
		if (!char) continue; // Character isn't loaded yet
		if (char.name == name) return char;
	}
	return null;
}

let show_party_frame_property = {
	img: true,
	hp: true,
	mp: true,
	xp: true,
	cc: true,
	ping: true,
	share: true
};

function get_toggle_text(key) {
	return key.toUpperCase() + (show_party_frame_property[key] ? '✔️' : '❌');
}

function update_toggle_text(key) {
	const toggle = parent.document.getElementById('party-props-toggles-' + key);
	toggle.textContent = get_toggle_text(key);
}

function addPartyFramePropertiesToggles() {
	if (parent.document.getElementById('party-props-toggles')) {
		return;
	}

	const toggles = parent.document.createElement('div');
	toggles.id = 'party-props-toggles';
	toggles.classList.add('hidden');
	toggles.style = `
    display: flex; 
    flex-wrap: wrap;
    width: 100%;
    max-width: 480px;
    background-color: black;
    margin-top: 2px;
`;

	function create_toggle(key) {
		const toggle = parent.document.createElement('button');
		toggle.id = 'party-props-toggles-' + key;
		toggle.setAttribute('data-key', key);
		toggle.style = `
        border: 1px #ccc solid; 
        background-color: #000; 
        color: #ccc;
        width: 20%;
        margin: 0px;
		font-size: 9px;
        padding: 5px;
		cursor: pointer;
    `;
		toggle.setAttribute(
			'onclick',
			`parent.code_eval(show_party_frame_property['${key}'] = !show_party_frame_property['${key}']; update_toggle_text('${key}'));`
		);
		toggle.appendChild(parent.document.createTextNode(get_toggle_text(key)));
		return toggle;
	}

	for (let key of ['img', 'hp', 'mp', 'xp', 'cc']) {
		toggles.appendChild(create_toggle(key));
	}

	//let party = parent.document.getElementById('newparty');
	//let party_parent = party.parentNode;
	//party_parent.append(toggles);

	const rightBottomMenu = parent.document.getElementById("bottomrightcorner");
	const gameLogUi = parent.document.getElementById("gamelog");
	//rightBottomMenu.insertBefore(toggles, gameLogUi);
	// reactivate if you want toggle buttons ^^^^
}

function updatePartyFrames() {
	let $ = parent.$;
	let partyFrame = $('#newparty');
	partyFrame.addClass('party-container');

	if (partyFrame) {
		addPartyFramePropertiesToggles();

		for (let x = 0; x < partyFrame.children().length; x++) {
			let party_member_name = Object.keys(parent.party)[x];
			let info = get(party_member_name + '_newparty_info');
			if (!info || Date.now() - info.lastSeen > 1000) {
				let iframed_party_member = getIFramedCharacter(party_member_name);
				if (iframed_party_member) {
					info = Object.fromEntries(Object.entries(iframed_party_member).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
				} else {
					let party_member = get_player(party_member_name);
					if (party_member) {
						info = Object.fromEntries(Object.entries(party_member).filter(current => { return includeThese.includes(current[0]); }));
					} else {
						info = { name: party_member_name };
					}
				}
			}

			let infoHTML = `<div style="width: ${partyFrameWidth}px; height: 20px; margin-top: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${info.name}</div>`;

			info.max_cc = 200;

			let hpWidth = 0;
			let mpWidth = 0;
			let hp = '??';
			let mp = '??';
			if (info.hp !== undefined) {
				hpWidth = info.hp / info.max_hp * 100;
				mpWidth = info.mp / info.max_mp * 100;
				hp = info.hp;
				mp = info.mp;
			}

			let xpWidth = 0;
			let xp = '??';
			if (info.xp !== undefined) {
				let lvl = info.level;
				let max_xp = G.levels[lvl];
				xpWidth = info.xp / max_xp * 100;
				xp = xpWidth.toFixed(2) + '%';

				//const billion = 1_000_000_000;
				//xp = (info.xp / billion).toFixed(1) + 'b/' + (max_xp / billion).toFixed(0) + 'b';
			}

			let ccWidth = 0;
			let cc = '??';
			if (info.cc !== undefined) {
				ccWidth = info.cc / info.max_cc * 100;
				cc = info.cc.toFixed(2);
			}

			let pingWidth = 0;
			let ping = '??';
			if (character.ping !== undefined) {
				pingWidth = -10;
				ping = character.ping.toFixed(0);
			}

			let shareWidth = 0;
			let share = '??';
			if (parent.party[party_member_name] && parent.party[party_member_name].share !== undefined) {
				shareWidth = parent.party[party_member_name].share * 100;
				share = (parent.party[party_member_name].share * 100).toFixed(2) + '%'; // Display share percentage with % sign
			}

			let data = {
				hp: hp,
				hpWidth: hpWidth,
				hpColor: 'red',
				mp: mp,
				mpWidth: mpWidth,
				mpColor: 'blue',
				xp: xp,
				xpWidth: xpWidth,
				xpColor: 'green',
				cc: cc,
				ccWidth: ccWidth,
				ccColor: 'grey',
				ping: ping,
				pingWidth: pingWidth,
				pingColor: 'black',
				share: share,
				shareWidth: shareWidth * 3,
				shareColor: 'teal',
			};

			for (let key of ['hp', 'mp', 'xp']) { // add what you want to see here ['hp', 'mp', 'xp', 'cc', 'ping', 'share']
				const text = key.toUpperCase();
				const value = data[key];
				const width = data[key + 'Width'];
				const color = data[key + 'Color'];
				if (show_party_frame_property[key]) {
					infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 17px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">${text}: ${value}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${color}; width: ${width}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;
				}
			}

			let party_member_frame = partyFrame.find(partyFrame.children()[x]);
			party_member_frame.children().first().css('display', show_party_frame_property['img'] ? 'inherit' : 'none');
			party_member_frame.children().last().html(`<div style="font-size: 22px;" onclick='pcs(event); party_click("${party_member_name}\");'>${infoHTML}</div>`);
		}
	}
}

parent.$('#party-props-toggles').remove();

setInterval(updatePartyFrames, 250);
