const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntHunterCommandQueue = require('../js/effects/hunt/HuntHunterCommandQueue.js');

const calls = [];
const hunter = {
    index: 0, hunterName: '참가자', isNpc: false, status: 'alive',
    hp: 100, maxHp: 100, atb: 100, potions: 2, lifepowders: 1,
    sharpnessProfile: { green: 100 }, sharpness: 100, maxSharpness: 100
};
const ally = { index: 1, hunterName: '동료', status: 'alive', hp: 50, maxHp: 100, atb: 10 };
const engine = {
    selectedWeapons: [hunter, ally],
    perkRuntime: null,
    addLog: text => calls.push(['log', text]),
    updateHpUI: target => calls.push(['hp', target.index]),
    updateWeaponAtbUI: (index, atb) => calls.push(['atb', index, atb]),
    updatePotionCountUI: (index, count) => calls.push(['potion', index, count]),
    updateSharpnessUI: (index) => calls.push(['sharpness', index]),
    updateHunterCommandQueueUI: target => calls.push(['queue', [...(target.queuedCommands || [])]]),
    playSFX: key => calls.push(['sfx', key]),
    playAudioFile: file => calls.push(['audio', file]),
    showSkillBubble: (index, text) => calls.push(['bubble', index, text]),
    shakeWeapon: index => calls.push(['shake', index]),
    callbacks: {
        onTriggerRollAnimation: index => calls.push(['roll', index]),
        onTriggerInvincibleJump: (index, active) => calls.push(['invincible-jump', index, active])
    }
};
const queue = new HuntHunterCommandQueue({ maxQueued: 3 });

const newbie = { ...hunter, hunterName: '몬린이', personality: 'newbie', queuedCommands: [] };
engine.selectedWeapons.push(newbie);
const newbieWhetstone = queue.handle(engine, { nickname: '몬린이' }, '!숫돌');
assert.strictEqual(newbieWhetstone.accepted, false, 'newbie hunters must reject reserved whetstone use');
assert.deepStrictEqual(newbie.queuedCommands, [], 'a rejected newbie whetstone must not remain stuck in the queue');

assert.strictEqual(queue.handle(engine, { nickname: '시청자' }, '!숫돌').accepted, false, 'non-participants cannot reserve hunter actions');
const firstReservation = queue.handle(engine, { nickname: '참가자' }, '!숫돌');
assert.strictEqual(firstReservation.accepted, true);
assert.strictEqual(firstReservation.suppressBubble, true, 'reservation confirmation must not create a combat chat bubble');
assert.ok(calls.some(call => call[0] === 'queue'), 'queue UI must refresh when reservations change');
assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!회복가루').accepted, true);
assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!숫돌').accepted, false, 'duplicate reservations must be rejected');

assert.strictEqual(queue.tryExecute(engine, hunter), true, 'an executable later reservation must not be blocked by a waiting whetstone');
assert.deepStrictEqual(hunter.queuedCommands, ['whetstone']);
assert.strictEqual(hunter.lifepowders, 0);
assert.strictEqual(ally.hp, 75);
assert.strictEqual(ally.atb, 70);

hunter.itemDuration = 0;
hunter.sharpness = 70;
assert.strictEqual(queue.tryExecute(engine, hunter), true);
assert.strictEqual(hunter.pendingSharpnessRestore, true);
assert.strictEqual(hunter.itemDuration, 30);
assert.deepStrictEqual(hunter.queuedCommands, []);

hunter.hp = 40;
assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!회복약').accepted, true);
assert.strictEqual(queue.tryExecute(engine, hunter), true);
assert.strictEqual(hunter.hp, 100);
assert.strictEqual(hunter.potions, 1);
assert.ok(calls.some(call => call[0] === 'audio' && call[1].includes('Potion Drink')));

assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!점프').feedback, '예약: !점프 (1/3)');
assert.strictEqual(queue.tryExecute(engine, hunter), true);
assert.strictEqual(hunter.jumpInvulnerableTicks, 50, 'reserved jump must grant exactly five seconds of invulnerability');
assert.strictEqual(hunter.atb, 0, 'an off-screen hunter cannot keep charging its action gauge');
assert.ok(calls.some(call => call[0] === 'invincible-jump' && call[1] === hunter.index && call[2] === true));

assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!귀환옥').accepted, true);
assert.strictEqual(queue.tryExecute(engine, hunter), true);
assert.strictEqual(hunter.isAtCamp, true);
assert.strictEqual(hunter.farcasterUsed, true);
assert.strictEqual(hunter.perkCampTicks, 150, 'Farcaster must remove its hunter from combat for 15 seconds');
assert.strictEqual(hunter.hp, hunter.maxHp);
assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!귀환옥').accepted, false,
    'each hunter may use Farcaster at most once per battle');

const ranged = { hunterName: '거너', isNpc: false, status: 'alive', sharpnessProfile: null, potions: 1, lifepowders: 1 };
engine.selectedWeapons.push(ranged);
assert.strictEqual(queue.handle(engine, { nickname: '거너' }, '!숫돌').accepted, false, 'ranged weapons cannot reserve whetstones');

queue.handle(engine, { nickname: '참가자' }, '!회복약');
assert.strictEqual(queue.handle(engine, { nickname: '참가자' }, '!예약취소').accepted, true);
assert.deepStrictEqual(hunter.queuedCommands, []);

const executor = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
assert.match(executor, /hunterCommandQueue\.tryExecute\(engine, w\)/, 'reserved actions must execute before autonomous turn selection');
assert.strictEqual(queue.parse('!가루'), 'lifepowder');
assert.strictEqual(queue.parse('!물약'), 'potion');
assert.strictEqual(queue.parse('!믈약'), 'potion', 'the common 믈약 typo must still reserve a potion');

console.log('[test] Participant hunter action reservation queue passed.');
