let group = ["CrownsAnal", "CrownTown", "CrownPriest", "CrownMerch"];

function partyMaker() {
    let partyLead = get_entity(group[0]); // The first character in the group is the leader
    let currentParty = get_party(); // Get the current party details
    let healer = get_entity("CrownPriest");

    // If you're the leader and party size is less than 3, invite group members
    if (character.name === group[0]) {
        for (let i = 1; i < group.length; i++) {
            let name = group[i];

            // Check if the member is already in the party
            if (!currentParty[name]) {
                send_party_invite(name);
                console.log("Party leader inviting member:", name);
            }
        }
    } else {
        // If you're in a party that's not led by the group leader, leave it
        if (currentParty && currentParty[character.name] && currentParty[character.name].in !== group[0] && healer) {
            console.log(`In a party with ${currentParty[character.name].in}, but leader should be ${group[0]}. Leaving party.`);
            leave_party();
        }

        // If not in a party and the leader exists, send a party request
        if (!currentParty[character.name] && partyLead) {
            console.log(`Requesting to join ${group[0]}'s party.`);
            send_cm(group[0], "party");
            send_party_request(group[0]);
        }
    }
}


// Call this function every second to manage the party
setInterval(partyMaker, 1000);

// Automatically accept party requests from group members
function on_party_request(name) {
	console.log("Party Request from " + name);
	if (group.indexOf(name) != -1) {
		console.log("Accepting party request from " + name);
		accept_party_request(name);
	}
}

// Automatically accept party invites from group members
function on_party_invite(name) {
	console.log("Party Invite from " + name);
	if (group.indexOf(name) != -1) {
		console.log("Accepting party invite from " + name);
		accept_party_invite(name);
	}
}
