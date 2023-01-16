setInterval(() => {
    let myInfo = Object.fromEntries(Object.entries(character).filter(current => {return character.read_only.indexOf(current[0]) != -1}));
    myInfo.name = character.name;
	set(character.name,myInfo);
}, 200);
setInterval(() => {
    let $ = parent.$;
    let partied = $('#newparty');
    partied.addClass('party-container');
    let css = `
        .party-container {
            position: absolute;
            top: 0px;
            left: -50%;
            width: 450px;
            height: 450px;
            transform: translate(-50%, 0);
        }
    `;
parent.$('head').append(`<style>${css}</style>`);
    if (partied){
        for (let x=0; x < partied.children().length; x++){
        	let info = get(Object.entries(parent.party)[x][0]);
		let lvl = info.level
		let exp = info.xp / G.levels[lvl] * 100;
        	let infoHTML = `<div>${info.name}</div>`;
        	let percenthp = Math.round(info.hp / info.max_hp * 100);
		let percentmp = Math.round(info.mp / info.max_mp * 100);
		let percentxp = exp.toFixed(2);
			infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 3px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">HP: ${percenthp}%</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: red; width: ${info.hp/info.max_hp*100}%; height: 20px; transform: translate(0, 0); border: 1px solid grey;"></div>
</div>`;

			infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 4px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">MP: ${percentmp}%</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: blue; width: ${info.mp/info.max_mp*100}%; height: 20px; transform: translate(0, 0); border: 1px solid gray;"></div>
</div>`;
			
			infoHTML += `<div style="position: relative; width: 100%; height: 20px; text-align: center; margin-top: 4px;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 20px; z-index: 1; white-space: nowrap; text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">XP: ${(percentxp)}%</div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: green; width: ${exp}%; height: 20px; transform: translate(0, 0); border: 1px solid gray;"></div>
</div>`;
            partied.find(partied.children()[x]).children().last().html(`<div style="font-size: 22px;">${infoHTML}</div>`);
        }
    }
},200)
