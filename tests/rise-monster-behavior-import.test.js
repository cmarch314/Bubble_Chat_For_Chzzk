'use strict';

const assert = require('assert');
const {
    parseBasic,
    parseMoves,
    parseMonster,
    parseKiranicoMoves,
    parseKiranicoSmallMonster,
    selectRepresentativeMoves,
    runtimeMonster
} = require('../scripts/import-rise-monster-behavior.js');

const fixture = `
<section id="s-basic"><h2>Basic data</h2>
<div class="mh-kvlist mh-wide">
<p class="mh-kv"><span>Threat level</span><span>7</span></p>
<p class="mh-kv"><span>Type</span><span><span>
<span class="mh-lang" lang="ja"><span>飛竜種</span></span>
<span class="lang-default mh-lang" lang="en"><span>Flying Wyvern</span></span>
<span class="mh-lang" lang="ko"><span>비룡종</span></span>
</span>, (internal)Flying wyvern, Arial</span></p>
<p class="mh-kv"><span>Default move pattern</span><span>fly</span></p>
<p class="mh-kv"><span>Flying stance to move</span><span>true</span></p>
</div></section>
<section id="s-moveset"><h2>Move set</h2><table><tbody>
<tr><td lang="ja">突進（角あり）</td><td><ul><li>Physical 80</li></ul></td>
<td><ul><li><img alt="Stun" src="stun.png">70</li></ul></td>
<td>Yes</td><td>60</td><td>Flying away</td><td>PowerM</td><td>M</td><td></td></tr>
<tr><td lang="ja">バインドボイス</td><td><ul></ul></td>
<td><ul><li><img alt="Strong roar" src="roar.png">90</li></ul></td>
<td>Yes</td><td>0</td><td>No reaction</td><td>None</td><td>None</td><td></td></tr>
</tbody></table></section>`;

const basic = parseBasic(fixture);
assert.deepStrictEqual(basic.type.internal, ['Flying wyvern', 'Arial']);
assert.strictEqual(basic.type.nameKO, '비룡종');
assert.strictEqual(basic.defaultMovePattern, 'fly');
assert.strictEqual(basic.flyingStanceToMove, true);

const moves = parseMoves(fixture);
assert.strictEqual(moves.length, 2);
assert.strictEqual(moves[0].semantic, 'charge');
assert.strictEqual(moves[0].damage.Physical, 80);
assert.strictEqual(moves[1].semantic, 'roar');
assert.strictEqual(moves[1].statuses['Strong roar'], 90);
assert.strictEqual(selectRepresentativeMoves(moves, 'large')[0].nameJA, '突進（角あり）');

const monster = parseMonster(fixture, {
    sourceId: '7',
    iconCode: 'em007_00',
    nameEN: 'Diablos',
    nameKO: '디아블로스',
    kind: 'large'
}, 'https://mhrise.mhrice.info/monster/007_00.html');
assert.strictEqual(monster.roar.status, 'verified-present');
assert.strictEqual(monster.species.nameEN, 'Flying Wyvern');
assert.strictEqual(monster.representativeMoves[0].evidence, 'mhrice-installed-move-table');
const runtime = runtimeMonster(monster);
assert.strictEqual(runtime.id, 'diablos');
assert.strictEqual(runtime.patterns[0].name, '포효');
assert.ok(runtime.patterns.every(pattern => pattern.evidence === 'mhrice-installed-move-table'));
assert.ok(!runtime.patterns.some(pattern => pattern.tags.includes('ultimate')),
    'a strongest move must not be relabelled as an ultimate without explicit evidence');

const smallHtml = `<h2>Attack Moves</h2><table><tbody>
<tr>${['噛みつき攻撃', 10, 2, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0].map(value => `<td>${value}</td>`).join('')}</tr>
<tr>${['火球', 20, 2, 0, 0, 0, 25, 1, 10, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0].map(value => `<td>${value}</td>`).join('')}</tr>
</tbody></table>`;
assert.strictEqual(parseKiranicoMoves(smallHtml).length, 2);
const small = parseKiranicoSmallMonster(smallHtml, {
    sourceId: '1', iconCode: 'ems001_00', nameEN: 'Test Prey', nameKO: '테스트'
}, 'https://mhrise.kiranico.com/data/monsters/1');
assert.strictEqual(small.roar.status, 'verified-absent');
assert.ok(runtimeMonster(small).patterns.every(pattern =>
    pattern.evidence === 'kiranico-rise-installed-attack-move-table'));

console.log('rise monster behavior importer tests passed');
