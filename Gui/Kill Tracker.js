if (parent.prev_handlersranger) {
    for (let [event, handler] of parent.prev_handlersranger) {
      parent.socket.removeListener(event, handler);
    }
}
parent.prev_handlersranger = [];
function register_rangerhandler(event, handler) 
{
    parent.prev_handlersranger.push([event, handler]);
    parent.socket.on(event, handler);
};
let ratKills = 0;
let ratKillStart = new Date();
function killHandler(data)
{
    if(typeof data == "string" && data.includes("killed a Fire Spirit")) //Change to target
    {
        ratKills++;
        let elapsed = (new Date() - ratKillStart) / 1000;
        let killsPerSec = ratKills/elapsed;
        let dailyKillRate = killsPerSec*60*60*24;
        set_message(dailyKillRate.toLocaleString());
    }
}
register_rangerhandler("game_log", killHandler);