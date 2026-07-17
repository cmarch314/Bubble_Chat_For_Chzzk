#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const extractRoot = path.join(root, 'game_extracts', 'rise');
const inputRoot = path.join(extractRoot, 'natives', 'STM');
const outputRoot = path.join(root, 'local_assets', 'monster_hunter', 'rise');
const workRoot = path.join(extractRoot, 'decode_work');
const vgmstream = path.join(root, 'game_extracts', 'tools', 'vgmstream', 'vgmstream-cli.exe');
const quickbmsRoot = path.join(root, 'game_extracts', 'tools', 'Wwise-Unpacker', 'Wwise-Unpacker-master', 'Tools');
const quickbms = path.join(quickbmsRoot, 'quickbms.exe');
const wavescan = path.join(quickbmsRoot, 'wavescan.bms');
const ffmpeg = process.env.FFMPEG_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffmpeg.exe';
const ffprobe = process.env.FFPROBE_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffprobe.exe';

const requested = new Set(process.argv.slice(2).filter(value => !value.startsWith('--')));
const resume = !process.argv.includes('--fresh');
const manifestPath = path.join(outputRoot, 'manifest.json');
const manifest = resume && fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
    : { version: 1, source: 'Monster Hunter Rise local installation', defaultGain: 0.8, entries: [] };
const completedBanks = new Set(manifest.completedBanks || []);
const failedBanks = new Set(manifest.failedBanks || []);
const hashes = new Set(manifest.entries.map(entry => entry.sha256));

function ensureTools() {
    for (const file of [vgmstream, quickbms, wavescan, ffmpeg, ffprobe]) {
        if (!fs.existsSync(file)) throw new Error(`Required local tool is missing: ${file}`);
    }
    fs.mkdirSync(outputRoot, { recursive: true });
    fs.mkdirSync(workRoot, { recursive: true });
}

function walk(dir, result = []) {
    if (!fs.existsSync(dir)) return result;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(absolute, result);
        else result.push(absolute);
    }
    return result;
}

function localeOf(name) {
    const match = name.match(/\.X64\.(En|Fc|Ja)$/i);
    return match ? match[1].toLowerCase() : null;
}

function classify(file) {
    const name = path.basename(file).toLowerCase();
    let match;
    if (name.startsWith('pl_wp_')) {
        const weaponCodes = ['g_swd', 'l_swd', 's_swd', 'd_bld', 'ham', 'hrn', 'lan', 'g_lan', 's_axe', 'c_axe', 'i_gla', 'l_bg', 'h_bg', 'bow'];
        const weapon = weaponCodes.find(code => name.startsWith(`pl_wp_${code}_`) || name.startsWith(`pl_wp_${code}.`)) || 'common';
        return { category: 'weapon', group: weapon, language: null };
    }
    if ((match = name.match(/^(ems?\d{3})/))) return { category: 'monster', group: match[1], language: null };
    if (name.startsWith('em_')) return { category: 'monster', group: 'common', language: null };
    if (name.startsWith('hit_')) return { category: 'hit', group: name.includes('hit_pl') ? 'hunter' : 'monster', language: null };
    if (name.startsWith('pl_voice')) {
        const voice = name.match(/^pl_voice_([^_.]+(?:_[^_.]+)?)/)?.[1] || 'common';
        return { category: 'hunter_voice', group: voice, language: localeOf(name) || 'neutral' };
    }
    if (name.startsWith('dialogue') || name.startsWith('meat_voice')) {
        return { category: 'dialogue', group: name.startsWith('meat_voice') ? 'canteen' : 'character', language: localeOf(name) || 'neutral' };
    }
    if (name.startsWith('ui_') || name.startsWith('gui_')) return { category: 'ui', group: 'common', language: null };
    if (name.startsWith('buff') || name.startsWith('pl_com') || name.startsWith('pl_quest') || name.startsWith('system')) {
        return { category: 'item', group: 'common', language: null };
    }
    return null;
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, { encoding: options.binary ? null : 'utf8', maxBuffer: 128 * 1024 * 1024, ...options });
    if (result.status !== 0) {
        const detail = String(result.stderr || result.stdout || '').trim().slice(-1200);
        throw new Error(`${path.basename(command)} failed (${result.status}): ${detail}`);
    }
    return result;
}

function safeName(value) {
    return value.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function streamInfo(file, index = null) {
    const args = ['-m'];
    if (index !== null) args.push('-s', String(index));
    args.push(file);
    const text = run(vgmstream, args).stdout;
    const count = Number(text.match(/stream count:\s*(\d+)/i)?.[1] || 1);
    const name = text.match(/stream name:\s*(.+)/i)?.[1]?.trim() || String(index || 1);
    return { count, name };
}

function duration(file) {
    const value = run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).stdout.trim();
    return Number(value) || 0;
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function destination(meta, stem) {
    const parts = [outputRoot, meta.category];
    if (meta.language) parts.push(meta.language);
    parts.push(meta.group);
    const dir = path.join(...parts);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${safeName(stem)}.mp3`);
}

function encode(wav, output, start = null, end = null) {
    const args = ['-hide_banner', '-loglevel', 'error', '-y'];
    if (start !== null) args.push('-ss', start.toFixed(3));
    args.push('-i', wav);
    if (start !== null && end !== null) args.push('-t', Math.max(0.05, end - start).toFixed(3));
    args.push('-map_metadata', '-1', '-af', 'loudnorm=I=-20:TP=-2:LRA=11', '-ar', '48000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '128k', output);
    try {
        run(ffmpeg, args);
    } catch (error) {
        const filterIndex = args.indexOf('loudnorm=I=-20:TP=-2:LRA=11');
        if (filterIndex >= 0) args[filterIndex] = 'dynaudnorm=f=150:g=12,volume=0.8';
        run(ffmpeg, args);
    }
}

function silenceSegments(wav) {
    const total = duration(wav);
    if (total <= 20) return [[0, total]];
    const result = spawnSync(ffmpeg, ['-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.28', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const log = `${result.stdout || ''}\n${result.stderr || ''}`;
    const events = [...log.matchAll(/silence_(start|end):\s*([0-9.]+)/g)].map(match => ({ type: match[1], time: Number(match[2]) }));
    const segments = [];
    const addRegion = (from, to) => {
        if (to - from < 0.22) return;
        for (let cursor = from; cursor < to - 0.21; cursor += 12) {
            segments.push([Math.max(0, cursor - 0.06), Math.min(total, cursor + 12.06, to + 0.06)]);
        }
    };
    let start = 0;
    for (const event of events) {
        if (event.type === 'start') {
            addRegion(start, event.time);
        } else start = event.time;
    }
    addRegion(start, total);
    if (!segments.length) addRegion(0, total);
    return segments;
}

function record(output, meta, bank, stream, clip, sourceName) {
    const hash = sha256(output);
    if (hashes.has(hash)) {
        fs.rmSync(output, { force: true });
        return;
    }
    hashes.add(hash);
    manifest.entries.push({
        path: path.relative(root, output).replace(/\\/g, '/'),
        category: meta.category,
        group: meta.group,
        language: meta.language,
        sourceBank: bank,
        sourceStream: sourceName,
        stream,
        clip,
        duration: Number(duration(output).toFixed(3)),
        sha256: hash
    });
}

function decodeWem(wem, meta, bank, stem, stream) {
    const wav = path.join(workRoot, `${safeName(stem)}.pcm.wav`);
    run(vgmstream, ['-i', '-o', wav, wem]);
    const split = meta.category === 'hunter_voice' || meta.category === 'dialogue';
    const segments = split ? silenceSegments(wav) : [[0, duration(wav)]];
    segments.forEach(([start, end], clip) => {
        const output = destination(meta, `${stem}_${String(clip + 1).padStart(3, '0')}`);
        encode(wav, output, split ? start : null, split ? end : null);
        record(output, meta, bank, stream, clip + 1, path.basename(wem));
    });
    fs.rmSync(wav, { force: true });
}

function decodeBank(file, meta, bankKey) {
    const ext = file.toLowerCase().includes('.pck.') ? '.pck' : '.bnk';
    const staged = path.join(workRoot, `${safeName(path.basename(file))}${ext}`);
    fs.copyFileSync(file, staged);
    if (ext === '.pck') {
        const unpacked = `${staged}.unpacked`;
        fs.rmSync(unpacked, { recursive: true, force: true });
        fs.mkdirSync(unpacked, { recursive: true });
        run(quickbms, ['-o', wavescan, staged, unpacked]);
        const wems = walk(unpacked).filter(item => fs.statSync(item).size > 128);
        wems.forEach((wem, index) => decodeWem(wem, meta, bankKey, `${path.basename(staged, ext)}_${String(index + 1).padStart(3, '0')}`, index + 1));
        fs.rmSync(unpacked, { recursive: true, force: true });
    } else {
        const info = streamInfo(staged);
        for (let index = 1; index <= info.count; index += 1) {
            const detail = streamInfo(staged, index);
            const wem = path.join(workRoot, `${safeName(path.basename(staged, ext))}_${String(index).padStart(3, '0')}.wav`);
            run(vgmstream, ['-i', '-s', String(index), '-o', wem, staged]);
            const output = destination(meta, `${path.basename(staged, ext)}_${String(index).padStart(3, '0')}_${detail.name}`);
            encode(wem, output);
            record(output, meta, bankKey, index, 1, detail.name);
            fs.rmSync(wem, { force: true });
        }
    }
    fs.rmSync(staged, { force: true });
}

function save() {
    manifest.generatedAt = new Date().toISOString();
    manifest.completedBanks = [...completedBanks].sort();
    manifest.failedBanks = [...failedBanks].sort();
    manifest.summary = manifest.entries.reduce((summary, entry) => {
        summary[entry.category] = (summary[entry.category] || 0) + 1;
        return summary;
    }, {});
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function main() {
    ensureTools();
    const banks = walk(inputRoot)
        .filter(file => /\.(?:bnk|pck)\./i.test(path.basename(file)))
        .map(file => ({ file, meta: classify(file) }))
        .filter(item => item.meta && (!requested.size || requested.has(item.meta.category)))
        .sort((a, b) => a.meta.category.localeCompare(b.meta.category) || a.file.localeCompare(b.file));
    console.log(`[mh-audio] ${banks.length} local banks selected; resume=${resume}`);
    let processed = 0;
    for (const { file, meta } of banks) {
        const bankKey = path.relative(inputRoot, file).replace(/\\/g, '/');
        if (completedBanks.has(bankKey) || failedBanks.has(bankKey)) continue;
        try {
            decodeBank(file, meta, bankKey);
            completedBanks.add(bankKey);
            processed += 1;
            save();
            console.log(`[mh-audio] ${processed}/${banks.length}: ${bankKey} -> ${manifest.entries.length} clips`);
        } catch (error) {
            failedBanks.add(bankKey);
            save();
            console.warn(`[mh-audio] skipped ${bankKey}: ${error.message}`);
        }
    }
    save();
    console.log(`[mh-audio] complete: ${manifest.entries.length} clips`, manifest.summary);
}

main();
