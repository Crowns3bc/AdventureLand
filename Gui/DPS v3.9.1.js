// All currently supported damageTypes: "Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF", "DPS", "Dmg Taken"
// Displaying too many "Types" will result in a really wide meter that will effect the game_log window. i reccomend only tracking 4/5 things at a time for general use
const damageTypes = ["Base", "Blast", "Burn", "HPS", "MPS", "DR", "RF", "DPS", "Dmg Taken"];

// Toggle settings
let displayClassTypeColors = true;
let displayDamageTypeColors = true;
let showOverheal = false;
let showOverManasteal = true;

// Color mapping
const damageTypeColors = {
    Base: '#A92000',
    Blast: '#782D33',
    Burn: '#FF7F27',
    HPS: '#9A1D27',
    MPS: '#353C9C',
    DR: '#E94959',
    RF: '#D880F0',
    DPS: '#FFD700',
    "Dmg Taken": '#FF4C4C'
};

// Initialize the class color mapping
const classColors = {
    mage: '#3FC7EB',
    paladin: '#F48CBA',
    priest: '#FFFFFF', // White
    ranger: '#AAD372',
    rogue: '#FFF468',
    warrior: '#C69B6D'
};

// Overall-sums variables (optional use)
let damage = 0, burnDamage = 0, blastDamage = 0, baseDamage = 0;
let baseHeal = 0, lifesteal = 0, manasteal = 0, dreturn = 0, reflect = 0;
const METER_START = performance.now();

// Per-member tracking
let playerDamageSums = {};

function getPlayerEntry(id) {
    if (!playerDamageSums[id]) {
        playerDamageSums[id] = {
            startTime: performance.now(),
            sumDamage: 0,
            sumBurnDamage: 0,
            sumBlastDamage: 0,
            sumBaseDamage: 0,
            sumHeal: 0,
            sumLifesteal: 0,
            sumManaSteal: 0,
            sumDamageReturn: 0,
            sumReflection: 0,
            sumDamageTakenPhys: 0,
            sumDamageTakenMag: 0
        };
    }
    return playerDamageSums[id];
}

function getFormatted(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initDPSMeter() {
    const $ = parent.$;
    const brc = $('#bottomrightcorner');
    brc.find('#dpsmeter').remove();
    const container = $("<div id='dpsmeter'></div>").css({
        fontSize: '20px', color: 'white', textAlign: 'center', display: 'table', overflow: 'hidden', marginBottom: '-3px', width: '100%', backgroundColor: 'rgba(0,0,0,1)'
    });
    container.append(
        $("<div id='dpsmetercontent'></div>").css({ display: 'table-cell', verticalAlign: 'middle', padding: '2px', border: '4px solid grey' })
    );
    brc.children().first().after(container);
}

// Handle all hit events
parent.socket.on('hit', data => {
    const isParty = id => parent.party_list.includes(id)
    try {
        // == Party-only filter ==
        const attackerInParty = isParty(data.hid);
        const targetInParty = isParty(data.id);

        if (!attackerInParty && !targetInParty) return;

        // == Overall sums ==
        if (data.damage) {
            damage += data.damage;
            if (data.source === 'burn') burnDamage += data.damage;
            else if (data.splash) blastDamage += data.damage;
            else baseDamage += data.damage;
        }
        if (data.heal || data.lifesteal) {
            baseHeal += (data.heal ?? 0) + (data.lifesteal ?? 0);
            lifesteal += data.lifesteal ?? 0;
        }
        if (data.manasteal) manasteal += data.manasteal;
        if (data.dreturn) dreturn += data.dreturn;
        if (data.reflect) reflect += data.reflect;

        // == Damage taken by character ==
        if (data.damage && get_player(data.id)) {
            const e = getPlayerEntry(data.id);
            if (data.damage_type === 'physical') e.sumDamageTakenPhys += data.damage;
            else if (data.damage_type === 'magical') e.sumDamageTakenMag += data.damage;
        }

        // == Character actions ==
        // Heal / Lifesteal
        if (get_player(data.hid) && (data.heal || data.lifesteal)) {
            const e = getPlayerEntry(data.hid);  // healer’s entry
            const healer = get_player(data.hid);      // for lifesteal clamping
            const target = get_player(data.id);       // for heal clamping

            if (showOverheal) {
                // full heal + lifesteal
                e.sumHeal += (data.heal ?? 0) + (data.lifesteal ?? 0);
            } else {
                // clamp each component separately, inline
                e.sumHeal +=
                    (data.heal
                        ? Math.min(data.heal, (target?.max_hp ?? 0) - (target?.hp ?? 0))
                        : 0
                    )
                    + (data.lifesteal
                        ? Math.min(data.lifesteal, healer.max_hp - healer.hp)
                        : 0
                    );
            }
        }

        // Mana steal
        if (get_player(data.hid) && data.manasteal) {
            const e = getPlayerEntry(data.hid);
            const p = get_entity(data.hid);
            if (showOverManasteal) e.sumManaSteal += data.manasteal;
            else e.sumManaSteal += Math.min(data.manasteal, p.max_mp - p.mp);
        }

        // Other damage done
        if (data.damage && get_player(data.hid)) {
            const e = getPlayerEntry(data.hid);
            e.sumDamage += data.damage;
            if (data.source === 'burn') e.sumBurnDamage += data.damage;
            else if (data.splash) e.sumBlastDamage += data.damage;
            else e.sumBaseDamage += data.damage;
            if (data.dreturn) e.sumDamageReturn += data.dreturn;
            if (data.reflect) e.sumReflection += data.reflect;
        }
    } catch (err) {
        console.error('hit handler error', err);
    }
});

// Compute stat value for type
function getTypeValue(type, entry) {
    const elapsed = performance.now() - entry.startTime;
    if (elapsed <= 0) return 0;
    switch (type) {
        case 'DPS': {
            const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
            return Math.floor(total * 1000 / elapsed);
        }
        case 'Burn': return Math.floor(entry.sumBurnDamage * 1000 / elapsed);
        case 'Blast': return Math.floor(entry.sumBlastDamage * 1000 / elapsed);
        case 'Base': return Math.floor(entry.sumBaseDamage * 1000 / elapsed);
        case 'HPS': return Math.floor(entry.sumHeal * 1000 / elapsed);
        case 'MPS': return Math.floor(entry.sumManaSteal * 1000 / elapsed);
        case 'DR': return Math.floor(entry.sumDamageReturn * 1000 / elapsed);
        case 'RF': return Math.floor(entry.sumReflection * 1000 / elapsed);
        case 'Dmg Taken': {
            const phys = Math.floor(entry.sumDamageTakenPhys * 1000 / elapsed);
            const mag = Math.floor(entry.sumDamageTakenMag * 1000 / elapsed);
            return { phys, mag };
        }
        default:
            return 0;
    }
}

// Calculate DPS for sorting
function calculateDPSForEntry(entry) {
    const elapsed = performance.now() - entry.startTime;
    if (elapsed <= 0) return 0;
    const total = entry.sumDamage + entry.sumDamageReturn + entry.sumReflection;
    return Math.floor(total * 1000 / elapsed);
}

// Render the DPS meter UI
function updateDPSMeterUI() {
    const $ = parent.$;
    const c = $('#dpsmetercontent'); if (!c.length) return;
    // Elapsed time display
    const elapsedMs = performance.now() - METER_START;
    const hrs = Math.floor(elapsedMs / 3600000);
    const mins = Math.floor((elapsedMs % 3600000) / 60000);
    let html = `<div>👑 Elapsed Time: ${hrs}h ${mins}m 👑</div>` +
        '<table border="1" style="width:100%"><tr><th></th>';
    // Header row
    damageTypes.forEach(t => {
        const col = displayDamageTypeColors ? damageTypeColors[t] || 'white' : 'white';
        html += `<th style='color:${col}'>${t}</th>`;
    });
    html += '</tr>';
    // Player rows
    const classColors = { mage: '#3FC7EB', paladin: '#F48CBA', priest: '#FFFFFF', ranger: '#AAD372', rogue: '#FFF468', warrior: '#C69B6D' };
    const sorted = Object.entries(playerDamageSums)
        .map(([id, e]) => ({ id, dps: calculateDPSForEntry(e), e }))
        .sort((a, b) => b.dps - a.dps);
    sorted.forEach(({ id, e }) => {
        const p = get_player(id); if (!p) return;
        const nameCol = displayClassTypeColors ? classColors[p.ctype.toLowerCase()] || '#FFFFFF' : '#FFFFFF';
        html += `<tr><td style='color:${nameCol}'>${p.name}</td>`;
        damageTypes.forEach(t => {
            if (t === 'Dmg Taken') {
                const { phys, mag } = getTypeValue(t, e);
                html += `<td><span style='color:#FF4C4C'>${getFormatted(phys)}</span> | <span style='color:#6ECFF6'>${getFormatted(mag)}</span></td>`;
            } else {
                const val = getTypeValue(t, e);
                html += `<td>${getFormatted(val)}</td>`;
            }
        });
        html += '</tr>';
    });
    // Total row
    html += `<tr><td style='color:${damageTypeColors['DPS']}'>Total DPS</td>`;
    damageTypes.forEach(t => {
        if (t === 'Dmg Taken') {
            let totP = 0, totM = 0;
            Object.values(playerDamageSums).forEach(e => {
                const { phys, mag } = getTypeValue(t, e);
                totP += phys; totM += mag;
            });
            html += `<td><span style='color:#FF4C4C'>${getFormatted(totP)}</span> | <span style='color:#6ECFF6'>${getFormatted(totM)}</span></td>`;
        } else if (t === 'DPS') {
            let totalDmg = 0;
            Object.values(playerDamageSums).forEach(e => {
                totalDmg += e.sumDamage + e.sumDamageReturn + e.sumReflection;
            });
            const elapsed = performance.now() - METER_START;
            const totalDPS = Math.floor(totalDmg * 1000 / Math.max(elapsed, 1));
            html += `<td>${getFormatted(totalDPS)}</td>`;
        } else {
            let tot = 0;
            Object.values(playerDamageSums).forEach(e => tot += getTypeValue(t, e));
            html += `<td>${getFormatted(tot)}</td>`;
        }
    });
    html += '</tr></table>';
    c.html(html);
}

// Initialize and run
initDPSMeter();
setInterval(updateDPSMeterUI, 250);
