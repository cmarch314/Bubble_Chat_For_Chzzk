'use strict';

const assert = require('assert');
const { parsePage } = require('../scripts/harvest-mh-reference-icons');

const weapon = '<img src="http://cdn.kiranico.net/file/kiranico/mhrise-web/avatar/weapons/123.webp"><a href="https://mhrise.kiranico.com/ja/data/weapons/123">鉄の剣</a>';
assert.deepStrictEqual(parsePage({ kind: 'weapon' }, weapon)[0], { key: 'weapon:123', mediaKind: 'weapon', sourceId: '123', variant: null, nameJa: '鉄の剣', url: 'https://cdn.kiranico.net/file/kiranico/mhrise-web/avatar/weapons/123.webp', extension: '.webp' });
const armor = '<img src="http://cdn.kiranico.net/file/kiranico/mhrise-web/avatar/armors/456_m.webp"><img src="http://cdn.kiranico.net/file/kiranico/mhrise-web/avatar/armors/456_f.webp">';
assert.deepStrictEqual(parsePage({ kind: 'armor' }, armor).map(row => row.variant), ['male', 'female']);
const item = '<a href="https://mhrise.kiranico.com/ja/data/items/789"><div><img src="http://cdn.kiranico.net/file/kiranico/mhrise-web/images/items/789.png"></div><p>回復薬</p></a>';
assert.strictEqual(parsePage({ kind: 'item' }, item)[0].nameJa, '回復薬');
const monster = '<img src="http://cdn.kiranico.net/file/kiranico/mhrise-web/images/icons/em132_05.png" alt="원초를 새기는 멜-제나"><a href="https://mhrise.kiranico.com/ko/data/monsters/1301934382">원초를 새기는 멜-제나</a>';
assert.deepStrictEqual(parsePage({ kind: 'monster' }, monster)[0], {
    key: 'monster:1301934382',
    mediaKind: 'monster',
    sourceId: '1301934382',
    variant: 'em132_05',
    nameKo: '원초를 새기는 멜-제나',
    url: 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/icons/em132_05.png',
    extension: '.png'
});
console.log('[test] MH reference icon harvester semantic row parsing passed.');
