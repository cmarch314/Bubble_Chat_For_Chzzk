// Using native fetch available in Node.js 24

const channelId = "057a9a03fea9b368eb0c76b9e95e1ae5";
const testUrl = `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`;

function prepareUrl(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
}

function validateResponse(data) {
    if (!data || data.code !== 200 || !data.content) {
        throw new Error(`Invalid response (code: ${data ? data.code : 'unknown'})`);
    }
    return data;
}

const proxies = [
    {
        name: "Direct",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(target);
            const data = await res.json();
            return validateResponse(data);
        }
    },
    {
        name: "AllOrigins",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
            const wrapper = await res.json();
            if (!wrapper || !wrapper.contents) throw new Error("AllOrigins No Contents");
            const data = JSON.parse(wrapper.contents);
            return validateResponse(data);
        }
    },
    {
        name: "CorsProxy.io",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(target)}`);
            const data = await res.json();
            return validateResponse(data);
        }
    },
    {
        name: "Codetabs",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
            const data = await res.json();
            return validateResponse(data);
        }
    },
    {
        name: "ThingProxy",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(`https://thingproxy.freeboard.io/fetch/${encodeURIComponent(target)}`);
            const data = await res.json();
            return validateResponse(data);
        }
    },
    {
        name: "Cors.lol",
        fetch: async (url) => {
            const target = prepareUrl(url);
            const res = await fetch(`https://api.cors.lol/?url=${encodeURIComponent(target)}`);
            const data = await res.json();
            return validateResponse(data);
        }
    }
];

async function runTest() {
    console.log(`Starting proxy test against Chzzk Live-Status URL: ${testUrl}\n`);
    for (const p of proxies) {
        const start = Date.now();
        try {
            const data = await p.fetch(testUrl);
            const duration = Date.now() - start;
            console.log(`✅ [${p.name}] Succeeded! Duration: ${duration}ms, chatChannelId: ${data.content.chatChannelId}`);
        } catch (e) {
            const duration = Date.now() - start;
            console.log(`❌ [${p.name}] Failed. Error: ${e.message}. Duration: ${duration}ms`);
        }
    }
}

runTest();
