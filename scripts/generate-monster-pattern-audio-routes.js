'use strict';

// Compiles the review tool's per-pattern audio assignments
// (data/hunt/monster-pattern-audio-routes.json) into a browser-loadable global
// the hunt runtime consumes: js/effects/hunt/data/MonsterPatternAudioRoutes.generated.js.
//
// The runtime plays these with priority over HuntAudioCatalog, keyed by
// monster -> patternId -> phase slot (see data/hunt/monster-audio-phase-standard.md).
// Regenerate with `npm run generate:monster-pattern-audio`; the review server also
// runs this on every save so mappings take effect after a runtime reload.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'hunt', 'monster-pattern-audio-routes.json');
const OUTPUT = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MonsterPatternAudioRoutes.generated.js');

function generate({ sourcePath = SOURCE, outputPath = OUTPUT } = {}) {
    let routes = {};
    try {
        routes = JSON.parse(fs.readFileSync(sourcePath, 'utf8')).routes || {};
    } catch { routes = {}; }
    const body = [
        "'use strict';",
        '// GENERATED FILE — do not edit by hand.',
        '// Source: data/hunt/monster-pattern-audio-routes.json',
        '// Regenerate: npm run generate:monster-pattern-audio',
        `const HUNT_MONSTER_PATTERN_AUDIO_ROUTES = ${JSON.stringify(routes, null, 2)};`,
        "if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_AUDIO_ROUTES;",
        "if (typeof globalThis !== 'undefined') globalThis.HUNT_MONSTER_PATTERN_AUDIO_ROUTES = HUNT_MONSTER_PATTERN_AUDIO_ROUTES;",
        ''
    ].join('\n');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, body, 'utf8');
    const monsters = Object.keys(routes).length;
    const slots = Object.values(routes)
        .reduce((total, patterns) => total + Object.values(patterns)
            .reduce((sum, patternSlots) => sum + Object.keys(patternSlots).length, 0), 0);
    return { monsters, slots, outputPath };
}

if (require.main === module) {
    const result = generate();
    console.log(`[pattern-audio] wrote ${result.monsters} monster(s), ${result.slots} slot route(s).`);
}

module.exports = { generate, SOURCE, OUTPUT };
