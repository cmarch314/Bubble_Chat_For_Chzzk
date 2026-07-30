const assert = require('assert');
const HuntParticipantParser = require('../js/effects/hunt/HuntParticipantParser.js');

const parser = new HuntParticipantParser();
assert.deepStrictEqual(parser.parseReady('!준비'), { ready: true });
assert.deepStrictEqual(parser.parseReady('！ 준비'), { ready: true });
assert.strictEqual(parser.parseReady('준비'), null, 'ready must remain an explicit command');
assert.strictEqual(parser.parseReady('!준비 대검'), null, 'ready cannot be mixed with a loadout mutation');
assert.deepStrictEqual(parser.parsePerkReroll('!리롤'), { reroll: true });
assert.deepStrictEqual(parser.parsePerkReroll('！ 퍽리롤'), { reroll: true });
assert.strictEqual(parser.parsePerkReroll('!리롤 대검'), null, 'perk reroll must be a standalone loadout command');
assert.strictEqual(parser.parsePerkReroll('리롤'), null, 'perk reroll must remain an explicit command');
assert.deepStrictEqual(parser.parsePerkLock('!잠금 1'), { perkIndex: 0 });
assert.deepStrictEqual(parser.parsePerkLock('！ 잠금 3'), { perkIndex: 2 });
assert.strictEqual(parser.parsePerkLock('!잠금'), null, 'perk lock requires a visible one-based perk number');
assert.strictEqual(parser.parsePerkLock('!잠금 첫번째'), null, 'perk lock accepts numeric positions only');
assert.deepStrictEqual(parser.parsePerkUnlock('!해제 1'), { perkIndex: 0 });
assert.deepStrictEqual(parser.parsePerkUnlock('！ 해제 3'), { perkIndex: 2 });
assert.strictEqual(parser.parsePerkUnlock('!잠금 1'), null, 'lock must never toggle an existing lock off');
assert.strictEqual(parser.parsePerkUnlock('!잠금해제 1'), null, 'unlock must use the explicit !해제 command');
assert.strictEqual(parser.parsePerkUnlock('!해제'), null, 'perk unlock requires a visible one-based perk number');
assert.strictEqual(parser.parseRecruitment('hello'), null);
assert.deepStrictEqual(parser.parseRecruitment('!참가'), { join: true });
assert.deepStrictEqual(parser.parseRecruitment('！참가'), { join: true });
assert.strictEqual(parser.parseRecruitment('!참가 !대검'), null);
assert.strictEqual(parser.parseRecruitment('!참여'), null);

const cases = [
    ['!대검 지원가', 'great_sword', 'support'],
    ['!지원가 대검', 'great_sword', 'support'],
    ['!지원가, !대검', 'great_sword', 'support'],
    ['!차액', 'charge_blade', null],
    ['!차지액스', 'charge_blade', null],
    ['!라이트보우건 공격형', 'light_bowgun', 'offensive'],
    ['!헤보, !수비형', 'heavy_bowgun', 'defensive'],
    ['!수렵피리 !서폿', 'hunting_horn', 'support']
];
cases.forEach(([input, weaponId, personality]) => {
    const parsed = parser.parseLoadout(input);
    assert.ok(parsed, `${input} should be recognized`);
    assert.strictEqual(parsed.weaponId, weaponId);
    assert.strictEqual(parsed.personality, personality);
});
assert.strictEqual(parser.parseLoadout('오늘 대검 멋있다'), null, 'ordinary chat must not change loadout');
assert.strictEqual(parser.parseLoadout('잡담뿐'), null);
assert.strictEqual(parser.parseLoadout('!추천').recommend, true);
const personalityOnly = parser.parseLoadout('!지원가');
assert.deepStrictEqual(
    { weaponId: personalityOnly.weaponId, personality: personalityOnly.personality },
    { weaponId: null, personality: 'support' }
);
const weaponOnly = parser.parseLoadout('!대검');
assert.deepStrictEqual(
    { weaponId: weaponOnly.weaponId, personality: weaponOnly.personality },
    { weaponId: 'great_sword', personality: null }
);

const legacy = parser.parse('3 차액 베테랑', { isSubscriber: true }, false);
assert.deepStrictEqual(
    { index: legacy.index, isSubscriber: legacy.isSubscriber, weaponId: legacy.weaponId, personality: legacy.personality },
    { index: 2, isSubscriber: true, weaponId: 'charge_blade', personality: 'veteran' }
);
console.log('[test] Hunt recruitment and flexible loadout parser passed.');
