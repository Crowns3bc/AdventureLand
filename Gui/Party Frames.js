if (parent.party_style_prepared) {
	parent.$('#style-party-frames').remove();
}

let css = `
        .party-container {
            position: absolute;
            top: 0px;
            left: -50%;
            width: 500px;
            height: 450px;
            transform: translate(-50%, 0);
        }
    `;
parent.$('head').append(`<style id="style-party-frames">${css}</style>`);
parent.party_style_prepared = true;

const includeThese = ['mp', 'max_mp', 'hp', 'max_hp', 'name', 'max_xp', 'name'];
const partyFrameWidth = 70; // Set the desired width for the party frames

function updatePartyData() {
    let myInfo = Object.fromEntries(Object.entries(character).filter(current => { return character.read_only.includes(current[0]) || includeThese.includes(current[0]); }));
	myInfo.lastSeen = Date.now();
    set(character.name + '_newparty_info', myInfo);
}

setInterval(updatePartyData, 100);

function updatePartyFrames() {
    let $ = parent.$;
    let partied = $('#newparty');
	partied.addClass('party-container');
    if (partied) {
        for (let x = 0; x < partied.children().length; x++) {
			let party_member_name = Object.keys(parent.party)[x];
            let info = get(party_member_name + '_newparty_info');
			if (!info || Date.now() - info.lastSeen > 1000) {
				let party_member = get_player(party_member_name);
				if (party_member) {
					info = Object.fromEntries(Object.entries(party_member).filter(current => { return includeThese.includes(current[0]); }));
				} else {
					info = {name: party_member_name};
				}
			}

            let infoHTML = `<div style="width: ${partyFrameWidth}px; height: 20px; margin-top: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${info.name}</div>`;

			let hpwidth = 0;
			let mpwidth = 0;
			let percenthp = '??';
			let percentmp = '??';
			if (info.hp) {
				hpwidth = info.hp / info.max_hp * 100;
				mpwidth = info.mp / info.max_mp * 100;
            	percenthp = hpwidth.toFixed(0) + '%';
            	percentmp = mpwidth.toFixed(0) + '%';
			}

			let exp = 0;
			let percentxp = '??';
			if (info.xp) {
				let lvl = info.level
				exp = info.xp / G.levels[lvl] * 100;
            	percentxp = exp.toFixed(2) + '%';
			}

			infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">HP: ${percenthp}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: red; width: ${hpwidth}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;

            infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 5px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">MP: ${percentmp}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: blue; width: ${mpwidth}%; height: 20px; transform: translate(0, 0); border: 1px solid gray;"></div>
</div>`;

            infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 5px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">XP: ${(percentxp)}</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: green; width: ${exp}%; height: 20px; transform: translate(0, 0); border: 1px solid gray;"></div>
</div>`;
            partied.find(partied.children()[x]).children().last().html(`<div style="font-size: 24px;">${infoHTML}</div>`);
        }
    }
}

setInterval(updatePartyFrames, 100);
