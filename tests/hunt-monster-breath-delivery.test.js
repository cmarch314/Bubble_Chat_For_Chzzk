const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Animator = HuntMonsterAttackAnimator;`, context);
const animator = Object.create(context.Animator.prototype);

assert.strictEqual(animator.getBreathDelivery('화염구 브레스', { sourceActionClass: 'cBreathAttack', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('삼연 화염 브레스', { sourceActionClass: 'cBreathThreeway', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('포말 삼연 브레스', { sourceActionClass: 'cBubbleBreath3ToWall', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('고압 수류 레이저', { sourceActionClass: 'cWaterPressureLaserExL', tags: ['projectile'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('십자 수류 대회전', { sourceActionClass: 'cCrossLaserBreath', tags: ['ultimate'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('화염 브레스 쓸기', { tags: ['area', 'elemental'] }), 'stream');
assert.strictEqual(animator.getBreathDelivery('기공 탄환 사격', { tags: ['projectile'] }), 'projectile');

const css = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');
assert.match(css, /delivery-projectile[\s\S]*?monster-element-projectile/);
assert.match(css, /delivery-stream[\s\S]*?monster-element-stream/);
console.log('[test] Monster breath projectile, stream, and beam delivery passed.');
