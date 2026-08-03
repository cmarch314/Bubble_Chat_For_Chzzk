'use strict';

class HuntMonsterPartMaterialCatalog {
    static ITEM_ROOT = 'local_assets/monster_hunter/reference-icons/rise/item/';

    // Malzeno's Rise/Sunbreak material set is the neutral high-rank palette:
    // the source pixels are bright and effectively achromatic. Keep the source
    // identity and hash here so future icon harvests cannot silently replace a
    // wing or tail with a same-colour shell.
    static TEMPLATES = Object.freeze({
        head: Object.freeze({
            sourceId: '1671799227', sourceNameJa: '爵銀龍の銀角',
            shapeFamily: 'horn-fang', sha256Prefix: '8602b5ee'
        }),
        back: Object.freeze({
            sourceId: '1106415058', sourceNameJa: '爵銀龍の重殻',
            shapeFamily: 'shell', sha256Prefix: '113b1114'
        }),
        wing: Object.freeze({
            sourceId: '1120665075', sourceNameJa: '爵銀龍の剛翼',
            shapeFamily: 'wing', sha256Prefix: '2c18a8b3'
        }),
        tail: Object.freeze({
            sourceId: '1283890609', sourceNameJa: '爵銀龍の三又尾',
            shapeFamily: 'tail', sha256Prefix: '04b41e5b'
        }),
        // Rise intentionally reuses the same white part glyph for horns, fangs,
        // and claws. This is recorded rather than misrepresented as a distinct
        // extracted silhouette.
        leg: Object.freeze({
            sourceId: '407255840', sourceNameJa: '天廻龍の剛浄爪',
            shapeFamily: 'horn-fang-claw', sha256Prefix: '8602b5ee',
            sharesShapeWith: 'head'
        }),
        part: Object.freeze({
            sourceId: '1106415058', sourceNameJa: '爵銀龍の重殻',
            shapeFamily: 'shell', sha256Prefix: '113b1114'
        })
    });

    // The source glyphs are nearly pure white. A partial sepia pass only
    // coloured their antialiased rim, so every authored tint starts from a
    // full sepia conversion. This colours the opaque interior while retaining
    // the source luminance detail; unknown monsters stay neutral until reviewed.
    static MONSTER_TINTS = Object.freeze({
        rathalos: 'brightness(.9) sepia(1) saturate(5.6) hue-rotate(323deg) contrast(1.15)',
        azure_rathalos: 'brightness(.72) sepia(1) saturate(6.2) hue-rotate(158deg) contrast(1.2)',
        silver_rathalos: 'brightness(1.02) sepia(1) saturate(.42) hue-rotate(164deg) contrast(1.18)',
        rathian: 'brightness(.9) sepia(1) saturate(3.5) hue-rotate(57deg) contrast(1.12)',
        pink_rathian: 'brightness(.96) sepia(1) saturate(3.9) hue-rotate(286deg) contrast(1.1)',
        gold_rathian: 'brightness(.98) sepia(1) saturate(4.1) hue-rotate(352deg) contrast(1.12)',
        diablos: 'brightness(.94) sepia(1) saturate(1.9) hue-rotate(350deg) contrast(1.1)',
        black_diablos: 'brightness(.48) sepia(1) saturate(1.35) hue-rotate(218deg) contrast(1.3)',
        bazelgeuse: 'brightness(.86) sepia(1) saturate(2.9) hue-rotate(338deg) contrast(1.16)',
        seething_bazelgeuse: 'brightness(.88) sepia(1) saturate(4.5) hue-rotate(297deg) contrast(1.18)',
        chameleos: 'brightness(.88) sepia(1) saturate(3.7) hue-rotate(218deg) contrast(1.13)',
        legiana: 'brightness(1.02) sepia(1) saturate(2.8) hue-rotate(153deg) contrast(1.1)',
        shrieking_legiana: 'brightness(1.08) sepia(1) saturate(1.8) hue-rotate(157deg) contrast(1.12)',
        paolumu: 'brightness(1.06) sepia(1) saturate(1.45) hue-rotate(327deg) contrast(1.08)',
        nightshade_paolumu: 'brightness(.7) sepia(1) saturate(3.4) hue-rotate(199deg) contrast(1.2)',
        tigrex: 'brightness(.9) sepia(1) saturate(4.2) hue-rotate(353deg) contrast(1.16)',
        brute_tigrex: 'brightness(.62) sepia(1) saturate(3.2) hue-rotate(329deg) contrast(1.24)',
        nargacuga: 'brightness(.46) sepia(1) saturate(1.5) hue-rotate(208deg) contrast(1.32)',
        barioth: 'brightness(1.08) sepia(1) saturate(1.3) hue-rotate(151deg) contrast(1.1)',
        frostfang_barioth: 'brightness(1.02) sepia(1) saturate(2.1) hue-rotate(153deg) contrast(1.14)'
    });

    // Solid colours are rendered through the extracted icon's alpha mask.
    // This prevents white source interiors from surviving a CSS filter while
    // the original luminance detail remains as a restrained overlay.
    static MONSTER_PALETTES = Object.freeze({
        rathalos: { base: '#a6332b', highlight: '#e48a5d', shadow: '#4d1717', glow: '#ff7658' },
        azure_rathalos: { base: '#286da8', highlight: '#80c4e5', shadow: '#153954', glow: '#65c8ff' },
        silver_rathalos: { base: '#aeb9c4', highlight: '#f1f5f7', shadow: '#505b66', glow: '#dcecff' },
        rathian: { base: '#57883b', highlight: '#b7d77a', shadow: '#273f21', glow: '#aeea6d' },
        pink_rathian: { base: '#bd6687', highlight: '#f0aec4', shadow: '#633044', glow: '#ff98bd' },
        gold_rathian: { base: '#bd8e27', highlight: '#f5db79', shadow: '#60430e', glow: '#ffd85a' },
        diablos: { base: '#b69a70', highlight: '#ead5a8', shadow: '#5c4931', glow: '#f1cc85' },
        black_diablos: { base: '#343238', highlight: '#77727d', shadow: '#141318', glow: '#a494b1' },
        bazelgeuse: { base: '#776c61', highlight: '#b7aa96', shadow: '#38322d', glow: '#d7ad72' },
        seething_bazelgeuse: { base: '#774058', highlight: '#cf829e', shadow: '#321b29', glow: '#f06ca4' },
        legiana: { base: '#7fb6c9', highlight: '#d8f3f6', shadow: '#395f76', glow: '#9cecff' },
        shrieking_legiana: { base: '#9fcbd5', highlight: '#eefcff', shadow: '#4d7480', glow: '#caf7ff' },
        paolumu: { base: '#d1b8b6', highlight: '#fff0e8', shadow: '#756164', glow: '#ffd5cf' },
        nightshade_paolumu: { base: '#405571', highlight: '#869ab5', shadow: '#1d2739', glow: '#758fc1' },
        tigrex: { base: '#c58b45', highlight: '#f2c775', shadow: '#68451f', glow: '#f5b958' },
        brute_tigrex: { base: '#6e493e', highlight: '#ae7764', shadow: '#30201c', glow: '#d37b5e' },
        nargacuga: { base: '#343b45', highlight: '#777f8a', shadow: '#151a20', glow: '#8da0b6' },
        barioth: { base: '#d6d2c2', highlight: '#fffcec', shadow: '#77766d', glow: '#e8f7ef' },
        frostfang_barioth: { base: '#c9dce0', highlight: '#f5ffff', shadow: '#667b82', glow: '#c8f4ff' }
    });

    static PART_LABELS = Object.freeze({
        head: '머리', back: '등', leg: '발톱', wing: '날개', tail: '꼬리', part: '부위'
    });

    static normalize(value) {
        return String(value || '').trim().toLowerCase().replace(/['’]/g, '')
            .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    static displayKind(part) {
        const value = String(part?.kind || part?.sourceKind || '').toLowerCase();
        if (/(head|horn|chin|spike|fang)/.test(value)) return 'head';
        if (/wing/.test(value)) return 'wing';
        if (/tail/.test(value)) return 'tail';
        if (/(back|torso|body|shell|hide)/.test(value)) return 'back';
        if (/(leg|foot|claw|nail)/.test(value)) return 'leg';
        return 'part';
    }

    static displaySide(part) {
        const value = String(part?.kind || part?.sourceKind || '').toLowerCase();
        if (/(^|[-_])left($|[-_])/.test(value) || /^left/.test(value)) return 'left';
        if (/(^|[-_])right($|[-_])/.test(value) || /^right/.test(value)) return 'right';
        return 'center';
    }

    static resolve(monster, part) {
        const monsterId = this.normalize(monster?.id || monster?.nameEN || monster?.name);
        const kind = this.displayKind(part);
        const side = this.displaySide(part);
        const template = this.TEMPLATES[kind] || this.TEMPLATES.part;
        const monsterName = String(monster?.nameKO || monster?.name || monster?.nameKo || monster?.nameEN || '').trim();
        return Object.freeze({
            ...template,
            monsterId,
            kind,
            side,
            label: `${monsterName ? `${monsterName} ` : ''}${this.PART_LABELS[kind] || this.PART_LABELS.part}`,
            path: `${this.ITEM_ROOT}${template.sourceId}.png`,
            tint: this.MONSTER_TINTS[monsterId] || 'grayscale(1) brightness(1.08)',
            palette: Object.freeze(this.MONSTER_PALETTES[monsterId] || {
                base: '#8e9298', highlight: '#e8edf2', shadow: '#3f444a', glow: '#b9c1ca'
            }),
            evidence: 'rise-kiranico-neutral-material-template-with-hash-audit'
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPartMaterialCatalog;
else globalThis.HuntMonsterPartMaterialCatalog = HuntMonsterPartMaterialCatalog;
