#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { cleanBankName } = require('./mh-audio-taxonomy');

const root = path.resolve(__dirname, '..');
const referencePath = path.join(root, 'game_extracts', 'tools', 'world-audio-references.json');
const manifestPath = path.join(root, 'local_assets', 'monster_hunter', 'world', 'manifest.json');
const bankMapPath = path.join(root, 'data', 'hunt', 'world-monster-audio-banks.json');
const confirmationsPath = path.join(root, 'data', 'hunt', 'world-monster-roar-confirmations.json');
const outputPath = path.join(root, 'js', 'effects', 'hunt', 'data', 'WorldMonsterRoarRoutes.generated.js');

function normalizedBank(value) {
    return cleanBankName(value).toLowerCase();
}

function validEventChain(entry) {
    const eventIds = Array.isArray(entry?.wwiseEventIds) ? entry.wwiseEventIds.map(String) : [];
    const sourceIds = Array.isArray(entry?.wwiseSourceIds) ? entry.wwiseSourceIds.map(String) : [];
    return eventIds.length > 0
        && sourceIds.includes(String(entry?.sourceStream))
        && entry?.path
        && entry?.category === 'monster';
}

function resolveWorldMonsterRoars(references, manifest, monsterIdsByBank, confirmations = {}) {
    const entries = Array.isArray(manifest?.entries) ? manifest.entries : [];
    const entriesByBank = new Map();
    entries.forEach(entry => {
        const bank = normalizedBank(entry.sourceBank);
        if (!bank || entry.category !== 'monster') return;
        if (!entriesByBank.has(bank)) entriesByBank.set(bank, []);
        entriesByBank.get(bank).push(entry);
    });
    entriesByBank.forEach(bankEntries => bankEntries.sort((a, b) =>
        Number(a.stream) - Number(b.stream) || Number(a.sourceStream) - Number(b.sourceStream)));

    const routes = {};
    const unresolved = [];
    const review = [];
    const referencesByBank = new Map();
    (references?.clips || []).filter(reference => reference.actionFamily === 'monster_roar')
        .forEach(reference => {
            const bank = normalizedBank(reference.bank);
            if (!referencesByBank.has(bank)) referencesByBank.set(bank, []);
            referencesByBank.get(bank).push(reference);
        });

    referencesByBank.forEach((bankReferences, bank) => {
        const monsterIds = monsterIdsByBank[bank] || [];
        if (!monsterIds.length) return;
        const bankEntries = entriesByBank.get(bank) || [];
        const sourceSortedEntries = [...bankEntries].sort((a, b) =>
            Number(a.sourceStream) - Number(b.sourceStream) || Number(a.stream) - Number(b.stream));
        const candidateMap = new Map();
        const addCandidate = (reference, entry, mappingBasis) => {
            if (!validEventChain(entry)) return;
            const key = String(entry.sourceStream);
            if (!candidateMap.has(key)) {
                candidateMap.set(key, { reference, entry, mappingBases: [] });
            }
            const candidate = candidateMap.get(key);
            if (!candidate.mappingBases.includes(mappingBasis)) candidate.mappingBases.push(mappingBasis);
        };
        bankReferences.forEach(reference => {
            const number = Number(reference.wemOrdinal);
            // Community sheets do not use one globally reliable numbering
            // convention. Preserve both plausible interpretations for audition:
            // decoded stream N, and zero-based index N into successfully decoded
            // source-ID order. Diablos proves these may point at different files.
            addCandidate(reference, bankEntries.find(entry => Number(entry.stream) === number), 'direct-decoded-stream');
            addCandidate(reference, sourceSortedEntries[number], 'zero-based-decoded-index');
        });
        const uniqueCandidates = [...candidateMap.values()];
        const confirmation = confirmations[bank];
        let selected = null;
        let evidenceType = 'world-user-audition-event-chain';
        if (confirmation) {
            const confirmedEntry = bankEntries.find(entry =>
                String(entry.sourceStream) === String(confirmation.sourceStream));
            const expectedEvents = (confirmation.eventIds || []).map(String);
            const actualEvents = (confirmedEntry?.wwiseEventIds || []).map(String);
            if (validEventChain(confirmedEntry)
                && expectedEvents.length > 0
                && expectedEvents.every(eventId => actualEvents.includes(eventId))) {
                selected = {
                    reference: bankReferences[0],
                    entry: confirmedEntry,
                    confirmation
                };
                evidenceType = 'world-user-audition-event-chain';
            } else {
                unresolved.push({
                    bank,
                    reason: 'stale-confirmation',
                    expectedSourceStream: String(confirmation.sourceStream),
                    expectedEventIds: expectedEvents
                });
            }
        } else {
            unresolved.push({
                bank,
                reason: uniqueCandidates.length ? 'needs-audition' : 'missing-event-chain',
                candidates: uniqueCandidates.map(candidate => ({
                    referenceWemNumber: Number(candidate.reference.wemOrdinal),
                    mappingBases: candidate.mappingBases,
                    decodedStream: Number(candidate.entry.stream),
                    sourceStream: String(candidate.entry.sourceStream),
                    eventIds: candidate.entry.wwiseEventIds.map(String),
                    path: candidate.entry.path
                }))
            });
        }

        review.push({
            bank,
            monsterIds,
            status: selected ? 'user-confirmed' : 'needs-audition',
            candidates: uniqueCandidates.map(candidate => ({
                referenceWemNumber: Number(candidate.reference.wemOrdinal),
                mappingBases: candidate.mappingBases,
                decodedStream: Number(candidate.entry.stream),
                sourceStream: String(candidate.entry.sourceStream),
                eventIds: candidate.entry.wwiseEventIds.map(String),
                path: candidate.entry.path
            }))
        });

        if (!selected) return;
        const { reference, entry } = selected;
        const evidence = {
            type: evidenceType,
            sourceReference: reference.evidence,
            bank,
            ordinalBasis: 'audition-confirmed-source',
            referenceWemNumber: Number(reference.wemOrdinal),
            decodedStream: Number(entry.stream),
            eventIds: entry.wwiseEventIds.map(String),
            sourceIds: entry.wwiseSourceIds.map(String),
            sourceStream: String(entry.sourceStream),
            confirmation: selected.confirmation || null
        };
        const confirmedMonsterIds = Array.isArray(selected.confirmation?.monsterIds)
            ? monsterIds.filter(monsterId => selected.confirmation.monsterIds.includes(monsterId))
            : monsterIds;
        confirmedMonsterIds.forEach(monsterId => {
            routes[`${monsterId}:roar`] = [{
                label: selected.confirmation?.label || reference.label,
                evidence,
                layers: [[entry.path, 0.78, 0]]
            }];
        });
    });
    return { routes, unresolved, review };
}

function renderRuntime(result) {
    return `'use strict';\n\n`
        + `const HUNT_WORLD_MONSTER_ROAR_ROUTES = Object.freeze(${JSON.stringify(result.routes, null, 2)});\n`
        + `const HUNT_WORLD_MONSTER_ROAR_UNRESOLVED = Object.freeze(${JSON.stringify(result.unresolved, null, 2)});\n\n`
        + `const HUNT_WORLD_MONSTER_ROAR_REVIEW = Object.freeze(${JSON.stringify(result.review, null, 2)});\n\n`
        + `if (typeof module !== 'undefined' && module.exports) {\n`
        + `    module.exports = { HUNT_WORLD_MONSTER_ROAR_ROUTES, HUNT_WORLD_MONSTER_ROAR_UNRESOLVED, HUNT_WORLD_MONSTER_ROAR_REVIEW };\n`
        + `} else {\n`
        + `    window.HUNT_WORLD_MONSTER_ROAR_ROUTES = HUNT_WORLD_MONSTER_ROAR_ROUTES;\n`
        + `    window.HUNT_WORLD_MONSTER_ROAR_UNRESOLVED = HUNT_WORLD_MONSTER_ROAR_UNRESOLVED;\n`
        + `    window.HUNT_WORLD_MONSTER_ROAR_REVIEW = HUNT_WORLD_MONSTER_ROAR_REVIEW;\n`
        + `}\n`;
}

function main() {
    for (const required of [referencePath, manifestPath, bankMapPath, confirmationsPath]) {
        if (!fs.existsSync(required)) throw new Error(`Required roar evidence is missing: ${required}`);
    }
    const result = resolveWorldMonsterRoars(
        JSON.parse(fs.readFileSync(referencePath, 'utf8')),
        JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
        JSON.parse(fs.readFileSync(bankMapPath, 'utf8')),
        JSON.parse(fs.readFileSync(confirmationsPath, 'utf8'))
    );
    fs.writeFileSync(outputPath, renderRuntime(result), 'utf8');
    console.log(`[mh-audio] resolved ${Object.keys(result.routes).length} monster roar routes; unresolved=${result.unresolved.length}`);
}

if (require.main === module) main();
module.exports = { normalizedBank, resolveWorldMonsterRoars, renderRuntime };
