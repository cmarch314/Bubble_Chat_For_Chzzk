const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rendererPath = path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js');
const rendererSource = fs.readFileSync(rendererPath, 'utf8');
const context = vm.createContext({ console, window: {} });
const monsterAttackAnimatorPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js');
const monsterAttackAnimatorSource = fs.readFileSync(monsterAttackAnimatorPath, 'utf8');
const monsterAnimationCatalogPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const animatorPath = path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js');
const notificationPath = path.resolve(__dirname, '../js/effects/hunt/HuntNotificationRenderer.js');
vm.runInContext(fs.readFileSync(monsterAnimationCatalogPath, 'utf8'), context, { filename: monsterAnimationCatalogPath });
vm.runInContext(monsterAttackAnimatorSource, context, { filename: monsterAttackAnimatorPath });
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

{
    const removedTransient = [];
    const transientNodes = ['cart', 'emotion', 'stun'].map(name => ({
        remove() { removedTransient.push(name); }
    }));
    let transientSelector = '';
    renderer.container = {
        querySelectorAll(selector) {
            transientSelector = selector;
            return transientNodes;
        }
    };
    renderer.card = {
        querySelectorAll() { return []; },
        classList: { remove() {} }
    };
    renderer.clearCombatTransientVisuals();
    assert.deepStrictEqual(removedTransient, ['cart', 'emotion', 'stun']);
    assert.match(transientSelector, /\.game-hunt-cart-container/);
    assert.match(transientSelector, /\.victory-emoji-bubble/);
    assert.match(transientSelector, /\.hunter-stun-orbit/);
}

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
assert.strictEqual(animationClearCount, 2,
    'explicit phase cleanup and final container removal must each release their animation timers');
assert.strictEqual(removed, oldContainer);
assert.strictEqual(renderer.container, null);
assert.strictEqual(renderer.card, null);
assert.ok(renderer.combatAnimator, 'combat animator must be composed by HuntRenderer');
assert.ok(renderer.notifications, 'notification renderer must be composed by HuntRenderer');
assert.match(rendererSource, /this\.combatAnimator = new HuntCombatAnimator\(this\)/);
assert.match(rendererSource, /this\.notifications = new HuntNotificationRenderer\(this\)/);
assert.match(rendererSource, /renderFight\(data\)[\s\S]*?this\.selectedMonster = selectedMonster/,
    'the production renderer must expose the live monster to anatomy-driven facing and effect origins');
assert.match(rendererSource, /class="hunt-monster-attack-motion"/,
    'large-monster attack transforms must run on a wrapper isolated from image status effects');
assert.match(rendererSource, /class="hunt-monster-attack-motion is-small-monster"/,
    'small-monster attack transforms must use the same isolated ownership');
assert.match(rendererSource, /clearMonsterAnimations\('renderer-clear'\)/,
    'phase changes must explicitly release the active monster motion before clearing its timer');
assert.doesNotMatch(rendererSource, /className = 'monster-attack-effect'/);
assert.doesNotMatch(rendererSource, /className = 'combat-chat-bubble'/);
assert.match(fs.readFileSync(animatorPath, 'utf8'), /return this\.monsterAttackAnimator\.triggerMonsterAttack/);
assert.doesNotMatch(fs.readFileSync(animatorPath, 'utf8'), /cleanName\.includes\('돌진'\)/);
assert.match(monsterAttackAnimatorSource, /getElementalTheme\(attackName/,
    'monster elemental visuals must derive a real element theme from the attack name');
assert.match(monsterAttackAnimatorSource, /HuntMonsterAnimationCatalog/, 'every monster pattern must resolve through the shared motion catalog');
assert.match(monsterAttackAnimatorSource, /Math\.atan2\(dy, dx\)/,
    'directional breath effects must aim from the monster toward the selected hunter');
assert.match(monsterAttackAnimatorSource, /target\.result === 'dodge'/,
    'elemental visuals must preserve the visible pass-through behavior of a dodge');
assert.doesNotMatch(monsterAttackAnimatorSource, /className = 'elemental-projectile'/,
    'the retired single-emoji elemental projectile must not return');

const effectPath = path.resolve(__dirname, '../js/effects/HuntEffect.js');
const effectSource = fs.readFileSync(effectPath, 'utf8');
assert.match(
    effectSource,
    /startFight\(container\)\s*\{\s*this\.renderer\.clearLobbyTimer\(\);/,
    'fight startup must stop the lobby timer loop before changing phases'
);
assert.match(effectSource, /let timeLeft = this\.journeyVote \? HuntJourneyVoteRuntime\.VOTE_DURATION_SECONDS : 30;/,
    'ordinary quest-board recruitment must remain 30 seconds while journey votes receive their own timer');
assert.match(effectSource, /registration\.count >= 4/, 'four unique entrants must advance immediately');
assert.match(effectSource, /beginLoadout\(\)\s*\{\s*if \(this\.phase !== 'quest_board'\) return;/, 'loadout handover must be idempotent');
assert.match(effectSource, /if \(hunter && ready\)[\s\S]*?hunter\.loadoutReady = true[\s\S]*?departWhenLoadoutReady\(\)/,
    'a participant ready command must lock that hunter and check immediate departure');
assert.match(effectSource, /if \(hunter && ready\)[\s\S]*?hunter\.loadoutReady = true[\s\S]*?playReadyConfirmationVoice\(hunter\)[\s\S]*?departWhenLoadoutReady\(\)/,
    'the first ready confirmation must play that fixed hunter voice before departure');
assert.match(effectSource, /if \(hunter\.loadoutReady\)[\s\S]*?🔒 준비됨/,
    'ready hunters must reject later weapon and personality mutations');
assert.match(effectSource, /parsePerkReroll\(msg\)[\s\S]*?if \(hunter\.loadoutReady\)[\s\S]*?🔒 준비됨[\s\S]*?rerollCount >= 2[\s\S]*?🎲 2\/2 완료[\s\S]*?rerollHunterPerks\(hunter\)[\s\S]*?perkRerollCount = rerollCount \+ 1/,
    'each participant must receive two perk rerolls before ready-locking');
assert.match(effectSource, /parsePerkLock\(msg\)[\s\S]*?hunter\.lockedPerkId[\s\S]*?selectedPerk[\s\S]*?hunter\.perks = \[selectedPerk/,
    'participants must be able to lock one numbered perk and move it first');
assert.match(effectSource, /parsePerkUnlock\(msg\)[\s\S]*?selectedPerk\.id !== hunter\.lockedPerkId[\s\S]*?hunter\.lockedPerkId = null[\s\S]*?scheduleSave\(hunter\)/,
    'only explicit !해제 with the locked perk number may clear and persist a perk lock');
assert.match(effectSource, /materializeBattleStartPerks\(this\.selectedWeapons\)[\s\S]*?renderFight\([\s\S]*?saveNow\(hunter\)[\s\S]*?💩🌈 퍽 발현/,
    'an empty loadout jackpot must reveal and immediately persist the bound emoji perk at combat start');
assert.match(effectSource, /let weaponReplaced = false;[\s\S]*?weaponReplaced = this\.initializer\.replaceHunterWeapon\(hunter, weaponId\)[\s\S]*?const weaponChanged = weaponReplaced;[\s\S]*?const personalityChanged = hunter\.personality !== previousPersonality;[\s\S]*?if \(weaponChanged \|\| personalityChanged\)[\s\S]*?playLoadoutConfirmationVoice\(hunter/,
    'an accepted loadout mutation must trigger one hunter confirmation line for refreshed weapon data or a changed personality');
const loadoutMutationVoiceBlock = effectSource.match(/let weaponReplaced = false;[\s\S]*?return true;/)?.[0] || '';
assert.strictEqual((loadoutMutationVoiceBlock.match(/playLoadoutConfirmationVoice\(hunter/g) || []).length, 1,
    'a combined weapon and personality command must not duplicate its confirmation voice');
assert.match(loadoutMutationVoiceBlock, /const weaponChanged = weaponReplaced/,
    're-selecting the same weapon kind must still highlight its newly rolled weapon instance');
assert.match(loadoutMutationVoiceBlock, /highlightLoadoutChanges\(hunter\.index,[\s\S]*?weaponChanged[\s\S]*?personalityChanged/,
    'accepted loadout mutations must highlight only the changed weapon and personality fields');
assert.doesNotMatch(loadoutMutationVoiceBlock, /spawnCombatChatBubble/,
    'accepted loadout mutations must not cover the card with a redundant confirmation bubble');
assert.match(rendererSource, /highlightLoadoutChanges\(hunterIndex,[\s\S]*?hunt-loadout-weapon-icon[\s\S]*?hunt-loadout-weapon-name[\s\S]*?hunt-loadout-personality[\s\S]*?hunt-loadout-change-flash/,
    'the renderer must pulse the changed weapon and personality fields instead of the whole hunter card');
assert.match(effectSource, /departWhenLoadoutReady\(\)[\s\S]*?every\(hunter => Boolean\(hunter\.loadoutReady\)\)[\s\S]*?startFight/,
    'the party must depart immediately when every selected hunter is ready');
assert.match(effectSource, /startFight\(container\)\s*\{\s*this\.renderer\.clearLobbyTimer\(\);\s*if \(this\.phase !== 'loadout'\) return;/,
    'immediate departure and timer expiry must not start combat twice');
assert.match(effectSource, /renderLoadout\([\s\S]*?timeLeft: 60[\s\S]*?let timeLeft = 60;/, 'loadout must last one minute');
assert.match(
    effectSource,
    /beginLoadout\(\)[\s\S]*?playMHAudioFile\('Unified_SFX\/MH - Open Chest\.mp3'\)/,
    'supply-box SFX must play when recruitment hands over to loadout'
);
const resultPresenterSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntResultPresenter.js'), 'utf8');
assert.match(
    resultPresenterSource,
    /clearCombatTransientVisuals\(\);\s*effect\.clearAllTimers\(\);/,
    'result handoff must remove timer-owned combat emoji before cancelling their cleanup callbacks'
);
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
