const assert = require('assert');
const fs = require('fs');
const path = require('path');

const monsterTurn = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
const valstrax = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'), 'utf8');
const monsterRules = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterRules.js'), 'utf8');
const battleTick = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const css = require('./helpers/hunt-css');

assert.match(monsterRules, /jumpInvulnerableTicks[\s\S]{0,120}> 0/,
    'shared monster targeting rules must exclude an invincible jumper');
assert.match(monsterTurn, /Rules\.isHunterTargetable/,
    'ordinary and area monster attacks must use shared hunter targeting rules');
assert.match(valstrax, /Rules\.isHunterTargetable/,
    'Valstrax ambush must use shared hunter targeting rules');
assert.match(battleTick, /jumpInvulnerableTicks--[\s\S]*?onTriggerInvincibleJump/,
    'the five-second jump must return through its lifecycle owner');
assert.match(animator, /triggerInvincibleJump\(idx, active\)[\s\S]*?\.game-hunt-weapon-img/,
    'only the weapon image may leave the screen');
assert.match(css, /\.game-hunt-weapon-img\.hunter-invincible-jump[\s\S]*?animation:hunter-invincible-jump 5s/);
assert.match(css, /@keyframes hunter-invincible-jump[\s\S]*?translateY\(760px\)/,
    'the jump must flee downward out of the combat frame');

console.log('[test] Five-second off-screen invincible jump passed.');
