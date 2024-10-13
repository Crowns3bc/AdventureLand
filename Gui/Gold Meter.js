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
		//backgroundColor: 'rgba(0, 0, 0, 1)', // This is black background
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
	// Ensure the gold received is valid
	if (data.gold && typeof data.gold === 'number' && !Number.isNaN(data.gold)) {
		const partyShare = parent.party[character.name]?.share || 1; // Default to 1 if not in a party
		const totalGoldInChest = Math.round(data.gold / partyShare); // Calculate total chest gold

		sumGold += totalGoldInChest; // Track the actual total gold received

		// Track the largest gold drop
		if (totalGoldInChest > largestGoldDrop) {
			largestGoldDrop = totalGoldInChest;
		}
	} else {
		console.warn("Invalid gold value:", data.gold);
	}
});


// Function to visualize the loot stored in localStorage (optional)
function logLoot() {
	let savedLoot = JSON.parse(localStorage.getItem("lootItems") || "{}");
	console.log(savedLoot);
}

// Calculate average gold based on the selected interval
const calculateAverageGold = () => {
	const elapsedTime = (new Date() - startTime) / 1000; // Elapsed time in seconds
	const divisor = elapsedTime / (interval === 'minute' ? 60 : interval === 'hour' ? 3600 : 86400);

	// Prevent division by zero or near-zero values
	if (divisor <= 0) return 0;

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
