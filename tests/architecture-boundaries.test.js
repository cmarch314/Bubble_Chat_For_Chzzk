const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

function assertLoadedBefore(dependency, consumer) {
    const dependencyIndex = index.indexOf(dependency);
    const consumerIndex = index.indexOf(consumer);
    assert.ok(dependencyIndex >= 0, `${dependency} must be loaded`);
    assert.ok(consumerIndex >= 0, `${consumer} must be loaded`);
    assert.ok(dependencyIndex < consumerIndex, `${dependency} must load before ${consumer}`);
}

assertLoadedBefore('js/audio/AudioCommandMatcher.js', 'js/AudioManager.js');
assertLoadedBefore('js/audio/AudioMediaStager.js', 'js/AudioManager.js');
assertLoadedBefore('js/audio/AudioPlaybackEngine.js', 'js/AudioManager.js');
assertLoadedBefore('js/chat/ChatMediaBubbleController.js', 'js/ChatRenderer.js');
assertLoadedBefore('js/chat/ChatSpecialBubbleCommand.js', 'js/ChatRenderer.js');
assertLoadedBefore('js/effects/hunt/HuntMonsterAttackAnimator.js', 'js/effects/hunt/HuntCombatAnimator.js');
assertLoadedBefore('js/effects/hunt/HuntWeaponAnimationCatalog.js', 'js/effects/hunt/HuntCombatAnimator.js');

const jsRoot = path.join(root, 'js');
const productFiles = [];
const stack = [jsRoot];
while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const absolute = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(absolute);
        else if (entry.name.endsWith('.js') && entry.name !== 'audio-levels.generated.js') productFiles.push(absolute);
    }
}

const directAudioCreators = productFiles.filter(file => /\bnew Audio\s*\(/.test(fs.readFileSync(file, 'utf8')));
assert.deepStrictEqual(
    directAudioCreators.map(file => path.relative(root, file).replaceAll('\\', '/')),
    ['js/audio/AudioMediaStager.js']
);
const mediaSourceCreators = productFiles.filter(file => /createMediaElementSource\s*\(/.test(fs.readFileSync(file, 'utf8')));
assert.deepStrictEqual(
    mediaSourceCreators.map(file => path.relative(root, file).replaceAll('\\', '/')),
    ['js/audio/AudioMediaStager.js']
);

assert.doesNotMatch(read('js/AudioManager.js'), /createBufferSource\s*\(|decodeAudioData\s*\(/);
assert.doesNotMatch(read('js/ChatRenderer.js'), /document\.createElement\('video'\)|_activeVideoCount/);
assert.doesNotMatch(read('js/effects/hunt/HuntCombatAnimator.js'), /cleanName\.includes\('돌진'\)/);
assert.doesNotMatch(read('js/effects/hunt/HuntCombatAnimator.js'), /includes\('진액 추출'\)|\/포격\|용격/);
assert.doesNotMatch(read('js/ChzzkGateway.js'), /location\.reload\s*\(/);
assert.doesNotMatch(read('RENEWAL_REPORT.md'), /방송 전 `START_OBS_OVERLAY\.bat` 실행을 기본 운영 절차/);

console.log('[test] Final architecture boundary contract passed.');
