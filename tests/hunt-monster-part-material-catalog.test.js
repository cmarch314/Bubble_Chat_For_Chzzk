const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Catalog = require('../js/effects/hunt/HuntMonsterPartMaterialCatalog.js');

const root = path.resolve(__dirname, '..');
const releasedMonsters = require('../js/effects/hunt/data/ReleasedMonsterRuntimeIndex.generated.js');
const riseManifest = JSON.parse(fs.readFileSync(
    path.join(root, 'local_assets/monster_hunter/reference-icons/rise/manifest.json'),
    'utf8'
));

for (const [kind, template] of Object.entries(Catalog.TEMPLATES)) {
    const record = riseManifest.records[`item:${template.sourceId}`];
    assert.ok(record, `${kind} must resolve to an inventoried neutral item record`);
    assert.strictEqual(record.status, 'downloaded');
    assert.strictEqual(record.nameJa.replace(/&nbsp;/g, ''), template.sourceNameJa);
    assert.ok(record.sha256.startsWith(template.sha256Prefix), `${kind} source hash drifted`);
    assert.ok(fs.existsSync(path.join(root, Catalog.ITEM_ROOT, `${template.sourceId}.png`)));
}

const distinctShapeKinds = ['head', 'back', 'wing', 'tail'];
assert.strictEqual(new Set(distinctShapeKinds.map(kind => Catalog.TEMPLATES[kind].sha256Prefix)).size, 4,
    'head, shell, wing, and tail must remain visually distinct');
assert.strictEqual(Catalog.TEMPLATES.leg.sharesShapeWith, 'head',
    'the source-game horn/fang/claw reuse must remain explicit');

const rathalosWing = Catalog.resolve({ id: 'rathalos', name: '리오레우스' }, { kind: 'left-wing' });
const rathianWing = Catalog.resolve({ id: 'rathian', name: '리오레이아' }, { kind: 'left-wing' });
const diablosWing = Catalog.resolve({ id: 'diablos', name: '디아블로스' }, { kind: 'left-wing' });
const diablosRightWing = Catalog.resolve({ id: 'diablos', name: '디아블로스' }, { kind: 'right-wing' });
assert.strictEqual(rathalosWing.sourceId, Catalog.TEMPLATES.wing.sourceId);
assert.strictEqual(diablosWing.sourceId, Catalog.TEMPLATES.wing.sourceId);
assert.notStrictEqual(rathalosWing.tint, diablosWing.tint);
assert.notStrictEqual(rathianWing.tint, rathalosWing.tint);
assert.match(rathianWing.tint, /hue-rotate\(57deg\)/);
assert.strictEqual(rathalosWing.label, '리오레우스 날개');
assert.strictEqual(rathalosWing.shortLabel, '좌익');
assert.strictEqual(diablosRightWing.shortLabel, '우익');
assert.strictEqual(Catalog.resolve({ id: 'tigrex' }, { kind: 'left-front-leg' }).shortLabel, '왼발');
assert.strictEqual(Catalog.resolve({ id: 'tigrex' }, { kind: 'right-front-leg' }).shortLabel, '오른발');
assert.strictEqual(Catalog.resolve({ id: 'diablos' }, { kind: 'horn' }).shortLabel, '뿔');
assert.strictEqual(diablosWing.side, 'left');
assert.strictEqual(diablosRightWing.side, 'right');
assert.strictEqual(Catalog.resolve({ id: 'rathalos', name: '리오레우스' }, { kind: 'claw' }).label, '리오레우스 발톱');
assert.strictEqual(Catalog.resolve({ id: 'unreviewed' }, { kind: 'tail' }).tint, 'grayscale(1) brightness(1.08)');
for (const monster of releasedMonsters) {
    const material = Catalog.resolve(monster, { kind: 'head' });
    const tint = material.tint;
    assert.match(tint, /^brightness\([^)]+\) sepia\(1\)/,
        `${monster.id} must lower white luminance before tinting the opaque icon interior`);
    assert.doesNotMatch(tint, /^grayscale/,
        `${monster.id} must not silently fall back to a white material icon`);
    assert.match(material.color, /^#[0-9a-f]{6}$/i,
        `${monster.id} must provide a solid alpha-mask fill instead of relying on hue rotation`);
}
assert.match(Catalog.resolve({ id: 'azure_rathalos' }, { kind: 'head' }).tint,
    /^brightness\(\.72\) sepia\(1\) saturate\(6\.2\) hue-rotate\(158deg\)/);
assert.strictEqual(Catalog.resolve({ id: 'azure_rathalos' }, { kind: 'head' }).palette.base, '#176fc1');
assert.strictEqual(Catalog.resolve({ id: 'rathalos' }, { kind: 'head' }).palette.base, '#b72b20');
const bazelMaterial = Catalog.resolve({ id: 'bazelgeuse' }, { kind: 'head' });
assert.match(bazelMaterial.tint, /saturate\(0\)/,
    'base Bazelgeuse material details must stay neutral grey');
assert.deepStrictEqual(bazelMaterial.palette, {
    base: '#73797b', highlight: '#c8ced0', shadow: '#2d3234', glow: '#959da0'
}, 'base Bazelgeuse must use a neutral gunmetal material palette');
assert.notStrictEqual(
    bazelMaterial.palette.base,
    Catalog.resolve({ id: 'seething_bazelgeuse' }, { kind: 'head' }).palette.base,
    'Seething Bazelgeuse must retain its distinct heated palette'
);
assert.notStrictEqual(
    Catalog.resolve({ id: 'rathalos' }, { kind: 'head' }).palette.base,
    Catalog.resolve({ id: 'azure_rathalos' }, { kind: 'head' }).palette.base,
    'base species and subspecies must have visibly distinct solid-mask fills'
);
for (const monster of releasedMonsters) {
    const palette = Catalog.resolve(monster, { kind: 'head' }).palette;
    assert.match(palette.base, /^#[0-9a-f]{6}$/i);
    assert.match(palette.highlight, /^#[0-9a-f]{6}$/i);
    assert.match(palette.shadow, /^#[0-9a-f]{6}$/i);
    assert.match(palette.glow, /^#[0-9a-f]{6}$/i);
}

console.log('[test] Monster parts use hash-audited neutral templates with per-monster tinting.');
