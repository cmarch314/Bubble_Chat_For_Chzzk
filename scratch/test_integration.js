const fs = require('fs');
const path = require('path');

// 1. Mock Browser environment
globalThis.localStorage = {
    store: {},
    getItem(key) {
        console.log(`[LocalStorage] GET ${key}`);
        return this.store[key] || null;
    },
    setItem(key, value) {
        console.log(`[LocalStorage] SET ${key} = ${value}`);
        this.store[key] = String(value);
    },
    removeItem(key) {
        console.log(`[LocalStorage] REMOVE ${key}`);
        delete this.store[key];
    }
};

globalThis.document = {
    getElementById(id) {
        console.log(`[DOM] getElementById: ${id}`);
        return null;
    },
    body: {
        appendChild(child) {
            console.log(`[DOM] body.appendChild: [${child.id}]`);
        }
    },
    createElement(tag) {
        return {
            id: "",
            style: {},
            innerHTML: "",
            remove() {
                console.log("[DOM Mock] Element removed");
            }
        };
    }
};

globalThis.window = {
    dispatchEvent(event) {
        console.log(`[Window] Event Dispatched: ${event.type}`);
        if (event.type === 'chzzk_connected') {
            globalThis.testResolve(true);
        }
    }
};

globalThis.CustomEvent = class {
    constructor(type) {
        this.type = type;
    }
};

// Mock WebSocket to prevent full connection and just resolve on open
globalThis.WebSocket = class {
    constructor(url) {
        console.log(`[WebSocket] Connecting to: ${url}`);
        this.url = url;
        this.readyState = 0; // CONNECTING
        setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) {
                this.onopen();
            }
        }, 10);
    }
    send(data) {
        console.log(`[WebSocket] Sent: ${data}`);
    }
    close() {
        console.log(`[WebSocket] Closed`);
        if (this.onclose) this.onclose();
    }
};

// Mock Fetch to completely isolate the test from the network
globalThis.fetch = async (url, options) => {
    const urlStr = String(url);
    
    // Extract target URL if it's wrapped in a proxy
    let targetUrl = urlStr;
    if (urlStr.includes('api.allorigins.win/get?url=')) {
        const parts = urlStr.split('url=');
        targetUrl = decodeURIComponent(parts[1]);
    } else if (urlStr.includes('api.cors.lol/?url=')) {
        const parts = urlStr.split('url=');
        targetUrl = decodeURIComponent(parts[1]);
    } else if (urlStr.includes('corsproxy.io/?')) {
        const parts = urlStr.split('corsproxy.io/?');
        targetUrl = decodeURIComponent(parts[1]);
    } else if (urlStr.includes('api.codetabs.com/v1/proxy?quest=')) {
        const parts = urlStr.split('quest=');
        targetUrl = decodeURIComponent(parts[1]);
    } else if (urlStr.includes('thingproxy.freeboard.io/fetch/')) {
        const parts = urlStr.split('thingproxy.freeboard.io/fetch/');
        targetUrl = decodeURIComponent(parts[1]);
    }

    console.log(`[Mock Fetch] Request to: ${targetUrl}`);

    if (targetUrl.includes('live-status')) {
        return {
            ok: true,
            status: 200,
            json: async () => ({
                code: 200,
                message: null,
                content: { chatChannelId: "N2XCXJ" }
            })
        };
    } else if (targetUrl.includes('access-token')) {
        if (targetUrl.includes('INVALID_CHANNEL_ID_XYZ')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    code: 400,
                    message: "Bad Request",
                    content: null
                })
            };
        } else {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    code: 200,
                    message: null,
                    content: { accessToken: "MOCK_TOKEN_12345" }
                })
            };
        }
    }

    return {
        ok: false,
        status: 404,
        json: async () => ({ code: 404, message: "Not Found", content: null })
    };
};

// 2. Load EventBus and ChzzkGateway code
const eventBusCode = fs.readFileSync(path.join(__dirname, '../js/EventBus.js'), 'utf8');
const gatewayCode = fs.readFileSync(path.join(__dirname, '../js/ChzzkGateway.js'), 'utf8');

// Evaluate code in global context and assign to globalThis
eval(eventBusCode + "; globalThis.EventBus = EventBus;");
eval(gatewayCode + "; globalThis.ChzzkGateway = ChzzkGateway;");

const eventBus = new EventBus();

const appConfig = {
    channelId: "057a9a03fea9b368eb0c76b9e95e1ae5",
    log(msg) {
        console.log(`[AppConfig Log] ${msg}`);
    }
};

async function runTest() {
    console.log("=== STEP 1: First connection (No Cache) ===");
    const gateway = new ChzzkGateway(appConfig, eventBus);
    
    let connected = await new Promise((resolve) => {
        globalThis.testResolve = resolve;
        gateway.connect();
    });

    if (connected && localStorage.store[`chzzk_chat_channel_id_${appConfig.channelId}`]) {
        console.log("✅ Step 1 Succeeded! Channel ID successfully cached.");
    } else {
        console.error("❌ Step 1 Failed!");
        process.exit(1);
    }

    if (gateway.ws) {
        gateway.ws.onclose = null;
        gateway.ws.close();
    }

    console.log("\n=== STEP 2: Second connection (With Cache) ===");
    gateway.attemptCount = 1;

    connected = await new Promise((resolve) => {
        globalThis.testResolve = resolve;
        gateway.connect();
    });

    if (connected) {
        console.log("✅ Step 2 Succeeded! Fast connection using cached channel ID.");
    } else {
        console.error("❌ Step 2 Failed!");
        process.exit(1);
    }

    if (gateway.ws) {
        gateway.ws.onclose = null;
        gateway.ws.close();
    }

    console.log("\n=== STEP 3: Corrupted Cache Self-Healing ===");
    localStorage.setItem(`chzzk_chat_channel_id_${appConfig.channelId}`, "INVALID_CHANNEL_ID_XYZ");
    gateway.attemptCount = 1;

    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, delay) => {
        if (delay === 5000) {
            console.log(`[Mock Timeout] Fast-forwarding 5s reconnect delay`);
            return originalSetTimeout(fn, 50);
        }
        return originalSetTimeout(fn, delay);
    };

    connected = await new Promise((resolve) => {
        globalThis.testResolve = resolve;
        gateway.connect();
    });

    if (connected && localStorage.getItem(`chzzk_chat_channel_id_${appConfig.channelId}`) !== "INVALID_CHANNEL_ID_XYZ") {
        console.log("✅ Step 3 Succeeded! Self-healed by clearing bad cache and fetching fresh ID.");
    } else {
        console.error("❌ Step 3 Failed!");
        process.exit(1);
    }

    globalThis.setTimeout = originalSetTimeout;
    if (gateway.ws) {
        gateway.ws.onclose = null;
        gateway.ws.close();
    }

    console.log("\n🎉 All integration tests passed successfully!");
    process.exit(0);
}

runTest();
