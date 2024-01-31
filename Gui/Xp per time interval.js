setInterval(function () {
  update_xptimer();
}, 1000 / 4);

var minute_refresh;

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);
  let $ = parent.$;
  let brc = $('#bottomrightcorner');
  brc.find('#xptimer').remove();
  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
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

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
let xpRateType = 'second'; // Default to XP/s

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

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;
  let $ = parent.$;
  let now = new Date();
  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
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
  $('#xpcounter').css('color', '#87CEEB').text(counter); // Sky Blue color for the time until level up

  let xpRateDisplay = $('#xpRateDisplay');
  xpRateDisplay.empty(); // Clear previous values

  let xpButton = $('<div class="gamebutton clickable"></div>')
    .css({
      'font-size': '20px', // Adjusted font size
      'width': '30px', // Adjusted width
      'height': '5px', // Adjusted height
      'line-height': '5px', // Adjusted line height
      'background': 'none',
      'color': xpRateType === 'second' ? '#00FF00' : xpRateType === 'minute' ? '#FFA500' : '#FF0000',
      'margin-right': '50px',
      'borderWidth': '3px', // Adjusted border size
    })
    .text(`XP/${xpRateType.charAt(0).toUpperCase()}`)
    .on('click', toggleXPDisplay);

  let xprateContainer = $('<div class="xprate-container"></div>')
    .css({
      'display': 'flex',
      'align-items': 'center'
    });

  xprateContainer.append(xpButton);
  xprateContainer.append('<br>');
  xprateContainer.append(`<span id="xpRateDisplay">${xpRateType === 'second' ? ncomma(xp_rate) + ' XP/s' : xpRateType === 'minute' ? ncomma(xp_per_minute) + ' XP/min' : ncomma(xp_per_hour) + ' XP/h'}</span>`);

  $('#xprate').empty().append(xprateContainer);
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

init_xptimer(5);
