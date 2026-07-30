const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const LocalCompanionEndpoint = require('../js/runtime/LocalCompanionEndpoint');
const HuntCommandCatalog = require('../js/effects/hunt/HuntCommandCatalog');
const HuntProfileContract = require('../js/effects/hunt/HuntProfileContract');
const index = read('index.html');
const runtimeLoader = read('js/effects/hunt/HuntRuntimeLoader.js');
const position = resource => {
    const found = runtimeLoader.indexOf(resource);
    assert.ok(found >= 0, `${resource} must be ordered by HuntRuntimeLoader`);
    return found;
};
const indexPosition = resource => {
    const found = index.indexOf(resource);
    assert.ok(found >= 0, `${resource} must be loaded by index.html`);
    return found;
};

assert.ok(position('HuntData.js') < position('WildsMotionValues.generated.js'));
assert.ok(position('ReleasedMonsterRuntimeIndex.generated.js') < position('MonsterReleaseManifest.generated.js'));
assert.ok(position('MonsterReleaseManifest.generated.js') < position('HuntMonsterReleasePolicy.js'));
assert.ok(indexPosition('LocalCompanionEndpoint.js') < indexPosition('ChzzkGateway.js'));
assert.ok(indexPosition('LocalCompanionEndpoint.js') < indexPosition('HuntRuntimeLoader.js'));
assert.ok(indexPosition('HuntCommandCatalog.js') < indexPosition('HuntRuntimeLoader.js'));
assert.ok(indexPosition('HuntCommandCatalog.js') < indexPosition('GameCommandMatcher.js'));
assert.ok(position('HuntProfileContract.js') < position('HuntProfileClient.js'));
assert.ok(position('HuntProfileContract.js') < position('HuntInitializer.js'));
assert.ok(position('HuntRunState.js') < position('HuntRunDirector.js'));
assert.ok(position('HuntRunPartyAdapter.js') < position('HuntEffect.js'));
assert.ok(position('HuntSharedSupply.js') < position('HuntRunState.js'));
assert.ok(position('HuntJourneyRewardCatalog.js') < position('HuntEffect.js'));
assert.ok(position('HuntJourneyEconomy.js') < position('HuntJourneyEventCatalog.js'));
assert.ok(position('HuntJourneyCatalog.js') < position('HuntRunDirector.js'));
assert.ok(position('HuntJourneyEventCatalog.js') < position('HuntJourneyEventEngine.js'));
assert.ok(position('HuntJourneyVoteRuntime.js') < position('HuntEffect.js'));
assert.ok(position('HuntJourneyFlowController.js') < position('HuntEffect.js'));
assert.ok(position('HuntJourneyEventEngine.js') < position('HuntEffect.js'));
assert.ok(position('HuntRunClient.js') < position('HuntEffect.js'));
assert.ok(position('HuntRunDirector.js') < position('HuntEffect.js'));
assert.strictEqual(HuntCommandCatalog.matchStart('!몬헌').mode, 'journey');
assert.strictEqual(HuntCommandCatalog.matchStart('!수렵피리'), null, 'weapon commands must not collide with game starts');
assert.strictEqual(HuntCommandCatalog.isStop('!몬헌 중단'), true);
assert.strictEqual(HuntProfileContract.MAX_PERKS, 4);
assert.strictEqual(HuntProfileContract.endpoint({ BUBBLECHAT_COMPANION_ORIGIN: 'http://localhost:19000' }),
    'http://localhost:19000/api/hunt-profile');
assert.strictEqual(LocalCompanionEndpoint.DEFAULT_ORIGIN, 'http://127.0.0.1:17890');
assert.ok(position('WildsMotionValues.generated.js') < position('WildsRuntimeMotionTimings.generated.js'));
assert.ok(position('WildsRuntimeMotionTimings.generated.js') < position('HuntMotionValueCatalog.js'));
assert.ok(position('WildsMotionValues.generated.js') < position('HuntMotionValueCatalog.js'));
assert.ok(position('HuntMotionValueCatalog.js') < position('HuntWeaponCatalog.js'));
assert.ok(position('HuntWeaponMechanics.js') < position('HuntWeaponCatalog.js'));
assert.ok(position('HuntWeaponCatalog.js') < position('HuntWeaponActionSelector.js'));
assert.ok(position('HuntActionStateMachine.js') < position('HuntEngine.js'));
assert.ok(position('HuntBgmCatalog.js') < position('HuntBgmResolver.js'));
assert.ok(position('HuntBgmResolver.js') < position('HuntAudioManager.js'));
assert.ok(position('HuntMonsterProfiles.js') < position('HuntMonsterPatternCatalog.js'));
assert.ok(position('HuntMonsterEditionResolver.js') < position('HuntMonsterPatternCatalog.js'));
assert.ok(position('HuntMonsterArchetypeCatalog.js') < position('HuntMonsterAnatomyCatalog.js'));
assert.ok(position('HuntMonsterAnatomyCatalog.js') < position('HuntMonsterPartMaterialCatalog.js'));
assert.ok(position('HuntMonsterPartMaterialCatalog.js') < position('HuntRenderer.js'));
assert.ok(position('HuntMonsterArchetypeCatalog.js') < position('HuntMonsterFlightRuntime.js'));
assert.ok(position('HuntMonsterPatternCatalog.js') < position('HuntInitializer.js'));
assert.ok(position('HuntMonsterActionPolicy.js') < position('HuntMonsterTurnExecutor.js'));
assert.ok(position('HuntChatTactics.js') < position('HuntEffect.js'));
assert.ok(position('HuntPerkCatalog.js') < position('HuntInitializer.js'));
assert.ok(position('HuntPerkCatalog.js') < position('HuntPerkRuntime.js'));
assert.ok(position('HuntPerkRuntime.js') < position('HuntEngine.js'));
assert.ok(position('HuntLobbyRoster.js') < position('HuntEffect.js'));
assert.ok(position('HuntLoadoutAdvisor.js') < position('HuntEffect.js'));
assert.ok(position('HuntProfileClient.js') < position('HuntEffect.js'));

assert.doesNotMatch(read('js/effects/MonsterData.js'), /window\.HUNT_COMBO_LIST\s*=/, 'MonsterData must not overwrite live weapon actions');
assert.doesNotMatch(
    read('js/effects/hunt/HuntMonsterReleasePolicy.js'),
    /Object\.freeze\(\{\s*id:\s*['"][a-z0-9_]+['"]/,
    'reviewed monsters must come from validated MonsterKit data rather than a hand-maintained policy list'
);
assert.doesNotMatch(runtimeLoader, /MonsterData\.js|(?:Wilds|Rise|World|Mhxx|MhxxDb)MonsterBehavior\.generated\.js|WorldShellBehavior\.generated\.js|PublishedMonsterBehavior\.js/,
    'production OBS hunts must not parse the full roster or unreviewed behavior candidates');
assert.doesNotMatch(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /maxHp\s*\*\s*0\.45/, 'monster damage must come from pattern data');
assert.doesNotMatch(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /diablos|black_diablos/i,
    'reusable monster action execution must not branch on reviewed monster identity');
assert.doesNotMatch(read('js/effects/hunt/HuntMonsterAttackAnimator.js'), /diablos|black_diablos/i,
    'shared monster motion geometry and hit reactions must be profile-driven');
assert.doesNotMatch(read('js/effects/hunt/HuntMonsterAnimationCatalog.js'), /diablos|black_diablos/i,
    'shared animation selection must use authored profiles rather than monster IDs');
assert.match(read('js/effects/hunt/HuntMonsterActionPolicy.js'), /resolveTargeting[\s\S]*?phasedFollowUp[\s\S]*?shouldTriggerWhiffReaction|phasedFollowUp[\s\S]*?resolveTargeting[\s\S]*?shouldTriggerWhiffReaction/,
    'shared monster action policy must own phased actions, target geometry, and whiff reactions');
assert.match(read('js/effects/hunt/HuntMonsterArchetypeCatalog.js'), /telegraph[\s\S]*travel[\s\S]*impact[\s\S]*return[\s\S]*recovery/,
    'all monster skeletons must share the telegraph-to-recovery action contract');
assert.doesNotMatch(read('js/effects/hunt/HuntEngine.js'), /crossedKnockdownThresholds\(/,
    'runtime knockdowns must be caused by authored parts, status, traps, or patterns rather than HP bands');
assert.match(read('js/effects/hunt/HuntMonsterRules.js'), /cartRecoveryTicks/,
    'freshly returned hunters must not be targeted immediately');
assert.match(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /Rules\.isHunterTargetable/,
    'monster attacks must route through the shared hunter targetability rule');
assert.doesNotMatch(read('js/effects/hunt/HuntHunterTurnExecutor.js'), /생명의 가루[\s\S]{0,900}MH - Item Found/, 'Lifepowder must not reuse item-acquisition audio');
assert.doesNotMatch(read('js/effects/hunt/HuntHunterTurnExecutor.js'), /타격음_베기|타격음_무겁/, 'weapon actions must use semantic audio cues');
assert.doesNotMatch(read('js/effects/hunt/HuntAudioManager.js'), /Audio Blacklist/, 'hunt hit sounds must not be silently blacklisted');
assert.match(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /actionAllowsEvade/);
assert.match(read('js/effects/hunt/HuntEngine.js'), /actionStateMachine\.canEvade\(w\)/, 'roars must respect action locks too');
assert.match(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /shouldPlayHunterHit\s*&&\s*!becameStunned/,
    'a hit that enters hunter stun must not emit a hunter reaction voice');

console.log('[test] Hunt data-driven architecture boundary contract passed.');
require('./hunt-runtime-lazy-loader.test.js');
