'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'hunt', 'monster-pattern-motion-overrides.json');
const OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MonsterPatternMotionOverrides.generated.js');

function generate({ sourcePath = SOURCE, outputPath = OUTPUT } = {}) {
    let overrides = {};
    try { overrides = JSON.parse(fs.readFileSync(sourcePath, 'utf8')).overrides || {}; }
    catch { overrides = {}; }
    const body = [
        "'use strict';",
        '// GENERATED FILE — do not edit by hand.',
        '// Source: data/hunt/monster-pattern-motion-overrides.json',
        `const HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = ${JSON.stringify(overrides, null, 2)};`,
        "if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;",
        "if (typeof globalThis !== 'undefined') globalThis.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;",
        ''
    ].join('\n');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, body, 'utf8');
    return { monsters: Object.keys(overrides).length, outputPath };
}

if (require.main === module) console.log(generate());
module.exports = { generate, SOURCE, OUTPUT };
