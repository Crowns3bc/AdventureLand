let deaths = 0; // Variable to track the number of deaths
const killTime = new Date(); // Start time to calculate elapsed time

game.on('death', function (data) {
    if (parent.entities[data.id]) { // Check if the entity exists
        const mob = parent.entities[data.id];
        const mobName = mob.type;

        // Check if the mob is a monster
        if (mobName === 'monster') {
            const mobTarget = mob.target; // Get the mob's target
            const party = get_party(); // Get your party members

            // If party exists, extract party member names into an array
            const partyMembers = party ? Object.keys(party) : [];

            // Check if the mob's target was the player or someone in the party
            if (mobTarget === character.name || partyMembers.includes(mobTarget)) {
                console.log(data); // Log the death event
                deaths++; // Increment the death count
                killHandler(); // Call the killHandler function
            }
        }
    }
});

function killHandler() {
    const elapsed = (new Date() - killTime) / 1000; // Calculate elapsed time in seconds
    if (elapsed > 0) { // Prevent division by zero
        const deathsPerSec = deaths / elapsed; // Calculate deaths per second
        const dailyKillRate = calculateKillRate(deathsPerSec); // Calculate deaths based on interval

        add_top_button("kpm", Math.round(dailyKillRate.kpm).toLocaleString() + ' kpm'); // Deaths per minute
        add_top_button("kph", Math.round(dailyKillRate.kph).toLocaleString() + ' kph'); // Deaths per hour
        add_top_button("kpd", Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd'); // Deaths per day

        // If you don't like the buttons and would rather the old set_message version
        // set_message(Math.round(dailyKillRate.kpd).toLocaleString() + ' kpd');
    } else {
        console.warn("Elapsed time is zero, cannot calculate rates.");
    }
}

// Function to calculate deaths based on the interval
function calculateKillRate(deathsPerSec) {
    let kpm = deathsPerSec * 60; // Convert to deaths per minute
    let kph = kpm * 60; // Convert to deaths per hour
    let kpd = kph * 24; // Convert to deaths per day
    return { kpm, kph, kpd };
}
