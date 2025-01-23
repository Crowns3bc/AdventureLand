// Define the target player name constant
const targetPlayerName = "CrownMerch";

// Function to send location updates
async function sendLocationUpdate() {
	try {
		// Check if character has mluck and if it's not from targetPlayerName
		const needsUpdate = !character.s.mluck || character.s.mluck.f !== targetPlayerName;

		// Count the number of null slots in the inventory
		const nullCount = character.items.filter(item => item === null).length;

		// Send update if either condition is met
		if (needsUpdate || nullCount <= 7) {
			send_cm(targetPlayerName, {
				message: "location",
				x: character.x,
				y: character.y,
				map: character.map
			});
		}
	} catch (error) {
		console.error("Failed to send location update:", error);
	}
}

// Run sendLocationUpdate every second
setInterval(sendLocationUpdate, 1000);

const validPlayerNames = [
    "CrownsAnal",
    "CrownPriest",
    "CrownTown",
    "CrownMage",
    "CrownSpam",
    "CrownPal",
    "CrownMerch"
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
