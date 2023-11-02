var dpsInterval = 10000;
var damageLog = [];
setInterval(function () {
	updateMeter();
}, 100);

// Define the classColors object outside of the getFontColorByClass function
const classColors = {
	ranger: '#AAD372',
	warrior: '#C69B6D',
	priest: '#D5D5D5',
	mage: '#3FC7EB',
	paladin: '#F48CBA',
	rogue: '#FFF468',
	merchant: '#827A63',
	// Add more class-color mappings as needed
};

function init_dpsmeter(minref) {
	let $ = parent.$;
	let brc = $('#bottomrightcorner');
	brc.find('#dpsmeter').remove();
	let dpsmeter_container = $('<div id="dpsmeter"></div>').css({
		fontSize: '28px',
		color: 'white',
		textAlign: 'center',
		display: 'table',
		overflow: 'hidden',
		marginBottom: '-5px',
		width: "100%"
	});
	//vertical centering in css is fun
	let xptimer = $('<div id="dpsmetercontent"></div>')
		.css({
			display: 'table-cell',
			verticalAlign: 'middle'
		})
		.html("")
		.appendTo(dpsmeter_container);
	brc.children().first().after(dpsmeter_container);
}

function updateMeter() {
	let $ = parent.$;
	let listString = '<table border="5" bgcolor="black" align="right" cellpadding="5"><tr align="center"><td colspan="2">Damage Meter</td></tr><tr align="center"><td>Name</td><td>DPS</td></tr>';
	let partyMembers = [];

	// Add current character to the party members array
	let dps = getDPS(character.name);
	let color = getFontColorByClass(character.name);
	partyMembers.push({ name: character.name, dps, color });

	if (parent.party_list != null && character.party != null) {
		for (let className of ['ranger', 'warrior', 'priest', 'mage', 'paladin', 'rogue', 'merchant']) {
			for (id in parent.party_list) {
				let partyMember = parent.party_list[id];
				if (partyMember !== character.name) {
					let memberColor = getFontColorByClass(partyMember);
					if (memberColor === classColors[className]) {
						let memberDPS = getDPS(partyMember);
						partyMembers.push({ name: partyMember, dps: memberDPS, color: memberColor });
					}
				}
			}
		}
	}

	for (const partyMember of partyMembers) {
		listString += '<tr align="left"><td align="center" style="color:' + partyMember.color + '">' + partyMember.name + '</td><td>' + partyMember.dps + '</td></tr>';
	}

	if (parent.party_list != null && character.party != null) {
		let dps = getDPS();
		let color = getFontColorByClass("Total");
		listString += '<tr align="left"><td align="center" style="color:' + color + '">' + 'Total' + '</td><td>' + dps + '</td></tr>';
	}

	$('#' + 'dpsmetercontent').html(listString);
}

// Call the updateMeter function with the classColors object
updateMeter();

function getFontColorByClass(characterName) {
	// Handle the current character separately
	if (characterName === character.name) {
		return classColors[character.ctype] || '#FFFFFF';
	}

	let characterClass = null;

	// Search for the character's class in parent.entities
	if (parent.entities != null) {
		for (const id in parent.entities) {
			const entity = parent.entities[id];
			if (entity.name === characterName) {
				characterClass = entity.ctype;
				break;
			}
		}
	}

	// Return the font color based on the character's class
	return classColors[characterClass] || '#FFFFFF'; // Default to white color (#FFFFFF) if class is not found in the mapping
}

function getDPS(partyMember) {
	var sumDamage = 0;
	var minTime;
	var maxTime;
	var entries = 0;
	for (id in damageLog) {
		logEntry = damageLog[id];
		if (new Date() - logEntry.time < dpsInterval) {
			if (partyMember == null || logEntry.attacker == partyMember) {
				if (minTime == null || logEntry.time < minTime) {
					minTime = logEntry.time;
				}
				if (maxTime == null || logEntry.time > maxTime) {
					maxTime = logEntry.time;
				}
				sumDamage += logEntry.damage;
				entries++;
			}
		} else {
			damageLog.splice(id, 1);
		}
	}
	if (entries <= 1) {
		return 0;
	}
	var elapsed = maxTime - minTime;
	var dps = parseFloat(Math.round((sumDamage / (elapsed / 1000)) * 100) / 100).toFixed(2);
	return dps;
}

function register_dpsmeterhandler(event, handler) {
	parent.prev_handlersdpsmeter.push([event, handler]);
	parent.socket.on(event, handler);
}

function dpsmeterHitHandler(event) {
	if (parent != null) {
		var attacker = event.hid;
		var attacked = event.id;
		var attackerEntity = parent.entities[attacker];
		if (attacker == character.name) {
			attackerEntity = character;
		}
		if ((attackerEntity.party != null || attacker == character.name) || attackerEntity.party == character.party) {
			if (event.damage != null) {
				var hitEvent = {};
				hitEvent.damage = event.damage + (event.dreturn || 0);;
				hitEvent.time = new Date();
				hitEvent.attacker = event.hid;
				damageLog.push(hitEvent);
			}
		}
	}
}

//Clean out any pre-existing listeners
if (parent.prev_handlersdpsmeter) {
	for (let [event, handler] of parent.prev_handlersdpsmeter) {
		parent.socket.removeListener(event, handler);
	}
}
parent.prev_handlersdpsmeter = [];

register_dpsmeterhandler("hit", dpsmeterHitHandler);
init_dpsmeter(5);
