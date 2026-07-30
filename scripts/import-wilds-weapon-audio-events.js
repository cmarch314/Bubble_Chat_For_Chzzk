#!/usr/bin/env node
'use strict';

// Build a resumable installed-data graph:
// weapon SoundTriggerInfo event -> Wwise HIRC recipe -> WEM source IDs.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WWISE_ROOT = path.join(ROOT, 'game_extracts', 'wilds', 'natives', 'STM', 'Sound', 'Wwise');
const TRIGGERS = path.join(ROOT, 'game_extracts', 'tools', 'wilds-weapon-audio-triggers.json');
const OUTPUT = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(ROOT, 'game_extracts', 'tools', 'wilds-weapon-audio-events.json');
const CACHE_ROOT = path.join(ROOT, 'game_extracts', 'wilds', 'decode_work', 'weapon_event_graph');
const WWISER = path.join(ROOT, 'game_extracts', 'tools', 'wwiser', 'wwiser.py');
const PYTHON = process.env.PYTHON_PATH || 'python';
const WEAPONS = Object.freeze(JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'hunt', 'wilds-weapon-codes.json'), 'utf8')
).codes);

function walk(folder, output = []) {
    if (!fs.existsSync(folder)) return output;
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        const file = path.join(folder, entry.name);
        if (entry.isDirectory()) walk(file, output);
        else output.push(file);
    }
    return output;
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function bankRole(name) {
    const value = name.toLowerCase();
    if (value.includes('_effect')) return 'effect';
    if (value.includes('insect')) return 'insect';
    if (value.includes('_shell')) return 'shell';
    if (value.includes('cmnsub')) return 'sub';
    return 'motion';
}

function sourceIds(text) {
    return [...new Set([
        ...[...text.matchAll(/(?:^|\n)(?:wem\/)?(\d+)\.wem\s+#[ie]\b/gi)].map(match => match[1]),
        ...[...text.matchAll(/##(\d+)\.wem\b/gi)].map(match => match[1])
    ])];
}

function hircNodes(text) {
    return [...new Set([...text.matchAll(/^\s*#\s+(CAk[A-Za-z0-9_]+)/gm)].map(match => match[1]))];
}

function gameSyncs(fileName) {
    return [...fileName.matchAll(/\[([^=\]]+)=([^\]]+)\]/g)].map(match => ({
        group: match[1],
        value: match[2]
    }));
}

function parseTxtp(file, bank) {
    const name = path.basename(file);
    const eventId = name.match(/event-(\d+)/i)?.[1];
    if (!eventId) return null;
    const text = fs.readFileSync(file, 'utf8');
    const recipe = text.split(/\r?\n/).filter(line => line.trim() && !line.trimStart().startsWith('#'));
    return {
        eventId,
        variant: name.replace(/\.txtp$/i, ''),
        bank,
        role: bankRole(bank),
        sourceIds: sourceIds(text),
        hircNodes: hircNodes(text),
        gameSyncs: gameSyncs(name),
        recipe
    };
}

function parseBank(file) {
    const name = path.basename(file);
    const code = name.match(/^(Wp\d{2})/i)?.[1];
    if (!code || !WEAPONS[code]) return [];
    const hash = sha256(file);
    const folder = path.join(CACHE_ROOT, `${name.replace(/[^a-z0-9_-]+/gi, '_')}_${hash.slice(0, 12)}`);
    const done = path.join(folder, '.complete.json');
    fs.mkdirSync(folder, { recursive: true });
    if (!fs.existsSync(done)) {
        const result = spawnSync(PYTHON, [WWISER, '-g', '-go', folder, '-gnw', '-gxni', file], {
            encoding: 'utf8',
            maxBuffer: 128 * 1024 * 1024
        });
        if (result.status !== 0) {
            const detail = String(result.stderr || result.stdout || '').trim().slice(-1200);
            throw new Error(`${name}: wwiser failed (${result.status}): ${detail}`);
        }
        fs.writeFileSync(done, `${JSON.stringify({ bankSha256: hash })}\n`, 'utf8');
    }
    return walk(folder).filter(item => item.toLowerCase().endsWith('.txtp'))
        .map(item => parseTxtp(item, name)).filter(Boolean).map(row => ({
            weaponCode: code,
            weaponId: WEAPONS[code],
            bankSha256: hash,
            ...row
        }));
}

function compactEvents(rows) {
    const grouped = new Map();
    for (const row of rows) {
        const key = `${row.weaponId}:${row.eventId}`;
        if (!grouped.has(key)) {
            grouped.set(key, {
                weaponCode: row.weaponCode,
                weaponId: row.weaponId,
                eventId: Number(row.eventId),
                banks: [],
                roles: [],
                sourceIds: [],
                hircNodes: [],
                variants: []
            });
        }
        const event = grouped.get(key);
        if (!event.banks.includes(row.bank)) event.banks.push(row.bank);
        if (!event.roles.includes(row.role)) event.roles.push(row.role);
        row.sourceIds.forEach(id => { if (!event.sourceIds.includes(id)) event.sourceIds.push(id); });
        row.hircNodes.forEach(node => { if (!event.hircNodes.includes(node)) event.hircNodes.push(node); });
        event.variants.push({
            bank: row.bank,
            variant: row.variant,
            sourceIds: row.sourceIds,
            gameSyncs: row.gameSyncs,
            recipe: row.recipe
        });
    }
    return [...grouped.values()].sort((a, b) =>
        a.weaponCode.localeCompare(b.weaponCode) || a.eventId - b.eventId
    );
}

function main() {
    if (!fs.existsSync(WWISER) || !fs.existsSync(TRIGGERS)) {
        throw new Error('wwiser or wilds-weapon-audio-triggers.json is missing');
    }
    const banks = walk(WWISE_ROOT).filter(file => {
        const name = path.basename(file);
        return /^Wp\d{2}.*\.sbnk\.\d+\.X64$/i.test(name) && !/_m\.sbnk/i.test(name);
    }).sort();
    const rows = [];
    banks.forEach((file, index) => {
        const parsed = parseBank(file);
        rows.push(...parsed);
        console.log(`[wilds-weapon-events] ${index + 1}/${banks.length} ${path.basename(file)}: ${parsed.length} variants`);
    });
    const events = compactEvents(rows);
    const triggerData = JSON.parse(fs.readFileSync(TRIGGERS, 'utf8'));
    const eventIndex = new Map(events.map(event => [`${event.weaponId}:${event.eventId}`, event]));
    const triggerLinks = triggerData.records.map(record => {
        const event = eventIndex.get(`${record.weaponId}:${record.eventId}`);
        return {
            weaponId: record.weaponId,
            role: record.role,
            triggerId: record.triggerId,
            eventId: record.eventId,
            bankReference: record.bankReference,
            motionContexts: record.motionContexts || [],
            sourceIds: event?.sourceIds || [],
            eventBanks: event?.banks || [],
            hircNodes: event?.hircNodes || [],
            evidence: event
                ? 'installed-trigger+event+hirc+source'
                : 'installed-trigger+event'
        };
    });
    const coverage = {};
    for (const weaponId of Object.values(WEAPONS)) {
        const weaponLinks = triggerLinks.filter(row => row.weaponId === weaponId);
        coverage[weaponId] = {
            triggers: weaponLinks.length,
            motionLinked: weaponLinks.filter(row => row.motionContexts.length).length,
            hircLinked: weaponLinks.filter(row => row.sourceIds.length).length,
            eventOnly: weaponLinks.filter(row => !row.sourceIds.length).length
        };
    }
    const output = {
        version: 1,
        game: 'Monster Hunter Wilds',
        evidencePolicy: (
            'A direct record proves installed trigger, Wwise event, HIRC recipe and source identity. ' +
            'It does not by itself name the gameplay action; action assignment must retain a separate confidence.'
        ),
        banks: banks.map(file => path.relative(ROOT, file).replaceAll('\\', '/')),
        coverage,
        events,
        triggerLinks
    };
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, `${JSON.stringify(output)}\n`, 'utf8');
    const hircLinked = triggerLinks.filter(row => row.sourceIds.length).length;
    console.log(`[wilds-weapon-events] ${events.length} events; ${hircLinked}/${triggerLinks.length} triggers reach WEM sources -> ${OUTPUT}`);
    return output;
}

if (require.main === module) main();
module.exports = { sourceIds, hircNodes, gameSyncs, compactEvents, main };
