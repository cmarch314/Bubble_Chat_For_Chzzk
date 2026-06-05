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
    },
    {
        name: 'MH_Kokoto.mp3',
        query: 'Monster Hunter Kokoto Village Theme'
    },
    {
        name: 'MH_Pokke.mp3',
        query: 'Monster Hunter Pokke Village Theme'
    },
    {
        name: 'MH_Yukumo.mp3',
        query: 'Monster Hunter Yukumo Village Theme'
    },
    {
        name: 'MH_Bherna.mp3',
        query: 'Monster Hunter Bherna Village Theme'
    },
    {
        name: 'MH_ValHabar.mp3',
        query: 'Monster Hunter 4 Val Habar Theme'
    },
    {
        name: 'MHWI_Seliana.mp3',
        query: 'Monster Hunter World Iceborne Seliana Theme'
    },
    {
        name: 'MHR_Kamura.mp3',
        query: 'Monster Hunter Rise Kamura Village Theme'
    },
    {
        name: 'MHRS_Elgado.mp3',
        query: 'Monster Hunter Rise Sunbreak Elgado Outpost Theme'
    },
    {
        name: 'MH_Quest_Clear_Kokoto.mp3',
        query: 'Monster Hunter Kokoto Quest Clear Theme'
    },
    {
        name: 'MH_Quest_Clear_Pokke.mp3',
        query: 'Monster Hunter Portable 2nd Quest Clear Theme'
    },
    {
        name: 'MH_Quest_Clear_Yukumo.mp3',
        query: 'Monster Hunter Portable 3rd Quest Clear Theme'
    },
    {
        name: 'MH_Quest_Clear_MH4.mp3',
        query: 'Monster Hunter 4 Quest Clear Theme'
    },
    {
        name: 'MHR_Quest_Clear_Kamura.mp3',
        query: 'Monster Hunter Rise Quest Clear Theme'
    },
    {
        name: 'MH_Quest_Fail_Classic.mp3',
        query: 'Monster Hunter Portable 2nd Quest Failed Theme'
    },
    {
        name: 'MHW_Quest_Fail.mp3',
        query: 'Monster Hunter World Quest Failed Theme'
    },
    {
        name: 'MHR_Quest_Fail.mp3',
        query: 'Monster Hunter Rise Quest Failed Theme'
    }
];

const sfxDownloads = [];

function downloadYtdlp(query, destDir, destFileName, force = false, isSfx = false) {
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
    // If it is SFX, apply match-filter to query only short clips less than 15 seconds
    const durationFilter = isSfx ? '--match-filter "duration < 15"' : '';
    const command = `yt-dlp "ytsearch25:${cleanQuery}" ${durationFilter} -x --audio-format mp3 -o "${destPath.replace(/\.mp3$/, '')}.%(ext)s"`;
    
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
    
    // Purge abnormally large SFX files (> 1MB) before downloading
    if (fs.existsSync(sfxDir)) {
        const files = fs.readdirSync(sfxDir);
        for (const file of files) {
            if (file.startsWith('mh_') && file.endsWith('.mp3')) {
                const filePath = path.join(sfxDir, file);
                const stats = fs.statSync(filePath);
                if (stats.size > 1024 * 1024) { // 1MB
                    console.log(`⚠️ Detected abnormally large SFX file: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB). Deleting for purification...`);
                    try {
                        fs.unlinkSync(filePath);
                    } catch(e) {
                        console.error(`Failed to delete ${file}:`, e);
                    }
                }
            }
        }
    }

    console.log('\n--- Downloading BGMs ---');
    for (const bgm of bgmDownloads) {
        downloadYtdlp(bgm.query, bgmDir, bgm.name, false, false);
    }

    console.log('\n--- Downloading SFXs ---');
    for (const sfx of sfxDownloads) {
        downloadYtdlp(sfx.query, sfxDir, sfx.name, true, true);
    }
    
    console.log('\n🎉 Asset downloads complete!');
}

main();
