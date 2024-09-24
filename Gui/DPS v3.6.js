// All currently supported damageTypes: "Base", "Blast", "Burn", "HPS", "MPS", "DR", "DPS"
// The order of the array will be the order of the display
const damageTypes = ["Base", "Blast", "Burn", "HPS", "DPS"];
let displayClassTypeColors = true; // Set to false to disable class type colors
let displayDamageTypeColors = false; // Set to false to disable damage type colors
let showOverhealing = false; // Set to true to show overhealing
let showOverManasteal = false; // Set to true to show overMana'ing?

const damageTypeColors = {
    Base: '#A92000',
    HPS: '#9A1D27',
    Blast: '#782D33',
    Burn: '#FF7F27',
    MPS: '#353C9C',
    DR: '#E94959'
};

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

// Define your toggle variables
let showOverheal = true; // Set to true or false based on your preference
let showManaSteal = true; // Set to true or false based on your preference

// Handle "hit" events
parent.socket.on("hit", function (data) {
    try {
        // My personal logging for ranger healing
        if (data.hid === "CrownsAnal" && data.damage_type === "heal") {
            game_log("Healed " + data.id + " for " + data.heal, "#ac1414");
        }

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
                    sumDamageReturn: 0, // Make sure this is included
                };

                // Accumulate damage values
                entry.sumDamage += data.damage || 0;

                // Calculate actual heal/lifesteal to be added to sumHeal
                let actualHeal = data.heal || 0;
                let actualLifesteal = data.lifesteal || 0;

                // Check current health to limit heal/lifesteal contribution
                let player = get_player(targetId);
                let maxHealth = player.max_hp;
                let currentHealth = player.hp;
                let potentialHeal = maxHealth - currentHealth;

                // Limit healing and lifesteal to the potential healing amount
                if (showOverheal) {
                    actualHeal = Math.min(actualHeal, potentialHeal);
                    actualLifesteal = Math.min(actualLifesteal, potentialHeal);
                } else {
                    actualHeal = Math.max(0, actualHeal - potentialHeal); // Ignore if above potential
                    actualLifesteal = Math.max(0, actualLifesteal - potentialHeal); // Ignore if above potential
                }

                // Add the limited actual heal/lifesteal to the sumHeal
                entry.sumHeal += (actualHeal + actualLifesteal);

                // Calculate actual mana steal to be added to sumManaSteal
                let actualManaSteal = data.manasteal || 0;

                // Check current mana to limit mana steal contribution
                let maxMana = player.max_mp;
                let currentMana = player.mp;
                let potentialMana = maxMana - currentMana;

                // Limit mana steal based on the toggle
                if (showOverManasteal) {
                    actualManaSteal = Math.min(actualManaSteal, potentialMana);
                } else {
                    actualManaSteal = Math.max(0, actualManaSteal - potentialMana); // Ignore if above potential
                }

                // Add the limited actual mana steal to the sumManaSteal
                entry.sumManaSteal += actualManaSteal;

                // Accumulate other damage types
                if (data.source === "burn") {
                    entry.sumBurnDamage += data.damage;
                } else if (data.splash) {
                    entry.sumBlastDamage += data.damage;
                } else {
                    entry.sumBaseDamage += data.damage || 0;
                }

                // Update partyDamageSums with the entry
                partyDamageSums[targetId] = entry;
            }

            // Handle damage return
            if (data.dreturn) {
                let playerId = data.id;

                if (!playerDamageReturns[playerId]) {
                    playerDamageReturns[playerId] = {
                        startTime: performance.now(),
                        sumDamageReturn: 0,
                    };
                }

                let playerEntry = playerDamageReturns[playerId];
                playerEntry.sumDamageReturn += data.dreturn || 0;

                // Update the partyDamageSums for damage return
                if (parent.party_list && parent.party_list.includes(playerId)) {
                    let partyEntry = partyDamageSums[playerId] || {
                        startTime: performance.now(),
                        sumDamage: 0,
                        sumHeal: 0,
                        sumBurnDamage: 0,
                        sumBlastDamage: 0,
                        sumBaseDamage: 0,
                        sumLifesteal: 0,
                        sumManaSteal: 0,
                        sumDamageReturn: 0, // Make sure to include this
                    };
                    partyEntry.sumDamageReturn += data.dreturn || 0; // Add dreturn to party damage sums
                    partyDamageSums[playerId] = partyEntry; // Update the partyDamageSums
                }
            }
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
        let elapsed = performance.now() - METER_START;

        // Initialize damage variables
        let dps = Math.floor((damage * 1000) / elapsed);
        let burnDps = Math.floor((burnDamage * 1000) / elapsed);
        let blastDps = Math.floor((blastDamage * 1000) / elapsed);
        let baseDps = Math.floor((baseDamage * 1000) / elapsed);
        let hps = Math.floor((baseHeal * 1000) / elapsed);
        let mps = Math.floor((manasteal * 1000) / elapsed);
        let dr = Math.floor((dreturn * 1000) / elapsed);

        let $ = parent.$;
        let dpsDisplay = $('#dpsmetercontent');

        if (dpsDisplay.length === 0) return;

        let elapsedTime = getElapsedTime();

        let listString = `<div>👑 Elapsed Time: ${elapsedTime} 👑</div>`;
        listString += '<table border="1" style="width:100%">';

        // Header row
        listString += '<tr><th></th>';
        for (const type of damageTypes) {
            const color = displayDamageTypeColors ? (damageTypeColors[type] || 'white') : 'white'; // Use color if enabled
            listString += `<th style="color: ${color};">${type}</th>`;
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

        // Define a color mapping for player classes
        const classColors = {
            mage: '#3FC7EB',
            paladin: '#F48CBA',
            priest: '#FFFFFF', // White
            ranger: '#AAD372',
            rogue: '#FFF468',
            warrior: '#C69B6D'
        };

        // Player rows
        for (let { id, entry } of sortedPlayers) {
            const player = get_player(id);
            if (player) {
                listString += '<tr>';
                // Get the player's class type and corresponding color
                const playerClass = player.ctype.toLowerCase(); // Ensure class type is in lowercase
                const nameColor = displayClassTypeColors ? (classColors[playerClass] || '#FFFFFF') : '#FFFFFF'; // Use color if enabled

                // Apply color to the player's name
                listString += `<td style="color: ${nameColor};">${player.name}</td>`;

                for (const type of damageTypes) {
                    // Directly fetch value for each type from entry
                    let value = getTypeValue(type, entry);
                    listString += `<td>${getFormattedDPS(value)}</td>`; // No color for values
                }

                listString += '</tr>';
            }
        }

        // Total DPS row
        listString += '<tr><td>Total DPS</td>';
        for (const type of damageTypes) {
            let totalDPS = 0;

            for (let id in partyDamageSums) {
                const entry = partyDamageSums[id];
                const value = getTypeValue(type, entry);
                totalDPS += value;
            }
            listString += `<td>${getFormattedDPS(totalDPS)}</td>`; // No color for total values
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
            return Math.floor((entry.sumBurnDamage * 1000) / elapsedTime) || 0; // Default to 0
        case "Blast":
            return Math.floor((entry.sumBlastDamage * 1000) / elapsedTime) || 0; // Default to 0
        case "Base":
            return Math.floor((entry.sumBaseDamage * 1000) / elapsedTime) || 0; // Default to 0
        case "HPS":
            return Math.floor((entry.sumHeal * 1000) / elapsedTime) || 0; // Default to 0
        case "MPS":
            return Math.floor((entry.sumManaSteal * 1000) / elapsedTime) || 0; // Default to 0
        case "DR":
            return Math.floor((entry.sumDamageReturn * 1000) / elapsedTime) || 0; // Default to 0
        default:
            return 0;
    }
}

// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = performance.now() - (entry.startTime || performance.now());
        const totalDamage = entry.sumDamage || 0;
        const totalDamageReturn = entry.sumDamageReturn || 0; // Include damage return
        const totalCombinedDamage = totalDamage + totalDamageReturn; // Combine for DPS calculation

        // Prevent division by zero
        if (elapsedTime > 0) {
            return Math.floor((totalCombinedDamage * 1000) / elapsedTime) || 0; // Default to 0
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error calculating DPS for party member:', error);
        return 0;
    }
}

// Initialize the DPS meter and set up the update interval
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
