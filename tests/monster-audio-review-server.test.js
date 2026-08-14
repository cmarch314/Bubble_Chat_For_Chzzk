'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    CATEGORY_CATALOG,
    EXCLUDED_REVIEW_GRAPH_IDS,
    PRESETS,
    categoryForMonster,
    evidenceScope,
    groupEvents,
    normalizeStoredLabels,
    normalizeTags,
    orderedSources,
    reviewStatusForGraphId,
    saveReviewCompletion,
    saveGroupReview,
    validatePatternRouteInput,
    validatePatternMotionInput
} = require('../tools/monster-audio-review-server');

const reviewUi = [
    'monster-audio-review.html', 'monster-audio-review-app.js', 'monster-audio-review-state.js'
].map(file => fs.readFileSync(path.join(__dirname, '..', 'tools', file), 'utf8')).join('\n');
assert.match(reviewUi, /id="monsterCategories"/,
    'large monster rosters must navigate by taxonomy before choosing a monster');
assert.doesNotMatch(reviewUi, /id="monsterSearch"/,
    'the primary monster route must not require typing into a search field');
assert.match(reviewUi, /class="monster-picker-body"/,
    'monster selection must use a two-pane species then monster route');
assert.match(reviewUi, /id="monsterRosterTitle"/,
    'the roster must identify the active species and alphabetical ordering');
assert.match(reviewUi, /localeCompare\(b\.name, 'ko'/,
    'monsters within each species must be ordered by Korean name');
assert.match(reviewUi, /id="monsterStatuses"/,
    'pending and completed reviews must remain independently filterable');
assert.match(reviewUi, /\.app-header\{position:relative;z-index:1000;isolation:isolate\}/,
    'the roster header must own a top-level stacking context above the combat preview');
assert.match(reviewUi, /\.monster-picker-panel\{z-index:1200\}/,
    'the expanded monster picker must remain the highest review-page layer');
assert.doesNotMatch(reviewUi, /<select id="monster"/,
    'the review UI must not put the full roster into one native dropdown');
assert.match(reviewUi, /class="anchor-map visual-anchor-map"/,
    'motion positions must use a visual anchor map instead of another large dropdown');
assert.match(reviewUi, /className = 'timeline-slider'/,
    'the timeline must expose a native draggable scrubber in addition to beat clicks');
assert.match(reviewUi, /function startPlaybackProgress/,
    'real preview playback must drive the shared timeline cursor');
assert.match(reviewUi, /function updatePlaybackCursor\(tick, durationTicks\)/,
    'playback must update its cursor without rebuilding editor state every animation frame');
assert.match(reviewUi, /app\.playbackFrame = requestAnimationFrame\(frame\)/,
    'preview progress must follow the browser paint clock instead of a competing interval');
assert.doesNotMatch(reviewUi, /app\.session\.seek\(app\.playbackDurationTicks \* ratio\)/,
    'autonomous playback must not deep-project the complete editor session on every frame');
assert.match(reviewUi, /beat\.id !== app\.playbackBeatId[\s\S]*app\.session\.seek/,
    'editor selection may synchronize only when playback crosses a BEAT boundary');
assert.match(reviewUi, /MonsterAudioReviewState\.buildPreviewMotion/,
    'the editor must preserve legacy CSS motion instead of compiling ticks-only no-op motion');
assert.match(reviewUi, /refreshSourceSelection\(\)/,
    'timeline and pattern selection must not rebuild the complete audio candidate DOM');
assert.match(reviewUi, /between:1,2/,
    'the visual anchor map must expose positions between adjacent hunters');
assert.match(reviewUi, /left:target 180/);
assert.match(reviewUi, /right:target 180/);
assert.match(reviewUi, /data-anchor-key="face"/,
    'each motion beat must expose its image-facing/mirroring anchor');
assert.match(reviewUi, /이미지 좌우 방향/);
assert.match(reviewUi, /above:target 180/);
assert.match(reviewUi, /below:target 180/,
    'the visual anchor map must expose all four cardinal target approaches');
assert.match(reviewUi, /polar:target 315deg 180/,
    'diagonal target approaches must remain directly selectable');
assert.match(reviewUi, /const EDITABLE_MOTION_FIELDS\s*=/,
    'the editor must declare the complete runtime-editable motion contract');
assert.match(reviewUi, /MonsterAudioReviewState\.createEditorSession\(\)/,
    'one editor session must own timeline, selection, scrub, history and save state');
assert.match(reviewUi, /animationDurationMs: snapshot\.timeline\.durationTicks \* 100/,
    'the preview animation and timeline must consume the same projected duration');
assert.match(reviewUi, /motionValuesEqual\(beats, verify\)/,
    'saving must compare every editable transform against a freshly reloaded runtime projection, not ticks alone');
assert.match(reviewUi, /assertGeneratedAudioRoute\(result\)/,
    'audio assignments must fail visibly when their runtime route module was not generated');
assert.match(reviewUi, /metadata\.apiVersion !== 3.*metadata\.buildId !== 'unified-editor-v3'/s,
    'a stale server must be rejected instead of mixing old APIs with the new editor');
assert.match(reviewUi, /data-view="runtime"/);
assert.match(reviewUi, /data-view="design"/,
    'the editor must separate production runtime playback from forced design scenarios');
assert.match(reviewUi, /forcedImpactTargets/,
    'design scenarios must author per-impact target combinations');
assert.match(reviewUi, /bubblechat:pattern-preview-edit/,
    'preview gizmo edits must synchronize back into the selected BEAT draft');
assert.match(reviewUi, /timeline-docked/,
    'the motion timeline must replace the old fixed audio-information footer');
assert.match(reviewUi, /--audio-progress/,
    'audio preview buttons must render their own clock-style playback progress');
assert.match(reviewUi, /audio\.ontimeupdate/,
    'button progress must be driven by the real decoded audio duration');
assert.match(reviewUi, /data-preset="smallFlinch">소경직</);
assert.match(reviewUi, /data-preset="knockdown">대경직</);
assert.match(reviewUi, /data-preset="death">죽음</,
    'non-pattern reaction vocals must remain directly classifiable');
assert.doesNotMatch(reviewUi, /data-preset="(?:roar|breath|physical)">/,
    'roar, breath and physical cues belong to pattern BEAT mapping, not legacy classification buttons');
assert.match(reviewUi, /sourceIds,\s*category: preset/,
    'reaction mapping must send the source IDs and semantic category required by the server contract');
assert.match(reviewUi, /result\.runtime\?\.outputPath/,
    'reaction mapping must reject a save that did not regenerate the runtime route module');
assert.match(reviewUi, /classList\.toggle\('selected', Boolean\(active\)\)/,
    'the current reaction assignment must remain visibly selected after rerender');
assert.match(reviewUi, /bubblechat:pattern-preview-settings/,
    'target and state controls must update preview settings without replaying the pattern');
assert.match(reviewUi, /function syncPreviewSettings\(\).*selectedBeatId/s,
    'settings-only updates must preserve the selected BEAT required by direct manipulation');
assert.doesNotMatch(reviewUi, /renderScenario\(\);playCurrentPreview\(\)/,
    'scenario controls must never restart animation as a side effect');
assert.match(reviewUi, /class EditorSession/,
    'motion editing must provide reversible pattern-local history through the state owner');
assert.match(reviewUi, /undo-motion/);
assert.match(reviewUi, /redo-motion/);
assert.match(reviewUi, /header-edit-actions[\s\S]*recent-save|header-edit-actions[\s\S]*최근 저장/,
    'save, history and recent-save reset controls must remain in the always-visible header');
assert.doesNotMatch(reviewUi, /class="preview-motion"/,
    'pattern playback owns preview, so the redundant preview button must not return');
assert.match(reviewUi, /event\.key\.toLowerCase\(\)/,
    'undo and redo must expose standard keyboard shortcuts');
assert.match(reviewUi, /previewFrame\(\)\.src = metadata\.previewPath/,
    'the preview endpoint must come from the same versioned server contract');
assert.match(reviewUi, /정밀 좌표/,
    'the full anchor DSL must remain available without cluttering primary controls');

assert.strictEqual(categoryForMonster({ id: 'jagras', tier: 'small', species: 'Fanged Wyvern' }), 'small');
assert.strictEqual(categoryForMonster({ id: 'barioth', tier: 'large', species: 'Flying Wyvern' }), 'primitive-wyvern');
assert.strictEqual(categoryForMonster({ id: 'anjanath', tier: 'large', species: 'Brute Wyvern' }), 'brute-wyvern');
assert.strictEqual(categoryForMonster({ id: 'zorah_magdaros', tier: 'colossal', species: 'Elder Dragon' }), 'colossal');
assert.strictEqual(categoryForMonster({ id: 'unknown', tier: 'large', species: 'Unclassified' }), 'other');
assert.strictEqual(categoryForMonster({ id: 'leshen', tier: 'large', species: 'Relict' }), 'relict');
assert.strictEqual(categoryForMonster({ id: 'aptonoth', tier: 'large', species: 'Herbivore' }), 'herbivore');
assert.strictEqual(categoryForMonster({ id: 'barnos', tier: 'large', species: 'Wingdrake' }), 'wingdrake');
assert.strictEqual(categoryForMonster({ id: 'gore_magala', tier: 'large', species: '???' }), 'unknown-species');
assert.ok(EXCLUDED_REVIEW_GRAPH_IDS.has('em127'),
    'Leshen crossover audio stays archived but is absent from the review roster');
assert.strictEqual(CATEGORY_CATALOG.find(category => category.id === 'brute-wyvern').icon, '🦖');
assert.strictEqual(CATEGORY_CATALOG.find(category => category.id === 'primitive-wyvern').icon, '🦇');
assert.ok(['small', 'primitive-wyvern', 'flying-wyvern', 'fanged-wyvern', 'brute-wyvern',
    'fanged-beast', 'amphibian', 'elder-dragon', 'bird-wyvern', 'cephalopod',
    'piscine-wyvern', 'leviathan', 'carapaceon', 'temnoceran', 'neopteron',
    'snake-wyvern', 'relict', 'herbivore', 'wingdrake', 'fish', 'construct',
    'machine', 'unknown-species', 'colossal']
    .every(id => CATEGORY_CATALOG.some(category => category.id === id)),
    'the requested review buckets must remain present in the extensible category catalog');

const event = {
    chunk: 'chunkG0',
    bank: 'em001_vo',
    eventId: 123,
    structures: ['random', 'layer'],
    sourceIds: [10, 11, 12],
    variants: [{
        variant: 'event-a',
        structure: ['random'],
        decodedClips: [
            { sourceId: 10, stream: 1, path: 'local_assets/monster_hunter/world/monster/em001/a.mp3' },
            { sourceId: 11, stream: 2, path: 'local_assets/monster_hunter/world/monster/em001/b.mp3' }
        ]
    }]
};
const aliases = [{
    chunk: 'chunkG0',
    bank: 'em001_vo',
    sourceId: 12,
    canonicalPath: 'local_assets/monster_hunter/world/monster/em001/c.mp3'
}];

assert.deepStrictEqual(orderedSources(event, aliases).map(source => source.sourceId), [10, 11, 12]);
assert.deepStrictEqual(normalizeTags('roar'), ['monster_roar']);
assert.deepStrictEqual(normalizeTags('wingFlap'), ['wing_flap']);
assert.deepStrictEqual(normalizeTags('custom', '날개짓, 브레스적중'), ['wing_flap', 'breath_impact']);
assert.deepStrictEqual(normalizeTags('custom', 'bite_vocal, attack_vocal, bite_vocal'), ['bite_vocal', 'attack_vocal']);
assert.strictEqual(PRESETS.physical.label, '물리공격');
assert.deepStrictEqual(evidenceScope('em024_se'), {
    sourceLayer: 'sound-effect',
    reuseScope: 'cross-title-semantic'
});
assert.deepStrictEqual(evidenceScope('em024_vo'), {
    sourceLayer: 'voice',
    reuseScope: 'monster-identity'
});

const validatedBeatRoute = validatePatternRouteInput({
    huntId: 'BARIOTH', patternId: 'barioth.roar', slot: 'beat:roar', mode: 'single'
});
assert.strictEqual(validatedBeatRoute.huntId, 'barioth');
assert.throws(() => validatePatternRouteInput({
    huntId: 'barioth', patternId: 'barioth.roar', slot: 'telegraph'
}), /slot|사운드|구형/i, 'the server must reject legacy phase slots');
assert.throws(() => validatePatternRouteInput({
    huntId: 'barioth', patternId: 'barioth.roar', slot: 'beat:not-authored'
}), /slot|사운드|모션/i, 'the server must reject beat ids absent from the motion timeline');
assert.doesNotThrow(() => validatePatternMotionInput({
    huntId: 'barioth', patternId: 'barioth.roar', beats: {
        brace: { ticks: 6 }, roar: { ticks: 10 }, settle: { ticks: 8 }
    }
}));
assert.throws(() => validatePatternMotionInput({
    huntId: 'barioth', patternId: 'barioth.roar', beats: { invented: { ticks: 10 } }
}), /BEAT/i, 'motion saves must reject missing and unknown beat ids atomically');
assert.strictEqual(reviewStatusForGraphId('em011', {
    completedMonsterIds: ['kirin']
}, { em011_vo: ['kirin'] }), 'completed');
assert.strictEqual(reviewStatusForGraphId('em023', {
    silentVoiceMonsterIds: ['rajang']
}, { em023_vo: ['rajang'] }), 'silent-voice');

const grouped = groupEvents({
    events: [event],
    deduplication: { aliases }
}, {
    records: [
        { bank: 'em001_vo', eventId: 123, sourceId: 10, tags: ['monster_roar'] },
        { bank: 'em001_vo', eventId: 123, sourceId: 11, tags: ['monster_roar'] },
        { bank: 'em001_vo', eventId: 123, sourceId: 12, tags: ['monster_roar'] }
    ]
});
assert.strictEqual(grouped.length, 1);
assert.deepStrictEqual(grouped[0].structures, ['random', 'layer']);
assert.deepStrictEqual(grouped[0].groupTags, ['monster_roar']);

const nonBaseChunkEvent = { ...event, chunk: 'chunkG3', eventId: 124 };
const groupedFromInstalledChunk = groupEvents({
    events: [nonBaseChunkEvent],
    deduplication: { aliases: [] }
}, { records: [] });
assert.strictEqual(groupedFromInstalledChunk.length, 1,
    'World monster review must include installed banks outside chunkG0');

const groupedWithoutSilentSource = groupEvents({
    events: [event],
    deduplication: { aliases }
}, {
    excludedSourceIds: [11],
    records: []
});
assert.deepStrictEqual(groupedWithoutSilentSource[0].sources.map(source => source.sourceId), [10, 12]);

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-audio-review-'));
const labelsPath = path.join(temporaryRoot, 'labels.json');
fs.writeFileSync(labelsPath, JSON.stringify({
    version: 1,
    records: [{
        bank: 'em001_vo',
        eventId: 123,
        sourceId: 12,
        tags: ['individual_exception'],
        verdict: '확정',
        reviewMethod: 'individual-audition'
    }]
}));
const saved = saveGroupReview({
    monster: 'em001',
    bank: 'em001_vo',
    eventId: 123,
    sourceIds: [10, 11, 12],
    category: 'breath'
}, labelsPath);
assert.deepStrictEqual(saved, { tags: ['breath'], savedSources: 2 });
let labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.strictEqual(labels.records.length, 3);
assert.ok(labels.records.every(record => record.verdict === '확정'));
assert.strictEqual(labels.records.find(record => record.sourceId === 12).tags[0], 'individual_exception');
assert.ok(labels.records.filter(record => record.sourceId !== 12)
    .every(record => record.reuseScope === 'monster-identity'));

saveGroupReview({
    monster: 'em001',
    bank: 'em001_vo',
    eventId: 123,
    sourceIds: [10, 11, 12],
    category: 'clear'
}, labelsPath);
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.strictEqual(labels.records.length, 1);
assert.strictEqual(labels.records[0].reviewMethod, 'individual-audition');

const completion = saveReviewCompletion(
    { monster: 'em001', completed: true },
    labelsPath,
    { em001_vo: ['rathian', 'rathalos'] }
);
assert.deepStrictEqual(completion, {
    monster: 'em001',
    graphId: 'em001',
    monsterIds: ['rathian', 'rathalos'],
    reviewStatus: 'completed'
});
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.runtimePolicy.completedMonsterIds, ['rathalos', 'rathian']);
saveReviewCompletion(
    { monster: 'em001', completed: false },
    labelsPath,
    { em001_vo: ['rathian', 'rathalos'] }
);
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.runtimePolicy.completedMonsterIds, []);

const huntIdCompletion = saveReviewCompletion(
    { monster: 'legiana', completed: true },
    labelsPath,
    { em111_vo: ['legiana'] }
);
assert.deepStrictEqual(huntIdCompletion, {
    monster: 'legiana', graphId: 'em111', monsterIds: ['legiana'], reviewStatus: 'completed'
});

fs.writeFileSync(labelsPath, JSON.stringify({
    version: 1,
    records: [{ bank: 'em024_se', eventId: 9, sourceId: 8, tags: ['회오리', '날개짓'] }]
}));
assert.deepStrictEqual(normalizeStoredLabels(labelsPath), { changedRecords: 1, records: 1 });
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.records[0].tags, ['tornado', 'wing_flap']);
assert.strictEqual(labels.records[0].reuseScope, 'cross-title-semantic');
assert.strictEqual(labels.tagAliases.브레스적중, 'breath_impact');

const htmlPath = path.join(__dirname, '..', 'tools', 'monster-audio-review.html');
if (fs.existsSync(htmlPath)) {
    const html = reviewUi;
    assert.ok(html.includes('패턴 슬롯 매핑'));
    assert.ok(html.includes('id="completeReview"'));
    assert.ok(html.includes('/api/review-completion'));
    assert.ok(html.includes('/api/hunt-patterns'));
    assert.ok(html.includes('/api/hunt-pattern-route'));
assert.ok(html.includes('/api/hunt-pattern-route-move'));
assert.match(reviewUi, /async function assignSourceGroup[\s\S]*?const pattern = selectedPattern\(\), slot = selectedSlot\(\)/,
    'group assignment must resolve the live pattern and slot when clicked');
assert.match(reviewUi, /const operation = assignSourceGroup\(group, available\)/,
    'persistent source-rail buttons must never save through a stale rendered slot closure');
assert.match(reviewUi, /class="route-copy-button"[\s\S]*?class="route-source-link"/,
    'each mapped sound must expose copy immediately to the left of its source link');
assert.match(reviewUi, /bubblechat\.monsterAudioReview\.routeClipboard/,
    'the copied sound must survive navigation across monsters and patterns');
assert.match(reviewUi, /async function pasteRouteLayer[\s\S]*?saveRoute\(/,
    'pasting must use the same verified route save and runtime generation path');
    assert.ok(html.includes('/api/hunt-pattern-motion'));
    assert.ok(html.includes('unified-editor-v3'),
        'the editor must reject a stale server before any save can occur');
    assert.ok(html.includes('motion-editor'));
    assert.ok(html.includes('beat-handle'));
    assert.ok(html.includes('타이밍 편집'));
    assert.ok(html.includes('그룹배정'),
        'event summaries must expose a visible whole-group random assignment action');
    assert.ok(html.includes('current-slot-source'));
    assert.ok(html.includes('class="route-files"'),
        'a mapped slot must list every assigned file instead of collapsing to the first file');
    assert.ok(html.includes("slot.effective.mode === 'random'"),
        'slot summaries must distinguish random groups from layered and single routes');
    assert.ok(html.includes('slot.effective.label ||'),
        'slot summaries must expose the assigned event-group label when available');
    assert.ok(html.includes('playTimelineAudio'));
    assert.ok(html.includes('runtimePreviewMuteAudio: true'),
        'review playback must have one audio owner instead of layering iframe legacy and BEAT cues');
    assert.ok(html.includes('실수렵 모션 미리보기'));
    assert.ok(html.includes('bubblechat:pattern-preview'));
    assert.ok(html.includes('previewTargetMode({ newAction: play })'),
        'random adjacent preview targeting must choose a fresh pair only when a new action begins');
    assert.ok(html.includes('id="patternTitleHost"'),
        'the pattern title must render outside the stable preview and timeline roots');
    assert.ok(html.indexOf('id="patternTitleHost"') < html.indexOf('id="patternPreviewFrame"')
        && html.indexOf('id="patternPreviewFrame"') < html.indexOf('id="patternDesk"'),
        'the stable DOM order must remain title, preview iframe, then motion timeline');
    assert.ok(!html.includes("desk.appendChild(preview)"),
        'pattern selection must never reparent and reload the combat-preview iframe');
    assert.ok(!html.includes("title.after(preview)"),
        'pattern rendering must not detach the iframe to move it above the timeline');
    assert.ok(html.includes('slow-fast-slow'));
    assert.ok(html.includes('rotationEasing'));
    assert.ok(html.includes('installScrubber'));
    assert.ok(html.includes('bubblechat:pattern-preview-seek'));
    assert.ok(html.includes('scrub-readout'),
        'the timeline must expose the exact selected tick while dragging');
    assert.ok(html.includes('flex:var(--ticks) 1 0'),
        'timeline bar widths must be proportional to ticks without content-width distortion');
    assert.ok(html.includes('bubblechat.monsterAudioReview.lastMonster'));
    assert.ok(html.includes('class="slot-pick"'));
    assert.ok(html.includes('class="workspace"'));
    assert.ok(html.includes('class="beat-track"'));
    assert.ok(html.includes('app.session.resizeBoundary'),
        'timeline handles must update the same state owner used by save and preview');
    assert.ok(html.includes('function selectPart('),
        'sound slots, timeline beats, timing fields and transforms must share one selected part');
    assert.ok(html.includes('function previewSlotsForBeat('),
        'preview audio must consume server-authored beat/audio bindings');
    assert.ok(html.includes('resolvePart(this.pattern'),
        'timeline, transform and audio selection must resolve through one shared state owner');
    assert.ok(!html.includes("id.includes('impact')"),
        'the editor must never guess an audio slot from beat-name substrings');
    assert.ok(!html.includes('||slots[index]||null'),
        'the editor must never pair motion and audio by unrelated array positions');
    assert.ok(html.includes('app.session.serialize()'),
        'timing save must serialize the state owner instead of DOM or stale closures');
    assert.ok(html.includes('저장 검증 실패'),
        'timing save must verify the server persisted every submitted beat');
    assert.doesNotMatch(fs.readFileSync(htmlPath, 'utf8'), /renderMotionEditor\s*=\s*function/,
        'the clean shell must not contain monkey-patched editor implementations');
}

console.log('monster audio event-group review server tests passed');
