async function main() {
    const targetUrl = 'https://www.101soundboards.com/boards/27043-monster-hunter-sounds';
    
    // Test with AllOrigins
    console.log("Testing AllOrigins...");
    try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const wrapper = await res.json();
        console.log(`AllOrigins status: ${res.status}`);
        if (wrapper && wrapper.contents) {
            console.log(`Content length: ${wrapper.contents.length}`);
            if (wrapper.contents.includes("Just a moment...")) {
                console.log("❌ AllOrigins returned Cloudflare challenge!");
            } else {
                console.log("✅ AllOrigins successfully bypassed Cloudflare!");
                // Let's print a small slice
                console.log(wrapper.contents.substring(0, 1000));
            }
        } else {
            console.log("❌ AllOrigins returned no contents");
        }
    } catch (e) {
        console.error("AllOrigins failed:", e.message);
    }

    // Test with CorsProxy.io
    console.log("\nTesting CorsProxy.io...");
    try {
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
        const text = await res.text();
        console.log(`CorsProxy.io status: ${res.status}`);
        console.log(`Content length: ${text.length}`);
        if (text.includes("Just a moment...")) {
            console.log("❌ CorsProxy.io returned Cloudflare challenge!");
        } else {
            console.log("✅ CorsProxy.io successfully bypassed Cloudflare!");
            console.log(text.substring(0, 1000));
        }
    } catch (e) {
        console.error("CorsProxy.io failed:", e.message);
    }
}

main();
