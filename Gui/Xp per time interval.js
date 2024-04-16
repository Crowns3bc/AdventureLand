// Initialize the XP timer and set the update interval
setInterval(update_xptimer, 250);
let xpRateType = 'second'; // Set to "second", "minute", or "hour"
// Initialize variables
let minute_refresh;

// Initialize the XP timer display
function init_xptimer(minref) {
    minute_refresh = minref || 1;
    parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);
    let $ = parent.$;
    let brc = $('#bottomrightcorner');
    brc.find('#xptimer').remove();
    let xpt_container = $('<div id="xptimer"></div>').css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '4px 4px',
        width: '98%',
        height: '66px',
        fontSize: '25px',
        color: '#00FF00',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    });
    let xptimer = $('<div id="xptimercontent"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html('<span style="color: white;">Estimated time until level up:</span><br><span id="xpcounter" style="font-size: 30px !important; line-height: 25px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}

// Initialize variables to track XP and XP rate
let last_minutes_checked = new Date();
let last_xp_checked_minutes = character.xp;
let last_xp_checked_kill = character.xp;

// Toggle between displaying XP rate in seconds, minutes, or hours
function toggleXPDisplay() {
    if (xpRateType === 'second') {
        xpRateType = 'minute';
    } else if (xpRateType === 'minute') {
        xpRateType = 'hour';
    } else {
        xpRateType = 'second';
    }
    update_xptimer(); // Update the display when toggling
}

var xpGainTotal = 0; // Total XP gained since code execution
var xpGainCount = 0; // Number of XP gain events since code execution
var startTime = new Date(); // Record the start time for XP calculation
// Update the XP timer display
function update_xptimer() {
    if (character.xp == last_xp_checked_kill) return;

    let $ = parent.$;
    let now = new Date();
    let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);

    // Calculate the average XP gain since code execution
    let elapsedTime = (now.getTime() - startTime.getTime()) / 1000;
    let averageXPGain = Math.round(xpGainTotal / elapsedTime);

    if (time < 1) return;

    let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
    let xp_per_hour = Math.round(xp_rate * 3600);
    let xp_per_minute = Math.round(xp_rate * 60);

    if (time > 60 * minute_refresh) {
        last_minutes_checked = new Date();
        last_xp_checked_minutes = character.xp;
    }

    last_xp_checked_kill = character.xp;
    let xp_missing = parent.G.levels[character.level] - character.xp;
    let seconds = Math.round(xp_missing / xp_rate);
    let minutes = Math.round(seconds / 60);
    let hours = Math.round(minutes / 60);
    let days = Math.floor(hours / 24);

    let remainingHours = hours % 24;
    let remainingMinutes = minutes % 60;

    let counter = `${days}d ${remainingHours}h ${remainingMinutes}min`;
    $('#xpcounter').css('color', '#87CEEB').text(counter);

    let xpRateDisplay = $('#xpRateDisplay');
    xpRateDisplay.empty();

    let xprateContainer = $('<div class="xprate-container"></div>')
        .css({
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center' // Center the content horizontally
        });

    xprateContainer.append('<br>');
    xprateContainer.append(`<span id="xpRateDisplay">${xpRateType === 'second' ? ncomma(xp_rate) + ' XP/s' : xpRateType === 'minute' ? ncomma(xp_per_minute) + ' XP/min' : ncomma(xp_per_hour) + ' XP/h'}</span>`);

    $('#xprate').empty().append(xprateContainer);
}

// Function to format numbers with commas for better readability
function ncomma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Initialize the XP timer
init_xptimer();
