#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { classifyBank, inferClipPurpose, cleanBankName } = require('./mh-audio-taxonomy');

const root = path.resolve(__dirname, '..');
const game = process.argv.find(value => value.startsWith('--game='))?.split('=')[1]?.toLowerCase() || 'rise';
const gameProfiles = {
    rise: { input: path.join(root, 'game_extracts', 'rise', 'natives', 'STM'), source: 'Monster Hunter Rise local installation' },
    world: { input: path.join(root, 'game_extracts', 'world'), source: 'Monster Hunter World local installation' },
    wilds: { input: path.join(root, 'game_extracts', 'wilds', 'natives', 'STM'), source: 'Monster Hunter Wilds local installation' }
};
if (!gameProfiles[game]) throw new Error(`Unsupported game profile: ${game}`);
const extractRoot = path.join(root, 'game_extracts', game);
const inputRoot = gameProfiles[game].input;
const outputRoot = path.join(root, 'local_assets', 'monster_hunter', game);
const workRoot = path.join(extractRoot, 'decode_work');
const vgmstream = path.join(root, 'game_extracts', 'tools', 'vgmstream', 'vgmstream-cli.exe');
const quickbmsRoot = path.join(root, 'game_extracts', 'tools', 'Wwise-Unpacker', 'Wwise-Unpacker-master', 'Tools');
const quickbms = path.join(quickbmsRoot, 'quickbms.exe');
const wavescan = path.join(quickbmsRoot, 'wavescan.bms');
const ffmpeg = process.env.FFMPEG_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffmpeg.exe';
const ffprobe = process.env.FFPROBE_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffprobe.exe';
const python = process.env.PYTHON_PATH || 'python';
const wwiser = path.join(root, 'game_extracts', 'tools', 'wwiser', 'wwiser.py');
const semanticReferencePath = path.join(root, 'game_extracts', 'tools', `${game}-audio-references.json`);
const semanticReferenceData = fs.existsSync(semanticReferencePath)
    ? JSON.parse(fs.readFileSync(semanticReferencePath, 'utf8').replace(/^\uFEFF/, ''))
    : { clips: [], voiceProfiles: [] };
const semanticReferenceIndex = new Map();
(semanticReferenceData.clips || []).forEach(reference => {
    const key = `${cleanBankName(reference.bank).toLowerCase()}:${Number(reference.wemOrdinal)}`;
    const current = semanticReferenceIndex.get(key);
    if (!current || current.confidence !== 'high') semanticReferenceIndex.set(key, reference);
});
const voiceProfileIndex = new Map((semanticReferenceData.voiceProfiles || []).map(profile => [cleanBankName(profile.bank).toLowerCase(), profile]));
const semanticBanks = new Set((semanticReferenceData.clips || []).filter(reference => reference.actionFamily !== 'unknown').map(reference => cleanBankName(reference.bank).toLowerCase()));

function semanticReferenceFor(bank, stream) {
    return semanticReferenceIndex.get(`${cleanBankName(bank).toLowerCase()}:${Number(stream)}`) || null;
}

const requested = new Set(process.argv.slice(2).filter(value => !value.startsWith('--')));
const requestedBank = process.argv.find(value => value.startsWith('--bank='))?.slice('--bank='.length).toLowerCase() || null;
const runtimeOnly = process.argv.includes('--runtime');
const retryFailed = process.argv.includes('--retry-failed');
const runtimeMonsterIds = new Set([
    'em001','em002','em007','em011','em013','em018','em023','em024','em025','em026','em027','em032','em036','em037',
    'em042','em043','em044','em045','em047','em050','em057','em058','em063','em071','em072','em077','em080','em082',
    'em086','em100','em101','em102','em103','em104','em105','em106','em107','em108','em109','em110','em111','em112',
    'em113','em114','em115','em116','em117','em118','em120','em121','em122','em123','em124','em125','em126','em127'
]);
const resume = !process.argv.includes('--fresh');
const manifestPath = path.join(outputRoot, 'manifest.json');
const manifest = resume && fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
    : { version: 2, game, source: gameProfiles[game].source, defaultGain: 0.8, entries: [] };
manifest.version = 2;
manifest.game = game;
manifest.source = gameProfiles[game].source;
manifest.entries = Array.isArray(manifest.entries) ? manifest.entries : [];
const completedBanks = new Set(manifest.completedBanks || []);
const failedBanks = new Set(manifest.failedBanks || []);
const ignoredBanks = new Map((manifest.ignoredBanks || []).map(entry => [entry.bank, entry.reason]));
if (retryFailed) {
    for (const bank of [...failedBanks]) {
        if (!requestedBank || cleanBankName(bank).toLowerCase() === requestedBank) {
            failedBanks.delete(bank);
        }
    }
}
for (const bank of [...completedBanks]) {
    const records = manifest.entries.filter(entry => String(entry.sourceBank || '').replace(/\\/g, '/').endsWith(bank));
    if (records.length && records.every(entry => !fs.existsSync(path.join(root, entry.path)))) {
        completedBanks.delete(bank);
        manifest.entries = manifest.entries.filter(entry => !records.includes(entry));
        console.warn(`[mh-audio] reopening completed bank with missing outputs: ${bank}`);
    }
}
manifest.entries.forEach(entry => {
    const meta = classifyBank(entry.sourceBank || '', entry.game || game);
    const semanticReference = semanticReferenceFor(entry.sourceBank || '', entry.stream);
    const inferred = inferClipPurpose(meta, { duration: entry.duration, semanticReference });
    entry.game = entry.game || game;
    entry.purpose = semanticReference?.purpose || meta.purpose;
    entry.actionFamily = inferred.actionFamily;
    entry.weaponId = entry.weaponId || meta.weaponId;
    entry.monsterId = entry.monsterId || meta.monsterId;
    entry.monsterVariant = entry.monsterVariant || meta.monsterVariant;
    entry.semanticEvidence = inferred.semanticEvidence;
    entry.bankEvidence = inferred.bankEvidence;
    entry.reviewHints = inferred.reviewHints;
    entry.classification = inferred.classification;
    entry.voiceProfile = voiceProfileIndex.get(cleanBankName(entry.sourceBank || '').toLowerCase()) || null;
    entry.wwiseEventIds = Array.isArray(entry.wwiseEventIds) ? entry.wwiseEventIds : [];
    entry.wwiseSourceIds = Array.isArray(entry.wwiseSourceIds) ? entry.wwiseSourceIds : [];
});
const hashes = new Set(manifest.entries.map(entry => entry.sha256).filter(Boolean));

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

function classify(file) {
    const meta = classifyBank(file, game);
    if (meta.category === 'unknown' && !process.argv.includes('--all')) return null;
    return meta;
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

function parseTxtpLinks(records) {
    const links = {};
    const addLink = (key, eventId, sourceId = null) => {
        if (!links[key]) links[key] = { eventIds: [], sourceIds: [] };
        if (!links[key].eventIds.includes(eventId)) links[key].eventIds.push(eventId);
        if (sourceId && !links[key].sourceIds.includes(sourceId)) links[key].sourceIds.push(sourceId);
    };
    for (const record of records) {
        const eventId = String(record.eventId || '');
        if (!eventId) continue;
        const text = record.text || '';
        for (const match of text.matchAll(/#s(\d+)\s+#[ie]\s+##(\d+)\.wem/gi)) {
            const stream = Number(match[1]);
            addLink(stream, eventId, match[2]);
            addLink(`source:${match[2]}`, eventId, match[2]);
        }
        // RE Engine media banks often keep the WEM payloads separately from the
        // event/HIRC bank. wwiser writes those as "wem/<source>.wem #i" without
        // an embedded stream ordinal, so source ID is the only exact join key.
        for (const match of text.matchAll(/(?:^|\n)(?:wem\/)?(\d+)\.wem\s+#[ie]\b/gi)) {
            addLink(`source:${match[1]}`, eventId, match[1]);
        }
    }
    return links;
}

function eventLinks(bankFile, bankKey) {
    if (process.argv.includes('--no-events') || !fs.existsSync(wwiser)) return {};
    const cacheRoot = path.join(workRoot, 'event_links');
    fs.mkdirSync(cacheRoot, { recursive: true });
    const cache = path.join(cacheRoot, `${safeName(bankKey)}.json`);
    if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
    const txtpRoot = path.join(cacheRoot, `${safeName(bankKey)}_txtp`);
    fs.rmSync(txtpRoot, { recursive: true, force: true });
    fs.mkdirSync(txtpRoot, { recursive: true });
    try {
        run(python, [wwiser, '-g', '-go', txtpRoot, '-gnw', '-gxni', bankFile]);
    } catch (error) {
        fs.writeFileSync(cache, '{}\n', 'utf8');
        return {};
    }
    const records = walk(txtpRoot).filter(file => file.toLowerCase().endsWith('.txtp')).map(file => ({
        eventId: path.basename(file).match(/event-(\d+)/i)?.[1],
        text: fs.readFileSync(file, 'utf8')
    }));
    const links = parseTxtpLinks(records);
    fs.writeFileSync(cache, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
    fs.rmSync(txtpRoot, { recursive: true, force: true });
    return links;
}

function companionEventBankCandidates(file) {
    const name = path.basename(file);
    if (/_media\.bnk\./i.test(name)) {
        return [file.replace(/_media(?=\.bnk\.)/i, '')];
    }
    // Wilds keeps WEM payloads in *_m.sbnk.1.X64 while the sibling bank
    // without "_m" owns the Wwise event/HIRC graph.
    if (/_m\.sbnk\.\d+\.x64/i.test(name)) {
        return [file.replace(/_m(?=\.sbnk\.\d+\.x64)/i, '')];
    }
    return [];
}

function companionEventBank(file) {
    return companionEventBankCandidates(file).find(candidate => fs.existsSync(candidate)) || null;
}

function eventLinksForDecodedBank(file, staged, bankKey) {
    const direct = eventLinks(staged, bankKey);
    const companion = companionEventBank(file);
    if (!companion) return direct;
    const companionKey = path.relative(inputRoot, companion).replace(/\\/g, '/');
    const companionStaged = path.join(workRoot, `${safeName(path.basename(companion))}.event.bnk`);
    fs.copyFileSync(companion, companionStaged);
    try {
        return { ...direct, ...eventLinks(companionStaged, companionKey) };
    } finally {
        fs.rmSync(companionStaged, { force: true });
    }
}

function linkForStream(links, stream, sourceName) {
    const sourceId = String(sourceName || '').match(/^\d+$/)?.[0];
    return (sourceId && links[`source:${sourceId}`]) || links[stream] || {};
}

function duration(file) {
    const value = run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).stdout.trim();
    return Number(value) || 0;
}

function wavDuration(file) {
    const buffer = fs.readFileSync(file);
    if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF') return duration(file);
    let byteRate = 0;
    let dataSize = 0;
    for (let offset = 12; offset + 8 <= buffer.length;) {
        const id = buffer.toString('ascii', offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4);
        if (id === 'fmt ' && offset + 20 <= buffer.length) byteRate = buffer.readUInt32LE(offset + 16);
        if (id === 'data') { dataSize = size; break; }
        offset += 8 + size + (size % 2);
    }
    return byteRate && dataSize ? dataSize / byteRate : duration(file);
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

function silenceSegments(wav, knownDuration = null) {
    const total = knownDuration ?? wavDuration(wav);
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

function record(output, meta, bank, stream, clip, sourceName, link = {}, knownDuration = null) {
    const hash = sha256(output);
    if (hashes.has(hash)) {
        fs.rmSync(output, { force: true });
        return;
    }
    hashes.add(hash);
    const clipDuration = Number((knownDuration ?? duration(output)).toFixed(3));
    const semanticReference = semanticReferenceFor(bank, stream);
    const inferred = inferClipPurpose(meta, { duration: clipDuration, semanticReference });
    manifest.entries.push({
        path: path.relative(root, output).replace(/\\/g, '/'),
        game,
        category: meta.category,
        group: meta.group,
        language: meta.language,
        purpose: semanticReference?.purpose || meta.purpose,
        actionFamily: inferred.actionFamily,
        weaponId: meta.weaponId,
        monsterId: meta.monsterId,
        monsterVariant: meta.monsterVariant,
        classification: inferred.classification,
        semanticEvidence: inferred.semanticEvidence,
        bankEvidence: inferred.bankEvidence,
        reviewHints: inferred.reviewHints,
        voiceProfile: voiceProfileIndex.get(cleanBankName(bank).toLowerCase()) || null,
        sourceBank: bank,
        sourceStream: sourceName,
        wwiseEventIds: link.eventIds || [],
        wwiseSourceIds: link.sourceIds || [],
        stream,
        clip,
        duration: clipDuration,
        sha256: hash
    });
}

function decodeWem(wem, meta, bank, stem, stream, link = null) {
    const wav = path.join(workRoot, `${safeName(stem)}.pcm.wav`);
    run(vgmstream, ['-i', '-o', wav, wem]);
    const split = meta.category === 'hunter_voice' || meta.category === 'dialogue';
    const total = wavDuration(wav);
    const segments = split ? silenceSegments(wav, total) : [[0, total]];
    segments.forEach(([start, end], clip) => {
        const output = destination(meta, `${stem}_${String(clip + 1).padStart(3, '0')}`);
        encode(wav, output, split ? start : null, split ? end : null);
        record(output, meta, bank, stream, clip + 1, path.basename(wem), link || {}, end - start);
    });
    fs.rmSync(wav, { force: true });
}

function decodeBank(file, meta, bankKey) {
    const packed = /\.(?:pck|spck|npck)(?:\.|$)/i.test(path.basename(file));
    const ext = packed ? '.pck' : '.bnk';
    const staged = path.join(workRoot, `${safeName(path.basename(file))}${ext}`);
    fs.copyFileSync(file, staged);
    const links = ext === '.bnk' ? eventLinksForDecodedBank(file, staged, bankKey) : {};
    if (ext === '.pck') {
        const unpacked = `${staged}.unpacked`;
        fs.rmSync(unpacked, { recursive: true, force: true });
        fs.mkdirSync(unpacked, { recursive: true });
        run(quickbms, ['-o', wavescan, staged, unpacked]);
        const wems = walk(unpacked).filter(item => fs.statSync(item).size > 128);
        wems.forEach((wem, index) => decodeWem(wem, meta, bankKey, `${path.basename(staged, ext)}_${String(index + 1).padStart(3, '0')}`, index + 1, links[index + 1]));
        fs.rmSync(unpacked, { recursive: true, force: true });
    } else {
        const info = streamInfo(staged);
        for (let index = 1; index <= info.count; index += 1) {
            const detail = streamInfo(staged, index);
            const wem = path.join(workRoot, `${safeName(path.basename(staged, ext))}_${String(index).padStart(3, '0')}.wav`);
            run(vgmstream, ['-i', '-s', String(index), '-o', wem, staged]);
            const clipDuration = wavDuration(wem);
            const output = destination(meta, `${path.basename(staged, ext)}_${String(index).padStart(3, '0')}_${detail.name}`);
            encode(wem, output);
            record(output, meta, bankKey, index, 1, detail.name, linkForStream(links, index, detail.name), clipDuration);
            fs.rmSync(wem, { force: true });
        }
    }
    fs.rmSync(staged, { force: true });
}

function relinkManifestEvents() {
    ensureTools();
    const files = new Map(walk(inputRoot).map(file => [path.relative(inputRoot, file).replace(/\\/g, '/').toLowerCase(), file]));
    const banks = [...new Set(manifest.entries
        .filter(entry => !requested.size || requested.has(entry.category))
        .map(entry => entry.sourceBank)
        .filter(Boolean))];
    let linkedEntries = 0;
    let linkedBanks = 0;
    for (const bankKey of banks) {
        const file = files.get(String(bankKey).toLowerCase());
        if (!file || !companionEventBank(file)) continue;
        const staged = path.join(workRoot, `${safeName(path.basename(file))}.relink.bnk`);
        fs.copyFileSync(file, staged);
        try {
            const links = eventLinksForDecodedBank(file, staged, bankKey);
            let changed = false;
            for (const entry of manifest.entries.filter(item => item.sourceBank === bankKey)) {
                const link = linkForStream(links, entry.stream, entry.sourceStream);
                if (!link.eventIds?.length) continue;
                entry.wwiseEventIds = [...new Set([...(entry.wwiseEventIds || []), ...link.eventIds])];
                entry.wwiseSourceIds = [...new Set([...(entry.wwiseSourceIds || []), ...(link.sourceIds || [])])];
                linkedEntries += 1;
                changed = true;
            }
            if (changed) linkedBanks += 1;
        } finally {
            fs.rmSync(staged, { force: true });
        }
    }
    save();
    console.log(`[mh-audio] relinked ${linkedEntries} clips across ${linkedBanks} ${game} media banks`);
}

function save() {
    manifest.generatedAt = new Date().toISOString();
    manifest.completedBanks = [...completedBanks].sort();
    manifest.failedBanks = [...failedBanks].sort();
    manifest.ignoredBanks = [...ignoredBanks.entries()]
        .map(([bank, reason]) => ({ bank, reason }))
        .sort((a, b) => a.bank.localeCompare(b.bank));
    manifest.summary = manifest.entries.reduce((summary, entry) => {
        summary[entry.category] = (summary[entry.category] || 0) + 1;
        return summary;
    }, {});
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function main() {
    if (process.argv.includes('--relink-events')) {
        relinkManifestEvents();
        return;
    }
    if (process.argv.includes('--reclassify-only')) {
        fs.mkdirSync(outputRoot, { recursive: true });
        save();
        console.log(`[mh-audio] reclassified ${manifest.entries.length} existing ${game} clips without decoding`);
        return;
    }
    ensureTools();
    const categoryPriority = ['monster', 'weapon', 'hunter_voice', 'hit', 'item', 'ui', 'companion', 'environment', 'gimmick', 'event', 'npc_voice', 'accessory', 'music', 'unknown'];
    const banks = walk(inputRoot)
        .filter(file => /\.(?:sbnk|spck)\.\d+\.x64(?:\.[a-z0-9]+)?$|\.(?:nbnk|npck|bnk|pck)$/i.test(path.basename(file)))
        .map(file => ({ file, meta: classify(file) }))
        .filter(item => item.meta && (!requested.size || requested.has(item.meta.category)))
        .filter(item => !requestedBank || cleanBankName(item.file).toLowerCase() === requestedBank)
        .filter(item => !process.argv.includes('--semantic-only') || semanticBanks.has(cleanBankName(item.file).toLowerCase()))
        .filter(item => !runtimeOnly || item.meta.category !== 'monster' || runtimeMonsterIds.has(String(item.meta.monsterId || '').replace(/^em0(?=\d{3})/, 'em')))
        .sort((a, b) => categoryPriority.indexOf(a.meta.category) - categoryPriority.indexOf(b.meta.category) || a.file.localeCompare(b.file));
    console.log(`[mh-audio] ${banks.length} local banks selected; resume=${resume}`);
    let processed = 0;
    for (const { file, meta } of banks) {
        const bankKey = path.relative(inputRoot, file).replace(/\\/g, '/');
        if (completedBanks.has(bankKey) || failedBanks.has(bankKey) || ignoredBanks.has(bankKey)) continue;
        if (fs.statSync(file).size <= 32) {
            failedBanks.delete(bankKey);
            ignoredBanks.set(bankKey, 'stub-bank-no-media');
            save();
            console.log(`[mh-audio] ignored media-free stub bank: ${bankKey}`);
            continue;
        }
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

if (require.main === module) main();
module.exports = { parseTxtpLinks, companionEventBankCandidates, companionEventBank, linkForStream };
