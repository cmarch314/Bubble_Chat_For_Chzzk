#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { cleanBankName } = require('./mh-audio-taxonomy');

const root = path.resolve(__dirname, '..');
const inputPath = process.argv[2] || path.join(root, 'game_extracts', 'tools', 'mhw_audio_reference-inspect.ndjson');
const outputPath = process.argv[3] || path.join(root, 'game_extracts', 'tools', 'world-audio-references.json');

function text(value) {
    return value == null ? '' : String(value).trim();
}

function semanticFromLabel(label, bank) {
    const value = text(label).toLowerCase();
    const bankLower = text(bank).toLowerCase();
    const tags = [];
    let purpose = 'unknown';
    let actionFamily = 'unknown';
    if (/\broar\b|howl/.test(value)) {
        purpose = 'monster_vocal'; actionFamily = 'monster_roar'; tags.push('roar');
    } else if (/dragon piercer/.test(value)) {
        purpose = 'weapon_action'; actionFamily = /hit/.test(value) ? 'dragon_piercer_hit' : 'dragon_piercer'; tags.push('bow', 'projectile');
    } else if (/arrow shot|shoot.*arrow|shot.*arrow/.test(value)) {
        purpose = 'weapon_action'; actionFamily = /arc shot/.test(value) ? 'arc_shot' : 'bow_shot'; tags.push('bow', 'projectile');
    } else if (/reload|reloaded|reloading/.test(value)) {
        purpose = 'weapon_action'; actionFamily = 'reload'; tags.push('reload');
    } else if (/special sheath/.test(value)) {
        purpose = 'weapon_action'; actionFamily = 'special_sheath'; tags.push('long_sword', 'sheath');
    } else if (/foresight|counter activated|counter sound/.test(value)) {
        purpose = 'weapon_action'; actionFamily = 'counter'; tags.push('counter');
    } else if (/slash|stab|thrust|swing|smash|shell|phial|blade|axe|hammer|lance|glaive|kinsect|shot/.test(value) && /^wp/.test(bankLower)) {
        purpose = 'weapon_action'; actionFamily = 'weapon_action';
    } else if (/potion/.test(value)) {
        purpose = 'item_action'; actionFamily = 'potion_use'; tags.push('potion');
    } else if (/lifepowder/.test(value)) {
        purpose = 'item_action'; actionFamily = 'lifepowder_use'; tags.push('support');
    } else if (/sharpen finished|weapon sharpen finished shine/.test(value)) {
        purpose = 'item_action'; actionFamily = 'whetstone_finish'; tags.push('whetstone', 'completion');
    } else if (/weapon sharpen/.test(value)) {
        purpose = 'item_action'; actionFamily = 'whetstone_stroke'; tags.push('whetstone');
    } else if (/hit|impact|part break|slam|explosion|breath|fireball|rocks falling/.test(value) && /^em/.test(bankLower)) {
        purpose = 'monster_action'; actionFamily = 'monster_attack'; tags.push('attack');
    } else if (/voice|growl|scream|grunt|pain|aggro/.test(value) && /^em/.test(bankLower)) {
        purpose = 'monster_vocal'; actionFamily = 'monster_vocal'; tags.push('vocal');
    }
    return { purpose, actionFamily, tags };
}

function reference(bank, wemOrdinal, label, confirmed, notes, evidenceLocation) {
    const semantic = semanticFromLabel(label, bank);
    const isConfirmed = /^yes$/i.test(text(confirmed));
    return {
        game: 'world',
        bank: cleanBankName(bank).toLowerCase(),
        wemOrdinal: Number(wemOrdinal),
        label: text(label),
        notes: text(notes) || null,
        purpose: semantic.purpose,
        actionFamily: semantic.actionFamily,
        tags: semantic.tags,
        confirmed: isConfirmed,
        confidence: isConfirmed ? 'high' : semantic.purpose === 'unknown' ? 'low' : 'medium',
        evidence: {
            type: 'labelled-community-map',
            source: 'MHW Audio Modding Google workbook',
            location: evidenceLocation
        }
    };
}

function parseNumberedNote(bank, note, location) {
    const records = [];
    for (const part of text(note).split(';')) {
        const match = part.match(/^\s*([0-9][0-9\s,&/]*(?:or\s*\d+)?(?:\s*\(possibly\s*\d+\))?)\s*=\s*(.+)$/i);
        if (!match) continue;
        const ordinals = [...match[1].matchAll(/\d+/g)].map(item => Number(item[0]));
        for (const ordinal of ordinals) records.push(reference(bank, ordinal, match[2], null, part, location));
    }
    return records;
}

function main() {
    if (!fs.existsSync(inputPath)) throw new Error(`Reference inspection is missing: ${inputPath}`);
    const tables = fs.readFileSync(inputPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
    const clips = [];
    const banks = [];
    const voiceProfiles = [];
    const unresolved = [];

    for (const table of tables) {
        const rows = Array.isArray(table.values) ? table.values : [];
        if (table.sheet === 'Bank Index') {
            rows.forEach((row, index) => {
                const bank = text(row[0]);
                if (!/\.(?:nbnk|npck)$/i.test(bank)) return;
                banks.push({ bank: cleanBankName(bank).toLowerCase(), description: text(row[3]) || null, notes: text(row[4]) || null, evidenceLocation: `Bank Index!A${index + 1}:E${index + 1}` });
                clips.push(...parseNumberedNote(bank, row[4], `Bank Index!E${index + 1}`));
            });
            continue;
        }
        if (table.sheet === 'Character Voice Presets') {
            rows.forEach((row, index) => {
                const bank = text(row[0]);
                if (!/\.nbnk$/i.test(bank)) return;
                const label = text(row[3]);
                voiceProfiles.push({ bank: cleanBankName(bank).toLowerCase(), label, gender: /^female/i.test(label) ? 'female' : /^male/i.test(label) ? 'male' : null, evidenceLocation: `Character Voice Presets!A${index + 1}:D${index + 1}` });
            });
            continue;
        }
        if (['Monster SFX', 'Sheet106'].includes(table.sheet)) {
            unresolved.push({ sheet: table.sheet, reason: 'sheet does not identify a source bank', labelledRows: rows.filter(row => text(row?.[1] || row?.[2])).length });
            continue;
        }
        const bank = /\.(?:nbnk|npck)$/i.test(table.sheet) ? table.sheet : /^em\d+_(?:vo|se)$/i.test(table.sheet) ? `${table.sheet}.nbnk` : null;
        if (!bank || /^copy of /i.test(bank)) continue;
        const header = Array.isArray(rows[0]) ? rows[0].map(text) : [];
        const detectedConfirmedIndex = header.findIndex(value => /confirmed|ยืนยัน/i.test(value));
        const confirmedIndex = detectedConfirmedIndex >= 0 ? detectedConfirmedIndex : 3;
        const labelIndex = confirmedIndex - 1;
        const notesIndex = confirmedIndex + 1;
        rows.slice(1).forEach((row, index) => {
            const ordinal = Number(row[0]);
            const label = text(row[labelIndex]);
            if (!Number.isInteger(ordinal) || ordinal < 1 || !label) return;
            clips.push(reference(bank, ordinal, label, row[confirmedIndex], row[notesIndex], `${table.sheet}!A${index + 2}:F${index + 2}`));
        });
    }

    const unique = new Map();
    clips.forEach(item => {
        const key = `${item.bank}:${item.wemOrdinal}:${item.label}`;
        if (!unique.has(key) || unique.get(key).confidence === 'low') unique.set(key, item);
    });
    const result = {
        version: 1,
        game: 'world',
        sourceWorkbook: path.basename(inputPath),
        generatedAt: new Date().toISOString(),
        banks,
        voiceProfiles,
        clips: [...unique.values()].sort((a, b) => a.bank.localeCompare(b.bank) || a.wemOrdinal - b.wemOrdinal),
        unresolved
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`[mh-audio] normalized ${result.clips.length} clip labels and ${voiceProfiles.length} voice profiles -> ${outputPath}`);
}

if (require.main === module) main();
module.exports = { semanticFromLabel, parseNumberedNote };
