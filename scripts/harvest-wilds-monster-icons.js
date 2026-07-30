#!/usr/bin/env node
'use strict';

// Private reference-media harvester. Outputs are intentionally ignored by Git.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const IDENTIFIERS = path.join(ROOT, 'game_extracts', 'tools', 'wilds-monster-identifiers.json');
const OUTPUT = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'wilds');
const MANIFEST = path.join(OUTPUT, 'manifest.json');
const USER_AGENT = 'BubbleChat local Wilds monster reference catalog/1.0';
const VERIFIED_FALLBACKS = Object.freeze({
    // Gogmazios was added to Wilds after the Kiranico CDN snapshot used by this tool.
    // MHGUDB carries the exact species icon under its MIT-licensed asset tree.
    EM0078_00_0: {
        localSource: path.join(ROOT, 'game_extracts', 'reference-repos', 'MHGUDB-iOS', 'MHGUDB', 'Assets', 'icons', 'monster_gogmazios.png'),
        sourceUrl: 'https://github.com/JoeLago/MHGUDB-iOS',
        pageUrl: 'https://github.com/JoeLago/MHGUDB-iOS',
        extension: 'png',
        license: 'MIT',
        evidence: 'installed-game-id+mhgudb-exact-species-icon'
    },
    // Exact Em0166 icon exposed by the Japanese Wilds monster reference page.
    EM0166_00_0: {
        sourceUrl: 'https://media.gamepedia.jp/wp-content/uploads/sites/157/2025/10/23161425/tex_EmIcon_EM0166_00_0_IMLM4.png',
        pageUrl: 'https://gamepedia.jp/mh-wilds/monster/13047',
        extension: 'png',
        license: 'reference-only',
        evidence: 'installed-game-id+verified-reference-page-icon'
    }
});

function sha256(bytes) {
    return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
            const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
        }
    }
    throw lastError;
}

async function main() {
    if (!fs.existsSync(IDENTIFIERS)) throw new Error('Run import-wilds-monster-identifiers.py first.');
    const source = JSON.parse(fs.readFileSync(IDENTIFIERS, 'utf8'));
    const rows = source.identifiers.filter(row => row.publicMonsterId && row.nameEn && row.nameKo);
    const manifest = fs.existsSync(MANIFEST)
        ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
        : { version: 1, game: 'wilds', source: 'installed-game EmID + Kiranico icon CDN', records: {} };
    let downloaded = 0;
    let skipped = 0;
    let unavailable = 0;
    fs.mkdirSync(path.join(OUTPUT, 'monster'), { recursive: true });
    for (const row of rows) {
        const code = row.enumName;
        const primarySourceUrl = `https://mhwilds.kiranico.net/em_icon/${code}.webp`;
        const fallback = VERIFIED_FALLBACKS[code] || null;
        const relative = `monster/${code}.${fallback?.extension || 'webp'}`;
        const destination = path.join(OUTPUT, relative);
        const previous = manifest.records[code];
        if (previous && fs.existsSync(destination)) {
            const current = fs.readFileSync(destination);
            if (current.length === previous.bytes && sha256(current) === previous.sha256) {
                skipped += 1;
                continue;
            }
        }
        let bytes;
        let sourceUrl = primarySourceUrl;
        let evidence = row.evidence;
        let pageUrl = null;
        let license = null;
        try {
            bytes = await fetchWithRetry(primarySourceUrl);
        } catch (error) {
            if (fallback) {
                try {
                    bytes = fallback.localSource
                        ? fs.readFileSync(fallback.localSource)
                        : await fetchWithRetry(fallback.sourceUrl);
                    sourceUrl = fallback.sourceUrl;
                    pageUrl = fallback.pageUrl;
                    license = fallback.license;
                    evidence = fallback.evidence;
                } catch (fallbackError) {
                    error = new Error(`primary ${error.message}; fallback ${fallbackError.message}`);
                }
            }
            if (bytes) {
                // Continue through the normal verified write/manifest path.
            } else {
            manifest.records[code] = {
                game: 'wilds', mediaKind: 'monster', sourceId: String(row.publicMonsterId),
                gameId: row.gameId, monsterCode: row.monsterCode, nameEn: row.nameEn, nameKo: row.nameKo,
                sourceUrl: primarySourceUrl, fallbackSourceUrl: fallback?.sourceUrl || null,
                localPath: null, status: 'unavailable', error: error.message,
                evidence: row.evidence
            };
            unavailable += 1;
            console.warn(`[wilds-monster-icons] unavailable ${code} ${row.nameEn}: ${error.message}`);
            continue;
            }
        }
        fs.writeFileSync(destination, bytes);
        manifest.records[code] = {
            game: 'wilds',
            mediaKind: 'monster',
            sourceId: String(row.publicMonsterId),
            gameId: row.gameId,
            monsterCode: row.monsterCode,
            nameEn: row.nameEn,
            nameKo: row.nameKo,
            sourceUrl,
            primarySourceUrl,
            pageUrl,
            license,
            localPath: relative,
            bytes: bytes.length,
            sha256: sha256(bytes),
            status: 'downloaded',
            evidence
        };
        downloaded += 1;
    }
    manifest.updatedAt = new Date().toISOString();
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`[wilds-monster-icons] ${downloaded} downloaded, ${skipped} verified/skipped, ${unavailable} unavailable, ${rows.length} exact installed-game joins`);
}

if (require.main === module) main().catch(error => {
    console.error(`[wilds-monster-icons] ${error.message}`);
    process.exitCode = 1;
});
