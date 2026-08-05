const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Executor = HuntHunterTurnExecutor;`, context);
const HuntHunterTurnExecutor = context.Executor;

assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_1' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_2' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_3' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.charging_sidestep' }), 'bow_charge_step');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.recover_stamina' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.charge_1' }), 'charge_tier_1');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.strong_charge_2' }), 'charge_tier_2');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.true_charge_3' }), 'charge_tier_3',
    'great sword charge stages must use their exact labelled World events instead of a random weapon-bank fallback');

console.log('[test] Bow draw stays silent; charging sidestep and Great Sword tiers stay explicit.');

// --- 폴백 봉쇄: cue 이름에 의존하지 않는 계약 ---
// 과거 회귀 원인: 차단이 cue 이름 allowlist라서 실행 경로가 넘기는 'attack'이나
// 신규 cue가 목록에서 빠지면 공용 bow 뱅크(시위 당김/삐걱임 포함)가 다시 열렸다.
const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');

const bowManager = Object.create(HuntAudioManager.prototype);
bowManager.weaponGroup = () => 'bow';
bowManager.playVerifiedWeaponCue = () => false;      // 큐레이션 미매핑 상황
bowManager.playEvidenceRankedWeaponAction = () => false;
let genericBankUsed = false;
bowManager.playLocalAudio = () => { genericBankUsed = true; return true; };

for (const cue of ['attack', 'bow_shot', 'bow_charge_start', 'draw', 'weapon_charge',
    'bow_draw_hold', 'release', 'anything_new', undefined]) {
    genericBankUsed = false;
    const played = bowManager.playWeaponAction('bow', cue, { actionId: 'bow.draw_1' });
    assert.strictEqual(genericBankUsed, false,
        `bow must never reach the generic bank fallback (cue=${String(cue)}) — that bank holds the banned drawstring/creak layers`);
    assert.strictEqual(played, false, `unmapped bow cue must stay silent (cue=${String(cue)})`);
}

// 다른 무기는 폴백이 살아 있어야 한다 (과잉 차단 방지)
const swordManager = Object.create(HuntAudioManager.prototype);
swordManager.weaponGroup = () => 'great_sword';
swordManager.playVerifiedWeaponCue = () => false;
swordManager.playEvidenceRankedWeaponAction = () => false;
let swordFellBack = false;
swordManager.playLocalAudio = () => { swordFellBack = true; return true; };
swordManager.playWeaponAction('great_sword', 'attack', {});
assert.strictEqual(swordFellBack, true, 'non-bow weapons must keep their bank fallback');

console.log('[test] Bow generic-bank fallback is sealed for every cue name.');
