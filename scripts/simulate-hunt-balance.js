const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadBrowserClass(relativePath, className) {
    const absolute = path.resolve(__dirname, '..', relativePath);
    vm.runInThisContext(`${fs.readFileSync(absolute, 'utf8')}\nglobalThis.${className} = ${className};`, { filename: absolute });
    return global[className];
}

global.window = {};
require('../js/effects/MonsterData.js');
require('../js/effects/hunt/HuntData.js');
window.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');

global.HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
global.HUNT_WILDS_MOTION_VALUES = require('../js/effects/hunt/data/WildsMotionValues.generated.js');
global.HUNT_WILDS_RUNTIME_MOTION_TIMINGS = require('../js/effects/hunt/data/WildsRuntimeMotionTimings.generated.js');
global.HuntMotionValueCatalog = require('../js/effects/hunt/HuntMotionValueCatalog.js');
global.HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
global.HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');
global.HuntHunterCommandQueue = require('../js/effects/hunt/HuntHunterCommandQueue.js');
global.HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');
global.HuntMonsterFlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
global.HuntBalanceTelemetry = require('../js/effects/hunt/HuntBalanceTelemetry.js');
global.HuntMonsterRules = loadBrowserClass('js/effects/hunt/HuntMonsterRules.js', 'HuntMonsterRules');
global.HuntBattleTickExecutor = loadBrowserClass('js/effects/hunt/HuntBattleTickExecutor.js', 'HuntBattleTickExecutor');
global.HuntValstraxExecutor = loadBrowserClass('js/effects/hunt/HuntValstraxExecutor.js', 'HuntValstraxExecutor');
global.HuntMonsterTurnExecutor = loadBrowserClass('js/effects/hunt/HuntMonsterTurnExecutor.js', 'HuntMonsterTurnExecutor');
global.HuntHunterTurnExecutor = loadBrowserClass('js/effects/hunt/HuntHunterTurnExecutor.js', 'HuntHunterTurnExecutor');

const HuntWeaponCatalog = require('../js/effects/hunt/HuntWeaponCatalog.js');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const HuntSeededRandom = require('../js/effects/hunt/HuntSeededRandom.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

const runs = Math.max(1, Number(process.argv[2] || 200));
const comboList = HuntWeaponCatalog.build(window.HUNT_COMBO_LIST);
const monsterPatterns = HuntMonsterPatternCatalog.build(window.MONSTER_ATTACKS, window.MONSTER_DATA);
const weapons = window.HUNT_WEAPONS;
const monsters = window.MONSTER_DATA.filter(monster => monsterPatterns[monster.id.replace(/-/g, '_')]);

function makeHunter(weapon, index, random) {
    const perks = HuntPerkCatalog.roll(random);
    return {
        ...weapon,
        index,
        hunterName: `SIM-${weapon.id}-${index}`,
        hp: 100,
        maxHp: 100,
        status: 'alive',
        sharpness: 100,
        ammo: 12,
        hasMoxie: true,
        atb: 0,
        comboIndex: 0,
        personality: ['normal', 'offensive', 'defensive', 'veteran'][index],
        perks,
        perkModifiers: HuntPerkCatalog.aggregate(perks),
        potions: 10,
        lifepowders: 1,
        spiritLevel: 0,
        demonModeDuration: 0,
        phials: weapon.id === 'charge_blade' ? 0 : 5,
        shieldChargeDuration: 0,
        overheatDuration: 0,
        extractBuffs: { red: 0, white: 0, orange: 0 },
        extractDuration: 0,
        weaponGauge: 100
    };
}

function run(seed) {
    const seeded = new HuntSeededRandom(seed);
    const random = () => seeded.next();
    const monster = monsters[Math.floor(random() * monsters.length)];
    const start = Math.floor(random() * weapons.length);
    const selectedWeapons = Array.from({ length: 4 }, (_, index) => makeHunter(weapons[(start + index) % weapons.length], index, random));
    let ended = false;
    let victory = false;
    const engine = new HuntEngine({
        selectedWeapons,
        selectedMonster: monster,
        random,
        schedule: callback => callback(),
        monsterTier: 'normal',
        monsterHp: 15600,
        monsterMaxHp: 15600,
        monsterSpeed: 2.2,
        monsterDamageMod: 0.9,
        monsterStunThreshold: 390,
        MONSTER_ATTACKS: window.MONSTER_ATTACKS,
        MONSTER_PATTERNS: monsterPatterns,
        COMBO_LIST: comboList,
        timeLimit: 480,
        callbacks: {
            onGameEnd: result => { ended = true; victory = result; }
        }
    });

    while (!ended && engine.battleTime < 4800) engine.processTick();
    return {
        victory,
        monsterId: monster.id,
        ticks: engine.battleTime,
        carts: engine.cartCount,
        weapons: selectedWeapons.map(weapon => weapon.id),
        telemetry: engine.telemetry.summary()
    };
}

const results = Array.from({ length: runs }, (_, index) => run(index + 1));
const wins = results.filter(result => result.victory);
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const weaponStats = {};
for (const result of results) {
    for (const weaponId of result.weapons) {
        const entry = weaponStats[weaponId] || { hunts: 0, wins: 0, ticks: 0, carts: 0 };
        entry.hunts++;
        if (result.victory) entry.wins++;
        entry.ticks += result.ticks;
        entry.carts += result.carts;
        weaponStats[weaponId] = entry;
    }
    for (const action of result.telemetry.hunterActions) {
        const entry = weaponStats[action.weaponId] || { hunts: 0, wins: 0, ticks: 0, carts: 0 };
        entry.damage = (entry.damage || 0) + action.damage;
        entry.actions = (entry.actions || 0) + action.uses;
        weaponStats[action.weaponId] = entry;
    }
}

console.log(`[hunt-sim] runs=${runs} wins=${wins.length} winRate=${(wins.length / runs * 100).toFixed(1)}% avgTicks=${average(results.map(result => result.ticks)).toFixed(1)} avgCarts=${average(results.map(result => result.carts)).toFixed(2)}`);
Object.entries(weaponStats).sort(([a], [b]) => a.localeCompare(b)).forEach(([weaponId, stat]) => {
    console.log(`  ${weaponId.padEnd(16)} hunts=${String(stat.hunts).padStart(4)} win=${(stat.wins / stat.hunts * 100).toFixed(1).padStart(5)}% avgTicks=${(stat.ticks / stat.hunts).toFixed(1).padStart(6)} carts=${(stat.carts / stat.hunts).toFixed(2)} dmg/action=${((stat.damage || 0) / Math.max(1, stat.actions || 0)).toFixed(1)}`);
});
