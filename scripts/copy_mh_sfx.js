const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('D:/BubbleChat/MonsterHunter_Soundtracks/Unified_SFX');
const destDir = path.resolve('D:/BubbleChat/SFX/MonsterHunter_Extracted_SFX');
const generatorScriptPath = path.resolve('D:/BubbleChat/scripts/generate_sfx_catalog.js');

function copyMhSFX() {
    console.log(`Source directory: ${srcDir}`);
    console.log(`Destination directory: ${destDir}`);

    if (!fs.existsSync(srcDir)) {
        console.error(`Error: Source directory does not exist at ${srcDir}`);
        process.exit(1);
    }

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`Created destination directory: ${destDir}`);
    }

    const files = fs.readdirSync(srcDir);
    const candidateFiles = [];

    files.forEach(file => {
        const filePath = path.join(srcDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && file.endsWith('.mp3')) {
            // Filter files less than 800KB to ensure they are short sounds/jingles
            if (stat.size < 800000) { 
                candidateFiles.push({
                    name: file,
                    path: filePath,
                    size: stat.size
                });
            }
        }
    });

    console.log(`Found ${candidateFiles.length} files under 800KB.`);

    // Sort by size ascending (shorter sounds first)
    candidateFiles.sort((a, b) => a.size - b.size);

    // Limit to 100 files
    const toCopy = candidateFiles.slice(0, 100);
    console.log(`Copying ${toCopy.length} selected files to ${destDir}...`);

    let copiedCount = 0;
    toCopy.forEach(file => {
        const destPath = path.join(destDir, file.name);
        try {
            fs.copyFileSync(file.path, destPath);
            copiedCount++;
        } catch (e) {
            console.error(`Failed to copy ${file.name}:`, e.message);
        }
    });

    console.log(`Successfully copied ${copiedCount} files.`);

    // Run the catalog generator
    console.log('Running catalog generator to update SFX/sfx_catalog.json...');
    try {
        require(generatorScriptPath);
    } catch (e) {
        console.log(`Note: Could not require generator script directly: ${e.message}. Running via shell command instead...`);
    }
}

copyMhSFX();
