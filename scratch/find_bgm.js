const https = require('https');

const url = 'https://archive.org/download/monster-hunter-world-iceborne-ost/';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        const regex = /href="([^"]+\.mp3)"/ig;
        let match;
        const mp3s = [];
        while ((match = regex.exec(html)) !== null) {
            mp3s.push(match[1]);
        }
        console.log(`Found ${mp3s.length} MP3 files:`);
        mp3s.forEach((f, i) => {
            const decoded = decodeURIComponent(f);
            console.log(`${i+1}: ${decoded} -> ${url + f}`);
        });
    });
}).on('error', err => {
    console.error('Error fetching list:', err);
});
