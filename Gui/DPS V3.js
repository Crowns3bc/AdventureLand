// Initialize the DPS meter
function initDPSMeter(minref) {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#dpsmeter').remove();
    let dpsmeter_container = $('<div id="dpsmeter"></div>').css({
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a background color
        //padding: '0px', // Add padding for better visibility
    });
    // vertical centering in CSS is fun
    let xptimer = $('<div id="dpsmetercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle',
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Add a background color
            padding: '5px', // Add padding for better visibility
            border: '5px solid grey', // Add a border for better visibility
        })
        .html("")
        .appendTo(dpsmeter_container);
    brc.children().first().after(dpsmeter_container);
}

// Initialize your variables
var damage = 0;
var burnDamage = 0;
var blastDamage = 0;
var baseDamage = 0;
var baseHeal = 0;
var METER_START = performance.now()

// Damage tracking object for party members
var partyDamageSums = {};

// Function to format DPS with commas for better readability
function getFormattedDPS(dps) {
    try {
        return dps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('An error occurred while formatting DPS:', error);
        return 'N/A';
    }
}

// Register the hit event handler
parent.socket.on("hit", function (data) {
    try {
        if (data.hid) {
            // Update DPS data for the character and party members
            let targetId = data.hid;
            let entry = partyDamageSums[targetId] || {
                startTime: performance.now(),
                sumDamage: 0,
                sumHeal: 0,
                sumBurnDamage: 0,
                sumBlastDamage: 0,
                sumBaseDamage: 0,
            };

            if (targetId == character.id) {
                // Update the character's damage values
                entry.sumDamage += data.damage || 0;
                entry.sumHeal += data.heal || 0;

                if (data.source == "burn") {
                    entry.sumBurnDamage += data.damage;
                } else if (data.splash) {
                    entry.sumBlastDamage += data.damage;
                } else {
                    entry.sumBaseDamage += data.damage || 0;
                }
            } else if (parent.party_list && Array.isArray(parent.party_list) && parent.party_list.includes(targetId)) {
                // Update party member's damage values
                entry.sumDamage += data.damage || 0;
                entry.sumHeal += data.heal || 0;

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
    } catch (error) {
        console.error('An error occurred in the hit event handler:', error);
    }
});

// Update the DPS meter display
function updateDPSMeterUI() {
    try {
        let ELAPSED = performance.now() - METER_START;
        let dps = Math.floor((damage * 1000) / ELAPSED);
        let burnDps = Math.floor((burnDamage * 1000) / ELAPSED);
        let blastDps = Math.floor((blastDamage * 1000) / ELAPSED);
        let baseDps = Math.floor((baseDamage * 1000) / ELAPSED);
        let hps = Math.floor((baseHeal * 1000) / ELAPSED);
        let $ = parent.$;
        let dpsDisplay = $('#dpsmetercontent');

        if (dpsDisplay.length === 0) {
            console.warn('DPS display element not found.');
            return;
        }

        let listString = '<div>Damage Meter</div>';
        listString += '<table border="1" style="width:100%">';

        // Header row start with player names
        listString += '<tr><th></th>';
        for (let id in partyDamageSums) {
            const player = get_player(id);
            if (player) {
                listString += `<th>${player.name}</th>`;
            }
        }
        listString += '</tr>';

        // Rows for each damage type
        const damageTypes = ["Base", "Blast", "Burn", "HPS", "DPS"];
        for (const type of damageTypes) {
            listString += '<tr>';
            listString += `<td>${type}</td>`;
            
            // Update damage values for each player
            for (let id in partyDamageSums) {
                const player = get_player(id);
                if (player) {
                    const entry = partyDamageSums[id];
                    const value = getTypeValue(type, entry);
                    listString += `<td>${getFormattedDPS(value)}</td>`;
                }
            }

            listString += '</tr>';
        }

        listString += '</table>'; // Table end

        // Update the existing content instead of creating new content
        dpsDisplay.html(listString);
    } catch (error) {
        console.error('An error occurred while updating the DPS meter UI:', error);
    }
}

function getTypeValue(type, entry) {
    switch (type) {
        case "DPS":
            return calculateDPSForPartyMember(entry);
        case "Burn":
            return entry ? Math.floor((entry.sumBurnDamage * 1000) / (performance.now() - entry.startTime)) : 0;
        case "Blast":
            return entry ? Math.floor((entry.sumBlastDamage * 1000) / (performance.now() - entry.startTime)) : 0;
        case "Base":
            return entry ? Math.floor((entry.sumBaseDamage * 1000) / (performance.now() - entry.startTime)) : 0;
        case "HPS":
            return entry ? Math.floor((entry.sumHeal * 1000) / (performance.now() - entry.startTime)) : 0;
        default:
            return 0;
    }
}

// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = performance.now() - (entry && entry.startTime || performance.now());
        const totalDamage = entry && entry.sumDamage || 0;
        return Math.floor((totalDamage * 1000) / elapsedTime);
    } catch (error) {
        console.error('An error occurred while calculating DPS for a party member:', error);
        return 0;
    }
}

// Initialize the DPS meter
initDPSMeter();

function updateDPSMeterInterval() {
    try {
        // Update the DPS meter UI
        updateDPSMeterUI();
    } catch (error) {
        console.error('An error occurred while updating the DPS meter at the interval:', error);
    }
}

// Start updating the DPS meter UI at regular intervals
setInterval(updateDPSMeterInterval, 1000);
