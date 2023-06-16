// Define the coordinates of various locations
const locations = {
    fireroamer: [{ x: 240, y: -815 }],
    bigbird: [{ x: 1310, y: 210 }],
    plantoid: [{ x: -832, y: -367 }],
    mole: [{ x: -30, y: -1130 }],
    ent: [{ x: -420, y: -2000 }],
    wolf: [{ x: 400, y: -2918 }],
    oneeye: [{ x: -500, y: 100 }],
    xscorpion: [{ x: -488, y: 694 }],
};

var home = 'fireroamer'; // Specify the initial location
var angle = 0;
var speed = .5; // Adjust the speed of movement (lower values for slower movement)

async function circleWalk() {
    let delay = 1;
    try {
        if (!get_nearest_monster({ type: home })) {
            if (!smart.moving) {
                smart_move(home); // Move to the specified home location if not already moving
                game_log(home); // Log the current home location
            }
        } else {
            if (!smart.moving) {
                var center = locations[home][0]; // Access the coordinates of the home location
                var radius = 45; // Set the desired radius for the circular path

                // Visualize the different paths using circle drawings
                clear_drawings();
                draw_circle(center.x, center.y, radius, 3, 0xE8FF00); // Ranger walk path
                draw_circle(center.x, center.y, 35, 3, 0xFF00FB); // Melee walk path
                draw_circle(center.x, center.y, 25, 3, 0xFFFFFF); // Tank Walk Path
                draw_circle(center.x, center.y, 1, 3, 0x00FF00); // Center point
                draw_circle(center.x, center.y, 40, 3, 0x00FF00); // Kill zone based on mobTargets_inRange

                var offsetX = Math.cos(angle) * radius; // Calculate the x-offset based on the current angle and radius
                var offsetY = Math.sin(angle) * radius; // Calculate the y-offset based on the current angle and radius
                var targetX = center.x + offsetX; // Calculate the target x-coordinate
                var targetY = center.y + offsetY; // Calculate the target y-coordinate

                if (!character.moving) {
                    await move(targetX, targetY); // Move towards the target coordinates, await to slow Call Cost
                }

                angle += speed; // Increment the angle to continue moving in a circular path
                if (angle >= 2 * Math.PI) {
                    angle = 0; // Reset the angle to complete the circular path
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
    setTimeout(circleWalk, delay); // Recursive call to create the event loop
}

circleWalk(); // Start the event loop
