const locations = {
    fireroamer: [{ x: 250, y: -785 }, { x: 215, y: -800 }, { x: 250, y: -815 }, { x: 285, y: -800 }],
    xscorpion: [{ x: -510, y: 615 }, { x: -565, y: 640 }, { x: -510, y: 690 }, { x: -455, y: 655 }],
    bigbird: [{ x: 1310, y: 230 }, { x: 1275, y: 245 }, { x: 1310, y: 260 }, { x: 1340, y: 245 }],
    plantoid: [{ x: -857, y: -340 }, { x: -805, y: -340 }, { x: -805, y: -395 }, { x: -857, y: -395 }],
    mole: [{ x: -30, y: -1130 }, { x: 30, y: -1130 }, { x: 30, y: -1190 }, { x: -30, y: -1190 }],
    wolf: [{ x: 400, y: -2750 }, { x: 450, y: -2750 }]
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
