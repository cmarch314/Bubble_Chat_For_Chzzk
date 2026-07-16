const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const index = read('index.html');
const position = resource => {
    const found = index.indexOf(resource);
    assert.ok(found >= 0, `${resource} must be loaded by index.html`);
    return found;
};

assert.ok(position('HuntData.js') < position('HuntWeaponCatalog.js'));
assert.ok(position('HuntWeaponCatalog.js') < position('HuntWeaponActionSelector.js'));
assert.ok(position('HuntActionStateMachine.js') < position('HuntEngine.js'));
assert.ok(position('HuntBgmCatalog.js') < position('HuntBgmResolver.js'));
assert.ok(position('HuntBgmResolver.js') < position('HuntAudioManager.js'));
assert.ok(position('HuntMonsterProfiles.js') < position('HuntMonsterPatternCatalog.js'));
assert.ok(position('HuntMonsterPatternCatalog.js') < position('HuntInitializer.js'));
assert.ok(position('HuntChatTactics.js') < position('HuntEffect.js'));

assert.doesNotMatch(read('js/effects/MonsterData.js'), /window\.HUNT_COMBO_LIST\s*=/, 'MonsterData must not overwrite live weapon actions');
assert.doesNotMatch(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /maxHp\s*\*\s*0\.45/, 'monster damage must come from pattern data');
assert.doesNotMatch(read('js/effects/hunt/HuntHunterTurnExecutor.js'), /타격음_베기|타격음_무겁/, 'weapon actions must use semantic audio cues');
assert.doesNotMatch(read('js/effects/hunt/HuntAudioManager.js'), /Audio Blacklist/, 'hunt hit sounds must not be silently blacklisted');
assert.match(read('js/effects/hunt/HuntMonsterTurnExecutor.js'), /actionAllowsEvade/);
assert.match(read('js/effects/hunt/HuntEngine.js'), /actionStateMachine\.canEvade\(w\)/, 'roars must respect action locks too');

console.log('[test] Hunt data-driven architecture boundary contract passed.');
