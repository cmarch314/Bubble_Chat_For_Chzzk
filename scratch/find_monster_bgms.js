const https = require('https');

const url = 'https://archive.org/download/monster-hunter-world-iceborne-ost/';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, here Gecko) Chrome/120.0.0.0 Safari/537.36';

https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        const regex = /href="([^"]+\.mp3)"/ig;
        let match;
        const mp3s = [];
        while ((match = regex.exec(html)) !== null) {
            mp3s.push(decodeURIComponent(match[1]));
        }
        
        console.log(`--- Total ${mp3s.length} tracks found ---`);
        const keywords = ['rathalos', 'nergigante', 'zinogre', 'velkhana', 'brachydios', 'deviljho', 'tigrex', 'nargacuga', 'glavenus', 'bazelgeuse', 'valkhana', 'theme', 'chase', 'proof of a hero', 'nay'];
        
        mp3s.forEach((decoded, i) => {
            const lower = decoded.toLowerCase();
            const matches = keywords.some(k => lower.includes(k));
            if (matches) {
                console.log(`${i+1}: ${decoded}`);
            }
        });
    });
}).on('error', err => {
    console.error('Error fetching list:', err);
});
