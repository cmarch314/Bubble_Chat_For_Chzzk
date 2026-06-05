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
    console.log("🔍 Searching archive.org for MHGU or Arena music...");
    const searchQuery = encodeURIComponent('title:("monster hunter") AND (generations OR mhgu OR arena)');
    const searchUrl = `https://archive.org/advancedsearch.php?q=${searchQuery}&fl[]=identifier&fl[]=title&fl[]=item_size&rows=50&output=json`;

    try {
        const searchResult = await getJSON(searchUrl);
        const docs = searchResult.response.docs;
        console.log(`Found ${docs.length} items on Archive.org.`);

        for (const doc of docs) {
            console.log(` - Item: ${doc.title} (${doc.identifier})`);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
