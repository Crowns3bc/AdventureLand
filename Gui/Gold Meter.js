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
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
setInterval(updateGoldDisplay, 400);

// Initialize gold meter
initGoldMeter();

// Loot event handler
character.on("loot", (data) => {
	const goldReceived = data.gold; // The gold this character received
	const partyShare = parent.party[character.name]?.share || 1; // Get the character's party share; default to 1 if solo

	const totalGoldInChest = Math.round(goldReceived / partyShare); // Calculate and round the total gold in the chest
	sumGold += totalGoldInChest; // Track the total gold, accounting for share

	// Track largest gold drop based on the chest's total value, rounded
	if (totalGoldInChest > largestGoldDrop) {
		largestGoldDrop = totalGoldInChest;
	}
});

// Gold sent event handler
character.on("gold_sent", (data) => {
	if (data.receiver === character.name) { // Check if the receiver is this character
		sumGold += data.gold; // Add sent gold to the total gold sum
	}
});

// Calculate average gold based on the selected interval
const calculateAverageGold = () => {
	const elapsedTime = (new Date() - startTime) / 1000; // Elapsed time in seconds
	const divisor = elapsedTime / (interval === 'minute' ? 60 : interval === 'hour' ? 3600 : 86400);
	return Math.round(sumGold / divisor); // Return gold per the specified interval
};

// Function to change the interval (can be called externally)
const setGoldInterval = (newInterval) => {
	if (['minute', 'hour', 'day'].includes(newInterval)) {
		interval = newInterval;
	} else {
		console.warn("Invalid interval. Use 'minute', 'hour', or 'day'.");
	}
};
