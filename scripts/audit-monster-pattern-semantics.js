#!/usr/bin/env node
'use strict';

const HuntMonsterReleasePolicy = require('../js/effects/hunt/HuntMonsterReleasePolicy.js');
const RELEASED_MONSTER_IDS = Object.freeze(
    HuntMonsterReleasePolicy.REVIEWED.map(record => record.id)
);

function sourceName(pattern = {}) {
    return String(pattern.sourceActionClass || pattern.sourceMoveNameJA || '').trim();
}

function auditPattern(monsterId, pattern, index) {
    const findings = [];
    const name = String(pattern?.name || '');
    const source = sourceName(pattern);
    const location = `${monsterId}[${index}]`;
    const add = (code, detail) => findings.push({
        monsterId,
        patternId: pattern?.id || null,
        name,
        sourceAction: source || null,
        code,
        detail,
        location
    });

    if (/【\s*(?:MR|HR|操竜)?\s*】|\[(?:MR|HR)\]/i.test(name)) {
        add('rank-or-development-label', 'Player-facing move names must not expose rank or development labels.');
    }
    if (/(?:操竜|確定操竜|ジャンプ用ダメージ|ダメージアタリ|ヒットデータ|テスト咆哮|やられ当たり)/.test(source)) {
        add('internal-only-action-row', 'The source row describes riding, hit data, test data, or a damage volume rather than a complete visible action.');
    }
    if (/레이저/.test(name) && /毒霧/.test(source)) {
        add('delivery-mismatch', 'Poison mist hit geometry must not be rendered or named as a laser.');
    }
    if ((pattern?.type === 'ultimate' || pattern?.tags?.includes('ultimate'))
        && !pattern?.signatureEvidence) {
        add('missing-signature-evidence', 'An ultimate requires explicit move-specific lethality and identity evidence.');
    }
    return findings;
}

function auditCatalog(catalog = {}, monsterIds = Object.keys(catalog)) {
    return monsterIds.flatMap(monsterId =>
        (catalog[monsterId] || []).flatMap((pattern, index) => auditPattern(monsterId, pattern, index)));
}

function loadRuntimeCatalog() {
    global.window = global;
    global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
    require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
    require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
    require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
    require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
    require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
    require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
    require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
    const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
    return HuntMonsterPatternCatalog.build({}, RELEASED_MONSTER_IDS.map(id => ({
        id,
        tier: id === 'chameleos' ? 'elder' : 'large'
    })));
}

function printReport(findings, monsterIds) {
    const byMonster = new Map();
    findings.forEach(finding => {
        if (!byMonster.has(finding.monsterId)) byMonster.set(finding.monsterId, []);
        byMonster.get(finding.monsterId).push(finding);
    });
    for (const monsterId of monsterIds) {
        const rows = byMonster.get(monsterId) || [];
        console.log(`${monsterId}: ${rows.length}`);
        rows.forEach(row => console.log(`  - ${row.code}: ${row.name} <- ${row.sourceAction || 'no source action'}`));
    }
    console.log(`total: ${findings.length}`);
}

if (require.main === module) {
    const catalog = loadRuntimeCatalog();
    const ids = process.argv.includes('--all') ? Object.keys(catalog) : RELEASED_MONSTER_IDS;
    const findings = auditCatalog(catalog, ids);
    printReport(findings, ids);
    if (process.argv.includes('--strict') && findings.length) process.exitCode = 1;
}

module.exports = {
    RELEASED_MONSTER_IDS,
    PILOT_MONSTER_IDS: RELEASED_MONSTER_IDS,
    auditPattern,
    auditCatalog,
    loadRuntimeCatalog
};
