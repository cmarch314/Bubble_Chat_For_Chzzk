const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Animator = HuntMonsterAttackAnimator;`, context);
const animator = Object.create(context.Animator.prototype);

{
    const monsterRect = { left: 700, top: 120, width: 400, height: 300 };
    const head = { x: .23, y: .64 };
    const leftOrigin = context.Animator.targetFacingOrigin(
        monsterRect, { left: 100, top: 650, width: 200, height: 200 }, head, 'left');
    const rightOrigin = context.Animator.targetFacingOrigin(
        monsterRect, { left: 1500, top: 650, width: 200, height: 200 }, head, 'left');
    assert.strictEqual(leftOrigin.x, 792,
        'a left-side target must launch from the authored left-facing Rath head');
    assert.strictEqual(rightOrigin.x, 1008,
        'a right-side target must mirror the Rath head origin to the sprite right side');
    assert.strictEqual(leftOrigin.y, rightOrigin.y);
    const launchPattern = { projectileLaunchDelayTicks: 10 };
    assert.deepStrictEqual(
        [17, 22, 27].map(tick =>
            context.Animator.projectileLaunchDelayMs(launchPattern, tick, 17, 10, 720)),
        [1000, 1500, 2000],
        'Rathian triple fireballs must launch after one second at exact half-second intervals'
    );
}

assert.strictEqual(animator.getElementalTheme('백스텝 브레스', {
    id: 'rathalos.backstep_fireball', tags: ['projectile', 'elemental', 'fire']
}).id, 'fire', 'element tags must override a move name that omits its damage element');
assert.strictEqual(animator.getElementalTheme('정체불명 공격', { tags: ['thunder'] }).id, 'thunder');
assert.strictEqual(animator.getBreathDelivery('화염구 브레스', { sourceActionClass: 'cBreathAttack', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('삼연 화염 브레스', { sourceActionClass: 'cBreathThreeway', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('포말 삼연 브레스', { sourceActionClass: 'cBubbleBreath3ToWall', tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('고압 수류 레이저', { sourceActionClass: 'cWaterPressureLaserExL', tags: ['projectile'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('십자 수류 대회전', { sourceActionClass: 'cCrossLaserBreath', tags: ['ultimate'] }), 'beam');
assert.strictEqual(animator.getBreathDelivery('화염 브레스 쓸기', { tags: ['area', 'elemental'] }), 'gas');
assert.strictEqual(animator.getBreathDelivery('기공 탄환 사격', { tags: ['projectile'] }), 'projectile');
assert.strictEqual(animator.getBreathDelivery('직선 독무', {
    sourceActionClass: '固定長ビーム状毒霧ヒットデータ', tags: ['poison', 'mist']
}), 'gas', 'poison-mist geometry must take priority over a beam-shaped source label');
assert.strictEqual(animator.getBreathDelivery('부채꼴 독무', { delivery: 'gas', tags: ['poison'] }), 'gas');
assert.match(source, /const isRoar = type === 'roar'[\s\S]*?this\.triggerMonsterRoar\(pattern\);[\s\S]*?return;/,
    'roars must exit through their dedicated spectacle before elemental delivery can spawn');
assert.match(source, /delivery === 'projectile'[\s\S]*?className = 'monster-element-projectile'/,
    'projectiles must own a detached projectile node instead of restyling a beam node');
assert.doesNotMatch(source, /delivery === 'projectile'[\s\S]{0,240}?className = 'monster-element-beam'/,
    'a projectile branch must never create a laser body');
assert.match(source, /else if \(delivery !== 'gas'\)[\s\S]*?className = 'monster-element-beam'/,
    'gas delivery must not create even a hidden beam body');
assert.doesNotMatch(source, /delivery === 'gas'[\s\S]{0,220}?className = 'monster-element-beam'/,
    'gas delivery must remain structurally separate from true beams');

const css = require('./helpers/hunt-css');
assert.match(css, /delivery-projectile[\s\S]*?\.monster-element-projectile/);
assert.match(css, /delivery-stream[\s\S]*?monster-element-stream/);
assert.match(css, /delivery-gas[\s\S]*?radial-gradient/);
assert.doesNotMatch(css, /monster-gas-plume/,
    'gas breath must not draw a geometric triangular plume');
assert.match(source, /delivery === 'gas'[\s\S]*?perpendicularX[\s\S]*?i < 15/,
    'gas breath particles alone must spread into a fifteen-cloud fan');
assert.match(css, /@keyframes monster-element-projectile-reduced[\s\S]*?prefers-reduced-motion[\s\S]*?monster-element-projectile-reduced/,
    'reduced-motion mode must keep a visible projectile instead of collapsing it to 0.01ms');
const animatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const engineSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
const executorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
assert.match(executorSource, /runtimeImpactPending:\s*true[\s\S]*?runtimeImpactDelayTicks:\s*impactDelayTicks/,
    'delayed projectile visuals need the authored impact time');
assert.match(animatorSource, /runtimeImpactPending[\s\S]*?createElementalAttack/,
    'a pending delayed impact must launch its projectile before returning');
assert.match(animatorSource, /is-awaiting-outcome[\s\S]*?is-projectile-miss/,
    'a detached projectile must wait for the live judgment, then either impact or leave the board');
assert.match(animatorSource, /resolveElementalProjectileOutcome[\s\S]*?result\?\.result === 'hit'/,
    'only an actual hit may create a projectile impact');
assert.match(css, /monster-element-projectile-arrive[\s\S]*?monster-element-projectile-miss/,
    'a missed projectile must continue beyond its card destination before fading out');
const resolverSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatJudgmentResolver.js'), 'utf8');
assert.match(resolverSource, /judgment:\$\{encodeURIComponent\(String\(command\.judgmentGroup\)\)\}:cue[\s\S]*?judgmentResults/,
    'mapped projectile impact audio must route through the authored judgment group after a live resolution');
assert.match(animatorSource,
    /projectileLaunchDelayTicks[\s\S]*?resolveLiveElementalOrigin\([\s\S]*?createElementalAttack/,
    'Rath fireballs must wait for their turn and remeasure the live head before launch');
assert.match(animatorSource, /runtimeResolvedImpactTimeline[\s\S]*?pattern\.impactTimeline[\s\S]*?createElementalAttack/,
    'detached elemental delivery must use the live resolved targets rather than a stale catalog timeline');
assert.match(animatorSource, /schedulePreviewProjectile[\s\S]*?event\?\.targetIndices[\s\S]*?visualTargetIndex[\s\S]*?createElementalAttack/,
    'motion-only Preview must use each resolved judgment recipient for multi-spit projectile destinations');
assert.match(animatorSource, /schedulePreviewProjectile[\s\S]*?deferOutcome:\s*true[\s\S]*?resolveElementalProjectileOutcome/,
    'Preview projectiles must defer their hunter impact until the projectile has visually arrived');
assert.match(animatorSource, /previewProjectileScheduleKey === scheduleKey/,
    'one BEAT preview action must schedule its projectile timeline exactly once');
assert.match(animatorSource, /!minimalFx && delivery !== 'projectile'/,
    'a detached projectile must not also render the legacy travelling element head');
assert.match(animatorSource, /hasEmptyAuthoredLane[\s\S]*?off-board phantom destination[\s\S]*?result: hasEmptyAuthoredLane \? 'miss'/,
    'an edge-side triple fireball must preserve its empty flank as an off-board miss instead of retargeting a hunter');
assert.strictEqual(context.Animator.usesElementalDelivery('', { type: 'projectile' }), true,
    'authored projectile semantics must remain visible even when a localized move name is unknown');
assert.match(engineSource, /const authoredElemental = tags\.has\('elemental'\)[\s\S]*?delivery/,
    'monster attack classification must prefer authored type, tags, and delivery over display-name inference');
console.log('[test] Monster breath projectile, gas-cone, and true-beam delivery passed.');
