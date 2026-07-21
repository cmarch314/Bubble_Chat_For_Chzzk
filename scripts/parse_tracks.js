const fs = require('fs');
const path = require('path');

const tempDir = path.resolve('D:/BubbleChat/scratch/temp');
const files = fs.readdirSync(tempDir).filter(f => f.startsWith('album_') && f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const html = fs.readFileSync(filePath, 'utf8');

    // Extract album title
    const titleMatch = html.match(/<h2>([^<]+)<\/h2>/i) || html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : file;

    console.log(`\nAlbum: ${title} (${file})`);

    // Match song links
    // <td class="clickable-row"><a href="...">Track Name</a></td>
    const songRegex = /<td[^>]*class="clickable-row"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/td>/gi;
    let match;
    const tracks = [];
    while ((match = songRegex.exec(html)) !== null) {
        const url = match[1];
        const name = match[2].replace(/<[^>]*>/g, '').trim();
        if (url.includes('.mp3') && !tracks.includes(name)) {
            tracks.push(name);
        }
    }

    // Print tracks containing keywords
    tracks.forEach((track, i) => {
        const norm = track.toLowerCase();
        if (norm.includes('potion') || norm.includes('drink') || norm.includes('eat') || norm.includes('item') || norm.includes('use') || norm.includes('heal') || norm.includes('gargle') || norm.includes('gulp') || norm.includes('faint')) {
            console.log(`  - [${i+1}] ${track}`);
        }
    });
});
