const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.resolve('D:/BubbleChat/MonsterHunter_Soundtracks');
const targetDir = path.join(baseDir, 'Unified_SFX');
const mappingFile = path.join(baseDir, 'sfx_mapping.json');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map to track hashes -> relative target file name
const hashToTarget = new Map();
// Mapping result for all encountered source files
const mapping = {};

// Helper to compute MD5 hash of a file
function getFileHash(filePath) {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
}

// Recursively walk directory and find files in SFX directories
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Exclude the target directory from scanning
            if (fullPath === targetDir) {
                return;
            }
            walk(fullPath);
        } else if (stat.isFile() && file.endsWith('.mp3')) {
            // Only consolidate from folders named "SFX"
            const parentDirName = path.basename(dir);
            if (parentDirName.toUpperCase() === 'SFX') {
                processSfxFile(fullPath);
            }
        }
    });
}

function processSfxFile(sourcePath) {
    const relativeSource = path.relative(baseDir, sourcePath).replace(/\\/g, '/');
    const hash = getFileHash(sourcePath);
    const basename = path.basename(sourcePath);

    if (hashToTarget.has(hash)) {
        // Already copied this exact file content
        const targetRelative = hashToTarget.get(hash);
        mapping[relativeSource] = targetRelative;
        console.log(`Deduplicated: ${relativeSource} -> Already exists as ${targetRelative}`);
    } else {
        // Unique file content
        let destName = basename;
        let destPath = path.join(targetDir, destName);
        let counter = 1;

        // If file name collision exists for different content
        while (fs.existsSync(destPath)) {
            const ext = path.extname(basename);
            const nameWithoutExt = path.basename(basename, ext);
            destName = `${nameWithoutExt}_${counter}${ext}`;
            destPath = path.join(targetDir, destName);
            counter++;
        }

        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        const targetRelative = `Unified_SFX/${destName}`;
        hashToTarget.set(hash, targetRelative);
        mapping[relativeSource] = targetRelative;
        console.log(`Copied: ${relativeSource} -> ${targetRelative}`);
    }
}

console.log('Starting SFX consolidation...');
walk(baseDir);

// Write mapping to file
fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2), 'utf-8');
console.log(`Consolidation complete. Mapping written to ${mappingFile}`);
