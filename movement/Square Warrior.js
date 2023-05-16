const locations = {
    fireroamer: [{ x: 250, y: -775 }, { x: 205, y: -800 }, { x: 250, y: -825 }, { x: 295, y: -800 }],
    xscorpion: [{ x: -515, y: 605 }, { x: -570, y: 630 }, { x: -515, y: 680 }, { x: -460, y: 645 }],
    bigbird: [{ x: 1310, y: 220 }, { x: 1265, y: 245 }, { x: 1310, y: 270 }, { x: 1340, y: 245 }],
    plantoid: [{ x: -847, y: -352 }, { x: -817, y: -352 }, { x: -817, y: -382 }, { x: -847, y: -382 }],
    mole: [{ x: -30, y: -1130 }, { x: 30, y: -1130 }, { x: 30, y: -1190 }, { x: -30, y: -1190 }],
    wolf: [{ x: 400, y: -2740 }, { x: 450, y: -2740 }]
};

var pointIndex = 0;
var home = 'fireroamer';
async function eventer() {
    let delay = 125;
    try {
        if (!get_nearest_monster({ type: home })) {
            if (!smart.moving) {
                smart_move(home);
            }
        } else {
            if (!smart.moving) {
                var point = locations[home][pointIndex];
                if (!character.moving) {
                    await move(point.x, point.y);
                }
                var distance = simple_distance({ x: character.real_x, y: character.real_y }, point);
                if (distance < 10) {
                    pointIndex++;
                    if (pointIndex > locations[home].length - 1) {
                        pointIndex = 0;
                    }
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
    setTimeout(eventer, delay)
}
eventer();
