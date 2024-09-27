function initXP() {
  let $ = parent.$;
  $('#xpui').css({
    fontSize: '28px',
    width: "100%",
  });
}

function displayXP() {
  let $ = parent.$;
  let xpPercent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
  let xpString = `LV${character.level} ${xpPercent}%`;
  $('#xpui').html(xpString);
}

// Initialize GUI and set interval for updates
initXP();
setInterval(displayXP, 1000);
