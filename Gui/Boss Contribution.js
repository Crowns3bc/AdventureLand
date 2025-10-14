// Initialize the scoop meter
function initscoopMeter() {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    // Remove any existing scoop meter
    brc.find('#scoopmeter').remove();

    // Create a container for the scoop meter
    let scoopmeter_container = $('<div id="scoopmeter"></div>').css({
        fontSize: '20px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-3px',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 1)',
    });

    // Create a div for the scoop meter content
    let scoopmeter_content = $('<div id="scoopmetercontent"></div>').css({
        display: 'table-cell',
        verticalAlign: 'middle',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        padding: '2px',
        border: '4px solid grey',
    }).appendTo(scoopmeter_container);

    // Insert the scoop meter container
    brc.children().first().after(scoopmeter_container);
}

// Function to get nearby players/entities and sort by scoop
function updatescoopMeterUI() {
    try {
        let $ = parent.$;
        let scoopDisplay = $('#scoopmetercontent');

        if (scoopDisplay.length === 0) return;

        let entitiesWithscoop = [];

        // Add your character's .s.coop.p
        if (character?.s?.coop?.p !== undefined) {
            entitiesWithscoop.push({
                name: character.name, // Your character's name
                scoop: character?.s?.coop?.p, // Accessing the new scoop value
                classType: character.ctype // Get the class type of your character
            });
        }

        // Add nearby players/entities with .s.coop.p
        for (let id in parent.entities) {
            let entity = parent.entities[id];
            if (entity.s && entity.s.coop && entity.s.coop.p !== undefined) {  // Include only those with .s.coop.p
                entitiesWithscoop.push({
                    name: entity.name || entity.mtype, // Use player name or monster type
                    scoop: entity.s.coop.p, // Accessing the new scoop value
                    classType: entity.ctype // Get the class type of the entity
                });
            }
        }

        // Sort by scoop in descending order
        entitiesWithscoop.sort((a, b) => b.scoop - a.scoop);

        // Get the highest .s.coop.p to calculate percentages
        let highestscoop = entitiesWithscoop[0]?.scoop || 1; // Prevent division by zero

        // Prepare the display string
        let listString = '<div>👑 Boss Contribution 👑</div>';
        listString += '<table border="1" style="width:100%;">';

        // Track the max rows per column
        let maxRows = 6;
        let totalPlayers = entitiesWithscoop.length;
        let numColumns = Math.ceil(totalPlayers / maxRows);

        // Calculate column width based on number of columns
        let columnWidth = (100 / numColumns).toFixed(2) + '%'; // e.g., '50.00%', '33.33%', etc.

        // Iterate over each row (up to maxRows)
        for (let row = 0; row < maxRows; row++) {
            listString += '<tr>'; // Start a new row
            for (let col = 0; col < numColumns; col++) {
                let index = row + col * maxRows;
                if (index >= totalPlayers) break; // Stop if no more players

                let entity = entitiesWithscoop[index];
                const playerClass = entity.classType.toLowerCase(); // Ensure class type is in lowercase
                const nameColor = classColors[playerClass] || '#FFFFFF'; // Default to white if class not found

                // Calculate the percentage for the progress bar using .s.coop.p
                let entityScoop = Number(entity.scoop) || 0;
                let highestScoop = Number(highestscoop) || 1;
                let percentBarWidth = (entityScoop / highestScoop) * 100;
                percentBarWidth = Math.min(100, +percentBarWidth.toFixed(1));

                // Create the progress bar with styling and the scoop value inside the bar
                let progressBar = `<div style="width: 100%; background-color: gray; border-radius: 5px; overflow: hidden; position: relative;">
                    <div style="width: ${percentBarWidth}%; background-color: ${nameColor}; height: 10px;"></div>
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);  margin-top: -1px; color: black; font-size: 16px; font-weight: bold;"> ${getFormattedscoop(entity.scoop)}
</span>
                </div>`;

                // Apply color to the player's name and display the progress bar with scoop inside
                listString += `<td style="color: ${nameColor}; width: ${columnWidth};">${entity.name} ${progressBar}</td>`;
            }
            listString += '</tr>'; // End the row
        }

        listString += '</table>';
        scoopDisplay.html(listString);

    } catch (error) {
        //console.error('Error updating scoop meter UI:', error);
    }
}

// Helper function to format scoop with commas for readability and round to nearest whole number
function getFormattedscoop(scoop) {
    try {
        let roundedscoop = Math.round(scoop); // Round to the nearest whole number
        return roundedscoop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (error) {
        console.error('Formatting scoop error:', error);
        return 'N/A';
    }
}

// Initialize the scoop meter and update it every 250ms
initscoopMeter();
setInterval(updatescoopMeterUI, 250);
