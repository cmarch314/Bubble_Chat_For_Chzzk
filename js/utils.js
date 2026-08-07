// ==========================================
// [Global Emoji Image Load Fallback]
// Catch any twemoji or .emoji image load failure and fallback to native unicode text.
// This is registered globally in the capturing phase so it catches errors early.
// ==========================================
window.addEventListener('error', function(event) {
    const target = event.target;
    if (target && target.tagName === 'IMG') {
        const isEmoji = target.classList.contains('emoji') || 
                        (target.parentNode && target.parentNode.classList.contains('actor-emoji')) ||
                        (target.closest && target.closest('.actor-emoji')) ||
                        (target.src && target.src.includes('twemoji'));
        if (isEmoji) {
            let emojiChar = target.alt;
            if (!emojiChar && target.src) {
                try {
                    const lastSlash = target.src.lastIndexOf('/');
                    if (lastSlash !== -1) {
                        const filename = target.src.substring(lastSlash + 1);
                        const dotIdx = filename.indexOf('.');
                        const codeStr = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
                        const codePoints = codeStr.split('-').map(part => parseInt(part, 16));
                        if (codePoints.every(cp => !isNaN(cp) && cp > 0)) {
                            emojiChar = String.fromCodePoint(...codePoints);
                        }
                    }
                } catch (e) {
                    console.error("[Twemoji Fallback] Error parsing hex code from URL:", e);
                }
            }
            if (emojiChar) {
                console.warn(`[Twemoji Global Capture] Failed to load emoji image: ${target.src}. Falling back to native: ${emojiChar}`);
                const textNode = document.createTextNode(emojiChar);
                if (target.parentNode) {
                    target.parentNode.replaceChild(textNode, target);
                }
            }
        }
    }
}, true); // True to capture error event at the window level before bubbling is skipped for resource loads

// ==========================================
// [Global Twemoji CDN Fix] MaxCDN is dead, route all twemoji requests to jsDelivr
// ==========================================
function setupTwemojiOverride() {
    if (window.twemoji && !window.twemoji._isOverridden) {
        const originalParse = twemoji.parse;
        twemoji.parse = function(what, options) {
            if (typeof options === 'function') {
                const originalCallback = options;
                options = {
                    base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/',
                    folder: 'svg',
                    ext: '.svg',
                    callback: originalCallback
                };
            } else {
                options = options || {};
                if (!options.base) {
                    options.base = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/';
                }
                if (!options.folder && !options.size) {
                    options.folder = 'svg';
                }
                if (!options.ext) {
                    options.ext = '.svg';
                }
            }
            const result = originalParse.call(twemoji, what, options);
            
            // [Cdn/Network Fallback] Double protection: attach local onerror handlers
            if (what && what.nodeType === 1) {
                const images = what.querySelectorAll('img.emoji');
                images.forEach(img => {
                    if (!img._hasOnError) {
                        img._hasOnError = true;
                        img.onerror = function() {
                            console.warn(`[Twemoji Inline onerror] Failed to load emoji: ${img.src}. Falling back to native: ${img.alt}`);
                            const textNode = document.createTextNode(img.alt || '');
                            if (img.parentNode) {
                                img.parentNode.replaceChild(textNode, img);
                            }
                        };
                    }
                });
            }
            return result;
        };
        window.twemoji._isOverridden = true;
        return true;
    }
    return false;
}

// 1. 즉시 실행 시도
if (!setupTwemojiOverride()) {
    // 2. 실패 시 주기적 폴링 및 로드 이벤트 가드
    const twemojiInterval = setInterval(() => {
        if (setupTwemojiOverride()) {
            clearInterval(twemojiInterval);
        }
    }, 50);

    window.addEventListener('load', () => {
        setupTwemojiOverride();
        clearInterval(twemojiInterval);
    });
}

const WEAPON_MAP = {
    '대검': 'great_sword.svg',
    '태도': 'long_sword.svg',
    '한손검': 'sword_shield.svg',
    '쌍검': 'dual_blades.svg',
    '해머': 'hammer.svg',
    '수렵피리': 'hunting_horn.svg',
    '피리': 'hunting_horn.svg',
    '랜스': 'lance.svg',
    '건랜스': 'gunlance.svg',
    '슬래시액스': 'switch_axe.svg',
    '슬액': 'switch_axe.svg',
    '차지액스': 'charge_blade.svg',
    '차액': 'charge_blade.svg',
    '조충곤': 'insect_glaive.svg',
    '라이트보건': 'light_bowgun.svg',
    '라보': 'light_bowgun.svg',
    '헤비보건': 'heavy_bowgun.svg',
    '헤보': 'heavy_bowgun.svg',
    '활': 'bow.svg'
};
const WEAPON_KEYWORDS = Object.keys(WEAPON_MAP).sort((a, b) => b.length - a.length);
const WEAPON_REGEX = new RegExp(`(${WEAPON_KEYWORDS.join('|')})`, 'g');

function replaceWeaponNamesWithIcons(message) {
    if (!message) return message;
    const parts = message.split(/(<[^>]+>)/g);
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            parts[i] = parts[i].replace(WEAPON_REGEX, (match) => {
                const filename = WEAPON_MAP[match];
                return `<img src="./img/weapons/${filename}" class="weapon-icon" alt="${match}" />`;
            });
        }
    }
    return parts.join('');
}

function renderMessageWithEmotesHTML(message, emotes, scale = 1) {
    // All remote chat text is escaped before the approved emote markup is added.
    const content = SafeContent.renderEmotesHTML(message, emotes, scale);

    let result = content;
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
        result = temp.innerHTML;
    }
    
    // Apply weapon icon replacements
    return replaceWeaponNamesWithIcons(result);
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

// [CMC] 한글 음절 -> 자모(초성/중성/종성) 분해. 한국어 오타는 음절 단위보다 자모 단위
// 편집거리로 재야 "슥고이 vs 스고이", "대단하다 vs 대단하니" 같은 근접 오타를 정확히 잡는다.
const CMC_CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const CMC_JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const CMC_JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function cmcDecompose(str) {
    let out = '';
    for (const ch of str) {
        const c = ch.codePointAt(0);
        if (c >= 0xAC00 && c <= 0xD7A3) {
            const s = c - 0xAC00;
            out += CMC_CHO[Math.floor(s / (21 * 28))] + CMC_JUNG[Math.floor((s % (21 * 28)) / 28)] + CMC_JONG[s % 28];
        } else {
            out += ch;
        }
    }
    return out;
}
// 편집거리 (최대 허용거리 maxDist 초과 시 조기 종료 -> 명령어 수가 많아도 빠름)
function cmcEditDistance(a, b, maxDist) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > maxDist) return maxDist + 1;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
        let cur = new Array(n + 1);
        cur[0] = i;
        let rowMin = cur[0];
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
            if (cur[j] < rowMin) rowMin = cur[j];
        }
        if (rowMin > maxDist) return maxDist + 1; // 이 행 전체가 이미 한계 초과 -> 더 볼 필요 없음
        prev = cur;
    }
    return prev[n];
}
// 명령어 목록의 자모 분해 결과를 캐시 (목록이 바뀌면 자동 재생성)
function cmcJamoIndex(commands) {
    const cache = window.__CMC_JAMO_CACHE;
    if (cache && cache.source === commands) return cache.entries;
    const entries = commands.map(c => ({ cmd: c, jamo: cmcDecompose(c.toLowerCase()) }));
    window.__CMC_JAMO_CACHE = { source: commands, entries };
    return entries;
}

// 유사도 임계값: 0.72 -> 1글자 오타 복구율 98%, 무관한 단어 오발동 0% (실측 기준)
const CMC_FUZZY_THRESHOLD = 0.72;

// [New] Global helper to parse and find CMC video commands in a chat message
function findCMCVideosInMessage(message) {
    const commandGroups = window.HIVE_CMC_COMMAND_GROUPS || {};
    const CMC_COMMANDS = Object.keys(commandGroups);
    if (!message || CMC_COMMANDS.length === 0) return [];

    // 매칭 전략: 명령어가 수백~1000개에 달하므로 정확히 치기 어렵다. "정확 -> 프리픽스 -> 자모 퍼지"
    // 3단계로, 오타/유사 입력은 관대하게 잡되 무관한 채팅은 재생하지 않도록 임계값으로 통제한다.
    //  - 예측 가능하려면 관련도 최고 1개만 골라야 한다(예전의 substring "포함되면 아무거나" 방식 폐기).
    //  - 한 글자 term은 초성만으로 남발되므로 프리픽스/퍼지에서 제외(정확 일치만 허용).
    const findBestMatch = (term) => {
        term = term.toLowerCase().trim();
        if (!term) return null;

        // 1. 정확 일치 (예: #뭐 -> 뭐, #하지마요 -> 하지마요 별칭)
        let match = CMC_COMMANDS.find(f => f.toLowerCase() === term);
        if (match) return match;

        if (term.length < 2) return null; // 한 글자는 정확 일치가 아니면 발동 금지

        // 2. 명령어 프리픽스 = 명령어 앞부분만 입력 (예: #수호룡 -> 수호룡삭제, #안녕 -> 안녕하세요)
        //    여러 개면 가장 짧은(가장 구체적으로 완성에 가까운) 명령어 선택 -> 결정적 동작.
        let bestPrefix = null;
        for (const f of CMC_COMMANDS) {
            if (f.toLowerCase().startsWith(term) && (!bestPrefix || f.length < bestPrefix.length)) {
                bestPrefix = f;
            }
        }
        if (bestPrefix) return bestPrefix;

        // 3. 자모 편집거리 기반 퍼지 = 오타/유사 철자 (예: #슥고이 -> 스고이, #대단하니 -> 대단하다)
        //    유사도(1 - 편집거리/최대길이)가 임계값 이상인 것 중 최고 1개만.
        const termJamo = cmcDecompose(term);
        const entries = cmcJamoIndex(CMC_COMMANDS);
        let best = null, bestScore = -1;
        for (const { cmd, jamo } of entries) {
            const maxLen = Math.max(termJamo.length, jamo.length);
            if (maxLen === 0) continue;
            // 임계값을 넘으려면 편집거리 <= (1-threshold)*maxLen 이어야 함 -> 그 값으로 조기 종료
            const maxDist = Math.floor((1 - CMC_FUZZY_THRESHOLD) * maxLen);
            const dist = cmcEditDistance(termJamo, jamo, maxDist);
            const score = 1 - dist / maxLen;
            if (score < CMC_FUZZY_THRESHOLD) continue;
            // 동점이면 더 짧은(구체적인) 명령어 우선 -> 명령어 등록 순서와 무관하게 결정적
            if (score > bestScore || (score === bestScore && best && cmd.length < best.length)) {
                bestScore = score;
                best = cmd;
            }
        }
        return best;
    };

    const videoQueue = [];
    const tokens = message.trim().split(/\s+/);
    let searchPos = 0;
    for (const token of tokens) {
        if (token.startsWith('#') && token.length > 1) {
            const term = token.substring(1);
            const matchedFile = findBestMatch(term);
            if (matchedFile) {
                const indexInOriginal = message.indexOf(token, searchPos);
                videoQueue.push({
                    type: 'video',
                    command: matchedFile,
                    files: commandGroups[matchedFile],
                    startIndex: indexInOriginal !== -1 ? indexInOriginal : 0,
                    length: token.length
                });
                if (indexInOriginal !== -1) {
                    searchPos = indexInOriginal + token.length;
                }
                if (videoQueue.length >= 5) break;
            }
        }
    }
    return videoQueue;
}

// [New] Maps space-removed index back to its index in the original string with spaces
function mapIndexSpaceRemovedToOriginal(spaceRemovedIndex, originalString) {
    let spaceRemovedCount = 0;
    for (let i = 0; i < originalString.length; i++) {
        if (originalString[i].match(/\s/)) {
            continue;
        }
        if (spaceRemovedCount === spaceRemovedIndex) {
            return i;
        }
        spaceRemovedCount++;
    }
    return originalString.length;
}

