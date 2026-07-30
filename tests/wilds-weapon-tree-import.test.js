'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { importTree } = require('../scripts/import-wilds-weapon-tree');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wilds-tree-'));
const source = path.join(root, 'merged');
fs.mkdirSync(path.join(source, 'weapons'), { recursive: true });
for (let index = 0; index < 14; index += 1) {
    const kind = `weapon-${index}`;
    const rows = [{ game_id: 1, kind, names: { ko: `시작 ${index}`, en: `Start ${index}` }, descriptions: { ko: '설명' }, rarity: 1, attack_raw: 80, affinity: 0, defense: 0, sharpness: { red: 10 }, handicraft: [], specials: [], slots: [], skills: {}, series_id: 7, crafting: { zenny_cost: 1, inputs: {}, previous_id: null, branches: [2], is_shortcut: false, row: 0, column: 0 } }, { game_id: 2, kind, names: { ko: `강화 ${index}`, en: `Upgrade ${index}` }, descriptions: {}, rarity: 2, attack_raw: 90, affinity: 0, defense: 0, sharpness: { orange: 20 }, handicraft: [], specials: [], slots: [], skills: {}, series_id: 7, crafting: { zenny_cost: 2, inputs: { 53: 2 }, previous_id: 1, branches: [], is_shortcut: false, row: 0, column: 1 } }];
    fs.writeFileSync(path.join(source, 'weapons', `W${index}.json`), JSON.stringify(rows));
}
fs.writeFileSync(path.join(source, 'WeaponSeries.json'), JSON.stringify([{ game_id: 7, names: { ko: '뼈 소재 파생', en: 'Bone Tree' } }]));
fs.writeFileSync(path.join(source, 'Item.json'), JSON.stringify([{ game_id: 53, names: { ko: '용골', en: 'Monster Bone' } }]));
const dbPath = path.join(root, 'test.sqlite');
const first = importTree({ sourceRoot: source, dbPath });
const second = importTree({ sourceRoot: source, dbPath });
assert.deepStrictEqual({ weapons: first.weapons, edges: first.edges, materials: first.materials, classes: first.classes }, { weapons: 28, edges: 14, materials: 14, classes: 14 });
assert.strictEqual(second.weapons, 28);
const db = new DatabaseSync(dbPath, { readOnly: true });
assert.deepStrictEqual({ ...db.prepare("SELECT name_ko, previous_key FROM weapon_tree_nodes WHERE weapon_key='weapon-0:2'").get() }, { name_ko: '강화 0', previous_key: 'weapon-0:1' });
assert.deepStrictEqual({ ...db.prepare("SELECT item_name_ko, quantity FROM weapon_tree_materials WHERE weapon_key='weapon-0:2'").get() }, { item_name_ko: '용골', quantity: 2 });
assert.strictEqual(db.prepare('SELECT count(*) count FROM weapon_media_evidence').get().count, 0);
db.close();
fs.rmSync(root, { recursive: true, force: true });
console.log('wilds-weapon-tree-import tests passed');
