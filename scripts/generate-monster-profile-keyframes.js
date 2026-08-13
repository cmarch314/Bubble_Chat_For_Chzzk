'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'styles', 'hunt-runtime.css');
const OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MonsterProfileKeyframes.generated.js');

function blockAt(css, open) {
    let depth = 0;
    for (let index = open; index < css.length; index += 1) {
        if (css[index] === '{') depth += 1;
        else if (css[index] === '}' && --depth === 0) return css.slice(open + 1, index);
    }
    throw new Error(`Unclosed CSS block at ${open}`);
}

function declarations(text) {
    const frame = {};
    for (const entry of text.split(';')) {
        const colon = entry.indexOf(':');
        if (colon < 0) continue;
        const key = entry.slice(0, colon).trim(), value = entry.slice(colon + 1).trim();
        if (!value) continue;
        if (key === 'transform') frame.transform = value;
        else if (key === 'opacity') frame.opacity = Number(value);
        else if (key === 'filter') frame.filter = value;
        else if (key === 'animation-timing-function') frame.easing = value;
    }
    return frame;
}

function extract(css) {
    const keyframes = {};
    const matcher = /@keyframes\s+([^\s{]+)\s*\{/g;
    let match;
    while ((match = matcher.exec(css))) {
        const body = blockAt(css, css.indexOf('{', match.index));
        const frames = new Map();
        const rule = /([^{}]+)\{([^{}]*)\}/g;
        let item;
        while ((item = rule.exec(body))) {
            const values = declarations(item[2]);
            for (const selector of item[1].split(',')) {
                const value = selector.trim();
                const offset = value === 'from' ? 0 : value === 'to' ? 1
                    : /%$/.test(value) ? Number.parseFloat(value) / 100 : NaN;
                if (!Number.isFinite(offset)) continue;
                frames.set(offset, { ...(frames.get(offset) || {}), offset, ...values });
            }
        }
        if (frames.size) keyframes[match[1]] = [...frames.values()].sort((a, b) => a.offset - b.offset);
    }
    return keyframes;
}

function extractProfiles(css) {
    const profiles = {};
    const rule = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = rule.exec(css))) {
        const selector = match[1].trim();
        if (selector.includes('@keyframes') || selector.includes('[data-')) continue;
        const ids = [...selector.matchAll(/\.monster-motion-([a-z0-9-]+)/g)].map(item => item[1]);
        if (!ids.length) continue;
        const animation = match[2].match(/animation\s*:\s*([^\s;]+)\s+var\([^)]*\)\s+(.+?)\s+both\s*!?important/i);
        if (!animation) continue;
        const origin = match[2].match(/transform-origin\s*:\s*([^;]+)/i)?.[1]?.trim() || null;
        for (const id of ids) profiles[id] ||= { name: animation[1], easing: animation[2].trim(), origin };
    }
    return profiles;
}

function generate() {
    const css = fs.readFileSync(SOURCE, 'utf8');
    const keyframes = extract(css), profiles = extractProfiles(css);
    const source = `'use strict';\n// Generated from styles/hunt-runtime.css. Do not edit.\n`
        + `const HUNT_MONSTER_PROFILE_KEYFRAMES=${JSON.stringify({ keyframes, profiles }, null, 2)};\n`
        + `if(typeof window!=='undefined')window.HUNT_MONSTER_PROFILE_KEYFRAMES=HUNT_MONSTER_PROFILE_KEYFRAMES;\n`
        + `if(typeof module!=='undefined')module.exports=HUNT_MONSTER_PROFILE_KEYFRAMES;\n`;
    fs.writeFileSync(OUTPUT, source, 'utf8');
    return { keyframes: Object.keys(keyframes).length, profiles: Object.keys(profiles).length, outputPath: OUTPUT };
}

if (require.main === module) console.log(generate());
module.exports = { extract, extractProfiles, generate };
