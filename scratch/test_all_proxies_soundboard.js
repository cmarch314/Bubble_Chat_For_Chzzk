async function main() {
    const targetUrl = 'https://www.101soundboards.com/boards/27043-monster-hunter-sounds';
    
    const proxies = [
        {
            name: "AllOrigins",
            url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
            parse: async (res) => {
                const wrapper = await res.json();
                return wrapper.contents || "";
            }
        },
        {
            name: "Codetabs",
            url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
            parse: async (res) => await res.text()
        },
        {
            name: "ThingProxy",
            url: `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
            parse: async (res) => await res.text()
        },
        {
            name: "Cors.lol",
            url: `https://api.cors.lol/?url=${encodeURIComponent(targetUrl)}`,
            parse: async (res) => await res.text()
        }
    ];

    for (const p of proxies) {
        console.log(`\nTesting proxy: ${p.name}...`);
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 8000); // 8s timeout
            const res = await fetch(p.url, { signal: controller.signal });
            clearTimeout(id);
            
            console.log(` - Status: ${res.status}`);
            if (res.status === 200) {
                const content = await p.parse(res);
                console.log(` - Content length: ${content.length}`);
                if (content.includes("Just a moment...")) {
                    console.log(" ❌ Returned Cloudflare challenge!");
                } else if (content.length < 500) {
                    console.log(` ❌ Too short content: ${content}`);
                } else {
                    console.log(" ✅ Bypassed Cloudflare successfully!");
                    // Check if it contains mp3 links
                    const matches = content.match(/href="([^"]+\.mp3)"/g) || content.match(/audio[^>]+src="([^"]+)"/g) || [];
                    console.log(` - Found ${matches.length} mp3/audio elements.`);
                    console.log(content.substring(0, 500));
                    break; // Found one that works
                }
            } else {
                console.log(` ❌ Non-200 status: ${res.status}`);
            }
        } catch (e) {
            console.error(` ❌ Failed: ${e.message}`);
        }
    }
}

main();
