'use strict';

const assert = require('assert');
const fs = require('fs');
const HuntCombatPresenter = require('../js/effects/hunt/HuntCombatPresenter.js');

const calls = [];
const hunters = [{ index: 0, name: 'A' }, { index: 3, name: 'D' }];
const renderer = {
    combatAnimator: {
        triggerHunterInterference: (...args) => calls.push(['interference', ...args]),
        triggerGuardImpact: (...args) => calls.push(['guard', ...args]),
        monsterAttackAnimator: { clearMonsterMotion: reason => calls.push(['clear', reason]) }
    },
    triggerMonsterAttack: (...args) => calls.push(['monster', ...args]),
    triggerHitAnimation: (...args) => calls.push(['hit', ...args]),
    updateHunterItemUI: (...args) => calls.push(['item', ...args])
};
const audio = { playMHAsset: (...args) => calls.push(['audio', ...args]) };
const presenter = new HuntCombatPresenter({
    renderer, audio, getHunters: () => hunters, getEngine: () => ({ sharedSupply: 'camp' })
});
const callbacks = presenter.callbacks();

callbacks.onTriggerMonsterAttack('charge', 'x', [], 'horn', { id: 'diablos.horn_charge' });
callbacks.onTriggerHitAnimation(3, { kind: 'strong' });
callbacks.onTriggerHunterInterference(0, 'tremor', 'large', true);
callbacks.onPlaySFX('monster_attack', null, { patternId: 'diablos.horn_charge' });
callbacks.onUpdateHunterItemUI(hunters[0]);
callbacks.onMonsterBeatActionComplete();

assert.strictEqual(calls[1][2], hunters[1], 'hunter lookup must use stable hunter indices');
assert.deepStrictEqual(calls[4], ['item', hunters[0], 'camp']);
assert(calls.some(call => call[0] === 'clear' && call[1] === 'beat-complete'));

const effectSource = fs.readFileSync('js/effects/HuntEffect.js', 'utf8');
assert.match(effectSource, /callbacks: this\.combatPresenter\.callbacks\(\)/);
assert.doesNotMatch(effectSource, /callbacks:\s*\{[\s\S]{0,120}onTriggerMonsterAttack/,
    'HuntEffect must not rebuild a private engine-to-renderer callback table');
console.log('[test] shared combat presenter callbacks passed.');
