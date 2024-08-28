// Define the player name constant
const TARGET_PLAYER_NAME = "CrownMerch";

// Function to send location updates
const sendLocationUpdate = () => {
    if (!character.s.mluck || character.s.mluck.f !== TARGET_PLAYER_NAME) {
        send_cm(TARGET_PLAYER_NAME, {
            message: "location",
            x: character.x,
            y: character.y,
            map: character.map
        });
    }
};

const validPlayerNames = [
    "CrownsAnal",
    "CrownPriest",
    "CrownTown",
    "CrownMage",
    "CrownSpam",
    "CrownPal"
];

// Function to handle cm messages
function on_cm(name, data) {
    if (validPlayerNames.includes(name) && data.message === "location") {
        // If not already moving, smart move to the location
        if (!smart.moving) {
            smart_move({ x: data.x, y: data.y, map: data.map });
            game_log(`Smart moving to ${name}`);
        }
    }
}
