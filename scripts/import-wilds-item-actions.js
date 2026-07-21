#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseMotlist } = require('./import-wilds-motion-timings.js');

const root = path.resolve(__dirname, '..');
const wildsRoot = path.join(root, 'game_extracts', 'wilds');
const output = process.argv[2] || path.join(root, 'game_extracts', 'tools', 'wilds-item-actions.json');

function findFile(name) {
    const stack = [wildsRoot];
    while (stack.length) {
        const folder = stack.pop();
        for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
            const file = path.join(folder, entry.name);
            if (entry.isDirectory()) stack.push(file);
            else if (entry.name.toLowerCase() === name.toLowerCase()) return file;
        }
    }
    return null;
}

function main() {
    const motlist = findFile('plc_ItemUse.motlist.992');
    const motionConnect = findFile('plc_ItemUse_mct.user.3');
    const itemParameters = findFile('PlayerItemParam.user.3');
    if (!motlist || !motionConnect || !itemParameters) throw new Error('Wilds item-use extraction is incomplete.');
    const parsed = parseMotlist(fs.readFileSync(motlist), motlist);
    const data = {
        version: 1,
        game: 'Monster Hunter Wilds',
        motionList: path.basename(motlist),
        sourcePath: path.relative(root, motlist).replace(/\\/g, '/'),
        motionConnectSource: path.relative(root, motionConnect).replace(/\\/g, '/'),
        itemParameterSource: path.relative(root, itemParameters).replace(/\\/g, '/'),
        mappingPolicy: 'Motion IDs and action/item semantics remain separate until an ActionParam or item-use table proves the link.',
        motions: parsed.motions,
        actions: []
    };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`[wilds-items] indexed ${data.motions.length} item-use motions -> ${output}`);
}

if (require.main === module) main();
module.exports = { main, findFile };
