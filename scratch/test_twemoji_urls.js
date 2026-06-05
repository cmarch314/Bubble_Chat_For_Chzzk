const urls = [
    "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f3c4.png",
    "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f3c4-200d-2642-fe0f.png",
    "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f3c4-200d-2640-fe0f.png",
    "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f42c.png" // 🐬 돌고래
];

async function test() {
    for (const url of urls) {
        try {
            const res = await fetch(url);
            console.log(`[${res.status}] ${url}`);
        } catch (e) {
            console.log(`[ERR] ${url}: ${e.message}`);
        }
    }
}

test();
