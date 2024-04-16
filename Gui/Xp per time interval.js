// Initialize the XP timer and set the update interval
setInterval(update_xptimer, 500);

// Initialize variables
let minute_refresh;
let timeStart = new Date(); // Record the start time for XP calculation
let startXP = character.xp; // Record the starting XP

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
        .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 30px !important; line-height: 25px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
        .appendTo(xpt_container);
    brc.children().first().after(xpt_container);
}

// Update the XP timer display
function update_xptimer() {
    if (character.xp === startXP) return;

    let $ = parent.$;
    let now = new Date();
    let time = Math.round((now.getTime() - timeStart.getTime()) / 1000);

    if (time < 1) return;

    let elapsedTime = (now.getTime() - timeStart.getTime()) / 1000;
    let xpGain = character.xp - startXP;
    let averageXPGain = Math.round(xpGain / elapsedTime);

    let xp_rate = Math.round((character.xp - startXP) / elapsedTime);
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
    xprateContainer.append(`<span id="xpRateDisplay">${ncomma(Math.round(averageXPGain))} XP/s</span>`); // Updated to use simplified XP rate calculation

    $('#xprate').empty().append(xprateContainer);
}

// Function to format numbers with commas for better readability
function ncomma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

init_xptimer();
