'use strict';
const assert = require('assert');
const { parsePage, targetForPage, runtimeMonster, TARGETS } = require('../scripts/import-mhxx-db-monster-behavior');
const html = `<h1>鏖魔(おうま)ディアブロス(二つ名)</h1>
<table><tr><th>種別</th><td>飛竜種</td></tr><tr><th>咆哮</th><td>大</td></tr></table>
<h2>鏖魔ディアブロスの攻撃パターン</h2><table>
<tr><th>攻撃方法</th><th>詳細</th></tr>
<tr><td>尻尾叩きつけ岩飛ばし</td><td>尻尾で岩を飛ばす。</td></tr>
<tr><td>地中からの急襲</td><td>地面に潜り飛び出す。</td></tr></table>`;
const page = parsePage(html, 157);
assert.strictEqual(page.moves.length, 2);
assert.strictEqual(targetForPage(page)[0], 'bloodbath_diablos');
const runtime = runtimeMonster('bloodbath_diablos', TARGETS.bloodbath_diablos, page);
assert.strictEqual(runtime.roar.status, 'verified-present');
assert.ok(runtime.patterns.every(pattern => !pattern.evidence.startsWith('species-archetype:')));
console.log('[test] MHXX database exact named attack-table importer passed.');
