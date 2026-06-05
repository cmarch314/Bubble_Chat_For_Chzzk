const https = require('https');

function getJSON(url) {
    return new Promise((resolve, reject) => {
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log("🔍 Searching archive.org for audio items matching 'monster hunter'...");
    // Search query: "monster hunter" AND mediatype:audio
    const searchQuery = encodeURIComponent('monster hunter AND mediatype:audio');
    const searchUrl = `https://archive.org/advancedsearch.php?q=${searchQuery}&fl[]=identifier&fl[]=title&rows=100&output=json`;

    try {
        const searchResult = await getJSON(searchUrl);
        const docs = searchResult.response.docs;
        console.log(`Found ${docs.length} audio items on Archive.org.`);

        for (const doc of docs) {
            console.log(`\n📦 Checking item: ${doc.title} (${doc.identifier})`);
            const metaUrl = `https://archive.org/metadata/${doc.identifier}`;
            const meta = await getJSON(metaUrl);
            
            if (meta && meta.files) {
                const audioFiles = meta.files.filter(f => 
                    f.name.endsWith('.mp3') || f.name.endsWith('.wav') || f.name.endsWith('.ogg')
                );
                
                const keywords = ['potion', 'drink', 'sharpen', 'whetstone', 'reload', 'dodge', 'roll', 'guard', 'shield', 'block', 'cart', 'faint', 'roar', 'scream', 'zinogre', 'velkhana', 'nergigante', 'rathalos'];
                const matched = audioFiles.filter(f => {
                    const name = f.name.toLowerCase();
                    return keywords.some(kw => name.includes(kw));
                });
                
                if (matched.length > 0) {
                    console.log(`   🌟 Found ${matched.length} matched files:`);
                    matched.slice(0, 10).forEach(m => {
                        console.log(`    * ${m.name} -> https://archive.org/download/${doc.identifier}/${m.name}`);
                    });
                } else {
                    console.log(`   (No matched files out of ${audioFiles.length} audio files)`);
                }
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
