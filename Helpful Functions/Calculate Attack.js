/* 
* This script calculates your total attack based on your current weapons and stats.
*
* You can change `mh` (mainhand) or `oh` (offhand) to the attack value of any weapon at any item level
* to see how much your attack would increase with that upgrade.
*/
const achv = 212; // Total attack from achievements
// Weapon attack values (change these to test weapons you don't have by giving the item's 'damage' value at the given item level)
const mh = calculate_item_properties(character.slots.mainhand)?.attack || 0;
const oh = calculate_item_properties(character.slots.offhand)?.attack || 0;

const ctype = G.classes[character.ctype];
const stat = character[ctype.main_stat] || 0;
const base = ctype.attack || 0;
const totalAttack = Math.round(mh + oh + (mh + oh * 0.7) * (stat / 20) + achv + base);

show_json(totalAttack | 0);
