// Initialize the DPS meter
function initDPSMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing DPS meter
    brc.find('#dpsmeter').remove();

    // Create a container for the DPS meter
    let dpsmeter_container = $('<div id="dpsmeter"></div>').css({
        //position: 'relative',
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });

    // Create a div for the DPS meter content
    let dpsmeter_content = $('<div id="dpsmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '2px',
        border: '4px solid grey',
    }).appendTo(dpsmeter_container);

    // Insert the DPS meter container
    brc.children().first().after(dpsmeter_container);
}

// Initialize variables
let damage = 0;
let burnDamage = 0;
let blastDamage = 0;
let baseDamage = 0;
let baseHeal = 0;
let lifesteal = 0;
let manasteal = 0;
let dreturn = 0; // Initialize dreturn
let METER_START = performance.now();

// Damage tracking object for party members
let partyDamageSums = {};
let playerDamageReturns = {}; // Initialize playerDamageReturns

// Format DPS with commas for readability
function getFormattedDPS(dps) {
    try {
        return dps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('Formatting DPS error:', error);
        return 'N/A';
    }
}

// Handle "hit" events
parent.socket.on("hit", function (data) {
    try {
        if (data.hid) {
            let targetId = data.hid;
            if (parent.party_list && parent.party_list.includes(targetId)) {
                let entry = partyDamageSums[targetId] || {
                    startTime: performance.now(),
                    sumDamage: 0,
                    sumHeal: 0,
                    sumBurnDamage: 0,
                    sumBlastDamage: 0,
                    sumBaseDamage: 0,
                    sumLifesteal: 0,
                    sumManaSteal: 0,
                };

                if (targetId == character.id) {
                    entry.sumDamage += data.damage || 0;
                    entry.sumHeal += (data.heal || 0) + (data.lifesteal || 0);
                    entry.sumManaSteal += data.manasteal || 0;

                    if (data.source == "burn") {
                        entry.sumBurnDamage += data.damage;
                    } else if (data.splash) {
                        entry.sumBlastDamage += data.damage;
                    } else {
                        entry.sumBaseDamage += data.damage || 0;
                    }
                } else {
                    entry.sumDamage += data.damage || 0;
                    entry.sumHeal += (data.heal || 0) + (data.lifesteal || 0);
                    entry.sumManaSteal += data.manasteal || 0;

                    if (data.source == "burn") {
                        entry.sumBurnDamage += data.damage;
                    } else if (data.splash) {
                        entry.sumBlastDamage += data.damage;
                    } else {
                        entry.sumBaseDamage += data.damage || 0;
                    }
                }

                partyDamageSums[targetId] = entry;
            }
        }
        if (data.dreturn) {
            let playerId = data.id;
            
            if (!playerDamageReturns[playerId]) {
                playerDamageReturns[playerId] = {
                    startTime: performance.now(), // Initialize startTime
                    sumDamageReturn: 0,
                };
            }
            
            let entry = playerDamageReturns[playerId];
            entry.sumDamageReturn += data.dreturn || 0;
        }
    } catch (error) {
        console.error('Error in hit event handler:', error);
    }
});

// Function to calculate the elapsed time in hours and minutes
function getElapsedTime() {
    let elapsedMs = performance.now() - METER_START;
    let elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    let elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${elapsedHours}h ${elapsedMinutes}m`;
}

// Update the DPS meter UI
function updateDPSMeterUI() {
    try {
        const damageTypes = ["Base", "Blast", "HPS", "DR", "DPS"];
        let elapsed = performance.now() - METER_START;

        // Initialize damage variables
        let dps = Math.floor((damage * 1000) / elapsed);
        let burnDps = Math.floor((burnDamage * 1000) / elapsed);
        let blastDps = Math.floor((blastDamage * 1000) / elapsed);
        let baseDps = Math.floor((baseDamage * 1000) / elapsed);
        let hps = Math.floor((baseHeal * 1000) / elapsed);
        let mps = Math.floor((manasteal * 1000) / elapsed);

        // Update total dreturn
        let totalDreturn = 0;
        let playerDreturn = {}; // Initialize player-specific dreturn

        for (let id in playerDamageReturns) {
            const entry = playerDamageReturns[id];
            playerDreturn[id] = Math.floor((entry.sumDamageReturn * 1000) / elapsed);
            totalDreturn += entry.sumDamageReturn || 0;
        }
        let dreturnDps = Math.floor((totalDreturn * 1000) / elapsed);

        let $ = parent.$;
        let dpsDisplay = $('#dpsmetercontent');

        if (dpsDisplay.length === 0) return;

        let elapsedTime = getElapsedTime();

        let listString = `<div>👑 Elapsed Time: ${elapsedTime} 👑</div>`;
        listString += '<table border="1" style="width:100%">';

        // Header row
        listString += '<tr><th></th>';
        for (const type of damageTypes) {
            listString += `<th>${type}</th>`;
        }
        listString += '</tr>';

        // Sort players by DPS
        let sortedPlayers = Object.entries(partyDamageSums)
            .map(([id, entry]) => ({
                id,
                dps: calculateDPSForPartyMember(entry),
                entry
            }))
            .sort((a, b) => b.dps - a.dps);

        // Player rows
        for (let { id, entry } of sortedPlayers) {
            const player = get_player(id);
            if (player) {
                listString += '<tr>';
                listString += `<td>${player.name}</td>`;

                for (const type of damageTypes) {
                    let value;
                    if (type === "DR") {
                        value = playerDreturn[id] || 0;
                    } else {
                        value = getTypeValue(type, entry);
                    }
                    listString += `<td>${getFormattedDPS(value)}</td>`;
                }

                listString += '</tr>';
            }
        }

        // Total DPS row
        listString += '<tr><td>Total DPS</td>';
        for (const type of damageTypes) {
            let totalDPS = 0;

            if (type === "DR") {
                totalDPS = dreturnDps;
            } else {
                for (let id in partyDamageSums) {
                    const entry = partyDamageSums[id];
                    const value = getTypeValue(type, entry);
                    totalDPS += value;
                }
            }

            listString += `<td>${getFormattedDPS(totalDPS)}</td>`;
        }
        listString += '</tr>';

        listString += '</table>';

        dpsDisplay.html(listString);
    } catch (error) {
        console.error('Error updating DPS meter UI:', error);
    }
}

// Get value for a specific damage type
function getTypeValue(type, entry) {
    const elapsedTime = performance.now() - (entry.startTime || performance.now());
    switch (type) {
        case "DPS":
            return calculateDPSForPartyMember(entry);
        case "Burn":
            return Math.floor((entry.sumBurnDamage * 1000) / elapsedTime);
        case "Blast":
            return Math.floor((entry.sumBlastDamage * 1000) / elapsedTime);
        case "Base":
            return Math.floor((entry.sumBaseDamage * 1000) / elapsedTime);
        case "HPS":
            return Math.floor((entry.sumHeal * 1000) / elapsedTime);
        case "MPS":
            return Math.floor((entry.sumManaSteal * 1000) / elapsedTime);
        case "DR":
            return Math.floor((entry.sumDamageReturn * 1000) / elapsedTime); // Per-character
        default:
            return 0;
    }
}

// Calculate DPS for a specific party member
// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = performance.now() - (entry.startTime || performance.now());
        const totalDamage = entry.sumDamage || 0;
        return Math.floor((totalDamage * 1000) / elapsedTime);
    } catch (error) {
        console.error('Error calculating DPS for party member:', error);
        return 0;
    }
}

// Initialize the DPS meter and set up the update interval
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
