let sumXP = 0;
let largestXPGain = 0;
const timeStart = new Date(); // Record the start time for XP calculation
const startXP = character.xp; // Record the starting XP
let xpInterval = 'second'; // Default interval (options: 'second', 'minute', 'hour', 'day')
let targetXpRate = 40000; // Set as the target xp rate you want to be achieving and the color will automatically update

// Initialize the XP timer display
const initXpTimer = () => {
    const $ = parent.$;
    $('#bottomrightcorner').find('#xptimer').remove();

    const xpContainer = $('<div id="xptimer"></div>').css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '4px 4px',
        width: "98%",
        height: '66px',
        fontSize: '25px',
        color: '#00FF00',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    });

    $('<div id="xptimercontent"></div>')
        .css({ display: 'table-cell', verticalAlign: 'middle' })
        .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 30px;">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpContainer);

    $('#bottomrightcorner').children().first().after(xpContainer);
};

// Update the XP timer display
const updateXpTimer = () => {
    if (character.xp === startXP) return;

    const $ = parent.$;
    const now = new Date();
    const elapsedTime = Math.round((now - timeStart) / 1000);
    if (elapsedTime < 1) return;

    const xpGain = character.xp - startXP;
    const xpMissing = parent.G.levels[character.level] - character.xp;
    const seconds = Math.round(xpMissing / calculateXpRate(elapsedTime, xpGain));

    const counter = formatRemainingTime(seconds);
    $('#xpcounter').css('color', '#87CEEB').text(counter);

    // Calculate average XP based on the selected interval
    const averageXP = calculateAverageXP(elapsedTime, xpGain);
    const xpRateColor = getXpRateColor(averageXP, targetXpRate);
    $('#xprate').css('color', xpRateColor).html(`<span class="xprate-container">${ncomma(Math.round(averageXP))} XP/${xpInterval.charAt(0).toUpperCase() + xpInterval.slice(1)}</span>`);
};

// Function to calculate XP rate
const calculateXpRate = (elapsedTime, xpGain) => {
    return Math.round(xpGain / elapsedTime);
};

// Function to format the remaining time based on seconds
const formatRemainingTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}min`;
};

// Function to calculate average XP based on the selected interval
const calculateAverageXP = (elapsedTime, xpGain) => {
    switch (xpInterval) {
        case 'second':
            return Math.round(xpGain / elapsedTime); // XP per second
        case 'minute':
            return Math.round(xpGain / (elapsedTime / 60)); // XP per minute
        case 'hour':
            return Math.round(xpGain / (elapsedTime / 3600)); // XP per hour
        case 'day':
            return Math.round(xpGain / (elapsedTime / 86400)); // XP per day
        default:
            console.warn(`Invalid interval: ${xpInterval}. Use 'second', 'minute', 'hour', or 'day'.`);
            return 0;
    }
};

// Function to determine the color based on average XP rate
const getXpRateColor = (averageXP, targetXpRate) => {
    if (averageXP < targetXpRate * 0.5) {
        return '#FF0000'; // Dark Red for way below target
    } else if (averageXP < targetXpRate) {
        return '#FFA500'; // Orange for below target
    } else if (averageXP >= targetXpRate && averageXP <= targetXpRate * 1.2) {
        return '#FFFF00'; // Yellow for at target
    } else if (averageXP <= targetXpRate * 1.5) {
        return '#90EE90'; // Light Green for above target
    } else {
        return '#00FF00'; // Green for way above target
    }
};

// This is also used in my gold meter so delete/comment out if needed
//const ncomma = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Function to change the interval (can be called externally)
const setXPInterval = (newInterval) => {
    if (['second', 'minute', 'hour', 'day'].includes(newInterval)) {
        xpInterval = newInterval;
        console.log(`XP interval set to ${xpInterval}.`);
    } else {
        console.warn(`Invalid interval: ${newInterval}. Use 'second', 'minute', 'hour', or 'day'.`);
    }
};

// Initialize XP timer and set interval to update
initXpTimer();
setInterval(updateXpTimer, 500);
