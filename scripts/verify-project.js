const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set([
    '.git',
    'node_modules',
    'scratch',
    'MonsterHunter_Soundtracks',
    '__pycache__'
]);

function walk(directory, predicate) {
    const found = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) found.push(...walk(absolute, predicate));
        else if (predicate(absolute)) found.push(absolute);
    }
    return found;
}

function relative(file) {
    return path.relative(root, file).replaceAll('\\', '/');
}

function run(command, args) {
    const result = spawnSync(command, args, {
        cwd: root,
        encoding: 'utf8',
        shell: false
    });
    return {
        ok: result.status === 0,
        output: `${result.stdout || ''}${result.stderr || ''}`.trim()
    };
}

const failures = [];
const warnings = [];
const productJs = walk(root, file => {
    const name = path.basename(file);
    return file.endsWith('.js')
        && !file.endsWith('.old.js')
        && !name.startsWith('recovered_')
        && name !== 'clean_gmail.py';
});
const textFiles = walk(root, file => /\.(?:js|css|html|json|md)$/.test(file));
const cssFiles = walk(root, file => file.endsWith('.css'));

for (const file of productJs) {
    const result = run(process.execPath, ['--check', file]);
    if (!result.ok) failures.push(`JavaScript syntax: ${relative(file)}\n${result.output}`);
}

for (const file of textFiles) {
    const bytes = fs.readFileSync(file);
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        failures.push(`UTF-8 BOM is not allowed: ${relative(file)}`);
    }
    const text = bytes.toString('utf8');
    if (text.includes('\uFFFD')) failures.push(`UTF-8 replacement character found: ${relative(file)}`);
}

for (const file of cssFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const braceLines = [];
    let line = 1;
    let quote = null;
    let inComment = false;
    let escaped = false;

    for (let index = 0; index < source.length; index++) {
        const char = source[index];
        const next = source[index + 1];
        if (char === '\n') line++;
        if (inComment) {
            if (char === '*' && next === '/') {
                inComment = false;
                index++;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = null;
            continue;
        }
        if (char === '/' && next === '*') {
            inComment = true;
            index++;
        } else if (char === '"' || char === "'") {
            quote = char;
        } else if (char === '{') {
            braceLines.push(line);
        } else if (char === '}') {
            if (!braceLines.length) failures.push(`Unexpected CSS closing brace: ${relative(file)}:${line}`);
            else braceLines.pop();
        }
    }

    if (quote) failures.push(`Unclosed CSS string: ${relative(file)}:${line}`);
    if (inComment) failures.push(`Unclosed CSS comment: ${relative(file)}:${line}`);
    for (const openingLine of braceLines) failures.push(`Unclosed CSS block: ${relative(file)}:${openingLine}`);

    const urlPattern = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
    for (const match of source.matchAll(urlPattern)) {
        const reference = match[2].trim().split(/[?#]/, 1)[0];
        if (!reference || /^(?:https?:|data:|blob:|\/\/|#)/i.test(reference)) continue;
        let decoded = reference;
        try { decoded = decodeURIComponent(reference); } catch (_) {}
        const resolved = path.resolve(path.dirname(file), decoded);
        if (!fs.existsSync(resolved)) failures.push(`Missing CSS resource: ${relative(file)} -> ${reference}`);
    }
}

const indexPath = path.join(root, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');
const localReferences = [];
const referencePattern = /<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi;
for (const match of index.matchAll(referencePattern)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (!reference || /^(?:https?:|data:|\/\/)/i.test(reference)) continue;
    localReferences.push(reference);
    const resolved = path.resolve(root, reference);
    if (!fs.existsSync(resolved)) failures.push(`Missing index resource: ${reference}`);
}

const duplicates = localReferences.filter((value, indexValue) => localReferences.indexOf(value) !== indexValue);
for (const duplicate of [...new Set(duplicates)]) warnings.push(`Duplicate index resource: ${duplicate}`);

console.log(`[verify] Checked ${productJs.length} product JavaScript files.`);
console.log(`[verify] Checked ${textFiles.length} UTF-8 text files.`);
console.log(`[verify] Checked ${cssFiles.length} CSS files and local resources.`);
console.log(`[verify] Checked ${localReferences.length} index resources.`);

for (const warning of warnings) console.warn(`[warning] ${warning}`);
if (failures.length) {
    for (const failure of failures) console.error(`[failure] ${failure}`);
    process.exit(1);
}

console.log('[verify] Project integrity checks passed.');
