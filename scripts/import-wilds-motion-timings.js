#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DEFAULT_SOURCE = path.join(root, 'game_extracts', 'wilds', 'natives', 'STM', 'Motion', 'Player', 'Weapon');
const DEFAULT_OUTPUT = path.join(root, 'game_extracts', 'tools', 'wilds-motion-timings.json');
const WEAPONS = Object.freeze(JSON.parse(fs.readFileSync(path.join(root, 'data', 'hunt', 'wilds-weapon-codes.json'), 'utf8')).codes);

function assertRange(buffer, offset, size, label) {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset + size > buffer.length) {
        throw new Error(`${label} is outside the file (${offset}+${size}/${buffer.length})`);
    }
}

function readU64(buffer, offset, label) {
    assertRange(buffer, offset, 8, label);
    const value = buffer.readBigUInt64LE(offset);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${label} exceeds safe integer range`);
    return Number(value);
}

function readUtf16(buffer, offset, label) {
    assertRange(buffer, offset, 2, label);
    let end = offset;
    while (end + 1 < buffer.length && end - offset <= 1024 && buffer.readUInt16LE(end) !== 0) end += 2;
    if (end - offset > 1024 || end + 1 >= buffer.length) throw new Error(`${label} is not a bounded UTF-16 string`);
    return buffer.toString('utf16le', offset, end);
}

function parseMotlist(buffer, source = '<buffer>') {
    assertRange(buffer, 0, 0x58, 'motlist header');
    const version = buffer.readUInt32LE(0);
    const magic = buffer.toString('ascii', 4, 8);
    if (version !== 992 || magic !== 'mlst') throw new Error(`${source}: expected Wilds motlist.992, got ${version}/${magic}`);
    const pointersOffset = readU64(buffer, 0x10, 'motion pointer table');
    const motionIdsOffset = readU64(buffer, 0x18, 'motion ID table');
    const count = buffer.readUInt32LE(0x30);
    if (!count || count > 20000) throw new Error(`${source}: implausible motion count ${count}`);
    assertRange(buffer, pointersOffset, count * 8, 'motion pointer table');
    assertRange(buffer, motionIdsOffset, count * 72, 'motion ID table');

    const motions = [];
    const seen = new Set();
    for (let index = 0; index < count; index += 1) {
        const motionOffset = readU64(buffer, pointersOffset + index * 8, `motion pointer ${index}`);
        if (!motionOffset || seen.has(motionOffset)) continue;
        assertRange(buffer, motionOffset, 0x7a, `motion ${index}`);
        if (buffer.toString('ascii', motionOffset + 4, motionOffset + 8) !== 'mot ') continue;
        const motionVersion = buffer.readUInt32LE(motionOffset);
        if (motionVersion !== 932) throw new Error(`${source}: unsupported embedded mot.${motionVersion} at index ${index}`);
        const nameOffset = motionOffset + readU64(buffer, motionOffset + 0x58, `motion name ${index}`);
        const internalName = readUtf16(buffer, nameOffset, `motion name ${index}`);
        const frames = buffer.readFloatLE(motionOffset + 0x60);
        const fps = buffer.readUInt16LE(motionOffset + 0x78);
        if (!(frames > 0 && frames < 100000 && Number.isFinite(frames))) throw new Error(`${source}: invalid frame count at ${index}`);
        if (![15, 24, 25, 30, 48, 50, 60, 90, 120].includes(fps)) throw new Error(`${source}: invalid frame rate ${fps} at ${index}`);
        motions.push({
            index,
            motionId: buffer.readUInt16LE(motionIdsOffset + index * 72 + 8),
            internalName,
            frames: Number(frames.toFixed(4)),
            fps,
            seconds: Number((frames / fps).toFixed(4)),
            timingEvidence: 'installed-game-motlist-header'
        });
        seen.add(motionOffset);
    }
    return { version, embeddedMotionVersion: 932, count, motions };
}

function findMainMotlists(sourceRoot) {
    if (!fs.existsSync(sourceRoot)) return [];
    return fs.readdirSync(sourceRoot, { withFileTypes: true }).filter(entry => entry.isDirectory() && /^Wp\d{2}$/i.test(entry.name))
        .map(entry => {
            const folder = path.join(sourceRoot, entry.name, `${entry.name.toLowerCase()}_00`);
            const file = fs.existsSync(folder) ? fs.readdirSync(folder).find(name => /_00\.motlist\.992$/i.test(name)) : null;
            return file ? { code: `Wp${entry.name.slice(2)}`, file: path.join(folder, file) } : null;
        }).filter(Boolean).sort((a, b) => a.code.localeCompare(b.code));
}

function main(sourceRoot = process.argv[2] || DEFAULT_SOURCE, outputPath = process.argv[3] || DEFAULT_OUTPUT) {
    const files = findMainMotlists(sourceRoot);
    if (files.length !== 14) throw new Error(`Expected 14 Wilds weapon motlists, found ${files.length} below ${sourceRoot}`);
    const weapons = {};
    for (const entry of files) {
        const parsed = parseMotlist(fs.readFileSync(entry.file), entry.file);
        weapons[WEAPONS[entry.code]] = {
            weaponCode: entry.code,
            source: path.relative(root, entry.file).replace(/\\/g, '/'),
            ...parsed
        };
    }
    const data = {
        version: 1,
        game: 'Monster Hunter Wilds',
        evidence: 'installed-game-motlist.992 embedded mot.932 headers',
        durationFormula: 'frameCount / frameRate',
        actionMappingPolicy: 'Do not bind a duration to a named action until ActionParam/BTable/MCT evidence resolves its motion ID.',
        weapons
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    const count = Object.values(weapons).reduce((sum, weapon) => sum + weapon.motions.length, 0);
    console.log(`[hunt-motion] verified ${count} embedded motions across ${files.length} weapons -> ${outputPath}`);
    return data;
}

if (require.main === module) main();
module.exports = { parseMotlist, findMainMotlists, main, WEAPONS };
