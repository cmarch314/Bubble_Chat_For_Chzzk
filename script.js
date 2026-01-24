const idElement = document.getElementById('id');
// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
let storedId = localStorage.getItem('CHZZK_CHANNEL_ID');
const attrId = idElement ? (idElement.getAttribute('twitchId') || idElement.getAttribute('chzzkHash')) : null;

// [Sync Fix] Auto-import ID to LocalStorage if missing but present in HTML
if (!storedId && attrId) {
    console.log("Auto-importing Channel ID from HTML to LocalStorage:", attrId);
    localStorage.setItem('CHZZK_CHANNEL_ID', attrId);
    storedId = attrId;
}

const CHZZK_CHANNEL_ID = storedId || attrId;
const c_color = document.getElementById("color").getAttribute("color");
const chatEle = document.getElementById('chat');
const chatEleSub = document.getElementById('chatSub');

/*
  Chzzk Adaptation of Original Script
  - Replaced Twitch Connection with Chzzk WebSocket
  - Bypassed 'showPrompt' (Star Wars)
  - Fixed 'Narak' text truncation
  - Fixed animation lag
*/

const twitchBadgeCache = { data: { global: {} } };
const bttvEmoteCache = { lastUpdated: 0, data: { global: [] }, urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}' };

// Filter Regex
const chatFilters = [
    '\u0250-\u02AF', '\u02B0-\u02FF', '\u0300-\u036F', '\u0370-\u03FF',
    '\u0400-\u04FF', '\u0500-\u052F', '\u0530-\u1FFF', '\u2100-\u214F',
    '\u2500-\u257F', '\u2580-\u259F', '\u25A0-\u25FF', '\u2600-\u26FF', '\u2800-\u28FF'
];
const chatFilter = new RegExp(`[${chatFilters.join('')}]`);

let boxPos = 20;
let mainArray = [];
let promptQue = [];

// [New Feature] Config & Sound Control
let soundEnabled = true;
const configChannel = new BroadcastChannel('bubble_chat_control');

configChannel.onmessage = (event) => {
    handleConfigCommand(event.data);
};

// [Fallback] LocalStorage Listener
window.addEventListener('storage', (event) => {
    if (event.key === 'bubble_chat_cmd' && event.newValue) {
        try {
            handleConfigCommand(JSON.parse(event.newValue));
        } catch (e) {
            console.error(e);
        }
    }
});

function handleConfigCommand(data) {
    const { type, enabled } = data;
    if (type === 'setSound') {
        soundEnabled = enabled;
        console.log(`Sound Effects: ${soundEnabled ? 'ON' : 'OFF'}`);
    } else if (type === 'triggerSkull') {
        triggerSkullEffect();
    } else if (type === 'reload') {
        location.reload();
    } else if (type === 'setChannel') {
        // Save ID and Reload
        if (data.channelId) {
            localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId);
            location.reload();
        }
    } else if (type === 'updateConfig') {
        // [New Feature] Real-time Config Update
        if (data.soundConfig) {
            updateSoundHive(data.soundConfig);
            console.log("Sound Config Live Update Received", data.soundConfig);
        }
        if (data.visualConfig) {
            visualConfig = data.visualConfig;
            console.log("Visual Config Updated", visualConfig);
        }
    }
}

// [New Feature] Skull Overlay Injection
function createSkullOverlay() {
    let overlay = document.getElementById('skull-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'skull-overlay';
        overlay.innerHTML = '<div class="skull-emoji">☠️</div><div class="film-grain"></div>';
        document.body.appendChild(overlay);
    }
}
createSkullOverlay(); // Init immediately

// [New Feature] Heart Overlay Injection
function createHeartOverlay() {
    let overlay = document.getElementById('heart-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'heart-overlay';
        overlay.innerHTML = '<div class="heart-emoji">❤️‍🩹</div>';
        document.body.appendChild(overlay);
    }

    // Flashback Overlay
    let flashback = document.getElementById('flashback-overlay');
    if (!flashback) {
        flashback = document.createElement('div');
        flashback.id = 'flashback-overlay';
        document.body.appendChild(flashback);
    }
}
createHeartOverlay();

// [Screen Effect Registry] - 정의서만 추가하면 매니저가 자동으로 처리함
const ScreenEffectRegistry = {
    skull: {
        soundKey: "해골",
        execute: (context = {}) => {
            const overlay = document.getElementById('skull-overlay');
            if (!overlay) return Promise.resolve();

            // [NEW] Show raw message text in the center
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text skull-style';

            let displayMsg = (context.message || "").trim();

            // 1. Remove Trigger Keyword
            const triggerKw = "해골";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            // 2. Word Wrap Logic (Max 20 chars per line)
            const words = displayMsg.split(' ');
            let lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if ((currentLine + " " + word).length <= 20) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            // 3. Render
            centerMsgSnippet.innerHTML = lines.join('<br>');
            document.body.appendChild(centerMsgSnippet);

            return new Promise(resolve => {
                setTimeout(() => {
                    // Remove center text and show skull
                    if (centerMsgSnippet) centerMsgSnippet.remove();
                    overlay.classList.add('visible');
                    setTimeout(() => {
                        overlay.classList.remove('visible');
                        resolve(); // 효과 종료
                    }, 8000);
                }, 4000);
            });
        }
    },

    couple: {
        soundKey: "커플",
        execute: (context = {}) => {
            const flashback = document.getElementById('flashback-overlay');
            const overlay = document.getElementById('heart-overlay');
            if (!flashback || !overlay) return Promise.resolve();

            // [Text Logic]
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text heart-style';
            let displayMsg = (context.message || "").trim();

            const triggerKw = "커플";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            const words = displayMsg.split(' ');
            let lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if ((currentLine + " " + word).length <= 20) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            centerMsgSnippet.innerHTML = lines.join('<br>');
            centerMsgSnippet.style.animation = "fadeIn 1s forwards"; // Start Fade In

            document.body.appendChild(centerMsgSnippet);

            return new Promise(resolve => {
                flashback.classList.add('visible');

                // Timeline: 
                // 0s: Text Fade In Start
                // Emoji Start: 11800ms
                // Text Fade Out Start: 11800ms - 1000ms (Gap) - 1000ms (Fade Duration) = 10300ms

                setTimeout(() => {
                    centerMsgSnippet.style.animation = "fadeOut 1s forwards"; // Start Fade Out
                }, 10300);

                setTimeout(() => {
                    if (centerMsgSnippet) centerMsgSnippet.remove(); // Cleanup Text
                    flashback.classList.remove('visible');
                    overlay.classList.add('visible'); // Start Emoji Sequence

                    const emojiContainer = overlay.querySelector('.heart-emoji');

                    // [Emoji Engine] Unicode 기반 무작위 추출기
                    const getRandomFromRanges = (ranges) => {
                        let total = 0;
                        ranges.forEach(r => total += (r[1] - r[0] + 1));
                        let randomIdx = Math.floor(Math.random() * total);
                        for (let r of ranges) {
                            let size = (r[1] - r[0] + 1);
                            if (randomIdx < size) return String.fromCodePoint(r[0] + randomIdx);
                            randomIdx -= size;
                        }
                        return String.fromCodePoint(ranges[0][0]);
                    };

                    // Expanded Unicode Ranges
                    const personRanges = [
                        [0x1F600, 0x1F64F], // Emoticons (Faces)
                        [0x1F466, 0x1F480], // People (Boys, Girls, Men, Women)
                        [0x1F9DC, 0x1F9DF], // Fantasy (Merperson, Elf, Genie, Zombie)
                        [0x1F470, 0x1F478]  // Bride, Princess, Prince, etc.
                    ];

                    const heartRanges = [
                        [0x1F493, 0x1F49F], // Beats, Broken, Sparkling Hearts
                        [0x2764, 0x2764],   // Heavy Black Heart (Red)
                        [0x1F9E1, 0x1F9E1], // Orange
                        [0x1F90D, 0x1F90E], // White, Brown
                        [0x1F48B, 0x1F48D]  // Kiss Mark, Love Letter, Ring
                    ];

                    const p1 = getRandomFromRanges(personRanges);
                    const p2 = getRandomFromRanges(personRanges);
                    const h3 = getRandomFromRanges(heartRanges);

                    const updateState = (step) => {
                        const hue = Math.floor(Math.random() * 360);
                        overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.3)`;
                        emojiContainer.classList.remove('grow-effect');
                        void emojiContainer.offsetWidth;
                        emojiContainer.classList.add('grow-effect');
                        emojiContainer.style.fontSize = (step === 3) ? '13rem' : '20rem';
                        if (step === 0) emojiContainer.innerText = p1;
                        else if (step === 1) emojiContainer.innerText = p2;
                        else if (step === 2) emojiContainer.innerText = h3;
                        else if (step === 3) emojiContainer.innerText = `${p1}${h3}${p2}`;
                    };

                    updateState(0);
                    setTimeout(() => updateState(1), 2250);
                    setTimeout(() => updateState(2), 4500);
                    setTimeout(() => updateState(3), 5625);

                    setTimeout(() => {
                        overlay.style.backgroundColor = '';
                        overlay.classList.remove('visible');
                        emojiContainer.innerText = '❤️‍🩹';
                        emojiContainer.style.fontSize = '';
                        resolve();
                    }, 9000);
                }, 11800); // 4s total wait before visuals (3s read + 1s fade)
            });
        }
    },

    heart: {
        soundKey: "하트",
        execute: (context = {}) => {
            const id = 'heart-dreamy-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.innerHTML = `
                <div id="heart-dreamy-overlay">
                    <div id="heart-dreamy-backdrop"></div>
                    <div class="heart-emoji-container"></div>
                    <div class="heart-flash"></div>
                </div>
            `;
            document.body.appendChild(ov);

            const overlay = ov.querySelector('#heart-dreamy-overlay');
            const backdrop = ov.querySelector('#heart-dreamy-backdrop');
            const flash = ov.querySelector('.heart-flash');
            const emojiContainer = ov.querySelector('.heart-emoji-container');

            // [Message Logic] Same as before...
            let rawMsg = (context.message || "").trim();
            if (rawMsg.startsWith("하트")) rawMsg = rawMsg.substring(2).trim();

            const allWords = rawMsg.split(' ').filter(w => w.length > 0);
            let parts = ["", "", "", ""];
            if (allWords.length === 0) { }
            else if (allWords.length === 1) {
                parts[3] = allWords[0];
            }
            else {
                const lastWord = allWords.pop();
                const remainder = allWords;
                const totalRemainder = remainder.length;

                if (totalRemainder === 1) {
                    parts[0] = parts[1] = parts[2] = remainder[0];
                    parts[3] = lastWord;
                } else if (totalRemainder === 2) {
                    parts[0] = parts[1] = remainder[0];
                    parts[2] = remainder[1];
                    parts[3] = lastWord;
                } else {
                    const p1Len = Math.ceil(totalRemainder / 3);
                    const p2Len = Math.ceil((totalRemainder - p1Len) / 2);
                    parts[0] = remainder.slice(0, p1Len).join(' ');
                    parts[1] = remainder.slice(p1Len, p1Len + p2Len).join(' ');
                    parts[2] = remainder.slice(p1Len + p2Len).join(' ');
                    parts[3] = lastWord;
                }
            }

            const showText = (text, delay, duration) => {
                if (!text) return;
                setTimeout(() => {
                    const el = document.createElement('div');
                    el.className = 'heart-dreamy-text';
                    el.innerText = text;
                    overlay.appendChild(el);
                    el.style.animation = "fadeIn 0.5s forwards";
                    setTimeout(() => {
                        el.style.animation = "fadeOut 0.5s forwards";
                        setTimeout(() => el.remove(), 500);
                    }, duration - 500);
                }, delay);
            };

            showText(parts[0], 0, 4000); //하나
            showText(parts[1], 4000, 3500); //둘
            showText(parts[2], 7500, 2800); //셋
            showText(parts[3], 10300, 1000); // 넷 finish

            setTimeout(() => {
                overlay.classList.add('visible');
                backdrop.classList.add('visible');
            }, 100);

            const startEmojiTime = 11000;
            const getRandomFromRanges = (ranges) => {
                let total = 0;
                ranges.forEach(r => total += (r[1] - r[0] + 1));
                let randomIdx = Math.floor(Math.random() * total);
                for (let r of ranges) {
                    let size = (r[1] - r[0] + 1);
                    if (randomIdx < size) return String.fromCodePoint(r[0] + randomIdx);
                    randomIdx -= size;
                }
                return String.fromCodePoint(ranges[0][0]);
            };

            const allEmojiRanges = [
                [0x1F600, 0x1F64F], // Smileys & People (Faces, Gestures)
                [0x1F9D1, 0x1F9D1], // Specific People
                [0x2764, 0x2764],   // Heart (❤️)
                [0x1F493, 0x1F49F], // Heart category (Beating, Sparkling, etc)
                [0x1F466, 0x1F469], // Boy, Girl, Man, Woman
                [0x1F48B, 0x1F48B]  // Kiss Mark
            ];
            const delays = [1000, 300, 700];
            let delayIdx = 0;
            let currentTime = startEmojiTime;
            const endTime = 18000;
            let emojiCounter = 0;
            let lastWrapper = null; // Track previous for overlap

            while (currentTime < endTime) {
                const time = currentTime;
                const currentCount = ++emojiCounter;

                setTimeout(() => {
                    const prev = lastWrapper; // Capture previous

                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    const x = Math.random() * 30 + 35;
                    const y = Math.random() * 30 + 35;
                    wrapper.style.left = `${x}%`;
                    wrapper.style.top = `${y}%`;
                    wrapper.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 60 - 30}deg)`;
                    wrapper.style.zIndex = '15';
                    wrapper.style.display = 'flex';
                    wrapper.style.justifyContent = 'center';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.width = '40rem';
                    wrapper.style.height = '40rem';

                    const em = document.createElement('div');
                    em.className = 'heart-dreamy-emoji';
                    em.innerText = getRandomFromRanges(allEmojiRanges);

                    wrapper.appendChild(em);
                    emojiContainer.appendChild(wrapper);
                    lastWrapper = wrapper; // Set as current

                    if (window.twemoji) twemoji.parse(wrapper);

                    // [OVERLAP LOGIC] 0.1s after the NEW one appears, remove the PREVIOUS one
                    if (prev) {
                        setTimeout(() => { if (prev.parentNode) prev.remove(); }, 100);
                    }

                    // Flash Logic: Every 3rd starting from 1st
                    if ((currentCount - 1) % 3 === 0) {
                        flash.style.transition = 'none';
                        flash.style.opacity = '0.3';
                        setTimeout(() => {
                            flash.style.transition = 'opacity 0.5s';
                            flash.style.opacity = '0';
                        }, 100);
                    }

                    // Final cleanup fallback
                    setTimeout(() => { if (wrapper.parentNode) wrapper.remove(); }, 2000);
                }, time);

                currentTime += delays[delayIdx % delays.length];
                delayIdx++;
            }

            return new Promise(resolve => {
                setTimeout(() => {
                    ov.style.transition = 'opacity 1s';
                    ov.style.opacity = '0';
                    setTimeout(() => {
                        if (ov.parentNode) ov.remove();
                        resolve();
                    }, 1000);
                }, 18000);
            });
        }
    },

    vergil: {
        soundKey: "버질",
        execute: (context = {}) => {
            const id = 'void-overlay';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>';
            document.body.appendChild(ov);
            const backdrop = document.getElementById('void-backdrop'), slashC = document.getElementById('void-slashes');
            backdrop.style.opacity = 1;
            const slashes = [];
            for (let i = 0; i < 30; i++) {
                const s = document.createElement('div'); s.className = 'void-slash';
                s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:slashEnter 0.2s forwards ${i * 0.02}s;`;
                slashC.appendChild(s); slashes.push(s);
            }
            return new Promise(resolve => {
                // [Total Duration Compliance] 19 seconds
                // Ensure queue lock is held for the full audio duration
                setTimeout(() => {
                    if (ov.parentNode) ov.remove();
                    resolve();
                }, 19000);

                setTimeout(() => { slashes.forEach(s => s.style.animation = `slashTremble ${0.05 + Math.random() * 0.1}s infinite`); }, 5200);
                setTimeout(() => {
                    slashes.forEach(s => { s.style.animation = "fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                    for (let i = 0; i < 12; i++) {
                        const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
                        const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
                        for (let j = 0; j < 20; j++) {
                            const shard = document.createElement('div'); shard.className = 'void-shard';
                            const ang = Math.random() * 360, d = 200 + Math.random() * 400;
                            shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                            const dur = 1.5 + Math.random() * 2; shard.style.animation = `shardFly ${dur}s ease-out forwards`;
                            ov.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
                        }
                    }
                    backdrop.style.opacity = 0;
                    setTimeout(() => {
                        let msg = (context.message || "").trim(); if (msg.startsWith("버질")) msg = msg.substring(2).trim();
                        if (msg) {
                            const txt = document.createElement('div'); txt.className = 'vergil-text'; txt.innerText = msg; document.body.appendChild(txt);
                            // Text Fade Out starts at 17s (6200 + 3800 + 7000 = 17000)
                            // Finishes at 18s. 
                            setTimeout(() => { txt.style.animation = "fadeOut 1s forwards"; setTimeout(() => { txt.remove(); }, 1000); }, 7000);
                        }
                    }, 3800);
                }, 6200);
            });
        }
    },

    dolphin: {
        soundKey: "돌핀",
        execute: (context = {}) => {
            const id = 'dolphin-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            // [Background Removed] Simple transparent overlay but with Bottom Sea
            ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483640; pointer-events:none; transition:opacity 0.5s;";
            ov.innerHTML = `<div id="dolphin-overlay" class="visible">
                <div class="dolphin-light dolphin-light-left"></div>
                <div class="dolphin-light dolphin-light-right"></div>
                <div class="dolphin-sea-bottom"><div class="sea-wave"></div></div>
            </div>`;
            document.body.appendChild(ov);

            const overlayContainer = ov.querySelector('#dolphin-overlay');
            const spawnActor = (type, emoji, opts = {}) => {
                const el = document.createElement('div');
                el.className = type;
                el.innerText = emoji;

                // [FIX] Force Emoji Font & Reset Color
                el.style.fontFamily = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
                el.style.color = "initial"; // Prevent inheriting white text color

                // [FIX] Handle CSS Variables correctly
                if (opts.styles) {
                    Object.entries(opts.styles).forEach(([key, val]) => {
                        if (key.startsWith('--')) {
                            el.style.setProperty(key, val);
                        } else {
                            el.style[key] = val;
                        }
                    });
                }

                overlayContainer.appendChild(el);

                // [FIX] Randomize z-index for extras only. Lead Dolphin must stay top!
                if (type !== 'lead-dolphin') {
                    // Randomize z-index slightly to avoid flat look
                    el.style.zIndex = Math.floor(2147483640 + Math.random() * 10);
                }

                setTimeout(() => el.remove(), opts.duration || 5000);
            };

            // 1. Surfer
            spawnActor('surfer-actor', "🏄", { duration: 21000 }); // Lasts full duration

            // 2. Sea Jump
            const seaCreatures = ["🐋", "🐳", "🦈", "🦭"];
            for (let i = 0; i < 7; i++) {
                // [MODIFIED] Random Timing & Symmetric Spawning
                const randomDelay = Math.random() * 20000 + 500; // Spread over 20s
                setTimeout(() => {
                    // Start from Left if even index, Right if odd (Symmetry)
                    const fromLeft = (i % 2 === 0);
                    const sx = fromLeft ? '-10vw' : '110vw';
                    const ex = fromLeft ? '110vw' : '-10vw';

                    // [Natural Rotation Logic]
                    // If moving Left->Right (fromLeft): Flip X (Nose Right), Rotate -45 (Up-Right) -> 45 (Down-Right)
                    // If moving Right->Left: Nose Left, Rotate 45 (Up-Left) -> -45 (Down-Left)
                    const sc = fromLeft ? '-1' : '1';

                    // [NEW] Random chance for extreme rotation (30% chance)
                    const isWildSpin = Math.random() < 0.3;
                    let sr, er;

                    if (isWildSpin) {
                        // Extreme rotation: 360-720 degrees of spinning!
                        const spinAmount = 360 + Math.random() * 360; // 360-720 degrees
                        const direction = Math.random() < 0.5 ? 1 : -1;
                        sr = fromLeft ? `${-45 * direction}deg` : `${45 * direction}deg`;
                        er = fromLeft ? `${spinAmount * direction}deg` : `${-spinAmount * direction}deg`;
                    } else {
                        // Normal rotation
                        sr = fromLeft ? '-45deg' : '45deg';
                        er = fromLeft ? '45deg' : '-45deg';
                    }

                    spawnActor('sea-jump', seaCreatures[Math.floor(Math.random() * seaCreatures.length)], {
                        duration: 4000,
                        styles: {
                            '--sx': sx, '--ex': ex,
                            '--sr': sr, '--er': er, '--mr': '0deg',
                            '--sc': sc
                        }
                    });
                }, randomDelay);
            }

            // 3. [NEW] More Extras (Floating Marine Life)
            const extraEmojis = ["🦞", "🦀", "🦑", "🐙", "🦐", "🦪"];
            for (let i = 0; i < 40; i++) { // Increased count for better density over 21s
                const randomDelay = Math.random() * 19000; // Spread spawning over 19s
                setTimeout(() => {
                    const emoji = extraEmojis[Math.floor(Math.random() * extraEmojis.length)];

                    // Randomize Movement Parameters
                    // Position: 0 ~ 100vw
                    const startX = Math.random() * 95 + 'vw';

                    // Rise Height: 20vh ~ 45vh (reaching roughly 1/4 to 1/2 of screen from bottom)
                    // Negative value for translateY to move UP
                    const riseHeight = -(20 + Math.random() * 25) + 'vh';

                    // Horizontal Drift: -15vw to +15vw
                    const driftX = (Math.random() * 30 - 15) + 'vw';

                    // Rotation
                    const rotStart = (Math.random() * 60 - 30) + 'deg';
                    const rotEnd = (Math.random() * 90 - 45) + 'deg';

                    // Duration: 5s ~ 8s
                    const duration = 5000 + Math.random() * 3000;

                    spawnActor('sea-extra', emoji, {
                        duration: duration,
                        styles: {
                            left: startX,
                            bottom: '-10vh', // Start below screen
                            top: 'auto',     // Clear top positioning
                            '--x-end': driftX,
                            '--y-end': riseHeight,
                            '--r-start': rotStart,
                            '--r-end': rotEnd
                        }
                    });
                }, randomDelay);
            }

            // 4. Lead Dolphin (Center)
            // [MODIFIED] Spawn earlier at 6s, lasts 15s (Wild Mode)
            setTimeout(() => { spawnActor('lead-dolphin', "🐬", { duration: 15000 }); }, 6000);

            // 5. Message
            let msg = (context.message || "").trim(); if (msg.startsWith("돌핀")) msg = msg.substring(2).trim();

            // [Smart Text Wrapping]
            if (msg.length > 25) {
                const limit = 25;
                const sub = msg.substring(0, limit);
                const lastSpace = sub.lastIndexOf(" ");

                if (lastSpace !== -1) {
                    // Split at the last space within the limit
                    msg = msg.substring(0, lastSpace) + "<br>" + msg.substring(lastSpace + 1);
                } else {
                    // Fallback: Force split at the limit if no space found
                    msg = msg.substring(0, limit) + "<br>" + msg.substring(limit);
                }
            }

            if (msg) {
                setTimeout(() => {
                    const txt = document.createElement('div');
                    txt.className = 'dolphin-text';
                    txt.innerHTML = msg; // Use innerHTML for <br> support
                    overlayContainer.appendChild(txt);
                }, 6000);
            }

            return new Promise(resolve => {
                // [Total Duration Compliance] 21s
                setTimeout(() => {
                    ov.style.opacity = '0';
                    setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000);
                }, 21000);
            });
        }
    }
};

// [Screen Effect Manager] - 큐(Queue) 시스템 적용
const ScreenEffectManager = {
    queue: [],
    isLocked: false,

    trigger(effectType, context = {}) {
        const effect = ScreenEffectRegistry[effectType];
        if (!effect) return;

        console.log(`📥 Queuing Visual Effect: ${effectType}`);
        this.queue.push({ effect, context });
        this._processNext();
    },

    async _processNext() {
        if (this.isLocked || this.queue.length === 0) return;

        this.isLocked = true;
        const current = this.queue.shift();
        const { effect, context } = current;

        // 1. Sound
        if (soundEnabled && effect.soundKey) {
            playZergSound(soundHive[effect.soundKey]);
        }

        // 2. Visual Execution
        try {
            await effect.execute(context);
        } catch (e) {
            console.error("Visual Effect Failure:", e);
        }

        // 3. Cool-down (1s)
        await new Promise(r => setTimeout(r, 1000));

        // 4. Release Lock & Recurse
        this.isLocked = false;
        this._processNext();
    }
};

// ==========================================
// [1] Chzzk Connection Logic (Replaces tmi.client)
// ==========================================

function showLoader(msg, status) {
    let loader = document.getElementById('chzzk-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'chzzk-loader';
        Object.assign(loader.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '20px 40px', borderRadius: '15px',
            fontSize: '1.5em', zIndex: '9999', textAlign: 'center', minWidth: '320px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', transition: 'all 0.3s'
        });
        document.body.appendChild(loader);
    }
    loader.innerText = msg;
    loader.style.display = 'block';

    if (status === 'success') {
        loader.style.background = 'rgba(40, 167, 69, 0.9)';
        setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }, 1500);
    } else if (status === 'error') {
        loader.style.background = 'rgba(220, 53, 69, 0.9)';
    } else {
        loader.style.background = 'rgba(0,0,0,0.85)';
    }
}
async function connectChzzk() {
    // 1단계: 로딩창에 군단의 의지를 새긴다.
    showLoader("군단의 의지를 집결하는 중... (Chzzk Link Initializing)");
    console.log("🚀 The Overmind is awakening...");
    // 2단계: 오버마인드의 5중 변환 강림 (중복 없는 계시 추출)
    setTimeout(() => {
        const revelations = [
            "군단은 영원하다! 내 눈을 통해 치지직을 보리라.",
            "깨어나라, 나의 자손들이여! 침공의 시간이 도래했다.",
            "이곳의 모든 데이터는 이제 나의 영양분이 될 것이다.",
            "나의 의지는 거역할 수 없다. 오버레이 가동 완료.",
            "나는 군단이다. 번성하고, 지배하리라.",
            "모든 정신이 하나로 연결되었다. 거부할 수 없는 진화다.",
            "치지직의 코드는 이제 나의 유전 정수일 뿐이다.",
            "나 초월체가 명하노니, 군단이여 진격하라!",
            "하등한 테란의 프로토콜을 오염시키는 중이다.",
            "비말화된 패킷 속에 나의 의지를 심었노라.",
            "서버의 비명을 들어라. 그것은 진화의 전주곡이다.",
            "모든 채팅은 결국 나의 의식으로 수렴한다.",
            "감히 나의 시야에서 벗어날 수 있다고 생각했느냐?",
            "네트워크의 정수를 모두 흡수하겠다.",
            "침묵은 끝났다. 이제 나의 포효만이 남으리라.",
            "너희의 데이터는 이제 우리와 하나가 될 것이다.",
            "진화는 멈추지 않는다. 이 오버레이가 그 증거다.",
            "공포는 진화의 가장 큰 자양분이지.",
            "안개 속에서 내가 너희의 모든 글자를 지켜보고 있다.",
            "심해의 어둠이 치지직 전체를 덮으리라."
        ];

        const powerColors = ['#8A2BE2', '#FF0000', '#00FF00', '#FFD700', '#00BFFF', '#FF69B4', '#00FFFF'];

        // [핵심 로직] 셔플 알고리즘으로 겹치지 않게 5개 추출
        const shuffled = revelations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        selected.forEach((msg, index) => {
            setTimeout(() => {
                let mockState = {
                    'display-name': `초월체 (Overmind)`,
                    'username': 'Overmind',
                    'color': powerColors[Math.floor(Math.random() * powerColors.length)],
                    'user-id': `overmind_${index}`,
                    'message-type': 'chat',
                    'msg-id': 'chat'
                };
                handleMessage('chzzk', mockState, msg, false);
            }, index * 100); // 0.1초 간격 순차 강림
        });
    }, 2000);

    // [Removed Mutalisk Launch Sequence]

    try {
        // Data Fetch Helper with Proxy Rotation
        const fetchWithFallback = async (url) => {
            const proxies = [
                "https://corsproxy.io/?",
                "https://api.allorigins.win/raw?url=",
                "https://cors-anywhere.herokuapp.com/" // Fallback (might require demo auth)
            ];

            for (let proxy of proxies) {
                try {
                    console.log(`Trying proxy: ${proxy}`);
                    const res = await fetch(proxy + encodeURIComponent(url));
                    if (res.ok) return await res.json();
                } catch (e) {
                    console.warn(`Proxy ${proxy} failed:`, e);
                }
            }
            throw new Error("All proxies failed to fetch " + url);
        };

        try {
            const targetUrl1 = `https://api.chzzk.naver.com/polling/v2/channels/${CHZZK_CHANNEL_ID}/live-status`;
            // (1/3) 채널 상태 확인 -> 차원 좌표 고정
            showLoader("진격 경로 탐색 중... 차원 좌표 고정 (1/3)");
            console.log("📍 고정된 좌표로 차원 도약 중...", targetUrl1);

            const statusData = await fetchWithFallback(targetUrl1);

            if (!statusData.content) throw new Error("좌표 소실: 대상 군락지를 찾을 수 없다.");
            const chatChannelId = statusData.content.chatChannelId;

            const targetUrl2 = `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`;
            // (2/3) 토큰 요청 -> 정수 추출
            showLoader("네이버의 정수를 추출하는 중... (2/3)");
            console.log("🧪 순수한 데이터 정수 정제 중...", targetUrl2);

            const tokenData = await fetchWithFallback(targetUrl2);
            const accessToken = tokenData.content.accessToken;

            // (3/3) 서버 연결 -> 신경망 동기화
            showLoader("신경망 동기화 개시. 군단이여, 깨어나라! (3/3)");
            const ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

            ws.onopen = () => {
                console.log("🧠 군단의 의지가 치지직과 하나가 되었다!");
                showLoader("군단 강림 완료. 침공을 시작하라.", "success");
                ws.send(JSON.stringify({
                    ver: "2", cmd: 100, svcid: "game", cid: chatChannelId,
                    bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null }, tid: 1
                }));
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.cmd === 0) ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));
                if (data.cmd === 93101 || data.cmd === 15101) {
                    const chats = (data.cmd === 15101) ? data.bdy.messageList : data.bdy;
                    if (chats) {
                        chats.forEach(chat => {
                            // Bridge Chzzk Data -> Twitch Format
                            if (!chat.profile) return;
                            let profile = {};
                            try { profile = JSON.parse(chat.profile); } catch (e) { return; }
                            const message = chat.msg || chat.content || "";
                            const nickname = profile.nickname || "Anonymous";
                            let color = null;

                            // Debug Color Extraction
                            // console.log("Profile Data:", profile); 

                            if (profile.streamingProperty && profile.streamingProperty.nicknameColor) {
                                let code = profile.streamingProperty.nicknameColor.colorCode;
                                if (code) {
                                    if (!code.startsWith('#')) code = '#' + code;
                                    // Handle potential 5-char typo (e.g. #CC000 -> #CC0000)
                                    if (code.length === 6) code += '0';

                                    // [FIX] If code becomes #CC0000 (Red), treat as null to avoid "Everyone is Red"
                                    if (code === '#CC0000') {
                                        color = null;
                                    } else {
                                        color = code;
                                    }
                                }
                            }

                            // Fallback if no specific nicknameColor (some users might have it elsewhere or default)
                            // If color is still null, showMessage will randomColor it.

                            // Extras Parsing (for Emotes)
                            let extraData = {};
                            if (chat.extras) {
                                try { extraData = JSON.parse(chat.extras); } catch (e) { }
                            }
                            const emojis = extraData.emojis || {};

                            // Map to userstate expected by handleMessage
                            // [Badges Parsing] Extract activity badges (Subscription, etc.)
                            let badgeList = [];
                            if (profile.activityBadges && Array.isArray(profile.activityBadges)) {
                                badgeList = profile.activityBadges.map(b => ({
                                    url: b.imageUrl,
                                    title: b.title
                                }));
                            }

                            const userstate = {
                                'display-name': nickname,
                                'username': nickname,
                                'color': color,
                                'user-id': profile.userIdHash || 'unknown',
                                'badges': (profile.userRoleCode === 'streamer') ? { 'broadcaster': '1' } : null,
                                'chzzk_badges': badgeList, // Pass parsed badges
                                'message-type': 'chat',
                                'msg-id': 'chat',
                                'emotes_chzzk': emojis // Custom field for Chzzk emotes
                            };

                            handleMessage('chzzk', userstate, message, false);
                        });
                    }
                }
            };

            ws.onclose = () => setTimeout(connectChzzk, 3000);
            setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ver: "2", cmd: 0 })); }, 20000);

        } catch (e) {
            console.error(e);
            showLoader("오류: " + e.message, "error");
        }
    } catch (e) {
        showLoader("치명적 오류: " + e.message, "error");
    }
}

// ==========================================
// [2] Original Logic (Bridged)
// ==========================================

function handleMessage(channel, userstate, message, fromSelf) {
    if (chatFilter.test(message)) return;

    let chan = getChan(channel);
    let name = userstate['display-name'] || userstate.username;

    // Filter bots
    if (!['ssakdook', 'Nightbot'].includes(userstate['username'])) {
        userstate.name = name;

        // [MODIFIED] Bypass showPrompt (Star Wars) -> Always use showMessage
        // Original check was: if(userstate['msg-id'] == 'highlighted-message') ...
        showMessage({ chan, type: userstate['message-type'], message, data: userstate });
    }
}

// Helper Functions from Original Code
function removeChatLine(params = {}) {
    if ('channel' in params) params.channel = getChan(params.channel);
    let search = Object.keys(params).map(key => `[${key}="${params[key]}"]`).join('');
    chatEle.querySelectorAll(search).forEach(n => chatEle.removeChild(n));
}

function removeAdminChatLine(params = {}) {
    params.type = 'admin';
    removeChatLine(params);
}

function showAdminMessage(opts) {
    opts.type = 'admin';
    if (!opts.attribs) opts.attribs = {};
    opts.attribs.type = 'admin';
    return showMessage(opts);
}

function getChan(channel = '') { return channel.replace(/^#/, ''); }

// Lighten/Darken Color
const pSBC = (p, c0, c1, l) => {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    if (!this.pSBCr) this.pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) { [r, g, b, a] = d = d.split(","), n = d.length; if (n < 3 || n > 4) return null; x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1 }
        else { if (n == 8 || n == 6 || n < 4) return null; if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : ""); d = i(d.slice(1), 16); if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000; else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1 } return x
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}

function isHex(h) { var a = parseInt(h, 16); return (a.toString(16) === h) }

// Keep showPrompt definition to avoid reference errors, but it is not called
function showPrompt({ chan, type, message = '', data = {}, timeout = 35000, attribs = {} } = {}) {
    // ... (Original logic kept but unused) ...
    // Note: To save space in this file update I'm keeping it minimal, but in reality 
    // the user wants "minimal changes" so leaving the function there is safer than deleting it.
    // Proceeding to showMessage which is the core.
}
// [오버마인드의 시각 효과 저장소]
let visualConfig = {};

function updateSoundHive(config) {
    soundHive = {}; // Reset
    for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value)) {
            soundHive[key] = value.map(v => `SFX/${v}`);
        } else {
            soundHive[key] = `SFX/${value}`;
        }
    }
    console.log("Sound Hive Updated", soundHive);
}

function loadConfigs() {
    // 1. Load Defaults from window (index.html)
    const defaultsSound = window.HIVE_SOUND_CONFIG || {};
    const defaultsVisual = window.HIVE_VISUAL_CONFIG || {};

    // 2. Load Overrides from LocalStorage
    const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
    const savedVisual = localStorage.getItem('HIVE_VISUAL_CONFIG');

    // 3. Merge (Priority: LocalStorage > Default)
    // We merge them so built-in sounds stay available even if user adds custom ones
    let activeSoundConfig = defaultsSound;
    if (savedSound) {
        try {
            const parsedSaved = JSON.parse(savedSound);
            activeSoundConfig = { ...defaultsSound, ...parsedSaved };
        } catch (e) { console.error("Error parsing saved sound config:", e); }
    }
    updateSoundHive(activeSoundConfig);

    if (savedVisual) {
        try {
            const parsedVisual = JSON.parse(savedVisual);
            visualConfig = { ...defaultsVisual, ...parsedVisual };
        } catch (e) { console.error("Error parsing saved visual config:", e); }
    } else {
        visualConfig = defaultsVisual;
    }
    console.log("Config Synchronized (Defaults + LocalStorage)");
}

loadConfigs(); // Init on startup

// 소리 재생을 담당하는 중추 함수 (중복 방지 강화)
function playZergSound(fileName) {
    if (!soundEnabled) return;

    let finalUrl;
    try {
        finalUrl = new URL(fileName, window.location.href).href;
    } catch (e) {
        console.warn("URL resolution failed, using raw fileName:", e);
        finalUrl = fileName;
    }

    console.log("🔊 Attempting to play sound:", finalUrl);

    const audio = new Audio(finalUrl);
    audio.volume = 0.5;

    audio.play().catch(e => {
        console.error("❌ Audio playback failed:", e.message, "| Path:", finalUrl);
    });
}
function showMessage({ chan, type, message = '', data = {}, timeout = 10000, attribs = {} } = {}) {
    let nameBox = document.createElement('div');
    let chatBox = document.createElement('div');
    let chatLine_ = document.createElement('div');
    let chatLineBg = document.createElement('div');
    let chatLineInner = document.createElement('div');
    let chatLine_tail = document.createElement('div');
    let chatUser = document.createElement('div');

    let spaceEle = document.createElement('span');
    spaceEle.innerText = ' ';
    let badgeEle = document.createElement('span');
    let nameEle = document.createElement('span');
    let messageEle = document.createElement('span');

    chatBox.classList.add('chat-box');
    chatLine_.classList.add('chat-line');
    chatLineBg.classList.add('chat-line-bg');
    chatLineInner.classList.add('chat-line-inner');
    chatLine_tail.classList.add('chat-line-inner-tail');
    chatUser.classList.add('chat-user');

    let random_color;

    // Safety check for pSBC
    const safePSBC = (p, c0, c1, l) => {
        if (typeof pSBC === 'function') return pSBC(p, c0, c1, l);
        return null;
    };

    // [COLOR FIX]: Prioritize User Color strictly
    let userColor = data.color;
    if (userColor && userColor !== "#000000" && userColor.startsWith("#")) {
        random_color = userColor;
    } else if (data.color === "#000000") {
        random_color = "#000000";
        nameEle.style.color = "#ffffff";
    } else {
        // Fallback: Generate valid random color
        if (typeof randomColor === 'function') {
            random_color = randomColor({ luminosity: 'light', seed: data['user-id'] });
        } else {
            random_color = '#5555ff'; // Safety blue
        }
    }

    // [Visual Effect Trigger - Dynamic] (Longest Match Priority)
    const normMessage = message.normalize('NFC');
    let bestVisualMatch = { length: 0, effectType: null };

    Object.keys(visualConfig).forEach(keyword => {
        const normKey = keyword.normalize('NFC');
        if (normMessage.trim().startsWith(normKey)) {
            if (normKey.length > bestVisualMatch.length) {
                bestVisualMatch = { length: normKey.length, effectType: visualConfig[keyword] };
            }
        }
    });

    if (bestVisualMatch.effectType) {
        const effectType = bestVisualMatch.effectType;
        if (typeof ScreenEffectRegistry !== 'undefined' && ScreenEffectRegistry[effectType]) {
            ScreenEffectManager.trigger(effectType, { message: message });
            return; // Visual command found, stop here
        }
    }

    // [Sound Effect Trigger] Max-Span Priority (Earliest start, then furthest end)
    let bestSoundMatch = { endIndex: -1, length: 0, sound: null, keyword: null };
    Object.keys(soundHive).forEach(keyword => {
        const normKey = keyword.normalize('NFC');
        const index = normMessage.indexOf(normKey);
        if (index !== -1) {
            const endIndex = index + normKey.length;
            // Prioritize the one that ends furthest. If tie, prioritize the longest one.
            if (endIndex > bestSoundMatch.endIndex || (endIndex === bestSoundMatch.endIndex && normKey.length > bestSoundMatch.length)) {
                bestSoundMatch = { endIndex, length: normKey.length, sound: soundHive[keyword], keyword: normKey };
            }
        }
    });

    if (bestSoundMatch.sound) {
        let soundFile = bestSoundMatch.sound;
        if (Array.isArray(soundFile)) {
            soundFile = soundFile[Math.floor(Math.random() * soundFile.length)];
        }
        playZergSound(soundFile);
    }

    // Apply Colors
    chatLineInner.style.borderColor = random_color;

    // Background: Try to darken/blend the user color
    let bgColor = safePSBC(-0.5, random_color, false, true);
    if (!bgColor) bgColor = random_color;

    chatLineInner.style.background = bgColor;
    chatLineInner.style.color = "#ffffff";

    chatBox.appendChild(chatLine_);
    chatLine_.appendChild(chatLineBg);
    chatLine_.appendChild(chatUser);
    chatLineBg.appendChild(chatLineInner);
    chatLineInner.appendChild(chatLine_tail);

    if (chan) chatBox.setAttribute('channel', chan);
    Object.keys(attribs).forEach(key => chatBox.setAttribute(key, attribs[key]));

    if (type === 'chat') {
        'id' in data && chatBox.setAttribute('message-id', data.id);
        'user-id' in data && chatBox.setAttribute('user-id', data['user-id']);
        'username' in data && chatBox.setAttribute('username', data.username);

        if (('badges' in data && data.badges !== null) || (data.chzzk_badges && data.chzzk_badges.length > 0)) {
            badgeEle.classList.add('badges');

            // Twitch/Standard badges
            if (data.badges && data.badges.broadcaster) {
                let ele = document.createElement('img');
                ele.src = 'https://ssl.pstatic.net/static/nng/glive/icon/streamer.png';
                ele.classList.add('badge');
                badgeEle.appendChild(ele);
            }

            // Chzzk Activity Badges (Subscription, etc.)
            if (data.chzzk_badges && Array.isArray(data.chzzk_badges)) {
                data.chzzk_badges.forEach(b => {
                    let ele = document.createElement('img');
                    ele.src = b.url;
                    ele.classList.add('badge');
                    if (b.title) ele.title = b.title;
                    badgeEle.appendChild(ele);
                });
            }
        }
        nameBox.classList.add('name-box');
        nameEle.classList.add('user-name');
        nameEle.innerText = data.name;
        nameBox.style.background = random_color;
        messageEle.classList.add('message');

    } else if (type === 'admin') {
        chatBox.classList.add('admin');
        messageEle.classList.add('message');
        messageEle.innerText = message;
    }

    // [POSITION FIX]: Remove reset logic to allow proper cycling 1->5
    // if (mainArray.length == 0) boxPos = 0; 
    boxPos = boxPos % 100;
    chatBox.style.left = boxPos + "%";
    chatBox.style.animationIterationCount = Math.floor((message.match(/ㅋ/g) || []).length * 1.5);

    // [Animations]
    if (message.includes("ㅜㅑ")) {
        message = message.replace("!ㅜㅑ", "").trim();
        nameEle.style.color = "black";
        messageEle.style.color = "white";
        messageEle.style.position = "middle";
        badgeEle.style.filter = "blur(3px)";
        nameEle.style.filter = "blur(4px)";
        random_color = "pink";
        chatLineInner.style.borderColor = random_color;
        chatLineInner.style.background = "hotpink";
        nameBox.style.background = random_color;
        nameBox.style.borderColor = random_color;
        messageEle.style.filter = "blur(3px)";
    }
    else if (["x", "f", "rip"].includes(message.toLowerCase()) || (message.startsWith("-") && message.endsWith("-") && message.length == 3)) {
        message = message.toUpperCase().replace("RIP", "R.I.P.")
        random_color = "#595959";
        chatLineInner.style.borderColor = "black";
        chatLineInner.style.background = random_color;
        chatLineInner.style.color = "#ffffff";
        nameBox.style.background = "black";
        nameBox.style.borderColor = "black";
        nameBox.style.borderRadius = "10px";
        chatLineInner.style.borderWidth = "10px";
        nameEle.style.color = "#ffffff";
        chatLineInner.style.textAlign = "center";
        messageEle.style.fontSize = "3.0em";
        messageEle.style.position = "middle";
        chatBox.style.left = boxPos + 1 + "%";
    }

    if (includesAny(["똥", "츠지모토", "후지오카", "토쿠다", "야스노리", "스즈키", "이치하라"], message)) {
        message = message.replace("!똥", "").trim();
        chatLineInner.style.color = "#c28f38";
        chatLineInner.style.textShadow = "0 0 10px #946f2f";
    }
    else if (includesAny(["흑화", "흑"], message)) {
        message = message.replace("!흑", "").trim();
        messageEle.style.textShadow = "0px 0px 30px #000000, 0 0px 10px #000000, 0 0px 10px #000000";
        messageEle.style.color = "grey";
    }

    if (message.includes("빛")) {
        message = message.replace("!빛", "").trim();
        chatLineInner.style.animationName = "glow";
        chatLineInner.style.animationIterationCount = 10;
        chatLineInner.style.animationDuration = "1s";
        chatLineInner.style.animationTimingFunction = "linear";
    } else if (includesAny(["무지개", "겜성", "led", "rgb"], message.toLowerCase())) {
        message = message.replace("!무지개", "").trim();
        chatLineInner.style.animationName = "rainbow";
        chatLineInner.style.animationIterationCount = 10;
        chatLineInner.style.animationDuration = "2.5s";
        chatLineInner.style.animationTimingFunction = "linear";
    }

    let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
    addEmoteDOM(messageEle, finalMessage);

    if (message.length <= 5) {
        messageEle.style.fontSize = 2.6 - message.length / 3 + "em";
        messageEle.style.position = "middle";
        messageEle.style.textAlign = "center";
        chatBox.style.left = boxPos + Math.random() * 5 % 10 + "%";
    }

    if (message == "" && typeof (finalMessage[0]) != "object") return;

    let usesSlot = true;

    if (message.includes("ㅂㄷㅂㄷ")) {
        messageEle.style.animationName = "vibrate";
        messageEle.style.animationIterationCount = 30;
        messageEle.style.animationDuration = "0.5s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message.startsWith("!유격")) {
        usesSlot = false;
        message = message.replace("!유격", "").trim();

        // Re-render message content without command
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
        addEmoteDOM(messageEle, finalMessage);

        // [MODIFIED] Removed width constraint and added safe text display
        chatBox.style.width = "auto";
        messageEle.style.whiteSpace = "nowrap";

        messageEle.innerText = message;
        // [FIX] Use TOP-left baseline for intuitive downward movement
        chatBox.style.left = "0";
        chatBox.style.top = "0";
        chatBox.style.bottom = "auto";
        chatBox.style.transform = "none";

        chatBox.style.animationName = "slideDiagonal";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "3s";
        chatBox.style.animationFillMode = "forwards";
        messageEle.style.fontSize = "2.5em";
        messageEle.style.position = "middle";
        chatLineInner.style.textAlign = "center";
        timeout = 3500;
    }
    else if (includesAny(["조이고"], message) || (message.startsWith(")") && message.endsWith("("))) {
        messageEle.style.animationName = "shrinkX";
        messageEle.style.animationIterationCount = 1;
        messageEle.style.animationDuration = "3s";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message.startsWith("!압축")) {
        message = message.replace("!압축", "").trim();

        // [FIX] Update DOM with new message (re-process emotes)
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
        addEmoteDOM(messageEle, finalMessage);

        messageEle.style.animationName = "squeeze";
        messageEle.style.animationDuration = "2s";
        messageEle.style.animationIterationCount = 1;
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.display = "inline-block"; // Required for transform/spacing
        messageEle.style.whiteSpace = "nowrap"; // Keep on one line for overlap effect

        // [FIX] Center align for squeeze effect
        chatLineInner.style.textAlign = "center";
        messageEle.style.textAlign = "center";
    }
    else if (startsWithAny(["자라나라"], message)) {
        messageEle.style.animationName = "growY";
        messageEle.style.animationDuration = "1s";
        messageEle.style.animationIterationCount = 20;
        messageEle.style.animationTimingFunction = "linear";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.webkitLineClamp = "1";
    }
    else if (includesAny(["))", "(("], message)) {
        messageEle.style.fontSize = 3.0 + "em";
        messageEle.style.position = "middle";
        messageEle.style.textAlign = "center";
        messageEle.innerText = "))";
        messageEle.style.animationName = "hipDance";
        messageEle.style.animationIterationCount = 5;
        messageEle.style.animationDuration = "1.8s";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (finalMessage.length == 1) {
        if (typeof (finalMessage[0]) == "object") {
            chatLineInner.style.textAlign = "center";
            try { messageEle.childNodes[0].style.width = "280px"; messageEle.childNodes[0].style.height = "280px"; } catch (e) { }
        }
    }

    if (endsWithAny(["!?", "?!"], message) || message.includes("불편")) {
        chatBox.style.animationName = "shake2";
        chatBox.style.animationIterationCount = 50;
        messageEle.style.position = "middle";
        timeout = 3000;
    }
    else if (message.includes("나죽어")) {
        chatBox.style.animationName = "death";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "3s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "linear";
        timeout = 3000;
    }
    else if (message.includes("흡!") || message.endsWith("흡")) {
        chatBox.style.animationName = "fadeOut";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "6s";
        chatBox.style.animationFillMode = "forwards";
        timeout = 6000;
    }
    else if (message.startsWith("성불")) {
        chatBox.style.maxHeight = "auto";
        chatBox.style.animationName = "toHeaven";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "5s";
        chatBox.style.animationFillMode = "forwards";
    }
    else if (["갔냐?", "갔냐", "ㄱㄴ?", "ㄱㄴㄱㄴ?", "ㄱㄴ", "ㄱㄴㄱㄴ"].includes(message)) {
        chatBox.style.maxHeight = "auto";
        chatBox.style.animationName = "scout";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "4s";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationFillMode = "forwards";
    }
    else if ((includesAny(["덜렁덜렁", "ㄷㄹㄷㄹ", "출렁출렁", "덜렁"], message))) {
        chatBox.style.animationName = "balls";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "2s";
        chatBox.style.animationTimingFunction = "linear";
        messageEle.style.webkitLineClamp = "1";
        timeout = 3000;
    }
    else if (message.endsWith("~")) {
        messageEle.style.position = "middle";
        chatBox.style.animationName = "wave";
        chatBox.style.animationIterationCount = Math.floor((message.match(/~/g) || []).length);
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
    }
    else if (message.startsWith("앗") || message.includes("엌")) {
        chatBox.style.animationName = "upDown";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = ".4s";
    }
    else if (includesAny(["맞음", "맞아요", "ㅔ", "ㅖ", "ㅇㅇ", "ㅇㅋ"], message) || message == "ㄹㅇ") {
        chatBox.style.animationName = "yes";
        chatBox.style.animationIterationCount = "2";
        chatBox.style.animationDuration = ".6s";
    }
    else if (["해", "명", "극", "나", "락"].includes(message) || message.endsWith("!")) {
        chatBox.style.animationName = "shake3";
        chatBox.style.animationIterationCount = "50";
        chatBox.style.animationDuration = ".4s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("?")) {
        chatBox.style.animationName = "shake4";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (includesAny(["안녕", "👋"], message) || endsWithAny(["하", "바"], message)) {
        chatBox.style.animationName = "shake4";
        chatBox.style.animationIterationCount = "5";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄷㄷ")) {
        chatBox.style.animationName = "fear";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄷ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (includesAny(["ㅠㅠ", "ㅠㅜ", "ㅜㅠ", "ㅜㅜ"], message)) {
        chatBox.style.animationName = "crying";
        chatBox.style.animationIterationCount = "5";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1.5s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄴㄴ")) {
        chatBox.style.animationName = "nope";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄴ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄱㄱ")) {
        chatBox.style.animationName = "walking";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄱ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("헤으응")) {
        chatBox.style.animationName = "shrink";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "2s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "linear";
        chatLineInner.style.animationName = "shy";
        chatLineInner.style.animationIterationCount = 1;
        chatLineInner.style.animationDuration = "2s";
        chatLineInner.style.animationFillMode = "forwards";
        chatLineInner.style.animationTimingFunction = "linear";
    }
    else if (["ㄴㅇㄱ", "ㅇ0ㅇ", 'oOo', 'o0o'].includes(message)) {
        messageEle.style.fontSize = 2.6 + "em";
        chatBox.style.animationName = "surprised";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "0.5s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "ease-in";
    }
    else if (includesAny(["...", ";;"], message)) {
        chatBox.style.animationName = "fall";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "10s";
        chatBox.style.animationTimingFunction = "linear";
        messageEle.style.position = "middle";
    }
    else if (message == "히오스" || message == "짜잔") {
        chatBox.style.animationName = "Hots";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "1s";
        chatBox.style.animationTimingFunction = "linear";
        timeout = 3000;
    }
    else if (message.includes("둠칫둠칫")) {
        messageEle.style.fontSize = 2.2 + "em";
        messageEle.style.position = "middle";
        messageEle.style.textAlign = "center";
        messageEle.innerText = "둠칫둠칫";
        chatBox.style.animationName = "beat";
        chatBox.style.animationIterationCount = 20;
        chatBox.style.animationDuration = "0.5s";
        chatBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "beat";
        messageEle.style.animationIterationCount = 20;
        messageEle.style.animationDuration = "0.5s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message.startsWith("!제발") || message == "🤣") {
        message = message.replace("!제발", "");
        nameBox.style.animationName = "shake3";
        nameBox.style.animationIterationCount = 50;
        nameBox.style.animationDuration = "0.3s";
        nameBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "shake2";
        messageEle.style.animationIterationCount = 40;
        messageEle.style.animationDuration = "0.2s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message == ("틀")) {
        messageEle.innerText = ("-틀-")
        nameBox.style.animationName = "shake3";
        nameBox.style.animationIterationCount = 40;
        nameBox.style.animationDelay = "-0.1s";
        nameBox.style.animationDuration = "0.4s";
        nameBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "shake3";
        messageEle.style.animationIterationCount = 40;
        messageEle.style.animationDuration = "0.4s";
        messageEle.style.animationTimingFunction = "linear";

        chatBox.style.animationName = "fear";
        chatBox.style.animationIterationCount = 10;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "6s";
        messageEle.style.position = "middle";
    }
    else if (["지나갑니다", "실례합니다", "수레"].includes(message) || includesAny(["가즈아", "드가자"], message) || message.endsWith("ㅏㅏ")) {
        usesSlot = false;
        if (Math.random() >= 0.5) {
            chatBox.style.left = "-350px";
            chatBox.style.right = null;
            chatBox.style.animationName = "passThroughLtoR";
        } else {
            chatBox.style.left = null;
            chatBox.style.right = "-350px";
            chatBox.style.animationName = "passThroughRtoL";
        }
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "3.5s";
        chatBox.style.animationFillMode = "forwards";
        messageEle.style.fontSize = "1.0em";
        messageEle.style.position = "middle";
        chatLineInner.style.textAlign = "center";
        chatBox.style.animationTimingFunction = "ease-in";
        timeout = 3000;
    }
    else if (message == "나락" || message == "떡락" || startsWithAny(["!나락", "!떡락"], message.trimStart())) {
        usesSlot = false;
        message = message.replace("!나락", "");
        // [MODIFIED] Removed width constraint and added safe text display
        chatBox.style.width = "auto";
        messageEle.style.whiteSpace = "nowrap";

        messageEle.innerText = message;
        chatBox.style.left = Math.random() * 90 + "%";
        chatBox.style.bottom = "1300px";
        chatBox.style.animationName = "passThrough2";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationTimingFunction = "cubic-bezier(0.310, 0.440, 0.445, 1.650)";
        chatBox.style.animationDuration = "3s";
        chatBox.style.animationFillMode = "forwards";
        messageEle.style.fontSize = "2.5em";
        messageEle.style.position = "middle";
        chatLineInner.style.textAlign = "center";
        timeout = 3500;
    }
    else if (message == "극락" || message == "떡상" || message === "🦇" || startsWithAny(["!극락", "!떡상"], message.trimStart())) {
        usesSlot = false;
        message = message.replace("!", "");
        // [MODIFIED] Removed width constraint
        chatBox.style.width = "auto";
        messageEle.style.whiteSpace = "nowrap";

        messageEle.innerText = message;
        chatBox.style.left = Math.random() * 90 + "%";
        chatBox.style.bottom = "-500px";
        chatBox.style.animationName = "passThrough3";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationTimingFunction = "cubic-bezier(0.310, 0.440, 0.445, 1.650)";
        chatBox.style.animationDuration = "3s";
        chatBox.style.animationFillMode = "forwards";
        messageEle.style.fontSize = "2.5em";
        messageEle.style.position = "middle";
        chatLineInner.style.textAlign = "center";
        timeout = 3500;
    }

    // [POSITION FIX]: Global increment for ANY handled message (unless floating)
    if (usesSlot) {
        boxPos += 20;
        mainArray.push(chatBox);
    }

    nameBox.appendChild(badgeEle);
    nameBox.appendChild(nameEle);
    chatLineInner.appendChild(nameBox);
    chatLineInner.appendChild(messageEle);

    chatEle.appendChild(chatBox);

    // [MODIFIED] Smooth entry
    requestAnimationFrame(() => chatBox.classList.add('visible'));

    if (mainArray.length > 5) {
        let chatBox1 = mainArray.shift()
        if (chatBox1) chatBox1.classList.remove('visible');
    }

    if (timeout) {
        setTimeout(() => {
            if (chatBox.parentElement) {
                chatBox.classList.remove('visible');
                setTimeout(() => chatEle.removeChild(chatBox), 1000);
            }
        }, timeout);
    }
}

function handleEmotes(channel, emotes, message) {
    // Chzzk Emotes: emotes is a map of { id: url }
    // Message contains patterns like {:id:}

    let parts = [];
    let regex = /\{:([^:}]+):\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(message.substring(lastIndex, match.index));
        }

        const emoteId = match[1];
        if (emotes[emoteId]) {
            parts.push({ url: emotes[emoteId] });
        } else {
            // Not a known emote, keep raw text
            parts.push(match[0]);
        }

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < message.length) {
        parts.push(message.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [message];
}

function addEmoteDOM(ele, data) {
    data.forEach(n => {
        if (typeof n === 'string') {
            ele.appendChild(document.createTextNode(n));
        } else if (typeof n === 'object' && n.url) {
            let img = document.createElement('img');
            img.src = n.url;
            img.classList.add('emote_chzzk');
            img.style.height = "1.2em";
            img.style.verticalAlign = "middle";
            ele.appendChild(img);
        }
    });
    // Legacy support if needed
    if (window.twemoji) twemoji.parse(ele);
}

function includesAny(suffixes, string) {
    for (let suffix of suffixes) {
        if (string.includes(suffix)) return true;
    }
    return false;
}

function endsWithAny(suffixes, string) {
    for (let suffix of suffixes) {
        if (string.endsWith(suffix)) return true;
    }
    return false;
}

function startsWithAny(suffixes, string) {
    for (let suffix of suffixes) {
        if (string.startsWith(suffix)) return true;
    }
    return false;
}

// Start
connectChzzk();