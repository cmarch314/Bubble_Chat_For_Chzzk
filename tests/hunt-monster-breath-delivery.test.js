const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Animator = HuntMonsterAttackAnimator;`, context);
const animator = Object.create(context.Animator.prototype);

assert.strictEqual(animator.getElementalTheme('백스텝 브레스', {
    id: 'rathalos.backstep_fireball', tags: ['projectile', 'elemental', 'fire']
}).id, 'fire', 'element tags must override a move name that omits its damage element');
assert.strictEqual(animator.getElementalTheme('정체불명 공격', { tags: ['thunder'] }).id, 'thunder');
assert.strictEqual(animator.getBreathDelivery('화염구 브레스', { sourceActionClass: 'cBreathAttack', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('삼연 화염 브레스', { sourceActionClass: 'cBreathThreeway', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('포말 삼연 브레스', { sourceActionClass: 'cBubbleBreath3ToWall', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('고압 수류 레이저', { sourceActionClass: 'cWaterPressureLaserExL', tags: ['projectile'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('십자 수류 대회전', { sourceActionClass: 'cCrossLaserBreath', tags: ['ultimate'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('화염 브레스 쓸기', { tags: ['area', 'elemental'] }), 'stream');
assert.strictEqual(animator.getBreathDelivery('기공 탄환 사격', { tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('직선 독무', {
    sourceActionClass: '固定長ビーム状毒霧ヒットデータ', tags: ['poison', 'mist']
}), 'gas', 'poison-mist geometry must take priority over a beam-shaped source label');
assert.strictEqual(animator.getBreathDelivery('부채꼴 독무', { delivery: 'gas', tags: ['poison'] }), 'gas');
assert.match(source, /const isRoar = type === 'roar'[\s\S]*?this\.triggerMonsterRoar\(\);[\s\S]*?return;/,
    'roars must exit through their dedicated spectacle before elemental delivery can spawn');
assert.match(source, /delivery === 'projectile'[\s\S]*?className = 'monster-element-projectile'/,
    'projectiles must own a detached projectile node instead of restyling a beam node');
assert.doesNotMatch(source, /delivery === 'projectile'[\s\S]{0,240}?className = 'monster-element-beam'/,
    'a projectile branch must never create a laser body');

const css = require('./helpers/hunt-css');
assert.match(css, /delivery-projectile[\s\S]*?\.monster-element-projectile/);
assert.match(css, /delivery-stream[\s\S]*?monster-element-stream/);
assert.match(css, /delivery-gas[\s\S]*?radial-gradient/);
assert.match(css, /@keyframes monster-element-projectile-reduced[\s\S]*?prefers-reduced-motion[\s\S]*?monster-element-projectile-reduced/,
    'reduced-motion mode must keep a visible projectile instead of collapsing it to 0.01ms');
const animatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const engineSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
const executorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
assert.match(executorSource, /runtimeImpactPending:\s*true[\s\S]*?runtimeImpactDelayTicks:\s*impactDelayTicks/,
    'delayed projectile visuals need the authored impact time');
assert.match(animatorSource, /runtimeImpactPending[\s\S]*?createElementalAttack/,
    'a pending delayed impact must launch its projectile before returning');
assert.match(animatorSource, /const isElementalDelivery = type === 'elemental'[\s\S]*?pattern\?\.type === 'projectile'/,
    'authored projectile semantics must remain visible even when a localized move name is unknown');
assert.match(engineSource, /const authoredElemental = tags\.has\('elemental'\)[\s\S]*?delivery/,
    'monster attack classification must prefer authored type, tags, and delivery over display-name inference');
console.log('[test] Monster breath projectile, stream, and beam delivery passed.');
