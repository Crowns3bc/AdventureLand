let sumGold = 0;
let largestGoldDrop = 0;
const startTime = new Date(); // Start time to calculate elapsed time
let interval = 'hour'; // Set default interval (options: 'minute', 'hour', 'day')

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

const formatGoldString = (averageGold) => `
    <div>${averageGold.toLocaleString('en')} Gold/${interval.charAt(0).toUpperCase() + interval.slice(1)}</div>
    <div>${largestGoldDrop.toLocaleString('en')} Jackpot</div>
`;

const updateGoldDisplay = () => {
    const $ = parent.$;
    const averageGold = calculateAverageGold(); // Get the average gold based on the selected interval
    $('#goldtimercontent').html(formatGoldString(averageGold)).css({
        background: 'black',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: 'solid gray',
        borderWidth: '4px 4px',
        height: '50px', // Increase height to accommodate additional text
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
    const totalGold = data.gold * 3; // Multiply by 3 for total gold across characters
    sumGold += totalGold; // Update total gold

    // Track largest gold drop directly here
    if (totalGold > largestGoldDrop) {
        largestGoldDrop = totalGold;
    }
});

// Gold sent event handler
character.on("gold_sent", (data) => {
    if (data.receiver === character.name) { // Check if the receiver is this character
        sumGold += data.gold; // Update total gold from sent gold
    }
});

// Calculate average gold based on the selected interval
const calculateAverageGold = () => {
    const elapsedTime = (new Date() - startTime) / 1000; // Elapsed time in seconds
    const divisor = elapsedTime / (interval === 'minute' ? 60 : interval === 'hour' ? 3600 : 86400);
    return Math.round(sumGold / divisor); // Gold per specified interval
};

// Function to change the interval (can be called externally)
const setGoldInterval = (newInterval) => {
    if (['minute', 'hour', 'day'].includes(newInterval)) {
        interval = newInterval;
    } else {
        console.warn("Invalid interval. Use 'minute', 'hour', or 'day'.");
    }
};
