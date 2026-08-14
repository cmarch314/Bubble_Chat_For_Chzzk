'use strict';

const assert = require('assert');
const { createServer } = require('../tools/monster-audio-review-server');

(async () => {
    const server = createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
        const metadata = await fetch(`${origin}/api/monsters`).then(response => response.json());
        assert.strictEqual(metadata.apiVersion, 3);
        assert.strictEqual(metadata.schemaVersion, 3);
        assert.strictEqual(metadata.buildId, 'unified-editor-v3');
        assert.strictEqual(metadata.previewPath, '/preview/?embed=1');
        assert.ok(metadata.capabilities.includes('transactional-save'));

        const shell = await fetch(`${origin}/`).then(response => response.text());
        assert.ok(shell.includes('<script src="/review-app.js"></script>'));
        assert.ok(shell.includes('value="common-part-break"') && shell.includes('value="common-items"'),
            'the source rail must split shared part-break and item/bomb Common groups');
        assert.ok(shell.includes('value="common">COMMON 범용 음향'),
            'the source rail must expose the shared common sound folder explicitly');
        assert.ok(!shell.includes('const state='), 'legacy monkey-patch application must not be served');
        assert.ok(shell.includes('src="/preview/?embed=1"'), 'preview must use the versioned same-origin server');
        assert.ok(shell.includes('id="simulationStart"')
            && shell.includes('id="simulationPause"')
            && shell.includes('id="simulationSpeed"'),
        'the review preview must expose live-combat start, pause and speed controls');

        const liveShell = await fetch(`${origin}/index.html?huntSimulation=1`).then(response => response.text());
        assert.ok(liveShell.includes('js/BubbleChatApp.js') && liveShell.includes('js/main.js'),
            'simulation mode must mount the production BubbleChat application, not a duplicate fixture');

        const app = await fetch(`${origin}/review-app.js`).then(response => response.text());
        assert.ok(app.includes('MonsterAudioReviewState.createEditorSession()'));
        assert.ok(app.includes("previewFrame().src = `/index.html?huntSimulation=1")
            && app.includes('simulationWindow()?.processMessage')
            && app.includes("sendSimulationChat('!참가'")
            && app.includes("sendSimulationChat('!준비'"),
        'live simulation must drive the real chat router through the production index');
        assert.ok(app.includes('simulationRuntime().clock?.setRate?.'),
            'simulation speed must control the shared combat clock');
        const commonGroups = await fetch(`${origin}/api/common-groups`).then(response => response.json());
        assert.ok(Array.isArray(commonGroups.groups), 'the common source endpoint must return a stable group list');
        assert.ok(commonGroups.groups.every(group => group.common === true),
            'COMMON mode must contain only explicitly shared groups');
        assert.ok(commonGroups.groups.some(group => group.commonCategory === 'part-break'
            && group.sources.every(source => source.path.includes('/monster/common/'))),
            'COMMON mode must retain the shared monster/common part-break bank');
        const commonItems = commonGroups.groups.filter(group => String(group.commonCategory || '').startsWith('items-'));
        assert.ok(commonItems.length >= 6, 'COMMON mode must expose the verified item and bomb cue groups');
        assert.ok(commonItems.some(group => group.cue === 'flash_pod')
            && commonItems.some(group => group.cue === 'whetstone_stroke')
            && commonItems.some(group => group.cue === 'barrel_bomb'),
            'item Common groups must include flash, whetstone and clearly-labelled bomb cues');
        assert.ok(commonItems.every(group => group.sources.every(source => !source.path.includes('/monster/common/'))),
            'item Common groups must not be mistaken for monster part-break audio');
        const flashPath = commonItems.find(group => group.cue === 'flash_pod').sources[0].path;
        assert.strictEqual((await fetch(`${origin}/audio?path=${encodeURIComponent(flashPath)}`)).status, 200,
            'verified non-monster Common assets must remain playable through the review server');
        assert.strictEqual((await fetch(`${origin}/audio?path=${encodeURIComponent('local_assets/monster_hunter/world/bgm_build/forbidden.mp3')}`)).status, 404,
            'audio serving must not expand beyond approved world audio roots');
        assert.ok(app.includes('function refreshTimingEditVisuals()'),
            'tick editing must use a lightweight DOM refresh path');
        assert.ok(app.includes('refreshTimingEditVisuals();') && app.includes('syncTimingPreviewAfterPaint();'),
            'tick input must update locally before deferring preview synchronization');
        assert.ok(!/field\.querySelector\('input'\)\.onchange\s*=\s*event\s*=>\s*\{[^}]*renderPatternDesk\(\)/.test(app),
            'tick input must not rebuild the whole editor desk');
        assert.ok(!/renderMotionEditor\s*=\s*function/.test(app));
        assert.ok(!app.includes('markSaved(result.beats)'),
            'storage projection must not be compared with the fully merged effective motion');
        assert.ok(app.includes('motionValuesEqual(beats, verify)'),
            'save verification must reload and compare the final effective motion');
        assert.ok(app.includes('hiddenSourceGroups: new Set()')
            && app.includes('favoriteSourceGroups: new Set()'),
            'group hide and favorite preferences must be first-class persisted editor state');
        assert.ok(app.includes('AUTO_FAVORITE_MAPPED_MONSTERS')
            && app.includes("'rathian', 'rathalos', 'bazelgeuse', 'tigrex', 'barioth', 'legiana'")
            && app.includes('기존 맵핑 자동 즐겨찾기'),
        'previously reviewed Rathian, Rathalos, Bazelgeuse, Tigrex, Barioth, and Legiana routes must surface as automatic source favorites');
        assert.ok(app.includes('sourceGroupIsFavorite(groupKey)')
            && app.includes('app.autoFavoriteSourceGroups = AUTO_FAVORITE_MAPPED_MONSTERS.has(app.huntId)'),
        'automatic mapped favorites must sort with manual favorites without overwriting local reviewer preferences');
        assert.ok(app.includes('toggleSourceGroupHidden(groupKey)')
            && app.includes('toggleSourceGroupFavorite(groupKey)'),
            'every source group header must expose hide and favorite controls');
        assert.ok(shell.includes('.favorite-group.active') && shell.includes('.group-audio-actions'),
            'group controls must remain compact beside the group playback button');
        assert.ok(app.includes('씰룩씰룩 좌우 반전') && app.includes('strideFlipTicks'),
            'the BEAT inspector must expose the runtime stride-flip option instead of requiring raw JSON edits');
        assert.ok(app.includes('data-key="rotation" type="number" value="${value.rotation ?? 0}"')
            && app.includes('data-key="rotateBy" type="number" value="${value.rotateBy ?? 0}"'),
        'unset BEAT rotations must render as editable 0° values rather than ambiguous blank fields');
        assert.ok(app.includes("label: '📣 포효'") && app.includes("label: '〰️ 지진'")
            && app.includes("label: '🌪️ 풍압'"),
            'timeline judgments must distinguish roar, tremor and wind pressure with emoji labels');
        assert.ok(app.includes('pattern.secondaryInterference'),
            'timeline judgments must include secondary interference instead of dropping wind pressure');
        assert.ok(app.includes('Never remount the source rail for route assignment/removal')
            && app.includes('if (activePattern) renderSlotFlow(activePattern);'),
            'audio assignment must patch the selected route without remounting the independent source rail');
        assert.ok(app.includes('sourceVisibilityToggle') && app.includes('linkedFirstToggle')
            && app.includes('sourceMappingIndex()') && app.includes('route-source-link'),
            'the source rail must support hide/show, linked-first sorting and bidirectional route navigation');
        assert.ok(app.includes('details.event-group[open][data-group-key]')
            && app.includes('root.scrollTop = Math.min(previousScrollTop'),
            'necessary source rerenders must preserve expanded groups and scroll position');
        assert.ok(app.includes('bubblechat:source-preferences-request')
            && app.includes('bubblechat:source-preferences-response')
            && app.includes("['17930', '17931', '17947']")
            && app.includes('favoriteGroups: [...new Set'),
            'favorite VO groups must migrate across local review-server ports instead of appearing lost');
        assert.ok(app.includes('대상까지 몸체 각도 맞춤') && app.includes("aimBodyAt: event.target.checked ? 'target' : null"),
            'the editor must distinguish horizontal facing from anatomical body-angle aiming');

        const diablosMap = await fetch(`${origin}/api/hunt-patterns?monster=em007`).then(response => response.json());
        assert.deepStrictEqual(
            ['__reaction.pitfall', '__reaction.stun', '__reaction.paralysis', '__reaction.sleep']
                .filter(id => !diablosMap.patterns.some(pattern => pattern.id === id)),
            [], 'the editor must expose every live trap and incapacitation reaction'
        );
        assert.ok(!diablosMap.patterns.some(pattern => pattern.id === '__reaction.trap'),
            'the editor must not expose a duplicate generic trap reaction beside the pitfall');
        assert.strictEqual(diablosMap.patterns.find(pattern => pattern.id === '__reaction.pitfall').reactionKind,
            'pitfall', 'the sole current trap review slot must be the live pitfall reaction');
        const sleepReaction = diablosMap.patterns.find(pattern => pattern.id === '__reaction.sleep');
        assert.deepStrictEqual(sleepReaction.motion.map(beat => beat.beat),
            ['sleep-enter', 'held', 'wake'],
            'sleep editing must always expose collapse, held sleep, and wake as three distinct beats');
        assert.deepStrictEqual(sleepReaction.slots.map(slot => slot.slot),
            ['beat:sleep-enter', 'beat:held', 'beat:wake'],
            'all three sleep beats must remain independently sound-mappable');
        assert.ok(!app.includes('const savedSleepBeats ='),
            'the client must consume the server BEAT contract instead of maintaining a second sleep topology');
        assert.ok(app.includes('const activePattern = selectedPattern();')
            && app.includes('if (activePattern) renderSlotFlow(activePattern);'),
        'shared reaction audio reloads must render the newly loaded pattern object instead of a stale pre-save reference');
        assert.ok(app.includes("pattern.id === '__reaction.sleep' && beat.id === 'held'")
            && app.includes('index * 30') && app.includes('offset < beat.ticks'),
        'sleep preview must replay the held sound every 30 ticks (3 seconds) without spilling into wake');
        const breakLayer = diablosMap.patterns.find(pattern => pattern.id === '__visual.part-break');
        assert.deepStrictEqual(breakLayer.slots.map(slot => slot.slot), ['beat:se'],
            'part-break split-image playback must own one universal SE without monster VO');
        assert.ok(!diablosMap.patterns.some(pattern => pattern.id.startsWith('__part.')),
            'the editor must not require repetitive per-part audio mapping');
        assert.deepStrictEqual(Object.fromEntries(diablosMap.partReactions.map(item => [item.partKind, item.profile])), {
            'left-horn': 'flinch', 'right-horn': 'flinch', back: 'flinch',
            'left-front-leg': 'knockdown', 'right-front-leg': 'knockdown', tail: 'tail'
        }, 'one dedicated mapping must connect each breakable anatomy part to its shared BEAT reaction');
        const tailVolley = diablosMap.patterns.find(pattern => pattern.id === 'diablos.tail_slam_rock');
        assert.strictEqual(tailVolley.maxTargets, 3);
        assert.deepStrictEqual(tailVolley.targeting,
            { mode: 'independent-passes', passCount: 3, distinctPasses: true });
        assert.deepStrictEqual(tailVolley.projectileEventKinds, ['diablos-rock-volley']);
        assert.deepStrictEqual(tailVolley.impactTimeline.map(event => event.atTicks), [26]);
        const burrow = diablosMap.patterns.find(pattern => pattern.id === 'diablos.burrow_enter');
        assert.deepStrictEqual(burrow.interference,
            { kind: 'tremor', size: 'large', directHitSupersedes: false });
        assert.strictEqual(burrow.secondaryInterference, null,
            'Diablos digging dust must not survive as a legacy wind-pressure route');

        const rathianCandidate = await fetch(`${origin}/api/hunt-patterns?monster=rathian&candidate=rathian`)
            .then(response => response.json());
        assert.strictEqual(rathianCandidate.patterns.filter(pattern => !pattern.id.startsWith('__')).length, 13,
            'candidate editing must expose the same complete native BEAT kit used by its preview');
        const candidateFireball = rathianCandidate.patterns.find(pattern => pattern.id === 'rathian.fireball');
        assert.ok(candidateFireball.slots.find(slot => slot.slot === 'beat:look')?.assigned,
            'a rebuilt candidate must inherit the prior reviewed fireball windup route');
        assert.ok(candidateFireball.slots.find(slot => slot.slot === 'beat:spit')?.assigned,
            'a rebuilt candidate must inherit the prior reviewed fireball contact route');

        const preview = await fetch(`${origin}/preview/?embed=1`).then(response => response.text());
        assert.ok(preview.includes('hunt-monster-pattern-lab-audio.js'));
        assert.ok(preview.includes('function playRuntimeReaction(pattern)')
            && preview.includes('HuntMonsterAnatomyCatalog.breakReaction'),
            'reaction and part-break previews must call the same runtime owners as a live hunt');
        const runtimeScript = await fetch(`${origin}/js/effects/hunt/HuntMotionCompiler.js`);
        assert.strictEqual(runtimeScript.status, 200, 'preview must load the production compiler from the same server');
        const animatorScript = await fetch(`${origin}/js/effects/hunt/HuntMonsterAttackAnimator.js`)
            .then(response => response.text());
        assert.ok(animatorScript.includes('if (!pattern?.runtimePreviewScrub) for (const cue of built.visualCues || [])')
            && animatorScript.includes('if (pattern?.runtimePreviewScrub) return;'),
            'pattern selection/scrubbing must render a still frame without firing combat spectacle');

        const invalidAnatomy = await fetch(`${origin}/api/hunt-monster-anatomy`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monsterId: 'barioth', geometry: {} })
        });
        assert.strictEqual(invalidAnatomy.status, 400, 'new save endpoints must exist on the versioned server');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
    console.log('[test] unified monster audio editor integration passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
