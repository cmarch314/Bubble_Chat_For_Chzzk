const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, '../img/monsters');

// Clean existing directory
if (fs.existsSync(outputDir)) {
    console.log(`🧹 Cleaning existing monsters directory: ${outputDir}`);
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
        fs.unlinkSync(path.join(outputDir, file));
    }
} else {
    fs.mkdirSync(outputDir, { recursive: true });
}

const translationMap = {
    // Large Monsters
    "rathalos": "리오레우스",
    "rathian": "리오레이아",
    "anjanath": "안쟈나프",
    "great jagras": "도스쟈그라스",
    "pukei-pukei": "푸케푸케",
    "tobi-kadachi": "토비카가치",
    "barroth": "볼보로스",
    "jyuratodus": "쥬라토도스",
    "kulu-ya-ku": "쿠루루야쿠",
    "diablos": "디아블로스",
    "odogaron": "오도가론",
    "legiana": "레이기에나",
    "great girros": "도스기르오스",
    "radobaan": "라도발킨",
    "paolumu": "파오우르무",
    "tzitzi-ya-ku": "치치야쿠",
    "kirin": "키린",
    "nergigante": "네르기간테",
    "teostra": "테오 테스카토르",
    "kushala daora": "크샬다오라",
    "vaal hazak": "발하자크",
    "xeno'jiiva": "제노-지바",
    "zorah magdaros": "조라-마그다라오스",
    "deviljho": "이블조",
    "lunastra": "나나-테스카토리",
    "kulve taroth": "맘-타로트",
    "behemoth": "베히모스",
    "leshen": "레셴",
    "ancient leshen": "고대 레셴",
    "banbaro": "버프바로",
    "beotodus": "브란토도스",
    "nargacuga": "나르가쿠르가",
    "tigrex": "티가렉스",
    "glavenus": "디노발드",
    "barioth": "베리오로스",
    "brachydios": "브라키디오스",
    "zinogre": "진오우거",
    "yian garuga": "얀가루루가",
    "scarred yian garuga": "상처입은 얀가루루가",
    "velkhana": "벨카나",
    "namielle": "네로미에르",
    "blackveil vaal hazak": "죽음을 두른 발하자크",
    "savage deviljho": "미친 들이치는 이블조",
    "ruiner nergigante": "모두를 멸하는 네르기간테",
    "shara ishvalda": "안-이슈왈다",
    "safi'jiiva": "무페토-지바",
    "stygian zinogre": "옥랑룡 진오우거 아종",
    "rajang": "라잔",
    "furious rajang": "격앙 라잔",
    "raging brachydios": "임계 브라키디오스",
    "alatreon": "알바트리온",
    "fatalis": "밀라보레아스",
    "frostfang barioth": "서리칼날 품은 베리오로스",
    "pink rathian": "리오레이아 아종",
    "azure rathalos": "리오레우스 아종",
    "black diablos": "디아블로스 아종",
    "silver rathalos": "리오레우스 희소종",
    "gold rathian": "리오레이아 희소종",
    "acidic glavenus": "디노발드 아종",
    "ebony odogaron": "오도가론 아종",
    "coral pukei-pukei": "푸케푸케 아종",
    "shrieking legiana": "얼려 찌르는 레이기에나",
    "nightshade paolumu": "파오우르무 아종",
    "viper tobi-kadachi": "토비카가치 아종",
    "brute tigrex": "티가렉스 아종",
    "dodogama": "도도가마",
    "uragaan": "우라간킨",
    "lavasioth": "볼가노스",
    "bazelgeuse": "바젤기우스",
    "seething bazelgeuse": "홍련의 솟구치는 바젤기우스",
    
    // Small Monsters & Endemic Life
    "apceros": "압케로스",
    "aptonoth": "압토노스",
    "barnos": "바르노스",
    "felyne": "동반자 아이루",
    "gajalaka": "가자부",
    "gajau": "가쟈우",
    "gastodon": "가스토돈",
    "girros": "기르오스",
    "grimalkyne": "테토루",
    "hornetaur": "칸타로스",
    "jagras": "쟈그라스",
    "kelbi": "켈비",
    "kestodon female": "케스토돈 (암컷)",
    "kestodon": "케스토돈",
    "mernos": "메르노스",
    "mosswine": "모스",
    "noios": "노이오스",
    "raphinos": "라피노스",
    "shamos": "샤모스",
    "vespoid": "랑고스타",
    "anteka": "안테카",
    "boaboa": "보아보아",
    "cortos": "코르토스",
    "popo": "포포",
    "wulg": "울그",

    // Added Missing Monsters from MonsterData
    "gore magala": "고어-마가라",
    "shagaru magala": "샤가르마가라",
    "valstrax": "발파루크",
    "crimson glow valstrax": "혁요에 번뜩이는 발파루크",
    "magnamalo": "마가이마가도",
    "malzeno": "멜-제나",
    "primordial malzeno": "원초를 새기는 멜-제나",
    "mizutsune": "타마미츠네",
    "astalos": "라이젝스",
    "gammoth": "가무토",
    "seregios": "셀레기오스",
    "chameleos": "오오나즈치",
    "lao shan lung": "노산룡",
    "yamatsukami": "야마츠카미",
    "akantor": "아캄토름",
    "ukanlos": "우캄루스",
    "amatsu": "아마츠마가츠치",
    "nakarkos": "오스트가로아",
    "goss harag": "고샤하기",
    "tetranadon": "요츠미와두",
    "somnacanth": "이소네미쿠니",
    "lunagaron": "루나가론",
    "garangolm": "가란고르무",
    "lagiacrus": "라기아크루스",
    "royal ludroth": "로알루드로스"
};

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${res.statusCode}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function getCategoryMembers(category) {
    console.log(`🔍 Fetching category members for ${category}...`);
    const url = `https://monsterhunter.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=200&format=json`;
    const data = await fetchJSON(url);
    if (!data.query || !data.query.categorymembers) {
        throw new Error(`Invalid response for category: ${category}`);
    }
    return data.query.categorymembers.filter(m => m.title.startsWith('File:') && m.title.endsWith('.png'));
}

async function getFileUrls(titles) {
    const url = `https://monsterhunter.fandom.com/api.php?action=query&prop=imageinfo&titles=${encodeURIComponent(titles.join('|'))}&iiprop=url&format=json`;
    const data = await fetchJSON(url);
    const urls = {};
    if (data.query && data.query.pages) {
        Object.values(data.query.pages).forEach(page => {
            if (page.imageinfo && page.imageinfo[0]) {
                urls[page.title] = page.imageinfo[0].url;
            }
        });
    }
    return urls;
}

async function main() {
    try {
        const mhwFiles = await getCategoryMembers('Category:MHW_Monster_Icons');
        const mhwiFiles = await getCategoryMembers('Category:MHWI_Monster_Icons');
        const allFiles = [...mhwFiles, ...mhwiFiles];

        // Deduplicate by title
        const fileMap = {};
        allFiles.forEach(f => {
            fileMap[f.title] = f;
        });
        const filesToProcess = Object.values(fileMap);
        console.log(`💡 Found ${filesToProcess.length} total monster icon files.`);

        const monstersList = [];

        // Process in batches of 50 for the API
        const batchSize = 50;
        for (let i = 0; i < filesToProcess.length; i += batchSize) {
            const batch = filesToProcess.slice(i, i + batchSize);
            const titles = batch.map(f => f.title);
            console.log(`📦 Fetching image URLs for batch ${i / batchSize + 1}...`);
            const urls = await getFileUrls(titles);

            for (const item of batch) {
                const imageUrl = urls[item.title];
                if (!imageUrl) continue;

                // Robust name cleaning
                let cleanName = item.title.replace(/^File:/, '');
                cleanName = cleanName.replace(/\.png$/i, '');
                cleanName = cleanName.replace(/^(MHW|MHWI)-/i, '');
                cleanName = cleanName.replace(/[\s_]icon$/i, '');
                cleanName = cleanName.replace(/_/g, ' ').trim();

                const nameKey = cleanName.toLowerCase().trim();
                let koreanName = translationMap[nameKey];

                // If still not found, try to guess or use capitalized name
                if (!koreanName) {
                    koreanName = cleanName;
                    console.log(`⚠️ Translation missing for: "${nameKey}" (using EN name "${koreanName}")`);
                }

                // Construct clean safe filename
                const safeFilename = `${nameKey.replace(/\s+/g, '_')}.png`;
                const destPath = path.join(outputDir, safeFilename);

                try {
                    console.log(`📥 Downloading ${cleanName} (${koreanName}) -> ${safeFilename}`);
                    await downloadFile(imageUrl, destPath);
                    monstersList.push({
                        id: nameKey.replace(/\s+/g, '_'),
                        nameEN: cleanName,
                        nameKO: koreanName,
                        filename: safeFilename
                    });
                } catch (err) {
                    console.error(`❌ Failed to download ${cleanName}:`, err.message);
                }
            }
        }

        // Save metadata file
        const metadataPath = path.join(outputDir, 'monsters.json');
        fs.writeFileSync(metadataPath, JSON.stringify(monstersList, null, 4), 'utf-8');
        console.log(`✅ Completed downloading ${monstersList.length} monsters. Metadata saved to ${metadataPath}`);

    } catch (error) {
        console.error('❌ Error in downloader:', error);
    }
}

main();
