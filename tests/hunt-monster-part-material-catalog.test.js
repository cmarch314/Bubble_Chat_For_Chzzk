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
assert.strictEqual(diablosWing.side, 'left');
assert.strictEqual(diablosRightWing.side, 'right');
assert.strictEqual(Catalog.resolve({ id: 'rathalos', name: '리오레우스' }, { kind: 'claw' }).label, '리오레우스 발톱');
assert.strictEqual(Catalog.resolve({ id: 'unreviewed' }, { kind: 'tail' }).tint, 'grayscale(1) brightness(1.08)');
for (const monster of releasedMonsters) {
    const tint = Catalog.resolve(monster, { kind: 'head' }).tint;
    assert.match(tint, /^brightness\([^)]+\) sepia\(1\)/,
        `${monster.id} must lower white luminance before tinting the opaque icon interior`);
    assert.doesNotMatch(tint, /^grayscale/,
        `${monster.id} must not silently fall back to a white material icon`);
}
assert.match(Catalog.resolve({ id: 'azure_rathalos' }, { kind: 'head' }).tint,
    /^brightness\(\.72\) sepia\(1\) saturate\(6\.2\) hue-rotate\(158deg\)/);

console.log('[test] Monster parts use hash-audited neutral templates with per-monster tinting.');
