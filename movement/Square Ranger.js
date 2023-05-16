const locations = {
    fireroamer: [{ x: 250, y: -765 }, { x: 195, y: -800 }, { x: 250, y: -835 }, { x: 305, y: -800 }],
    xscorpion: [{ x: -525, y: 600 }, { x: -580, y: 635 }, { x: -525, y: 670 }, { x: -470, y: 635 }],
    bigbird: [{ x: 1310, y: 210 }, { x: 1255, y: 245 }, { x: 1310, y: 260 }, { x: 1350, y: 245 }],
    plantoid: [{ x: -867, y: -332 }, { x: -797, y: -332 }, { x: -797, y: -402 }, { x: -867, y: -402 }],
    mole: [{ x: -30, y: -1130 }, { x: 30, y: -1130 }, { x: 30, y: -1190 }, { x: -30, y: -1190 }],
    wolf: [{ x: 400, y: -2918 }, { x: 450, y: -2918 }]
};

var home = 'plantoid';
var pointIndex = 0;
async function eventer() {
    let delay = 25;
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
