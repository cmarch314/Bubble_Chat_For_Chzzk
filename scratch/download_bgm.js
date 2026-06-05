const fs = require('fs');
const path = require('path');
const https = require('https');

const bgmDir = path.join(__dirname, '../BGM');
if (!fs.existsSync(bgmDir)) {
    fs.mkdirSync(bgmDir, { recursive: true });
}

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const tracks = [
    {
        name: 'MHW_Lobby.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/1-10%20Theme%20of%20Seliana.mp3'
    },
    {
        name: 'MHW_Proof_of_a_Hero.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/2-17%20Spark%20of%20Blue%20-%20Zinogre%20%28World%20Version%29.mp3'
    },
    {
        name: 'MHW_Quest_Clear.mp3',
        url: 'https://archive.org/download/monster-hunter-world-iceborne-ost/3-21%20Nay%21%20The%20Honor%20Is%20All%20Ours.mp3'
    }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        // Handle redirect if any
        const request = (targetUrl) => {
            https.get(targetUrl, { headers: { 'User-Agent': userAgent } }, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    console.log(`↪️ Redirecting to ${res.headers.location}`);
                    request(res.headers.location);
                    return;
                }
                
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${res.statusCode}`));
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

async function main() {
    console.log('🎵 Starting Monster Hunter BGM download...');
    for (const track of tracks) {
        const dest = path.join(bgmDir, track.name);
        console.log(`📥 Downloading ${track.name} from ${track.url}...`);
        try {
            await downloadFile(track.url, dest);
            console.log(`✅ Successfully downloaded: ${track.name}`);
        } catch (error) {
            console.error(`❌ Failed to download ${track.name}:`, error.message);
        }
    }
    console.log('🎉 BGM downloads complete!');
}

main();
