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
        console.error(`Error getting URL for ${title}:`, e.message);
    }
    return null;
}

async function searchAudio(keyword) {
    // MediaWiki Search API
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}%20filetype:audio&format=json&origin=*`;
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
