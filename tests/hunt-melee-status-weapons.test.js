const assert = require('assert');
const entries = require('../js/effects/hunt/data/WildsWeaponInstances.generated.js');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');

const statusEntries = entries.filter(entry => (entry.specials || []).some(special => special.kind === 'status'));
assert.strictEqual(statusEntries.length, 49);

function buildEngine() {
    return {
        random: () => .99,
        battleTime: 1,
        monsterHp: 10000,
        monsterMaxHp: 10000,
        monsterState: 'normal',
        monsterAtb: 100,
        monsterKnockdownDuration: 0,
        monsterPoisonBuild: 0,
        monsterParalysisBuild: 0,
        monsterSleepBuild: 0,
        monsterBlastBuild: 0,
        monsterPoisonTicks: 0,
        addLog: () => {},
        updateMonsterHpUI: () => {}
    };
}

for (const status of ['poison', 'paralysis', 'sleep', 'blast']) {
    const weaponInstance = statusEntries.find(entry => entry.specials.some(special => special.status === status));
    assert.ok(weaponInstance, `${status} needs at least one selectable final melee weapon`);
    const engine = buildEngine();
    const runtime = new HuntPerkRuntime(engine);
    const hunter = { hunterName: status, perks: [], weaponInstance };
    for (let hit = 0; hit < 40; hit++) runtime.applyMonsterStatus(hunter, {}, 200);
    if (status === 'poison') assert.ok(engine.monsterPoisonTicks > 0, 'poison weapon must proc poison');
    if (status === 'paralysis') assert.strictEqual(engine.monsterState, 'paralyzed', 'paralysis weapon must proc paralysis');
    if (status === 'sleep') assert.strictEqual(engine.monsterState, 'sleeping', 'sleep weapon must proc sleep');
    if (status === 'blast') assert.ok(engine.monsterHp < 10000, 'blast weapon must proc blast damage');
}

console.log('[test] All final Wilds melee status weapons survive generation and proc their runtime ailments.');
