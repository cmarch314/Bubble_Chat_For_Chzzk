const https = require('https');

const url = 'https://www.voicy.network/sounds/monster-hunter';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        console.log(`HTML Length: ${html.length}`);
        console.log(html.substring(0, 1000));
    });
}).on('error', err => {
    console.error('Error:', err);
});
