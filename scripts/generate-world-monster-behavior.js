#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { classifyAction, actionLabel } = require('./generate-wilds-monster-behavior');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'game_extracts', 'reference-data', 'mhw', 'monsterActions.txt');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'world-monster-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'WorldMonsterBehavior.generated.js');
const SOURCE_URL = 'https://gist.github.com/haato3o/faec6cbf2afe2b30c13b97908d5697b4';
const ID_SOURCE_URL = 'https://github.com/Ezekial711/MonsterHunterWorldModding/wiki/Monster-IDs';

const NAMESPACE_MONSTERS = Object.freeze({
    Em001_01: ['Pink Rathian', '리오레이아 아종'],
    Em001_02: ['Gold Rathian', '금화룡'],
    Em002_01: ['Azure Rathalos', '리오레우스 아종'],
    Em002_02: ['Silver Rathalos', '은화룡'],
    Em007_01: ['Black Diablos', '디아블로스 아종'],
    Em018_05: ['Scarred Yian Garuga', '상처 입은 얀가루루가'],
    Em023_05: ['Furious Rajang', '격앙 라잔'],
    Em032_01: ['Brute Tigrex', '티가렉스 아종'],
    Em042_05: ['Frostfang Barioth', '얼음 칼날을 찬 벨리오로스'],
    Em043_05: ['Savage Deviljho', '미친 이블조'],
    Em057_01: ['Stygian Zinogre', '진오우거 아종'],
    Em063_05: ['Raging Brachydios', '사납게 터지는 브라키디오스'],
    Em080_01: ['Acidic Glavenus', '디노발드 아종'],
    Em100_01: ['Fulgur Anjanath', '안쟈나프 아종'],
    Em102_01: ['Coral Pukei-Pukei', '푸케푸케 아종'],
    Em103_05: ['Ruiner Nergigante', '모두를 멸하는 네르기간테'],
    Em109_01: ['Viper Tobi-Kadachi', '토비카가치 아종'],
    Em110_01: ['Nightshade Paolumu', '파오우르무 아종'],
    Em111_05: ['Shrieking Legiana', '얼려 찌르는 레이기에나'],
    Em113_01: ['Ebony Odogaron', '오도가론 아종'],
    Em115_05: ['Blackveil Vaal Hazak', '죽음을 두른 발하자크'],
    Em118_05: ['Seething Bazelgeuse', '홍련의 솟구치는 바젤기우스']
});

function slug(value) {
    return String(value || '').normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '').toLowerCase();
}

function parseNamespaces(text) {
    const result = new Map();
    for (const line of String(text || '').split(/\r?\n/)) {
        const match = line.trim().match(/^nAct(Em\d{3}_\d{2})::(.+)$/);
        if (!match) continue;
        if (!result.has(match[1])) result.set(match[1], []);
        result.get(match[1]).push(match[2]);
    }
    return result;
}

function usable(name) {
    if (classifyAction(name) === 'utility') return false;
    return !/(SubAction|Damage|Return|Escape|Demo|Dummy|Wait|Idle|Move|Turn|Adjust|Check|Loop|End$|Start$|Base$)/i.test(name);
}

function score(name) {
    return (/Ultimate|Super|HighPower|Large|Full|Triple|Double|Combo|Max/i.test(name) ? 50 : 0)
        + (/Attack|Breath|Rush|Tackle|Bite|Kick|Laser|Shot|Slam|Tail/i.test(name) ? 20 : 0);
}

function selectActions(names, desired = 6) {
    const candidates = [...new Set(names)].filter(name => usable(name) && classifyAction(name) !== 'roar');
    const selected = [];
    for (const semantic of ['projectile', 'charge', 'aerial', 'burrow', 'sweep', 'area', 'close']) {
        const candidate = candidates.filter(name => classifyAction(name) === semantic)
            .sort((a, b) => score(b) - score(a))[0];
        if (candidate) selected.push(candidate);
        if (selected.length >= desired) break;
    }
    for (const candidate of candidates.sort((a, b) => score(b) - score(a))) {
        if (selected.length >= desired) break;
        if (!selected.includes(candidate)) selected.push(candidate);
    }
    return selected;
}

function runtimePattern(monsterId, name, index) {
    const semantic = classifyAction(name);
    const explicitUltimate = /Ultimate|Nova/i.test(name);
    const targetRange = ['area', 'sweep'].includes(semantic) ? [2, 4]
        : semantic === 'projectile' ? [1, 3] : [1, 2];
    return {
        id: `${monsterId}.world.${index}.${slug(name)}`,
        name: actionLabel(name, semantic),
        type: explicitUltimate ? 'ultimate' : semantic === 'close' ? 'physical' : semantic,
        damageRatio: explicitUltimate ? 0.90 : semantic === 'area' ? 0.38 : semantic === 'charge' || semantic === 'aerial' ? 0.36 : 0.29,
        windupTicks: explicitUltimate ? 14 : ['charge', 'aerial', 'burrow'].includes(semantic) ? 7 : 5,
        activeTicks: explicitUltimate ? 5 : ['projectile', 'sweep'].includes(semantic) ? 3 : 2,
        recoveryTicks: explicitUltimate ? 18 : 9,
        minTargets: explicitUltimate ? 4 : targetRange[0],
        maxTargets: explicitUltimate ? 4 : targetRange[1],
        cooldownTicks: explicitUltimate ? 450 : 32,
        weight: explicitUltimate ? 0.55 : 1,
        tags: [explicitUltimate && 'ultimate', semantic, explicitUltimate && 'all-target'].filter(Boolean),
        requiredState: explicitUltimate ? 'enraged' : undefined,
        sourceActionClass: name,
        sourceGame: 'world-iceborne',
        evidence: 'mhw-executable-action-enumeration',
        confidence: 'extracted-action'
    };
}

function buildBehavior(text) {
    const namespaces = parseNamespaces(text);
    const monsters = [];
    for (const [namespace, [nameEN, nameKO]] of Object.entries(NAMESPACE_MONSTERS)) {
        const names = namespaces.get(namespace) || [];
        const selected = selectActions(names);
        if (!selected.length) continue;
        const id = slug(nameEN);
        const roarName = names.find(name => /Roar/i.test(name)) || null;
        const patterns = selected.map((name, index) => runtimePattern(id, name, index));
        if (roarName) patterns.unshift({
            id: `${id}.world.roar`, name: '포효', type: 'roar', damageRatio: 0,
            windupTicks: 3, activeTicks: 2, recoveryTicks: 8,
            minTargets: 2, maxTargets: 4, cooldownTicks: 120, weight: 0.25,
            tags: ['roar'], sourceActionClass: roarName, sourceGame: 'world-iceborne',
            evidence: 'mhw-executable-action-enumeration', confidence: 'extracted-action'
        });
        monsters.push({
            id, namespace, nameEN, nameKO, sourceActionCount: names.length,
            roar: { status: roarName ? 'verified-present' : 'unresolved', sourceActionClass: roarName, audioStatus: 'unresolved' },
            patterns, evidence: 'mhw-executable-action-enumeration'
        });
    }
    return monsters.sort((a, b) => a.nameEN.localeCompare(b.nameEN));
}

function generate(options = {}) {
    const sourcePath = options.sourcePath || SOURCE_PATH;
    if (!fs.existsSync(sourcePath)) throw new Error(`World action evidence not found: ${sourcePath}`);
    const monsters = buildBehavior(fs.readFileSync(sourcePath, 'utf8'));
    const output = {
        version: 1, generatedAt: new Date().toISOString(),
        sources: [
            { title: 'MonsterHunter - Monster Actions (executable extraction)', url: SOURCE_URL },
            { title: 'Monster Hunter World Modding - Monster IDs', url: ID_SOURCE_URL }
        ],
        counts: {
            namespaces: Object.keys(NAMESPACE_MONSTERS).length,
            monsters: monsters.length,
            patterns: monsters.reduce((sum, monster) => sum + monster.patterns.length, 0)
        },
        monsters
    };
    fs.writeFileSync(options.outputPath || OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.mkdirSync(path.dirname(RUNTIME_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_WORLD_MONSTER_BEHAVIOR = ${JSON.stringify(Object.fromEntries(monsters.map(monster => [monster.id, monster])), null, 2)};\n`,
        'utf8');
    return output;
}

if (require.main === module) {
    try { console.log(JSON.stringify(generate().counts, null, 2)); }
    catch (error) { console.error(`[world-monster-behavior] ${error.stack || error.message}`); process.exitCode = 1; }
}

module.exports = { parseNamespaces, usable, selectActions, buildBehavior, generate };
