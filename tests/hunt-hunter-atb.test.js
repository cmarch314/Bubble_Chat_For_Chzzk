'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');

assert.strictEqual(HuntAtbConfig.FULL_GAUGE_SECONDS, 10);
assert.strictEqual(HuntAtbConfig.FILL_PER_TICK, 1);
assert.strictEqual(HuntAtbConfig.VISUAL_DURATION_SCALE, 1.25);
assert.strictEqual(HuntAtbConfig.scaleVisualDurationMs(1000), 1250);
assert.strictEqual(HuntAtbConfig.GREAT_SWORD_CHARGE_STAGE_TICKS, 10);
assert.strictEqual(HuntAtbConfig.STANDARD_CHARGE_STAGE_TICKS, 10);
assert.strictEqual(
    HuntAtbConfig.actionCostSeconds({ atbCostSeconds: HuntAtbConfig.STANDARD_CHARGE_AUTHORED_COST_SECONDS }),
    1,
    'shared charge steps must refill exactly during their one-second action lock'
);
assert.strictEqual(
    HuntAtbConfig.scaleVisualDurationMs(HuntAtbConfig.GREAT_SWORD_CHARGE_VISUAL_MS),
    1000,
    'every Great Sword charge stage must occupy and display for one second'
);
assert.strictEqual(HuntHunterTurnExecutor.atbCostSeconds({ durationTicks: 5 }), 1);
assert.strictEqual(HuntHunterTurnExecutor.atbCostSeconds({ durationTicks: 80 }), 10, 'action ATB costs must cap at the full ten-second budget');
assert.strictEqual(HuntHunterTurnExecutor.atbCostSeconds({ durationTicks: 13, atbCostSeconds: 5 }), 10, 'authored ATB cost must override animation length and scale with the shared budget');

const quickHunter = { atb: 100 };
HuntHunterTurnExecutor.spendActionAtb(quickHunter, { durationTicks: 5, atbCostSeconds: 0.5 });
assert.strictEqual(quickHunter.atb, 90, 'a quick sword combo must retain its ten-percent relative ATB cost');

const heavyHunter = { atb: 100 };
HuntHunterTurnExecutor.spendActionAtb(heavyHunter, { durationTicks: 13, atbCostSeconds: 5 });
assert.strictEqual(heavyHunter.atb, 0, 'Falling Bash class actions must spend the complete ATB budget');

const chainedHunter = { atb: 100 };
HuntHunterTurnExecutor.spendActionAtb(chainedHunter, { durationTicks: 18 }, { atbAfterAction: 72 });
assert.strictEqual(chainedHunter.atb, 64, 'legacy chained-action remainders must not override the unified timing scale');
assert.strictEqual(HuntHunterTurnExecutor.atbDamageScale({ atbCostSeconds: 0.5 }), 0.15,
    'rapid attacks retain their damage floor without an automatic win-rate compensation');
assert.strictEqual(HuntHunterTurnExecutor.atbDamageScale({ atbCostSeconds: 5 }), 0.65,
    'full-budget attacks retain their relative finisher impact without automatic damage inflation');

const mechanicsSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntWeaponMechanics.js'), 'utf8');
const executorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const tickSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const animatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
assert.match(mechanicsSource, /great_sword\.charge_1[\s\S]*?atbCostSeconds:\s*5/,
    'Great Sword must reserve its full charge-sequence budget only at entry');
assert.match(executorSource, /if \(!continuingGreatSwordCharge\) \{\s*HuntHunterTurnExecutor\.spendActionAtb/,
    'later charge stages and releases must not spend ATB again');
assert.match(executorSource, /if \(!continuingGreatSwordCharge\) w\.atb = 0/,
    'charge continuation must preserve ATB recovered during its animation lock');
assert.match(tickSource, /w\.atb >= actionAtbThreshold \|\| continuesGreatSwordCharge/,
    'an active Great Sword charge must advance without waiting for another full gauge');
assert.match(animatorSource, /durationMs:\s*this\.visualDuration\(resolvedProfile\.durationMs\)/,
    'hunter weapon motions must share the global visual slowdown');

console.log('[test] Configurable ten-second hunter ATB budget and proportional action costs passed.');
