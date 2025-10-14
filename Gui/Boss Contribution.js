// Initialize the PDPS meter
function initPDPSMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing PDPS meter
    brc.find('#pdpsmeter').remove();

    // Create a container for the PDPS meter
    let pdpsmeter_container = $('<div id="pdpsmeter"></div>').css({
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 1)',
    });

    // Create a div for the PDPS meter content
    let pdpsmeter_content = $('<div id="pdpsmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        padding: '2px',
        border: '4px solid grey',
    }).appendTo(pdpsmeter_container);

    // Insert the PDPS meter container
    brc.children().first().after(pdpsmeter_container);
}

// Function to get nearby players/entities and sort by pdps
function updatePDPSMeterUI() {
    try {
        let $ = parent.$;
        let pdpsDisplay = $('#pdpsmetercontent');

        if (pdpsDisplay.length === 0) return;

        let entitiesWithPDPS = [];

        // Add your character's pdps
        entitiesWithPDPS.push({
            name: character.name, // Your character's name
            pdps: character.pdps, // Your character's pdps
            classType: character.ctype // Get the class type of your character
        });

        // Add nearby players/entities with pdps
        for (let id in parent.entities) {
            let entity = parent.entities[id];
            if (entity.pdps !== undefined) {  // Include only those with pdps
                entitiesWithPDPS.push({
                    name: entity.name || entity.mtype, // Use player name or monster type
                    pdps: entity.pdps,
                    classType: entity.ctype // Get the class type of the entity
                });
            }
        }

        // Sort by pdps in descending order
        entitiesWithPDPS.sort((a, b) => b.pdps - a.pdps);

        // Get the highest PDPS to calculate percentages
        let highestPDPS = entitiesWithPDPS[0]?.pdps || 1; // Prevent division by zero

        // Prepare the display string
        let listString = '<div>👑 PDPS Tracker 👑</div>';
        listString += '<table border="1" style="width:100%">';

        // Track the max rows per column
        let maxRows = 6;
        let totalPlayers = entitiesWithPDPS.length;
        let numColumns = Math.ceil(totalPlayers / maxRows);

        // Iterate over each row (up to maxRows)
        for (let row = 0; row < maxRows; row++) {
            listString += '<tr>'; // Start a new row
            for (let col = 0; col < numColumns; col++) {
                let index = row + col * maxRows;
                if (index >= totalPlayers) break; // Stop if no more players

                let entity = entitiesWithPDPS[index];
                const playerClass = entity.classType.toLowerCase(); // Ensure class type is in lowercase
                const nameColor = classColors[playerClass] || '#FFFFFF'; // Default to white if class not found

                // Calculate the percentage for the progress bar
                let percentBarWidth = (entity.pdps / highestPDPS) * 100;

                // Create the progress bar with styling and the PDPS value inside the bar
                let progressBar = `<div style="width: 100%; background-color: gray; border-radius: 5px; overflow: hidden; position: relative;">
                    <div style="width: ${percentBarWidth}%; background-color: ${nameColor}; height: 10px;"></div>
                    <span style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); color: black; font-size: 16px; font-weight: bold;">${getFormattedPDPS(entity.pdps)}</span>
                </div>`;

                // Apply color to the player's name and display the progress bar with PDPS inside
                listString += `<td style="color: ${nameColor};">${entity.name} ${progressBar}</td>`;
            }
            listString += '</tr>'; // End the row
        }

        listString += '</table>';
        pdpsDisplay.html(listString);

    } catch (error) {
        console.error('Error updating PDPS meter UI:', error);
    }
}

// Helper function to format PDPS with commas for readability and round to nearest whole number
function getFormattedPDPS(pdps) {
    try {
        let roundedPDPS = Math.round(pdps); // Round to the nearest whole number
        return roundedPDPS.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('Formatting PDPS error:', error);
        return 'N/A';
    }
}

// Initialize the PDPS meter and update it every 250ms
initPDPSMeter();
setInterval(updatePDPSMeterUI, 250);
