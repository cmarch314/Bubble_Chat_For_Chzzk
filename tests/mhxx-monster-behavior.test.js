'use strict';
const assert = require('assert');
const { parsePage, runtimeMonster } = require('../scripts/import-mhxx-monster-behavior.js');

const html = `
<table><tr><td class="contents_game2">種族</td><td class="contents_game3">牙竜種</td></tr>
<tr><td class="contents_game2">咆哮</td><td class="contents_game3">小</td></tr></table>
<h3 class="contents">ジンオウガの攻撃パターン</h3>
<ul><li class="coin_contents">前脚攻撃</li><li class="coin_contents2">前進しながら連続で叩きつける。</li>
<li class="coin_contents">雷光弾</li><li class="coin_contents2">曲がる雷光弾を放つ。</li></ul>
<h3 class="contents">ジンオウガの攻略</h3>`;
const parsed = parsePage(html, 'zinogre', ['Zinogre', '진오우거']);
assert.strictEqual(parsed.speciesJA, '牙竜種');
assert.strictEqual(parsed.roar.status, 'verified-present');
assert.deepStrictEqual(parsed.moves.map(move => move.nameJA), ['前脚攻撃', '雷光弾']);
const runtime = runtimeMonster(parsed);
assert.strictEqual(runtime.patterns[0].type, 'roar');
assert.ok(runtime.patterns.slice(1).every(pattern => pattern.evidence === 'game-e-mhxx-named-attack-pattern-guide'));
console.log('[test] MHXX named attack-pattern importer passed.');
