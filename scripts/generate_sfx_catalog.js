const fs = require('fs');
const path = require('path');

const sfxDir = path.resolve(__dirname, '../SFX');
const catalogPath = path.join(sfxDir, 'sfx_catalog.json');

// Supported audio extensions
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);

function generateCatalog() {
    console.log(`Scanning SFX directory: ${sfxDir}`);
    
    if (!fs.existsSync(sfxDir)) {
        console.error(`Error: SFX directory does not exist at ${sfxDir}`);
        process.exit(1);
    }

    const catalog = {};
    const items = fs.readdirSync(sfxDir);

    items.forEach(item => {
        const itemPath = path.join(sfxDir, item);
        const stat = fs.statSync(itemPath);

        // Only process subdirectories
        if (stat.isDirectory()) {
            const files = fs.readdirSync(itemPath);
            const audioFiles = files
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return AUDIO_EXTENSIONS.has(ext);
                })
                .sort((a, b) => a.localeCompare(b, 'ko')); // Sort alphabetically (supporting Korean names)

            if (audioFiles.length > 0) {
                catalog[item] = audioFiles;
                console.log(`Category [${item}]: Found ${audioFiles.length} audio files.`);
            }
        }
    });

    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    console.log(`Success: SFX Catalog successfully generated and saved to ${catalogPath}`);

    const jsCatalogPath = path.join(sfxDir, 'sfx_catalog.js');
    const jsContent = `// Automatically generated file. Do not edit manually.\nwindow.SFX_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`;
    fs.writeFileSync(jsCatalogPath, jsContent, 'utf-8');
    console.log(`Success: SFX JS Catalog successfully generated and saved to ${jsCatalogPath}`);
}

generateCatalog();
