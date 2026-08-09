'use strict';

// 벨리오로스 재구축 계약.
//
// 이 킷은 한 번 갈아엎었다. 이전 구현이 잘못된 지점이 세 종류였고, 셋 다
// "그럴듯해 보이지만 자료에 없는 것"이었다. 테스트는 자료에 있는 것만 고정한다.
//
//   1. 근거 없는 수치 — 頭破壊 효과를 피해 .70 · 명중 .75로 적어뒀는데
//      어느 자료에도 없다. 실제 효과는 "브레스 뒤 竜巻이 남지 않는다"다.
//   2. 빠진 기술 — 回転ひっかき과 空中ブレス가 통째로 없었다.
//   3. 자료와 반대인 모션 — 물어뜯기는 前方に飛びかかり인데 측면으로 돌았고,
//      꼬리는 一歩後退した後인데 표적 쪽으로 다가갔다.
//
// 자료:
//   altema.jp/mhw/beriorosu   기술 7종 원문 모션
//   gamewith.jp/mhw/163255    尻尾「一歩後退」「先端が遅れてくる」
//                             頭破壊「氷ブレス後の竜巻が残らなくなる」
//                             棘破壊「ダウン状態になり、タックルで転倒可能」

const assert = require('node:assert');

global.window = global;
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
const patterns = global.HUNT_MONSTER_PATTERN_OVERRIDES.barioth;
const byId = id => patterns.find(pattern => pattern.id === id);

// ---- 자료에 있는 기술이 전부 있는가 ----

const REQUIRED = {
    'barioth.bite': '噛みつき',
    'barioth.short_tackle': 'ショートタックル',
    'barioth.spin_claw': '回転ひっかき',
    'barioth.tail_sweep': '尻尾なぎ払い',
    'barioth.ice_tornado': '氷ブレス',
    'barioth.hover_breath': '空中氷ブレス',
    'barioth.glide_pounce': '滑空攻撃',
    'barioth.landing_slam': '叩きつけかみつき',
    'barioth.wall_pounce': '壁蹴り飛びかかり'
};
for (const [id, nameJA] of Object.entries(REQUIRED)) {
    const pattern = byId(id);
    assert.ok(pattern, `${id}(${nameJA})가 빠졌다`);
    assert.strictEqual(pattern.sourceMoveNameJA, nameJA,
        `${id}의 일본어 원문 기술명이 다르다`);
}

// ---- 틱이 맞는가 ----
//
// 비트 틱 합이 movement.ticks와 다르면 애니메이션이 자기 창을 넘거나 남긴다.
// 타격 비트의 시작 틱이 impactTimeline과 다르면 때리는 순간과 그림이 어긋난다.
// 투사체 기술은 몸이 아니라 투사체가 때리므로, 대신 사출 신호가
// projectileLaunchDelayTicks와 같아야 한다 — 어긋나면 입이 열리기 전에 얼음이 난다.

for (const pattern of patterns) {
    if (!Array.isArray(pattern.motion) || !pattern.motion.length) continue;
    const total = pattern.motion.reduce((sum, beat) => sum + beat.ticks, 0);
    assert.strictEqual(total, pattern.movement.ticks,
        `${pattern.id}: 비트 틱 합 ${total} != movement.ticks ${pattern.movement.ticks}`);

    let elapsed = 0;
    const hits = [];
    const launches = [];
    for (const beat of pattern.motion) {
        if (beat.hit) hits.push(elapsed);
        if (beat.sfx === 'projectile') launches.push(elapsed);
        elapsed += beat.ticks;
    }
    if (pattern.delivery === 'projectile') {
        assert.strictEqual(launches[0], pattern.projectileLaunchDelayTicks,
            `${pattern.id}: 사출 비트 ${launches[0]}틱 != projectileLaunchDelayTicks ${pattern.projectileLaunchDelayTicks}`);
    } else {
        const timeline = (pattern.impactTimeline || []).map(entry => entry.atTicks);
        assert.deepStrictEqual(hits, timeline,
            `${pattern.id}: 타격 비트와 impactTimeline이 어긋난다`);
    }
}

// ---- 자료와 반대로 움직이지 않는가 ----

// 噛みつき「前方に飛びかかり」— 앞으로 뛰어든다. 측면으로 돌지 않는다.
const bite = byId('barioth.bite');
const biteApproach = bite.motion.find(beat => beat.beat === 'leap-in');
assert.match(biteApproach.to, /^toward:target/,
    '물어뜯기는 표적 정면으로 뛰어든다 (측면 우회가 아니다)');

// 尻尾「一歩後退した後」— 먼저 물러난다. toward의 음수 비율이 곧 물러남이다.
const tail = byId('barioth.tail_sweep');
const stepBack = tail.motion[0];
assert.match(stepBack.to, /^toward:target -/,
    '꼬리 휩쓸기는 먼저 한 걸음 물러나야 한다');
// 「先端が遅れてくる」— 본 타격 뒤 늦게 오는 약한 2타가 선단 지연이다.
assert.strictEqual(tail.impactTimeline.length, 2, '선단 지연이 2타로 표현돼야 한다');
assert.ok(tail.impactTimeline[1].damageScale < tail.impactTimeline[0].damageScale,
    '늦게 오는 선단은 본 타격보다 약하다');

// 벽차기는 표적 반대편에서 파생돼야 한다. 화면 한쪽에 고정하면 표적이 그쪽에
// 있어도 같은 벽으로 간다.
const wall = byId('barioth.wall_pounce');
for (const beat of wall.motion) {
    if (!beat.to) continue;
    assert.ok(!/^(left|right):home/.test(beat.to),
        `벽차기가 화면 한쪽에 고정돼 있다 (${beat.to})`);
}
assert.ok(wall.motion.some(beat => /^toward:target -/.test(beat.to || '')),
    '벽 위치는 표적 반대 방향에서 나와야 한다');

// ---- 부위 파괴 효과가 자료와 맞는가 ----

// 頭破壊「氷ブレス後の竜巻が残らなくなる」
// 회오리(2타 .45)를 잃으므로 총량의 .55만 남는다. 남는 회오리가 걸던 상태이상도 막힌다.
const tornado = byId('barioth.ice_tornado');
assert.strictEqual(tornado.brokenPartDamageModifiers.head, .55,
    '머리 파괴는 竜巻 2타(.45)를 잃는 것과 같아야 한다');
assert.ok(tornado.statusBlockedWhenBroken.includes('head'),
    '남는 회오리가 사라지면 빙결도 걸리지 않는다');
assert.ok(!tornado.brokenPartAccuracyModifiers,
    '명중 저하는 어느 자료에도 없다 (근거 없는 수치를 다시 넣지 않는다)');
const total = tornado.impactTimeline.reduce((sum, entry) => sum + entry.damageScale, 0);
assert.ok(Math.abs(total - 1) < 1e-9, '착탄+회오리 합이 1이어야 환산이 성립한다');

// 尻尾切断「判定が大きく縮まる」
assert.strictEqual(tail.brokenPartTargetCaps.tail, 1, '꼬리를 자르면 범위가 좁아진다');

// 棘破壊「ダウン状態になり、タックルで転倒可能」
// 앞발로 제동하는 기술에만 slip-eligible이 붙는다. 브레스에 붙으면 안 된다.
const SLIP = ['barioth.short_tackle', 'barioth.spin_claw', 'barioth.wall_pounce',
    'barioth.glide_pounce', 'barioth.landing_slam'];
for (const id of SLIP) {
    assert.ok(byId(id).tags.includes('slip-eligible'),
        `${id}는 앞발로 제동하므로 스파이크 파괴 시 미끄러져야 한다`);
}
for (const id of ['barioth.ice_tornado', 'barioth.hover_breath', 'barioth.bite']) {
    assert.ok(!byId(id).tags.includes('slip-eligible'),
        `${id}는 제동 동작이 아니므로 미끄러지지 않는다`);
}

// ---- 위력 순서가 자료와 맞는가 ----
// game8 모션값: slam 90 > 회전 70~75 > 활공 60 > 물기·꼬리 50
assert.ok(byId('barioth.landing_slam').damageRatio > byId('barioth.spin_claw').damageRatio,
    '내려찍기가 가장 세다');
assert.ok(byId('barioth.spin_claw').damageRatio > byId('barioth.glide_pounce').damageRatio,
    '회전 할퀴기가 활공보다 세다');
assert.ok(byId('barioth.glide_pounce').damageRatio > byId('barioth.bite').damageRatio,
    '활공이 물어뜯기보다 세다');

// ---- 탈진 ----
const fizzle = byId('barioth.ice_breath_fizzle');
assert.strictEqual(fizzle.requiredState, 'exhausted');
assert.strictEqual(fizzle.damageRatio, 0, '불발은 피해가 없다');
assert.ok(fizzle.tags.includes('no-impact'));

// ---- 벨리오로스는 지속 비행형이 아니다 ----
// 짧은 도약·활공·체공만 공중이다. flight-only를 붙이면 지상에서 영영 안 나온다.
for (const pattern of patterns) {
    assert.ok(!pattern.tags.includes('flight-only'),
        `${pattern.id}: 벨리오로스는 지속 비행형이 아니다`);
}

console.log(`[test] 벨리오로스 재구축 계약 통과 (패턴 ${patterns.length}개, 비트 ${patterns.filter(p => p.motion).length}개).`);
