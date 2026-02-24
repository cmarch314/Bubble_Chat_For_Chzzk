// ==========================================
// [Global Variables] 기본 전역 변수
// ==========================================
const idElement = document.getElementById('id');
const chatEle = document.getElementById('chat');
let boxPos = 0;
const mainArray = [];
let soundEnabled = true;
const promptQue = [];
let visualConfig = {};
let soundHive = {};

// [Refactor] Twitch -> Chzzk 변수명 변경
const chzzkBadgeCache = { data: { global: {} } };

function renderMessageWithEmotesHTML(message, emotes, scale = 1) {
    // Legacy helper for VisualDirector
    let content = message;
    if (emotes && Object.keys(emotes).length > 0) {
        // [Fix] Broaden regex to catch {:d_15:} or {d_15} or other variants
        content = message.replace(/\{[^}]+\}/g, (match) => {
            // Remove {, }, : and whitespace to get pure ID
            const emoteId = match.replace(/[\{\}:]/g, "").trim();
            const d = emotes[emoteId];
            const url = (d && (typeof d === 'string' ? d : (d.imageUrl || d.url))) || null;
            // [Fix] Use height:auto and max-width to preserve aspect ratio, preventing flattening
            // [Fix] Check if message is JUST this emote to scale it up
            const isSingleEmote = message.trim() === match;
            const sizeStyle = isSingleEmote ? "height: 10em; width: auto;" : `height: ${3 * scale}em; width: auto;`;

            return url ? `<img src="${url}" class="emote_chzzk_inline" style="${sizeStyle} vertical-align: middle; display: inline-block;" alt="${emoteId}">` : match;
        });
    }

    if (window.twemoji) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        twemoji.parse(temp);
        const images = temp.querySelectorAll('img.emoji');
        images.forEach(img => {
            img.style.height = `${scale}em`;
            img.style.width = `${scale}em`;
            img.style.verticalAlign = 'middle';
            img.style.display = 'inline-block';
        });
        return temp.innerHTML;
    }
    return content;
}

// [Utility] Plette Stackable Color Blending
function pSBC(p, c0, c1, l) {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    const pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) { [r, g, b, a] = d = d.split(","), n = d.length; if (n < 3 || n > 4) return null; x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1 }
        else { if (n == 8 || n == 6 || n < 4) return null; if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : ""); d = i(d.slice(1), 16); if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000; else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1 } return x
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}
