// Array of prioritized character names
var prioritizedCharacters = ["CrownsAnal", "CrownTown", "CrownPriest", "CrownPal"];

// Queue to store the last few mlucked targets
var mluckQueue = [];

async function mluckLoop() {
    let prioritizedTargetFound = false;

    try {
        // First, check the prioritized characters
        for (var i = 0; i < prioritizedCharacters.length; i++) {
            var target = get_player(prioritizedCharacters[i]);
            if (target && !isConsecutiveMlucks(target) && needsMluck(target)) {
                if (is_in_range(target, "mluck") && !is_on_cooldown("mluck")) {
                    await use_skill("mluck", target);
                    game_log("Mluck cast on " + target.name, "#90EE90"); // Light green color
                    mluckQueue.push(target.name);
                    if (mluckQueue.length > 3) mluckQueue.shift(); // Limit the queue size
                    prioritizedTargetFound = true;
                    break; // Exit after mlucking a prioritized character
                }
            }
        }

        // If no prioritized characters needed mluck, check other nearby characters
        if (!prioritizedTargetFound) {
            for (var id in parent.entities) {
                var current = parent.entities[id];
                if (current && current.type == 'character' && !current.npc && current.ctype !== 'merchant') {
                    if (!isConsecutiveMlucks(current) && needsMluck(current)) {
                        if (is_in_range(current, "mluck") && !is_on_cooldown("mluck")) {
                            await use_skill("mluck", current);
                            game_log("Mluck cast on " + current.name, "#90EE90"); // Light green color
                            mluckQueue.push(current.name);
                            if (mluckQueue.length > 3) mluckQueue.shift(); // Limit the queue size
                            break; // Exit after mlucking a nearby character
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    // Repeat the routine every 500ms
    setTimeout(mluckLoop, 500);
}

// Function to check if the given character has been mlucked consecutively more than 3 times
function isConsecutiveMlucks(character) {
    var count = 0;
    for (var i = mluckQueue.length - 1; i >= 0; i--) {
        if (mluckQueue[i] === character.name) {
            count++;
            if (count >= 3) {
                return true;
            }
        } else {
            break;
        }
    }
    return false;
}

// Function to check if a character needs mluck
function needsMluck(character) {
    return (!character.s.mluck ||
            (character.s.mluck.f !== character.name && !character.s.mluck.strong) ||
            character.s.mluck.ms < 1000 * 60 * 30);
}

// Start the mluck routine
mluckLoop();
