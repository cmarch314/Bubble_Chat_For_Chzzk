#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const graphPath = path.join(root, 'game_extracts', 'tools', 'wilds-weapon-combos.json');
const mapPath = path.join(root, 'data', 'hunt', 'wilds-runtime-action-map.json');
const outputPath = path.join(root, 'js', 'effects', 'hunt', 'data', 'WildsComboLinks.generated.js');

function build() {
    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    const semantic = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const weapons = {};
    for (const [weaponId, runtimeMap] of Object.entries(semantic.actions || {})) {
        const weapon = graph.weapons?.[weaponId];
        if (!weapon) throw new Error(`Missing installed-game combo graph for ${weaponId}`);
        const classToRuntime = new Map(Object.entries(runtimeMap).map(([runtimeId, className]) => [className, runtimeId]));
        const classByGuideId = new Map((weapon.actions || []).map(action => [action.actionGuideId, action.className]));
        const knownClasses = new Set(classByGuideId.values());
        for (const className of classToRuntime.keys()) {
            if (!knownClasses.has(className)) throw new Error(`${weaponId}: mapped ActionParam class is absent: ${className}`);
        }
        const links = {};
        for (const [runtimeId, className] of Object.entries(runtimeMap)) {
            const sourceIds = new Set((weapon.actions || []).filter(action => action.className === className).map(action => action.actionGuideId));
            const next = [...new Set((weapon.edges || [])
                .filter(edge => sourceIds.has(edge.sourceActionId))
                .map(edge => classToRuntime.get(classByGuideId.get(edge.targetActionId)))
                .filter(Boolean))];
            links[runtimeId] = {
                gameActionClass: className,
                next,
                evidence: 'installed-game-action-guide-transition'
            };
        }
        weapons[weaponId] = links;
    }
    const payload = { version: 1, game: graph.game, mappingEvidence: semantic.evidence, weapons };
    fs.writeFileSync(outputPath, `'use strict';\nconst HUNT_WILDS_COMBO_LINKS = ${JSON.stringify(payload)};\nif (typeof module !== 'undefined' && module.exports) module.exports = HUNT_WILDS_COMBO_LINKS;\nelse window.HUNT_WILDS_COMBO_LINKS = HUNT_WILDS_COMBO_LINKS;\n`, 'utf8');
    const linked = Object.values(weapons).flatMap(Object.values).filter(entry => entry.next.length).length;
    console.log(`[hunt-runtime] generated ${linked} runtime actions with verified combo successors -> ${outputPath}`);
    return payload;
}

if (require.main === module) build();
module.exports = { build };
