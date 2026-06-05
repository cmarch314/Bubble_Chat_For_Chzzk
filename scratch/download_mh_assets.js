const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bgmDir = path.join(__dirname, '../BGM');
const sfxDir = path.join(__dirname, '../SFX');

if (!fs.existsSync(bgmDir)) fs.mkdirSync(bgmDir, { recursive: true });
if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });

const bgmDownloads = [
    {
        name: 'MHGU_Arena.mp3',
        query: 'Monster Hunter Generations Ultimate - Arena Theme'
    }
];

const sfxDownloads = [
    {
        name: 'mh_potion.mp3',
        query: 'Monster Hunter World - Potion Drinking Sound Effect'
    },
    {
        name: 'mh_dodge.mp3',
        query: 'Monster Hunter World - Dodge Roll Sound Effect'
    },
    {
        name: 'mh_guard.mp3',
        query: 'Monster Hunter World - Shield Block Sound Effect'
    },
    {
        name: 'mh_sharpen.mp3',
        query: 'Monster Hunter World - Whetstone Sharpening Sound Effect'
    },
    {
        name: 'mh_reload.mp3',
        query: 'Monster Hunter World - Bowgun Reload Sound Effect'
    },
    {
        name: 'mh_cart.mp3',
        query: 'Monster Hunter World - Carted Faint Sound Effect'
    },
    {
        name: 'mh_roar.mp3',
        query: 'Monster Hunter World - Rathalos Roar Sound Effect'
    },
    {
        name: 'mh_aibo.mp3',
        query: 'Monster Hunter World - Handler Aibo Voice (Aibo!)'
    },
    {
        name: 'mh_dust.mp3',
        query: 'Monster Hunter World - Lifepowder Item Use Sound Effect'
    },
    {
        name: 'mh_hit.mp3',
        query: 'Monster Hunter World - Weapon Hit Damage Sound Effect'
    },
    {
        name: 'mh_stun.mp3',
        query: 'Monster Hunter - dizzy stars stun Sound Effect'
    }
];

function downloadYtdlp(query, destDir, destFileName, force = false) {
    const destPath = path.join(destDir, destFileName);
    if (force && fs.existsSync(destPath)) {
        try {
            fs.unlinkSync(destPath);
            console.log(`🗑️ Deleted existing file for fresh download: ${destFileName}`);
        } catch(e){}
    }
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        console.log(`⏭️ Skipping ${destFileName} (already exists)`);
        return true;
    }

    // Escape query for powershell/cmd
    const cleanQuery = query.replace(/"/g, '\\"');
    console.log(`📥 Downloading "${destFileName}" using yt-dlp...`);
    
    // yt-dlp command to search and download audio as mp3
    const command = `yt-dlp "ytsearch1:${cleanQuery}" -x --audio-format mp3 -o "${destPath.replace(/\.mp3$/, '')}.%(ext)s"`;
    
    try {
        execSync(command, { stdio: 'inherit' });
        
        // Sometimes yt-dlp appends .mp3 correctly, check if it exists
        if (fs.existsSync(destPath)) {
            console.log(`✅ Successfully downloaded: ${destFileName}`);
            return true;
        } else {
            // Check if yt-dlp named it slightly differently (e.g. nested extension) and rename
            const dirFiles = fs.readdirSync(destDir);
            const baseNameNoExt = path.basename(destFileName, '.mp3');
            const found = dirFiles.find(f => f.startsWith(baseNameNoExt) && f.endsWith('.mp3'));
            if (found) {
                fs.renameSync(path.join(destDir, found), destPath);
                console.log(`✅ Successfully downloaded and renamed: ${destFileName}`);
                return true;
            }
            throw new Error("File not found after yt-dlp download");
        }
    } catch (e) {
        console.error(`❌ Failed to download ${destFileName}:`, e.message);
        return false;
    }
}

async function main() {
    console.log('🎵 Starting Monster Hunter Generations Ultimate Asset Downloads via yt-dlp...');
    
    console.log('\n--- Downloading BGMs ---');
    for (const bgm of bgmDownloads) {
        downloadYtdlp(bgm.query, bgmDir, bgm.name);
    }

    console.log('\n--- Downloading SFXs ---');
    for (const sfx of sfxDownloads) {
        downloadYtdlp(sfx.query, sfxDir, sfx.name, true);
    }
    
    console.log('\n🎉 Asset downloads complete!');
}

main();
