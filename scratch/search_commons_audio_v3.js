async function getJSON(url) {
    const userAgent = 'BubbleChatMonsterHunterAssetDownloader/1.0 (choi@example.com) Node.js/24.13';
    const res = await fetch(url, {
        headers: { 'User-Agent': userAgent }
    });
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}

async function getFileUrl(title) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
        const data = await getJSON(url);
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].imageinfo) {
            return pages[pageId].imageinfo[0].url;
        }
    } catch (e) {
        // ignore
    }
    return null;
}

async function searchAudio(keyword) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&srnamespace=6&format=json&origin=*`;
    // Note: namespace 6 is File namespace in MediaWiki
    try {
        const data = await getJSON(url);
        const results = data.query.search;
        console.log(`\n🔍 Search results for '${keyword}':`);
        let count = 0;
        for (const res of results) {
            const title = res.title;
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.endsWith('.ogg') || lowerTitle.endsWith('.mp3') || lowerTitle.endsWith('.wav')) {
                const fileUrl = await getFileUrl(title);
                if (fileUrl) {
                    console.log(` - Title: ${title}`);
                    console.log(`   URL: ${fileUrl}`);
                    count++;
                    if (count >= 2) break; // Print up to 2
                }
            }
        }
        if (count === 0) {
            console.log(` - No matching audio files found in search results.`);
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
