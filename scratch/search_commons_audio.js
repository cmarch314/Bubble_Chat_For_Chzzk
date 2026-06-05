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

async function getFileUrl(title) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
    try {
        const data = await getJSON(url);
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].imageinfo) {
            return pages[pageId].imageinfo[0].url;
        }
    } catch (e) {
        console.error(`Error getting URL for ${title}:`, e.message);
    }
    return null;
}

async function searchAudio(keyword) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}%20filetype:audio&format=json`;
    try {
        const data = await getJSON(url);
        const results = data.query.search;
        console.log(`\n🔍 Search results for '${keyword}':`);
        for (const res of results.slice(0, 3)) {
            const fileUrl = await getFileUrl(res.title);
            console.log(` - Title: ${res.title}`);
            console.log(`   URL: ${fileUrl}`);
        }
    } catch (e) {
        console.error(`Error searching ${keyword}:`, e.message);
    }
}

async function main() {
    const keywords = ['gulp', 'whoosh', 'clank', 'sharpen', 'reload', 'roar', 'creak'];
    for (const kw of keywords) {
        await searchAudio(kw);
    }
}

main();
