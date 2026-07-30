const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntChatTactics = require('../js/effects/hunt/HuntChatTactics.js');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const tactics = new HuntChatTactics();
const retiredReservations = ['!물약', '!가루', '!폭탄', '!숫돌', '!점프', '!귀환옥', '!예약취소'];

for (const command of retiredReservations) {
    assert.strictEqual(tactics.parse(command), null, `${command} must not reserve a hunter action`);
}

const index = read('index.html');
const engine = read('js/effects/hunt/HuntEngine.js');
const turnExecutor = read('js/effects/hunt/HuntHunterTurnExecutor.js');
const chatTactics = read('js/effects/hunt/HuntChatTactics.js');
const renderer = read('js/effects/hunt/HuntRenderer.js');
const perkRuntime = read('js/effects/hunt/HuntPerkRuntime.js');

assert.doesNotMatch(index, /HuntHunterCommandQueue/, 'the retired reservation runtime must not load in OBS');
assert.doesNotMatch(engine, /hunterCommandQueue|queuedCommands/, 'the engine must not own a hunter action queue');
assert.doesNotMatch(turnExecutor, /hunterCommandQueue|queuedCommands/,
    'a queued chat command must never take priority over autonomous weapon AI');
assert.doesNotMatch(chatTactics, /hunterCommandQueue|queuedCommands/,
    'chat tactics must not forward messages into a hunter action queue');
assert.doesNotMatch(renderer, /hunt-action-queue|hunt-combat-reserve-commands|!예약취소/,
    'the combat HUD must not advertise retired reservation controls');
assert.match(perkRuntime, /trySpecialAction\(hunter\)/,
    'real perk-driven special actions must remain part of autonomous combat');

console.log('[test] Hunt combat remains an autonomous battler without per-hunter action reservations.');
