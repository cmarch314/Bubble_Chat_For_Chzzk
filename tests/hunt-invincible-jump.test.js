const assert = require('assert');
const fs = require('fs');
const path = require('path');

const monsterTurn = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
const valstrax = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'), 'utf8');
const battleTick = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');

assert.match(monsterTurn, /jumpInvulnerableTicks[\s\S]{0,120}<= 0/,
    'ordinary and area monster attacks must exclude an invincible jumper');
assert.match(valstrax, /jumpInvulnerableTicks[\s\S]{0,120}<= 0/,
    'Valstrax ambush must exclude an invincible jumper');
assert.match(battleTick, /jumpInvulnerableTicks--[\s\S]*?onTriggerInvincibleJump/,
    'the five-second jump must return through its lifecycle owner');
assert.match(animator, /triggerInvincibleJump\(idx, active\)[\s\S]*?\.game-hunt-weapon-img/,
    'only the weapon image may leave the screen');
assert.match(css, /\.game-hunt-weapon-img\.hunter-invincible-jump[\s\S]*?animation:hunter-invincible-jump 5s/);
assert.match(css, /@keyframes hunter-invincible-jump[\s\S]*?translateY\(-980px\)/,
    'the jump must visibly leave a 1080p combat frame');

console.log('[test] Five-second off-screen invincible jump passed.');
