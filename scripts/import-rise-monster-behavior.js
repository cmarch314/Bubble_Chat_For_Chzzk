#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REFERENCE_PATH = path.join(ROOT, 'data', 'hunt', 'monster-reference.generated.json');
const CACHE_DIR = path.join(ROOT, 'game_extracts', 'web', 'mhrice', 'monster');
const KIRANICO_CACHE_DIR = path.join(ROOT, 'game_extracts', 'web', 'kiranico-rise', 'monster');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'rise-monster-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'RiseMonsterBehavior.generated.js');
const SOURCE_ROOT = 'https://mhrise.mhrice.info/monster';
const USER_AGENT = 'BubbleChat behavior evidence importer/1.0';

function decodeEntities(value) {
    return String(value || '')
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function plainText(value) {
    return decodeEntities(String(value || '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(?:li|p|span|div)>/gi, ' ')
        .replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
}

function section(html, id) {
    const start = html.indexOf(`id="${id}"`);
    if (start < 0) return '';
    const next = html.indexOf('<section ', start + id.length + 5);
    return html.slice(start, next < 0 ? html.length : next);
}

function languageValue(html, language) {
    const match = html.match(new RegExp(`<span[^>]+lang="${language}"[^>]*>([\\s\\S]*?)<\\/span>`, 'i'));
    return match ? plainText(match[1]) : null;
}

function parseType(basicHtml) {
    const match = basicHtml.match(/<p class="mh-kv"><span>Type<\/span><span>([\s\S]*?)<\/p>/i);
    if (!match) return null;
    const value = match[1];
    const internal = plainText(value.match(/\(internal\)([\s\S]*)$/i)?.[1] || '');
    return {
        nameEN: languageValue(value, 'en'),
        nameKO: languageValue(value, 'ko'),
        nameJA: languageValue(value, 'ja'),
        internal: internal ? internal.split(',').map(token => token.trim()).filter(Boolean) : []
    };
}

function parseBasic(html) {
    const basic = section(html, 's-basic');
    const kv = {};
    for (const match of basic.matchAll(/<p class="mh-kv"><span>([\s\S]*?)<\/span><span>([\s\S]*?)<\/p>/gi)) {
        kv[plainText(match[1])] = plainText(match[2]);
    }
    const defaultMove = kv['Default move pattern'] || null;
    return {
        type: parseType(basic),
        defaultMovePattern: defaultMove,
        flyingStanceToMove: kv['Flying stance to move'] === 'true',
        threatLevel: Number(kv['Threat level']) || null,
        enragedMotion: kv['Motion(enraged)'] || null,
        tiredMotion: kv['Motion(tired)'] || null
    };
}

function parseDamage(cell) {
    const values = {};
    for (const match of cell.matchAll(/<li>(?:<img[^>]+alt="([^"]+)"[^>]*>)?\s*([^<]+)<\/li>/gi)) {
        const text = plainText(match[2]);
        const inline = text.match(/^([A-Za-z][A-Za-z ]+)\s+(-?\d+(?:\.\d+)?)/);
        const key = match[1] || inline?.[1] || 'value';
        const numeric = Number((inline?.[2] || text.match(/-?\d+(?:\.\d+)?/)?.[0]));
        values[key.trim()] = Number.isFinite(numeric) ? numeric : text;
    }
    return values;
}

function classifyMove(nameJA, cells, damage, statuses) {
    const name = nameJA || '';
    const flags = `${cells[5] || ''} ${cells[8] || ''}`.toLowerCase();
    const statusKeys = Object.keys(statuses);
    if (/バインドボイス|咆哮|雄叫び|大咆哮/.test(name) || /roar/.test(flags)) return 'roar';
    if (/潜|地中|土中/.test(name)) return 'burrow';
    if (/急降下|滑空|空中|飛びかか|飛び込み|ジャンプ|跳躍|飛翔/.test(name)) return 'aerial';
    if (/ブレス|火球|水球|雷球|氷塊|弾|レーザー|ビーム|砲撃|吐き|噴射|竜巻/.test(name)) return 'projectile';
    if (/突進|走り|ダッシュ|体当たり|タックル/.test(name)) return 'charge';
    if (/回転|薙ぎ|振り回|なぎ払|尻尾|尾撃/.test(name)) return 'sweep';
    if (/爆発|放電|大技|大爆発|叩きつけ|プレス|地面/.test(name) || statusKeys.some(key => /Blast|Fire|Thunder/.test(key))) return 'area';
    if ((damage.Physical || 0) > 0) return 'close';
    return 'utility';
}

function slug(value) {
    return String(value || '').normalize('NFKD').replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function localizedMoveName(move) {
    const replacements = [
        [/バインドボイス|大咆哮|咆哮|雄叫び/g, '포효'],
        [/大突進/g, '대돌진'], [/突進/g, '돌진'], [/急降下/g, '급강하'],
        [/飛びかかり|飛び掛かり/g, '덮치기'], [/ジャンプ/g, '점프'],
        [/ブレス/g, '브레스'], [/レーザー|ビーム/g, '레이저'],
        [/火球/g, '화염구'], [/水球/g, '물구슬'], [/雷球/g, '번개구슬'],
        [/尻尾|尾/g, '꼬리'], [/回転/g, '회전'], [/薙ぎ払い|なぎ払い/g, '휩쓸기'],
        [/叩きつけ|叩き付け/g, '내려찍기'], [/体当たり|タックル/g, '몸통박치기'],
        [/潜り/g, '잠복'], [/飛び出し/g, '튀어나오기'], [/爆発/g, '폭발'],
        [/放電/g, '방전'], [/噛みつき|かみつき/g, '물어뜯기']
    ];
    let translated = String(move.nameJA || '');
    let replacementsMade = 0;
    for (const [pattern, replacement] of replacements) {
        if (pattern.test(translated)) {
            translated = translated.replace(pattern, replacement);
            replacementsMade += 1;
        }
    }
    translated = translated.replace(/[（）()・／/]/g, ' ')
        .replace(/[一-龯ぁ-んァ-ンー]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (translated && replacementsMade) return translated;
    return {
        projectile: '원거리 공격', charge: '돌진', aerial: '공중 급습',
        burrow: '지중 급습', sweep: '휩쓸기', area: '광역 강타',
        close: '근접 강타', roar: '포효'
    }[move.semantic] || '특수 행동';
}

function runtimePattern(monsterId, move, index) {
    const ratio = Math.max(0.16, Math.min(0.48, 0.16 + (Number(move.power || 0) / 220)));
    const targetScale = move.semantic === 'area' || move.semantic === 'sweep' ? [2, 4]
        : move.semantic === 'projectile' ? [1, 3]
            : move.semantic === 'charge' || move.semantic === 'aerial' ? [1, 2] : [1, 1];
    const tags = [
        move.semantic,
        Object.keys(move.statuses || {}).some(key => /Poison/i.test(key)) && 'poison',
        Object.keys(move.statuses || {}).some(key => /Paraly/i.test(key)) && 'paralysis',
        Object.keys(move.statuses || {}).some(key => /Sleep/i.test(key)) && 'sleep'
    ].filter(Boolean);
    return {
        id: `${monsterId}.rise.${index}.${slug(move.nameJA) || move.semantic}`,
        name: localizedMoveName(move),
        sourceMoveNameJA: move.nameJA,
        type: move.semantic === 'close' ? 'physical' : move.semantic,
        damageRatio: Number(ratio.toFixed(3)),
        windupTicks: ['charge', 'aerial', 'burrow'].includes(move.semantic) ? 7 : 5,
        activeTicks: ['projectile', 'sweep'].includes(move.semantic) ? 3 : 2,
        recoveryTicks: move.power >= 70 ? 12 : 8,
        minTargets: targetScale[0],
        maxTargets: targetScale[1],
        cooldownTicks: move.power >= 70 ? 45 : 28,
        weight: 1,
        tags,
        guardable: move.guardable,
        sourcePower: move.power,
        sourceActionClass: move.nameJA,
        sourceGame: 'rise-sunbreak',
        evidence: move.evidence || 'mhrice-installed-move-table',
        confidence: 'extracted-action'
    };
}

function runtimeMonster(monster) {
    const monsterId = slug(monster.nameEN);
    const patterns = monster.representativeMoves.map((move, index) => runtimePattern(monsterId, move, index));
    if (monster.roar.status === 'verified-present') {
        patterns.unshift({
            id: `${monsterId}.rise.roar`, name: '포효',
            sourceMoveNameJA: monster.roar.move.nameJA, type: 'roar', damageRatio: 0,
            windupTicks: 3, activeTicks: 2, recoveryTicks: 8,
            minTargets: 2, maxTargets: 4, cooldownTicks: 120, weight: 0.25,
            tags: ['roar'], guardable: monster.roar.move.guardable,
            sourcePower: monster.roar.move.power, sourceActionClass: monster.roar.move.nameJA,
            sourceGame: 'rise-sunbreak', evidence: monster.roar.move.evidence || 'mhrice-installed-move-table',
            confidence: 'extracted-action'
        });
    }
    return {
        id: monsterId, nameEN: monster.nameEN, nameKO: monster.nameKO,
        species: monster.species, locomotion: monster.locomotion,
        roar: { status: monster.roar.status, strength: monster.roar.strength, audioStatus: 'unresolved' },
        patterns
    };
}

function parseKiranicoMoves(html) {
    const heading = html.indexOf('Attack Moves');
    if (heading < 0) return [];
    const tbodyStart = html.indexOf('<tbody', heading);
    const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
    if (tbodyStart < 0 || tbodyEnd < 0) return [];
    const body = html.slice(tbodyStart, tbodyEnd);
    const moves = [];
    for (const row of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
        const cells = [...row[1].matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/gi)].map(match => plainText(match[1]));
        if (cells.length < 14) continue;
        const nameJA = cells[0];
        const power = Number(cells[1]) || 0;
        const baseDamage = Number(cells[6]) || 0;
        const statuses = {};
        if (Number(cells[9])) statuses[`Debuff:${cells[9]}`] = Number(cells[10]) || 1;
        const move = {
            nameJA,
            damage: { Physical: Math.max(power, baseDamage) },
            statuses,
            guardable: Number(cells[13]) > 0,
            power,
            hitReaction: null,
            objectEffect: null,
            monsterEffect: null,
            flags: [],
            evidence: 'kiranico-rise-installed-attack-move-table'
        };
        move.semantic = classifyMove(nameJA, cells, move.damage, statuses);
        move.offensive = power > 0 || baseDamage > 0;
        moves.push(move);
    }
    return moves;
}

function parseKiranicoSmallMonster(html, reference, sourceUrl) {
    const moves = parseKiranicoMoves(html);
    return {
        game: 'rise-sunbreak',
        sourceId: reference.sourceId,
        iconCode: reference.iconCode,
        nameEN: reference.nameEN,
        nameKO: reference.nameKO,
        kind: 'small',
        species: null,
        locomotion: null,
        threatLevel: null,
        roar: { status: 'verified-absent', strength: null, move: null },
        representativeMoves: selectRepresentativeMoves(moves, 'small'),
        moveCount: moves.length,
        sourceUrl,
        evidence: 'kiranico-rise-installed-attack-move-table'
    };
}

function parseMoves(html) {
    const moveset = section(html, 's-moveset');
    const body = moveset.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || '';
    const moves = [];
    for (const row of body.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
        const rawCells = [...row[1].matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/gi)].map(match => match[1]);
        if (rawCells.length < 9) continue;
        const nameJA = plainText(rawCells[0]);
        const damage = parseDamage(rawCells[1]);
        const statuses = parseDamage(rawCells[2]);
        const cells = rawCells.map(plainText);
        const move = {
            nameJA,
            damage,
            statuses,
            guardable: /^Yes$/i.test(cells[3]),
            power: Number(cells[4]) || 0,
            hitReaction: cells[5] || null,
            objectEffect: cells[6] || null,
            monsterEffect: cells[7] || null,
            flags: cells[8] ? cells[8].split(/\s+/).filter(Boolean) : []
        };
        move.semantic = classifyMove(nameJA, cells, damage, statuses);
        move.offensive = Object.values(damage).some(value => typeof value === 'number' && value > 0);
        moves.push(move);
    }
    return moves;
}

function selectRepresentativeMoves(moves, kind) {
    const desired = kind === 'small' ? 3 : 6;
    const offensive = moves.filter(move => move.offensive);
    const categories = ['projectile', 'charge', 'aerial', 'burrow', 'sweep', 'area', 'close'];
    const selected = [];
    for (const semantic of categories) {
        const candidate = offensive
            .filter(move => move.semantic === semantic)
            .sort((a, b) => (b.power - a.power)
                || ((b.damage.Physical || 0) - (a.damage.Physical || 0)))[0];
        if (candidate && !selected.includes(candidate)) selected.push(candidate);
        if (selected.length >= desired - 1) break;
    }
    const strongest = offensive.slice().sort((a, b) => (b.power - a.power)
        || ((b.damage.Physical || 0) - (a.damage.Physical || 0)))[0];
    if (strongest && !selected.includes(strongest)) selected.push(strongest);
    for (const move of offensive) {
        if (selected.length >= desired) break;
        if (!selected.includes(move)) selected.push(move);
    }
    return selected.slice(0, desired).map(move => ({
        ...move,
        evidence: move.evidence || 'mhrice-installed-move-table'
    }));
}

function parseMonster(html, reference, sourceUrl) {
    const moves = parseMoves(html);
    const roarMove = moves.find(move => move.semantic === 'roar') || null;
    return {
        game: 'rise-sunbreak',
        sourceId: reference.sourceId,
        iconCode: reference.iconCode,
        nameEN: reference.nameEN,
        nameKO: reference.nameKO,
        kind: reference.kind,
        species: parseBasic(html).type,
        locomotion: {
            defaultMovePattern: parseBasic(html).defaultMovePattern,
            flyingStanceToMove: parseBasic(html).flyingStanceToMove
        },
        threatLevel: parseBasic(html).threatLevel,
        roar: roarMove ? {
            status: 'verified-present',
            strength: Object.keys(roarMove.statuses).find(key => /roar/i.test(key))
                || roarMove.hitReaction?.match(/(?:Strong|Weak) roar/i)?.[0]
                || null,
            move: roarMove
        } : {
            status: 'verified-absent',
            strength: null,
            move: null
        },
        representativeMoves: selectRepresentativeMoves(moves, reference.kind),
        moveCount: moves.length,
        sourceUrl,
        evidence: 'mhrice-installed-move-table-and-internal-species'
    };
}

async function fetchCached(reference, options = {}) {
    const code = reference.iconCode.replace(/^em/i, '');
    const cachePath = path.join(CACHE_DIR, `${code}.html`);
    const sourceUrl = `${SOURCE_ROOT}/${code}.html`;
    if (!options.refresh && fs.existsSync(cachePath)) {
        return { html: fs.readFileSync(cachePath, 'utf8'), sourceUrl, cachePath, cached: true };
    }
    const response = await fetch(sourceUrl, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${sourceUrl}: HTTP ${response.status}`);
    const html = await response.text();
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, html, 'utf8');
    return { html, sourceUrl, cachePath, cached: false };
}

async function fetchKiranicoCached(reference, options = {}) {
    const cachePath = path.join(KIRANICO_CACHE_DIR, `${reference.sourceId}.html`);
    const sourceUrl = `https://mhrise.kiranico.com/data/monsters/${reference.sourceId}`;
    if (!options.refresh && fs.existsSync(cachePath)) {
        return { html: fs.readFileSync(cachePath, 'utf8'), sourceUrl, cachePath, cached: true };
    }
    const response = await fetch(sourceUrl, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${sourceUrl}: HTTP ${response.status}`);
    const html = await response.text();
    fs.mkdirSync(KIRANICO_CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, html, 'utf8');
    return { html, sourceUrl, cachePath, cached: false };
}

async function importBehavior(options = {}) {
    const reference = JSON.parse(fs.readFileSync(options.referencePath || REFERENCE_PATH, 'utf8'));
    const rows = (reference.monsters || []).filter(row => row.game === 'rise-sunbreak');
    const monsters = [];
    const failures = [];
    for (const [index, row] of rows.entries()) {
        try {
            const fetched = row.kind === 'small'
                ? await fetchKiranicoCached(row, options)
                : await fetchCached(row, options);
            const parsed = row.kind === 'small'
                ? parseKiranicoSmallMonster(fetched.html, row, fetched.sourceUrl)
                : parseMonster(fetched.html, row, fetched.sourceUrl);
            parsed.sourceSha256 = crypto.createHash('sha256').update(fetched.html).digest('hex');
            monsters.push(parsed);
            if (!options.quiet) process.stdout.write(`\r[mhrice] ${index + 1}/${rows.length} ${row.nameEN} (${parsed.moveCount} moves)   `);
        } catch (error) {
            failures.push({ sourceId: row.sourceId, nameEN: row.nameEN, iconCode: row.iconCode, error: error.message });
            if (!options.quiet) process.stdout.write(`\r[mhrice] ${index + 1}/${rows.length} ${row.nameEN} FAILED             `);
        }
    }
    if (!options.quiet) process.stdout.write('\n');
    const output = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: {
            title: 'MHRice Monster Hunter Rise / Sunbreak game-data reference',
            url: 'https://mhrise.mhrice.info/monster.html',
            evidence: 'MHRice large-monster installed move table/internal locomotion plus Kiranico Rise small-monster installed attack table'
        },
        counts: {
            expected: rows.length,
            imported: monsters.length,
            failed: failures.length,
            moves: monsters.reduce((sum, monster) => sum + monster.moveCount, 0),
            verifiedRoarPresent: monsters.filter(monster => monster.roar.status === 'verified-present').length,
            verifiedRoarAbsent: monsters.filter(monster => monster.roar.status === 'verified-absent').length
        },
        failures,
        monsters
    };
    const outputPath = options.outputPath || OUTPUT_PATH;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    const runtime = Object.fromEntries(monsters.map(monster => {
        const record = runtimeMonster(monster);
        return [record.id, record];
    }));
    fs.mkdirSync(path.dirname(RUNTIME_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_RISE_MONSTER_BEHAVIOR = ${JSON.stringify(runtime, null, 2)};\n`, 'utf8');
    return output;
}

if (require.main === module) {
    importBehavior({ refresh: process.argv.includes('--refresh') })
        .then(output => {
            console.log(JSON.stringify(output.counts, null, 2));
            if (output.failures.length) process.exitCode = 1;
        })
        .catch(error => {
            console.error(`[rise-monster-behavior] ${error.stack || error.message}`);
            process.exitCode = 1;
        });
}

module.exports = {
    slug,
    classifyMove,
    localizedMoveName,
    runtimePattern,
    parseBasic,
    parseMoves,
    parseMonster,
    parseKiranicoMoves,
    parseKiranicoSmallMonster,
    selectRepresentativeMoves,
    runtimeMonster,
    importBehavior
};
