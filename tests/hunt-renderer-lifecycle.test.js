const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rendererPath = path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js');
const rendererSource = fs.readFileSync(rendererPath, 'utf8');
const context = vm.createContext({ console, window: {} });
const monsterAttackAnimatorPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js');
const animatorPath = path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js');
const notificationPath = path.resolve(__dirname, '../js/effects/hunt/HuntNotificationRenderer.js');
vm.runInContext(fs.readFileSync(monsterAttackAnimatorPath, 'utf8'), context, { filename: monsterAttackAnimatorPath });
vm.runInContext(fs.readFileSync(animatorPath, 'utf8'), context, { filename: animatorPath });
vm.runInContext(fs.readFileSync(notificationPath, 'utf8'), context, { filename: notificationPath });
vm.runInContext(`${rendererSource}\nglobalThis.HuntRenderer = HuntRenderer;`, context, {
    filename: rendererPath
});

let clearCount = 0;
const lobbyTimers = {
    clearAll() {
        clearCount++;
    }
};
let animationClearCount = 0;
const animationTimers = {
    clearAll() { animationClearCount++; }
};
const renderer = new context.HuntRenderer({ lobbyTimers, animationTimers });
renderer.lobbyTimer = 17;
renderer.lobbyTimeouts = [18, 19];
renderer.clearLobbyTimer();

assert.strictEqual(clearCount, 1);
assert.strictEqual(renderer.lobbyTimer, null);
assert.deepStrictEqual(Array.from(renderer.lobbyTimeouts), []);

let removed = null;
renderer.container = {
    parentNode: {
        removeChild(node) {
            removed = node;
        }
    }
};
renderer.card = {};
const oldContainer = renderer.container;
renderer.removeContainer();

assert.strictEqual(clearCount, 2);
assert.strictEqual(animationClearCount, 1);
assert.strictEqual(removed, oldContainer);
assert.strictEqual(renderer.container, null);
assert.strictEqual(renderer.card, null);
assert.ok(renderer.combatAnimator, 'combat animator must be composed by HuntRenderer');
assert.ok(renderer.notifications, 'notification renderer must be composed by HuntRenderer');
assert.match(rendererSource, /this\.combatAnimator = new HuntCombatAnimator\(this\)/);
assert.match(rendererSource, /this\.notifications = new HuntNotificationRenderer\(this\)/);
assert.doesNotMatch(rendererSource, /className = 'monster-attack-effect'/);
assert.doesNotMatch(rendererSource, /className = 'combat-chat-bubble'/);
assert.match(fs.readFileSync(animatorPath, 'utf8'), /return this\.monsterAttackAnimator\.triggerMonsterAttack/);
assert.doesNotMatch(fs.readFileSync(animatorPath, 'utf8'), /cleanName\.includes\('돌진'\)/);

const effectPath = path.resolve(__dirname, '../js/effects/HuntEffect.js');
const effectSource = fs.readFileSync(effectPath, 'utf8');
assert.match(
    effectSource,
    /startFight\(container\)\s*\{\s*this\.renderer\.clearLobbyTimer\(\);/,
    'fight startup must stop the lobby timer loop before changing phases'
);
assert.match(effectSource, /let timeLeft = 30;/, 'quest-board recruitment must last 30 seconds');
assert.match(effectSource, /registration\.count >= 4/, 'four unique entrants must advance immediately');
assert.match(effectSource, /beginLoadout\(\)\s*\{\s*if \(this\.phase !== 'quest_board'\) return;/, 'loadout handover must be idempotent');
assert.match(effectSource, /renderLoadout\([\s\S]*?timeLeft: 60[\s\S]*?let timeLeft = 60;/, 'loadout must last one minute');
assert.match(
    effectSource,
    /beginLoadout\(\)[\s\S]*?playMHAudioFile\('Unified_SFX\/MH - Open Chest\.mp3'\)/,
    'supply-box SFX must play when recruitment hands over to loadout'
);
const resultPresenterSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntResultPresenter.js'), 'utf8');
assert.doesNotMatch(resultPresenterSource, /⚔️ 생존/, 'results must not display a survivor status label');
assert.match(resultPresenterSource, /if \(tag\) tag\.remove\(\);/, 'survivor status tag must be removed on victory');
assert.match(resultPresenterSource, /hunterStaggerMs:\s*2400/, 'carving hunter stagger must run at half speed');
assert.match(resultPresenterSource, /stepMs:\s*4000/, 'carving steps must run at half speed');
assert.match(resultPresenterSource, /soundCooldownMs:\s*1400/, 'carving item sounds must be rate-limited');
assert.doesNotMatch(
    effectSource,
    /clearTimeout\(|clearInterval\(/,
    'HuntEffect must release timers only through its ManagedTimers owner'
);

console.log('[test] HuntRenderer lobby timer lifecycle contract passed.');
