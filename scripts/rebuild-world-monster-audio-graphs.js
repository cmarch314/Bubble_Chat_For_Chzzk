#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GRAPH_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'audio_graph');
const EXTRACTOR = path.join(__dirname, 'extract-world-monster-audio-graph.js');
const PROGRESS_PATH = path.join(GRAPH_ROOT, '_rebuild-progress.json');

function writeProgress(value) {
    const temporary = `${PROGRESS_PATH}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, PROGRESS_PATH);
}

function main() {
    const monsterIds = fs.readdirSync(GRAPH_ROOT, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && /^em\d{3}$/i.test(entry.name))
        .map(entry => entry.name.toLowerCase())
        .sort();
    const previous = fs.existsSync(PROGRESS_PATH)
        ? JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'))
        : null;
    const canResume = !process.argv.includes('--restart')
        && previous
        && !previous.finishedAt
        && previous.total === monsterIds.length
        && (previous.completed || []).every(monsterId => monsterIds.includes(monsterId));
    const progress = canResume ? {
        ...previous,
        resumedAt: new Date().toISOString(),
        current: null
    } : {
        version: 1,
        startedAt: new Date().toISOString(),
        total: monsterIds.length,
        completed: [],
        failed: [],
        current: null
    };
    writeProgress(progress);
    const completed = new Set(progress.completed);
    for (const monsterId of monsterIds) {
        if (completed.has(monsterId)) continue;
        progress.current = monsterId;
        writeProgress(progress);
        const result = spawnSync(process.execPath, [EXTRACTOR, `--monster=${monsterId}`], {
            cwd: ROOT,
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024
        });
        if (result.status === 0) {
            progress.completed.push(monsterId);
            console.log(`[world-audio-graphs] ${progress.completed.length}/${monsterIds.length} ${monsterId}`);
        } else {
            progress.failed.push({
                monsterId,
                error: String(result.stderr || result.stdout || `exit ${result.status}`).trim().slice(-2000)
            });
        }
    }
    progress.current = null;
    progress.finishedAt = new Date().toISOString();
    writeProgress(progress);
    if (progress.failed.length) process.exitCode = 1;
}

if (require.main === module) main();
