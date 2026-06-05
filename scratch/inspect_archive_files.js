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
    const identifier = 'monster-hunter-ps-2-usa-audio';
    console.log(`Inspecting all files in item: ${identifier}`);
    const metaUrl = `https://archive.org/metadata/${identifier}`;
    
    try {
        const meta = await getJSON(metaUrl);
        if (meta && meta.files) {
            console.log(`Total files: ${meta.files.length}`);
            meta.files.forEach(f => {
                console.log(` - Name: ${f.name} (Size: ${f.size} bytes, Format: ${f.format})`);
            });
        } else {
            console.log("No metadata or files found.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
