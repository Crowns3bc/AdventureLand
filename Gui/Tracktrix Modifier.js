/**
 * Adds a Stats tab to the default tracker window
 * Shows achievement progress for stat bonuses earned from monster kills
 */
function modify_tracker() {
	const tracker_function = function () {
		this.render_tracker = function () {
			let html = "";

			// Tab buttons
			html += "<div style='font-size: 32px'>";
			html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerm\").show();'>Monsters</div>";
			html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackere\").show();'>Exchanges and Quests</div>";
			html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; display: inline-block; margin: 2px; padding: 6px;' class='clickable' onclick='pcs(event); $(\".trackers\").hide(); $(\".trackerx\").show();'>Stats</div>";
			html += "</div>";

			// Monsters tab (default game code)
			html += "<div class='trackers trackerm'>";
			object_sort(G.monsters, "hpsort").forEach(function (e) {
				if (e[1].cute && !e[1].achievements || e[1].unlist) return;
				let count = (tracker.monsters[e[0]] || 0) + (tracker.monsters_diff[e[0]] || 0);
				let color = "#50ADDD";
				if (tracker.max.monsters[e[0]] && tracker.max.monsters[e[0]][0] > count) {
					count = tracker.max.monsters[e[0]][0];
					color = "#DCC343";
				}
				html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: relative; display: inline-block; margin: 2px;' class='clickable' onclick='pcs(event); render_monster_info(\"" + e[0] + "\")'>";
				html += sprite(e[0], { scale: 1.5 });
				if (count) {
					html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:" + color + "; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(count) + "</div>";
				}
				if (tracker.drops && tracker.drops[e[0]] && tracker.drops[e[0]].length) {
					html += "<div style='background-color:#FD79B0; border: 2px solid #9F9FB0; position: absolute; bottom: -2px; right: -2px; display: inline-block; padding: 1px 1px 1px 1px; height: 2px; width: 2px'></div>";
				}
				html += "</div>";
			});
			html += "</div>";

			// Exchanges tab (default game code)
			html += "<div class='trackers trackere hidden' style='margin-top: 3px'>";
			object_sort(G.items).forEach(function (e) {
				if (e[1].e && !e[1].ignore) {
					let list = [[e[0], e[0], undefined]];
					if (e[1].upgrade || e[1].compound) {
						list = [];
						for (let i = 0; i < 13; i++) {
							if (G.drops[e[0] + i]) list.push([e[0], e[0] + i, i]);
						}
					}
					list.forEach(function (d) {
						html += "<div style='margin-right: 3px; margin-bottom: 3px; display: inline-block; position: relative;'";
						if (G.drops[d[1]]) {
							html += " class='clickable' onclick='pcs(event); render_exchange_info(\"" + d[1] + "\"," + (tracker.exchanges[d[1]] || 0) + ")'>";
						} else {
							html += ">";
						}
						html += item_container({ skin: G.items[d[0]].skin }, { name: d[0], level: d[2] });
						if (tracker.exchanges[d[1]]) {
							html += "<div style='background-color:#575983; border: 2px solid #9F9FB0; position: absolute; top: -2px; left: -2px; color:#ED901C; font-size: 16px; display: inline-block; padding: 1px 1px 1px 3px;'>" + to_shrinked_num(tracker.exchanges[d[1]]) + "</div>";
						}
						html += "</div>";
					});
				}
			});
			html += "</div>";

			// Stats tab
			html += "<div class='trackers trackerx hidden' style='margin-top: 3px; padding: 10px;'>";
			const kills = parent.tracker.max.monsters;
			const achievements = {};

			for (const mtype in kills) {
				if (!(mtype in G.monsters) || !G.monsters[mtype].achievements) continue;
				const killCount = kills[mtype][0];

				for (const achievement of G.monsters[mtype].achievements) {
					const [needed, type, reward, amount] = achievement;
					if (type !== "stat") continue;

					if (!achievements[reward]) {
						achievements[reward] = { value: 0, maxvalue: 0, monsters: [] };
					}

					if (killCount >= needed) {
						achievements[reward].value += amount;
					} else {
						achievements[reward].value += 0;
					}
					achievements[reward].maxvalue += amount;
					achievements[reward].monsters.push({ mtype, needed, amount });
				}
			}

			// Sort achievements alphabetically
			const sortedAchievements = Object.entries(achievements)
				.sort(([a], [b]) => a.localeCompare(b))
				.reduce((obj, [key, value]) => {
					obj[key] = value;
					return obj;
				}, {});

			html += "<div style='font-size: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;'>";

			for (const ac in sortedAchievements) {
				const achievement = sortedAchievements[ac];
				const percentage = ((achievement.value / achievement.maxvalue) * 100).toFixed(1);
				const borderColor = achievement.value >= achievement.maxvalue ? '#22c725' : '#9F9FB0';

				html += "<div style='background-color:#575983; border: 2px solid " + borderColor + "; padding: 5px; text-align: center; cursor: pointer; position: relative;' onclick='toggleDropdown(\"" + ac + "\")'>";
				html += "<div style='font-weight: bold; font-size: 28px; margin-bottom: 3px;'>" + ac + "</div>";
				html += "<div style='font-size: 25px; margin-bottom: 1px;'>" + achievement.value.toFixed(2) + " / " + achievement.maxvalue.toFixed(2) + "</div>";
				html += "<div style='font-size: 22px; color: #DCC343;'>(" + percentage + "%)</div>";

				html += "<div id='dropdown-" + ac + "' class='dropdown-content' style='display: none; background-color:#1a1a1a; border: 2px solid #9F9FB0; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; max-height: 70vh; overflow-y: auto; padding: 15px; z-index: 10000; box-shadow: 0 0 20px rgba(0,0,0,0.8);'>";
				html += "<div style='position: sticky; top: 0; background-color:#1a1a1a; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 2px solid #9F9FB0; font-size: 22px; font-weight: bold;'>" + ac + " Progress</div>";

				// Sort monsters by needed value, then alphabetically
				achievement.monsters.sort((a, b) => {
					if (a.needed !== b.needed) return a.needed - b.needed;
					return a.mtype.localeCompare(b.mtype);
				}).forEach(monster => {
					const currentKills = tracker.max.monsters[monster.mtype] ? Math.floor(tracker.max.monsters[monster.mtype][0]) : 0;
					const isCompleted = currentKills >= monster.needed;
					const bgColor = isCompleted ? '#1a3d1a' : '#2a2a3a';
					const fontColor = isCompleted ? '#22c725' : 'white';

					html += "<div style='background-color: " + bgColor + "; margin: 5px 0; padding: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;'>";
					html += "<div style='color: " + fontColor + "; flex: 1;'>" + monster.mtype + "</div>";
					html += "<div style='color: " + fontColor + "; font-size: 19px;'>" + currentKills.toLocaleString() + " / " + monster.needed.toLocaleString() + " (+" + monster.amount.toLocaleString() + ")</div>";
					html += "</div>";
				});

				html += "</div>";
				html += "</div>";
			}

			html += "</div></div>";

			show_modal(html, { wwidth: 578, hideinbackground: true });

			window.toggleDropdown = function (achievement) {
				const dropdown = document.getElementById('dropdown-' + achievement);
				dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
			};
		};
	};

	const full_text = tracker_function.toString();
	parent.smart_eval(full_text.slice(full_text.indexOf("{") + 1, full_text.lastIndexOf("}")));
}

modify_tracker();
