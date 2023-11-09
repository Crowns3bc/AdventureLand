// Constants
const DPS_UPDATE_INTERVAL = 100;
const DPS_SUM_INTERVAL = 10000;
const ENTRY_EXPIRATION_TIME = 30 * 1000; // Entries older than 30 seconds

// Damage tracking object
const damageSums = {};
const damageLog = [];

// Initialize the DPS meter
function initDPSMeter() {
    try {
        let $ = parent.$;
        let brc = $('#bottomrightcorner');

        brc.find('#dpsmeter').remove();

        let dps_container = $('<div id="dpsmeter"></div>').css({
            fontSize: '28px',
            color: 'white',
            textAlign: 'center',
            display: 'table',
            overflow: 'hidden',
            marginBottom: '-5px',
            width: "100%"
        });

        //vertical centering in css is fun
        let dpsmeter = $('<div id="dpsmetercontent"></div>')
            .css({
                //display: 'table-cell',
                verticalAlign: 'middle'
            })
            .html("")
            .appendTo(dps_container);

        brc.children().first().after(dps_container);
    } catch (error) {
        console.error('An error occurred during DPS meter initialization:', error);
    }
}

// Update the DPS meter display
function updateDPSMeter() {
    try {
        updateDPSList();
    } catch (error) {
        console.error('An error occurred while updating the DPS meter:', error);
    }
}

// Update the DPS meter display
function updateDPSMeter() {
    try {
        updateDPSList();
    } catch (error) {
        console.error('An error occurred while updating the DPS meter:', error);
    }
}

// Function to format DPS with commas for better readability
function getFormattedDPS(dps) {
    return dps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate DPS for a specific party member
function calculateDPSForPartyMember(entry) {
    try {
        const elapsedTime = Date.now() - entry.startTime;
        return Math.round(entry.sumDamage / (elapsedTime / 1000));
    } catch (error) {
        console.error('An error occurred while calculating DPS for a party member:', error);
    }
}

// Update DPS for a specific party member
function updateDPSForPartyMember(id, entry) {
    try {
        const dps = calculateDPSForPartyMember(entry);
        const formattedDPS = getFormattedDPS(dps);
        return `<tr align="left"><td align="center">${id}</td><td>${formattedDPS}</td></tr>`;
    } catch (error) {
        console.error('An error occurred while updating DPS for a party member:', error);
    }
}

// Update the DPS list and display
function updateDPSList() {
    try {
        let $ = parent.$;
        let listString = '<table style="border-style: solid;" border="5px" bgcolor="black" align="right" cellpadding="5">';
        listString += '<tr align="center"><td colspan="2">Damage Meter</td></tr>';
        listString += '<tr align="center"><td>Name</td><td>DPS</td></tr>';

        let totalDamage = 0;
        let oldestStartTime = Date.now();

        for (let id in damageSums) {
            const entry = damageSums[id];
            const elapsedTime = Date.now() - entry.startTime;
            const dps = Math.round(entry.sumDamage / (elapsedTime / 1000));
            const formattedDPS = getFormattedDPS(dps);
            listString += `<tr align="left"><td align="center">${id}</td><td>${formattedDPS}</td></tr>`;
            totalDamage += entry.sumDamage;

            if (entry.startTime < oldestStartTime) {
                oldestStartTime = entry.startTime;
            }
        }

        const elapsedTotalTime = Date.now() - oldestStartTime;
        const totalDPS = Math.round(totalDamage / (elapsedTotalTime / 1000));
        const formattedTotalDPS = getFormattedDPS(totalDPS);
        listString += `<tr align="left"><td>Total</td><td>${formattedTotalDPS}</td></tr>`;

        $('#dpsmetercontent').html(listString);
    } catch (error) {
        console.error('An error occurred while updating the DPS list:', error);
    }
}

// Event handler for DPS calculations upon hits
function handleDPSMeterHit(event) {
    try {
        if (parent && event && event.hid) {
            const attacker = event.hid;
            const attackerEntity = parent.entities[attacker];

            if (attacker === character.name || (attackerEntity && attackerEntity.party && attackerEntity.party === character.party)) {
                if (event.damage != null) {
                    let attackerEntry = damageSums[attacker] || { startTime: Date.now(), sumDamage: 0 };
                    attackerEntry.sumDamage += event.damage;
                    damageSums[attacker] = attackerEntry;
                }
            }
        }

        // Clear entries older than the expiration time
        const currentTime = Date.now();

        for (const key in damageSums) {
            const entry = damageSums[key];
            if (currentTime - entry.startTime > ENTRY_EXPIRATION_TIME) {
                delete damageSums[key];
            }
        }
    } catch (error) {
        console.error('An error occurred in handleDPSMeterHit:', error);
    }
}

// Register event handler for DPS updates
function registerDPSMeterHandler(event, handler) {
    try {
        parent.prev_handlersdpsmeter.push([event, handler]);
        parent.socket.on(event, handler);
    } catch (error) {
        console.error('An error occurred while registering DPS meter event handler:', error);
    }
}

// Clean out any pre-existing listeners
try {
    if (parent.prev_handlersdpsmeter) {
        for (let [event, handler] of parent.prev_handlersdpsmeter) {
            parent.socket.removeListener(event, handler);
        }
    }
} catch (error) {
    console.error('An error occurred while cleaning out pre-existing listeners:', error);
}

parent.prev_handlersdpsmeter = [];

// Register the hit event handler for the DPS meter
registerDPSMeterHandler("hit", handleDPSMeterHit);

// Initialize the DPS meter
initDPSMeter();

// Start updating the DPS meter
setInterval(updateDPSMeter, DPS_UPDATE_INTERVAL);
