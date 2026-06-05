const fs = require('fs');
const path = require('path');
const https = require('https');

const bgmDir = path.join(__dirname, '../BGM');
const sfxDir = path.join(__dirname, '../SFX');

if (!fs.existsSync(bgmDir)) fs.mkdirSync(bgmDir, { recursive: true });
if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });

// Specific User-Agent to comply with Wikimedia Foundation policy
const userAgent = 'BubbleChatMonsterHunterAssetDownloader/1.0 (choi@example.com) Node.js/24.13';

const assets = [
    // --- BGM ---
    {
        name: 'MHW_Zinogre.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/2-17%20Spark%20of%20Blue%20-%20Zinogre%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Velkhana.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/2-03%20Splendiferous%20Silver%20Sovereign%20-%20Velkhana.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Nergigante.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/3-19%20World%27s%20End%20-%20Arch-Tempered%20Nergigante.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Deviljho.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/3-10%20The%20Voracious%20Devil%20-%20Deviljho%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Tigrex.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/1-15%20The%20Beast%20Bares%20Its%20Fangs%20-%20Tigrex%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Nargacuga.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/1-13%20Red%20Glare%20in%20the%20Darkness%20-%20Nargacuga%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Glavenus.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/1-18%20The%20Scorching%20Blade%20-%20Glavenus%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },
    {
        name: 'MHW_Brachydios.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/1-20%20Brutish%20Indigo%20-%20Brachydios%20%28World%20Version%29.mp3',
        destDir: bgmDir
    },

    // --- SFX ---
    {
        name: 'mh_potion.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Gulp.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_dodge.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Whoosh.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_guard.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Metal_clank.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_sharpen.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Sharpening_a_knife.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_reload.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Pump_action_shotgun_reload.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_cart.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Wooden_wheelbarrow_creaking.ogg',
        destDir: sfxDir
    },
    {
        name: 'mh_roar.ogg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Monster_Growl.ogg',
        destDir: sfxDir
    }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const request = (targetUrl) => {
            https.get(targetUrl, { headers: { 'User-Agent': userAgent } }, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    request(res.headers.location);
                    return;
                }
                
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to download: status ${res.statusCode}`));
                    return;
                }

                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                file.on('error', (err) => {
                    fs.unlink(dest, () => {});
                    reject(err);
                });
            }).on('error', reject);
        };
        request(url);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🎵 Starting Monster Hunter Assets download (BGM & SFX)...');
    for (const asset of assets) {
        const dest = path.join(asset.destDir, asset.name);
        
        // Skip if file already exists with non-zero size
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
            console.log(`⏭️ Skipping ${asset.name} (already downloaded)`);
            continue;
        }

        console.log(`📥 Downloading ${asset.name} from ${asset.url}...`);
        try {
            await downloadFile(asset.url, dest);
            console.log(`✅ Successfully downloaded: ${asset.name}`);
        } catch (error) {
            console.error(`❌ Failed to download ${asset.name}:`, error.message);
        }
        
        // Add 2 seconds delay to respect API limits
        await delay(2000);
    }
    console.log('🎉 Assets downloads complete!');
}

main();
