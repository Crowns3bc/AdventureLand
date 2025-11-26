/*
 * Sends Discord notifications when you loot designated items, with auto-generated sprite images extracted from the game's sprite sheets.
 * 
 * Note: Doesnt work perfectly for items with quantities
 *
 * Setup:
 * 1. Create a Discord webhook in your server (Server Settings > Integrations > Webhooks)
 * 2. Copy the webhook URL and paste it into DISCORD_WEBHOOK_URL below
 * 3. (Optional) Add your Discord user ID to MENTION_USER_ID for ping notifications
 * 4. Add/remove items from the rareItems list as desired
 * 5. Run this code in your Adventure.land character
 */

// ============= CONFIGURATION =============
const DISCORD_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
const MENTION_USER_ID = "123456789";  // Your Discord user ID, or null to disable pings
const OUTPUT_SIZE = 50; // Scale image size
const BOT_USERNAME = "LootBot";
// =========================================

const rareItems = {
	"suckerpunch": { name: "Sucker Punch" },
	"ringofluck": { name: "Ring of Luck" },
	"mpxbelt": { name: "Mana Belt" },
	"amuletofm": { name: "Amulet of Mystery" },
	"goldring": { name: "Gold Ring" },
	"ukey": { name: "Underground Key" },
	"goldenpowerglove": { name: "Golden Power Glove" },
	"goldbooster": { name: "Gold Booster" },
	"fallen": { name: "Pants of the Fallen Master" },
	'bkey': { name: "Bank Key" },
	'networkcard': { name: "Network Card" },
	'glitch': { name: "Glitch" },
	//'stramulet': { name: "Strength Amulet"},
};

async function sendRareLootToDiscord(itemID, quantity, itemData, mentionUserID) {
	const article = getArticle(itemData.name);

	try {
		const imageDataURL = await generateItemImage(itemID);

		const base64Data = imageDataURL.split(',')[1];
		const byteCharacters = atob(base64Data);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: 'image/png' });

		const formData = new FormData();
		formData.append('file', blob, `${itemID}.png`);

		let messageContent = `${character.name} found ${article} **${itemData.name}**!`;
		if (mentionUserID) {
			messageContent += ` <@${mentionUserID}>`;
		}

		const payload = {
			...(mentionUserID && { content: messageContent }),
			username: BOT_USERNAME,
			embeds: [{
				description: `${character.name} found ${quantity > 1 ? `${quantity}x ` : ''}${article} **${itemData.name}**!`,
				thumbnail: {
					url: `attachment://${itemID}.png`
				},
				color: 0xFFD700,
				timestamp: new Date().toISOString()
			}]
		};

		formData.append('payload_json', JSON.stringify(payload));

		const response = await fetch(DISCORD_WEBHOOK_URL, {
			method: 'POST',
			body: formData
		});

		const responseData = await response.json();

		if (!response.ok) {
			console.error('Discord error:', responseData);
		} else {
			console.log(`Discord message sent: ${itemData.name}`);
		}
	} catch (error) {
		console.error('Error sending to Discord:', error);
	}
}

const TILE_SIZE = 20;

function generateItemImage(itemID) {
	return new Promise(async (resolve, reject) => {
		const coords = G.positions[itemID];
		if (!coords) {
			reject(`No sprite data for ${itemID}`);
			return;
		}

		const [sheetName, col, row] = coords;

		const actualSheetName = sheetName === "" ? "pack_20vt8" : sheetName;
		const sheetURL = `https://raw.githubusercontent.com/kaansoral/adventureland/main/images/tiles/items/${actualSheetName}.png`;


		try {
			const response = await fetch(sheetURL, { mode: 'cors' });

			if (!response.ok) {
				reject(`Failed to fetch: ${response.status}`);
				return;
			}

			const blob = await response.blob();

			const objectURL = URL.createObjectURL(blob);

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = OUTPUT_SIZE;
			canvas.height = OUTPUT_SIZE;

			const img = new Image();

			img.onload = () => {

				ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

				// Disable image smoothing
				ctx.imageSmoothingEnabled = false;
				ctx.mozImageSmoothingEnabled = false;
				ctx.webkitImageSmoothingEnabled = false;
				ctx.msImageSmoothingEnabled = false;

				ctx.drawImage(
					img,
					col * TILE_SIZE,
					row * TILE_SIZE,
					TILE_SIZE,
					TILE_SIZE,
					0,
					0,
					OUTPUT_SIZE,
					OUTPUT_SIZE
				);

				URL.revokeObjectURL(objectURL);

				const dataURL = canvas.toDataURL('image/png');
				resolve(dataURL);
			};

			img.onerror = (error) => {
				URL.revokeObjectURL(objectURL);
				reject(`Image load error: ${error}`);
			};

			img.src = objectURL;

		} catch (error) {
			reject(`Fetch error: ${error}`);
		}
	});
}

function getArticle(itemName) {
	const vowels = ['A', 'E', 'I', 'O', 'U'];
	return vowels.includes(itemName[0].toUpperCase()) ? "an" : "a";
}

// This is required! if you already use a character.on("loot") function, simply add this part to it
character.on("loot", (data) => {
	if (data.items && Array.isArray(data.items)) {
		data.items.forEach((item) => {
			if (rareItems[item.name]) {
				const quantity = item.q !== undefined ? item.q : 1;
				sendRareLootToDiscord(item.name, quantity, rareItems[item.name], MENTION_USER_ID);
			}
		});
	}
});
