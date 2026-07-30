#!/usr/bin/env node
'use strict';

// Rebuild verified Monster Hunter: World dedicated hunt music from installed
// WWST -> Wwise HIRC -> AKPK media evidence. Raw media remains in ignored
// game_extracts/local_assets; the normalized track is written only to the
// git-ignored local runtime BGM directory.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WORLD_ROOT = path.join(ROOT, 'game_extracts', 'world');
const PROFILE_PATH = path.join(ROOT, 'data', 'hunt', 'world-dedicated-bgm-sources.json');
const WWISER = path.join(ROOT, 'game_extracts', 'tools', 'wwiser', 'wwiser.py');
const VGMSTREAM = path.join(ROOT, 'game_extracts', 'tools', 'vgmstream', 'vgmstream-cli.exe');
const FFMPEG = process.env.FFMPEG_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffmpeg.exe';
const PYTHON = process.env.PYTHON_PATH || 'python';
const WORK_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'bgm_build');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: options.cwd || ROOT,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024
    });
    if (result.status !== 0) {
        throw new Error([
            `${path.basename(command)} failed with exit ${result.status}`,
            result.stdout,
            result.stderr
        ].filter(Boolean).join('\n'));
    }
    return result;
}

function safeInside(root, target) {
    const resolvedRoot = path.resolve(root);
    const resolvedTarget = path.resolve(target);
    if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)) {
        throw new Error(`Unsafe generated path: ${resolvedTarget}`);
    }
    return resolvedTarget;
}

function packageIndex(file) {
    const handle = fs.openSync(file, 'r');
    try {
        const header = Buffer.alloc(56);
        fs.readSync(handle, header, 0, header.length, 0);
        if (header.subarray(0, 4).toString('ascii') !== 'AKPK') {
            throw new Error(`Expected AKPK package: ${file}`);
        }
        const count = header.readUInt32LE(52);
        const raw = Buffer.alloc(count * 20);
        fs.readSync(handle, raw, 0, raw.length, 56);
        const entries = new Map();
        for (let index = 0; index < count; index += 1) {
            const offset = index * 20;
            entries.set(raw.readUInt32LE(offset), {
                id: raw.readUInt32LE(offset),
                type: raw.readUInt32LE(offset + 4),
                length: raw.readUInt32LE(offset + 8),
                offset: raw.readUInt32LE(offset + 12),
                ordinal: index + 1
            });
        }
        return entries;
    } finally {
        fs.closeSync(handle);
    }
}

function extractPackageMedia(packageFile, entries, sourceIds, outputRoot) {
    const handle = fs.openSync(packageFile, 'r');
    try {
        for (const sourceId of sourceIds) {
            const entry = entries.get(Number(sourceId));
            if (!entry) throw new Error(`AKPK media ${sourceId} is absent from ${packageFile}`);
            const media = Buffer.alloc(entry.length);
            fs.readSync(handle, media, 0, media.length, entry.offset);
            fs.writeFileSync(path.join(outputRoot, `${sourceId}.wem`), media);
        }
    } finally {
        fs.closeSync(handle);
    }
}

function findRecipe(txtpRoot, profile) {
    const eventNeedle = `event-${profile.eventId}`;
    const candidates = fs.readdirSync(txtpRoot)
        .filter(name => name.endsWith('.txtp') && name.includes(eventNeedle))
        .map(name => path.join(txtpRoot, name))
        .filter(file => {
            // wwiser trims very long filenames, so the complete authoritative
            // gamesync selection must be checked in the recipe header.
            const recipe = fs.readFileSync(file, 'utf8');
            return profile.requiredGameSyncs.every(sync => recipe.includes(`(${sync})`));
        });
    if (candidates.length !== 1) {
        throw new Error(`Expected one Wwise recipe for ${eventNeedle}, found ${candidates.length}`);
    }
    return candidates[0];
}

function sourceIdsFromRecipe(file) {
    const text = fs.readFileSync(file, 'utf8');
    return [...new Set([...text.matchAll(/wem\/(\d+)\.wem\b/g)].map(match => Number(match[1])))];
}

function build(profileId, profile) {
    const workRoot = safeInside(WORK_ROOT, path.join(WORK_ROOT, profileId));
    fs.rmSync(workRoot, { recursive: true, force: true });
    const txtpRoot = path.join(workRoot, 'txtp');
    const wemRoot = path.join(txtpRoot, 'wem');
    fs.mkdirSync(wemRoot, { recursive: true });

    const banks = profile.eventBanks.map(relative => path.join(WORLD_ROOT, relative));
    const stateFiles = profile.stateFiles.map(relative => path.join(WORLD_ROOT, relative));
    const packageFile = path.join(WORLD_ROOT, profile.mediaPackage);
    for (const file of [...banks, ...stateFiles, packageFile, WWISER, VGMSTREAM, FFMPEG]) {
        if (!fs.existsSync(file)) throw new Error(`Missing required source/tool: ${file}`);
    }

    run(PYTHON, [
        WWISER, '-g', '-gu', '-gd', '-gde', '-gwd',
        '-go', txtpRoot, '-gnw', '-gxni', ...banks
    ]);
    const generatedRecipe = findRecipe(txtpRoot, profile);
    const recipe = path.join(txtpRoot, 'selected.txtp');
    fs.copyFileSync(generatedRecipe, recipe);
    const sourceIds = sourceIdsFromRecipe(recipe);
    const expected = [...profile.expectedSourceIds].map(Number).sort((a, b) => a - b);
    const actual = [...sourceIds].sort((a, b) => a - b);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Recipe media changed: expected ${expected.join(', ')}, got ${actual.join(', ')}`);
    }

    extractPackageMedia(packageFile, packageIndex(packageFile), sourceIds, wemRoot);
    const renderSourceId = Number(profile.renderSourceId);
    if (!sourceIds.includes(renderSourceId)) {
        throw new Error(`Render source ${renderSourceId} is not part of the selected Wwise recipe`);
    }
    const renderSource = path.join(wemRoot, `${renderSourceId}.wem`);
    const wav = path.join(workRoot, `${profileId}.wav`);
    const temporaryOutput = path.join(workRoot, `${profileId}.mp3`);
    run(VGMSTREAM, ['-i', '-o', wav, renderSource]);
    run(FFMPEG, [
        '-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
        '-map_metadata', '-1',
        '-af', 'loudnorm=I=-22:TP=-2:LRA=11',
        '-ar', '48000', '-ac', '2',
        '-codec:a', 'libmp3lame', '-b:a', '192k',
        temporaryOutput
    ]);

    const output = safeInside(ROOT, path.join(ROOT, profile.output));
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(temporaryOutput, output);
    const stat = fs.statSync(output);
    console.log(`[world-bgm] ${profileId}: ${profile.eventId} -> ${profile.output} (${stat.size} bytes)`);
}

function main() {
    const catalog = readJson(PROFILE_PATH);
    const requested = process.argv.find(arg => arg.startsWith('--profile='))?.split('=')[1];
    const profiles = requested
        ? [[requested, catalog.profiles[requested]]]
        : Object.entries(catalog.profiles);
    for (const [profileId, profile] of profiles) {
        if (!profile) throw new Error(`Unknown dedicated BGM profile: ${profileId}`);
        build(profileId, profile);
    }
}

if (require.main === module) main();

module.exports = { extractPackageMedia, findRecipe, packageIndex, sourceIdsFromRecipe };
