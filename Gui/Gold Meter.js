let sumGold = 0;
let largestGoldDrop = 0;
const startTime = new Date(); // Start time to calculate elapsed time
let interval = 'hour'; // Set default interval (options: 'minute', 'hour', 'day')

// Initialize the gold meter UI
const initGoldMeter = () => {
    const $ = parent.$;
    const brc = $('#bottomrightcorner');
    brc.find('#goldtimer').remove();

    const goldContainer = $('<div id="goldtimer"></div>').css({
        fontSize: '25px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: "100%",
    });

    $('<div id="goldtimercontent"></div>')
        .css({ display: 'table-cell', verticalAlign: 'middle' })
        .appendTo(goldContainer);

    brc.children().first().after(goldContainer);
};

// Format gold string to display
const formatGoldString = (averageGold) => `
    <div>${averageGold.toLocaleString('en')} Gold/${interval.charAt(0).toUpperCase() + interval.slice(1)}</div>
    <div>${largestGoldDrop.toLocaleString('en')} Jackpot</div>
`;

// Update the gold display with current data
const updateGoldDisplay = () => {
    const $ = parent.$;
    const averageGold = calculateAverageGold(); // Calculate average gold based on the selected interval
    $('#goldtimercontent').html(formatGoldString(averageGold)).css({
        background: 'black',
        //backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        border: 'solid gray',
        borderWidth: '4px 4px',
        height: '50px',
        lineHeight: '25px',
        fontSize: '25px',
        color: '#FFD700',
        textAlign: 'center',
    });
};

// Set up a timer to update the display
setInterval(updateGoldDisplay, 500);

// Initialize gold meter
initGoldMeter();

character.on("loot", (data) => {
	if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
		const myCharCount = countMyPartyCharacters(); 
		// should return 3 if your running 3 characters that are nearby
		const myGold = Math.round(data.gold * myCharCount); 
		// total gold you (as a player) earned amongst all your characters

		sumGold += myGold;

		if (myGold > largestGoldDrop) {
			largestGoldDrop = myGold;
		}
	} else {
		console.warn("Invalid gold value:", data);
	}
});

// Calculate average gold based on the selected interval
const calculateAverageGold = () => {
    const elapsedTime = (new Date() - startTime) / 1000; // Elapsed time in seconds
    const divisor = elapsedTime / (interval === 'minute' ? 60 : interval === 'hour' ? 3600 : 86400);

    // Prevent division by zero or near-zero values
    if (divisor <= 0) return 0;

    return Math.round(sumGold / divisor); // Return gold per the specified interval
};

// Get number of a characters a person is running
function countMyPartyCharacters() {
    let count = 0;

    for (const name in parent.party) {
        if (name === character.name || (parent.entities[name]?.owner === character.owner)) {
            count++;
        }
    }

    return count;
}

// Function to change the interval (can be called externally)
const setGoldInterval = (newInterval) => {
    if (['minute', 'hour', 'day'].includes(newInterval)) {
        interval = newInterval;
    } else {
        console.warn("Invalid interval. Use 'minute', 'hour', or 'day'.");
    }
};
