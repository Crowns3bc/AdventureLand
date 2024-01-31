var startTime = new Date();
var sumGold = 0;
var largestGoldDrop = 0;
setInterval(function() {
	update_goldmeter();
}, 400);

function init_goldmeter() {
  let $ = parent.$;
  let brc = $('#bottomrightcorner');
  brc.find('#goldtimer').remove();
  let xpt_container = $('<div id="goldtimer"></div>').css({
    fontSize: '25px',
    color: 'white',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px',
	width: "100%"
  });
  //vertical centering in css is fun
  let xptimer = $('<div id="goldtimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html("")
    .appendTo(xpt_container);
  brc.children().first().after(xpt_container);
}

function updateGoldTimerList(){
	let $ = parent.$;
	var gold = getGold();
	var goldString = "<div>" + gold.toLocaleString('en') + " Gold/Hr" + "</div>"; 
	goldString += "<div>" + largestGoldDrop.toLocaleString('en') + " Largest Gold Drop</div>";
	$('#' + "goldtimercontent").html(goldString).css({
    background: 'black',
	backgroundColor: 'rgba(0, 0, 0, 0.7)', // Add a background color
    border: 'solid gray',
    borderWidth: '5px 5px',
    height: '50px',
    lineHeight: '25px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
  });
}

function update_goldmeter() {
	updateGoldTimerList();
}

init_goldmeter();

function getGold(){
	var elapsed = new Date() - startTime;
	var goldPerSecond = parseFloat(Math.round((sumGold/(elapsed/1000)) * 100) / 100);
	return parseInt(goldPerSecond * 60 * 60);
}

function trackLargestGoldDrop(gold) {
  if (gold > largestGoldDrop) {
    largestGoldDrop = gold;
  }
}

//Clean out any pre-existing listeners
if (parent.prev_handlersgoldmeter) {
    for (let [event, handler] of parent.prev_handlersgoldmeter) {
      parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersgoldmeter = [];

function register_goldmeterhandler(event, handler) {
    parent.prev_handlersgoldmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function goldMeterGameResponseHandler(event){
	if(event.response == "gold_received"){
		var gold = event.gold;
		sumGold += gold;
		trackLargestGoldDrop(gold);
	}
}

function goldMeterGameLogHandler(event){
	if(event.color == "gold"){
		var gold = parseInt(event.message.replace(" gold", "").replace(",", ""));
		sumGold += gold;
		trackLargestGoldDrop(gold);
	}
}

register_goldmeterhandler("game_log", goldMeterGameLogHandler);
register_goldmeterhandler("game_response", goldMeterGameResponseHandler);
