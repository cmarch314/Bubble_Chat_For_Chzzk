const idElement = document.getElementById('id');
// [URL Parameters] Control features via index.html?debug or index.html?history
const urlParams = new URLSearchParams(window.location.search);
const DEBUG_MODE = urlParams.has('debug');
const LOAD_HISTORY = urlParams.has('history');

// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
let storedId = localStorage.getItem('CHZZK_CHANNEL_ID');
const attrId = idElement ? (idElement.getAttribute('twitchId') || idElement.getAttribute('chzzkHash')) : null;

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
    // Force recreate if old structure exists (wrapper check)
    if (overlay && !overlay.querySelector('.skull-wrapper')) {
        overlay.remove();
        overlay = null;
    }

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'skull-overlay';
        overlay.innerHTML = '<div class="skull-wrapper"><div class="skull-emoji" data-text="☠️">☠️</div></div><div class="film-grain"></div>';
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

function createUshoOverlay() {
    const id = 'usho-overlay';
    if (document.getElementById(id)) return;

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.innerHTML = `
        <div class="usho-wrapper">
            <div class="usho-emoji" data-text="😱" style="display:none;">😱</div>
            <div class="usho-hammer">🔨</div>
        </div>
    `;
    document.body.appendChild(overlay);
}
createUshoOverlay();

// [Screen Effect Registry] - 정의서만 추가하면 매니저가 자동으로 처리함
const ScreenEffectRegistry = {
    usho: {
        soundKey: "우쇼",
        execute: (context = {}) => {
            const overlay = document.getElementById('usho-overlay');
            if (!overlay) return Promise.resolve();

            let displayMsg = (context.message || "").trim();
            const triggerKw = "우쇼";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            // Split into Part 1 (everything but last word) and Part 2 (last word)
            const words = displayMsg.split(/\s+/).filter(w => w.length > 0);
            let part1 = "", part2 = "";

            if (words.length > 1) {
                part2 = words.pop();
                part1 = words.join(' ');
            } else if (words.length === 1) {
                part2 = words[0];
                part1 = "";
            }

            const showText = (text, delay, duration) => {
                if (!text) return;
                setTimeout(() => {
                    const el = document.createElement('div');
                    el.className = 'visual-center-text usho-style';

                    // Word Wrap Logic (Max 20 chars per line)
                    const w = text.split(' ');
                    let lines = [];
                    let currentLine = w[0] || "";
                    for (let i = 1; i < w.length; i++) {
                        if ((currentLine + " " + w[i]).length <= 20) currentLine += " " + w[i];
                        else { lines.push(currentLine); currentLine = w[i]; }
                    }
                    if (currentLine) lines.push(currentLine);
                    el.innerHTML = lines.join('<br>');

                    document.body.appendChild(el);
                    el.style.animation = "hvn-skull-fadeIn 0.2s forwards";
                    setTimeout(() => {
                        el.style.animation = "hvn-skull-fadeOut 0.2s forwards";
                        setTimeout(() => el.remove(), 200);
                    }, duration - 200);
                }, delay);
            };

            // Timing Phase
            showText(part1, 0, 3700);    // 0s ~ 3.8s
            showText(part2, 3600, 700);  // 3.5s ~ 4.1s (0.1s overlap with 😱, 0.3s overlap with part1)

            return new Promise(resolve => {
                // Usho Animation Start at 4s
                setTimeout(() => {
                    overlay.classList.add('visible');

                    // [HAMMER LOGIC] - 1.2s start, 3.14s interval
                    const hammer = overlay.querySelector('.usho-hammer');
                    if (hammer) {
                        // Reset
                        hammer.style.opacity = '0';
                        hammer.style.animation = 'none';

                        setTimeout(() => {
                            hammer.style.opacity = '1';
                            // 3.14s cycle
                            hammer.style.animation = "hvn-skull-hammerStrike 3.14s infinite";
                        }, 1200);
                    }

                    // [Glitch Logic - DISABLED] Reference Only
                    // const emojiEl = overlay.querySelector('.usho-emoji');
                    // let isActive = true;

                    // const triggerGlitch = () => {
                    //     if (!isActive) return;
                    //     // Force Reflow
                    //     void emojiEl.offsetWidth;
                    //     // Add glitch class
                    //     if (emojiEl) emojiEl.classList.add('glitching');
                    //     // Remove after 0.2s (duration of animation)
                    //     setTimeout(() => {
                    //         if (emojiEl) emojiEl.classList.remove('glitching');
                    //         // Schedule next glitch (0.26s to 1.04s random - 30% slower)
                    //         if (isActive) {
                    //             const nextDelay = 260 + Math.random() * 780;
                    //             setTimeout(triggerGlitch, nextDelay);
                    //         }
                    //     }, 200);
                    // };
                    // // Initial Trigger
                    // triggerGlitch();

                    // Cleanup after 8s
                    setTimeout(() => {
                        // isActive = false;
                        overlay.classList.remove('visible');
                        if (hammer) {
                            hammer.style.opacity = '0';
                            hammer.style.animation = 'none';
                        }
                        resolve();
                    }, 8000);
                }, 4000);
            });
        }
    },
    skull: {
        soundKey: "해골",
        execute: (context = {}) => {
            const overlay = document.getElementById('skull-overlay');
            if (!overlay) return Promise.resolve();

            let displayMsg = (context.message || "").trim();
            const triggerKw = "해골";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            // Split into Part 1 (everything but last word) and Part 2 (last word)
            const words = displayMsg.split(/\s+/).filter(w => w.length > 0);
            let part1 = "", part2 = "";

            if (words.length > 1) {
                part2 = words.pop();
                part1 = words.join(' ');
            } else if (words.length === 1) {
                part2 = words[0];
                part1 = "";
            }

            const showText = (text, delay, duration) => {
                if (!text) return;
                setTimeout(() => {
                    const el = document.createElement('div');
                    el.className = 'visual-center-text skull-style';

                    // Word Wrap Logic (Max 20 chars per line)
                    // We wrap the raw text first, then render emoticons to avoid breaking HTML tags
                    const words = text.split(' ');
                    let lines = [];
                    let currentLine = words[0] || "";
                    for (let i = 1; i < words.length; i++) {
                        if ((currentLine + " " + words[i]).length <= 20) currentLine += " " + words[i];
                        else { lines.push(currentLine); currentLine = words[i]; }
                    }
                    if (currentLine) lines.push(currentLine);

                    const wrappedText = lines.join('<br>');
                    el.innerHTML = renderMessageWithEmotesHTML(wrappedText, context.emotes || {});

                    document.body.appendChild(el);
                    el.style.animation = "hvn-skull-fadeIn 0.2s forwards";
                    setTimeout(() => {
                        el.style.animation = "hvn-skull-fadeOut 0.2s forwards";
                        setTimeout(() => el.remove(), 200);
                    }, duration - 200);
                }, delay);
            };

            // Timing Phase
            showText(part1, 0, 3700);    // 0s ~ 3.8s
            showText(part2, 3600, 700);  // 3.5s ~ 4.1s (0.1s overlap with skull, 0.3s overlap with part1)

            return new Promise(resolve => {
                // Skull Animation Start at 4s
                setTimeout(() => {
                    overlay.classList.add('visible');

                    // [Glitch Logic] Random Trigger Loop
                    const emojiEl = overlay.querySelector('.skull-emoji');
                    let isActive = true;

                    const triggerGlitch = () => {
                        if (!isActive) return;

                        // Force Reflow
                        void emojiEl.offsetWidth;

                        // Add glitch class
                        if (emojiEl) emojiEl.classList.add('glitching');

                        // Remove after 0.2s (duration of animation)
                        setTimeout(() => {
                            if (emojiEl) emojiEl.classList.remove('glitching');

                            // Schedule next glitch (0.26s to 1.04s random - 30% slower)
                            if (isActive) {
                                const nextDelay = 260 + Math.random() * 780;
                                setTimeout(triggerGlitch, nextDelay);
                            }
                        }, 200);
                    };

                    // Initial Trigger
                    triggerGlitch();

                    // Cleanup after 8s
                    setTimeout(() => {
                        isActive = false;
                        overlay.classList.remove('visible');
                        resolve();
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

            // Word Wrap (Max 20 chars per line)
            // Wrap raw text first to avoid breaking HTML tags in rendering
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

            const wrappedMsg = lines.join('<br>');
            centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(wrappedMsg, context.emotes || {});
            centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards"; // Start Fade In

            document.body.appendChild(centerMsgSnippet);

            return new Promise(resolve => {
                flashback.classList.add('visible');

                // Timeline: 
                // 0s: Text Fade In Start
                // Emoji Start: 11800ms
                // Text Fade Out Start: 11800ms - 1000ms (Gap) - 1000ms (Fade Duration) = 10300ms

                setTimeout(() => {
                    centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; // Start Fade Out
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
                    // [FIX] Render emoticons in message
                    const renderedText = renderMessageWithEmotesHTML(text, context.emotes || {});
                    el.innerHTML = renderedText;
                    overlay.appendChild(el);
                    el.style.animation = "hvn-heart-fadeIn 0.5s forwards";
                    setTimeout(() => {
                        el.style.animation = "hvn-heart-fadeOut 0.5s forwards";
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

    /* [TEMPLATE - DISABLED]
    reese: {
        soundKey: "리즈",
        execute: (context = {}) => {
             // ... Code preserved as template ...
             return Promise.resolve();
        } 
    }, 
    */
    reese_TEMPLATE: { // Renamed to prevent execution
        soundKey: "리즈",
        execute: (context = {}) => {
            // [SETUP] Create Overlay Structure (Same as Heart)
            const id = 'reese-dreamy-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.innerHTML = `
                <div id="heart-dreamy-overlay">
                    <div id="heart-dreamy-backdrop"></div>
                    <div class="heart-emoji-container"></div>
                    <div class="heart-flash"></div>
                </div>
            `;
            // Reuse Heart CSS classes for visual consistency
            document.body.appendChild(ov);

            const overlay = ov.querySelector('#heart-dreamy-overlay');
            const backdrop = ov.querySelector('#heart-dreamy-backdrop');
            const flash = ov.querySelector('.heart-flash');
            const emojiContainer = ov.querySelector('.heart-emoji-container');

            // [TIMING CONFIGURATION] - Adjust these values to sync with music!
            // ----------------------------------------------------------------
            const TEXT_1_START = 0;       // First text appears at 0ms
            const TEXT_2_START = 4000;    // Second text appears at 4000ms
            const TEXT_3_START = 7500;    // Third text appears at 7500ms
            const TEXT_4_START = 10300;   // Fourth text appears at 10300ms

            const TEXT_DURATION_1 = 4000; // Duration of first text
            const TEXT_DURATION_2 = 3500; // Duration of second text
            const TEXT_DURATION_3 = 2800; // Duration of third text
            const TEXT_DURATION_4 = 1000; // Duration of fourth text (Finish)

            const EMOJI_EXPLOSION_START = 11000; // When the emoji explosion begins
            const EMOJI_EXPLOSION_END = 18000;   // When the emoji explosion ends
            const OVERLAY_FADE_OUT = 18000;      // When the whole effect starts fading out
            // ----------------------------------------------------------------

            // [Message Parsing]
            let rawMsg = (context.message || "").trim();
            if (rawMsg.startsWith("리즈")) rawMsg = rawMsg.substring(2).trim();

            const allWords = rawMsg.split(' ').filter(w => w.length > 0);
            let parts = ["", "", "", ""];

            // Distribute words into 4 parts
            if (allWords.length === 0) { }
            else if (allWords.length === 1) { parts[3] = allWords[0]; }
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
                    el.style.animation = "hvn-heart-fadeIn 0.5s forwards";
                    setTimeout(() => {
                        el.style.animation = "hvn-heart-fadeOut 0.5s forwards";
                        setTimeout(() => el.remove(), 500);
                    }, duration - 500);
                }, delay);
            };

            // Trigger Text Sequence based on Timing Config
            showText(parts[0], TEXT_1_START, TEXT_DURATION_1);
            showText(parts[1], TEXT_2_START, TEXT_DURATION_2);
            showText(parts[2], TEXT_3_START, TEXT_DURATION_3);
            showText(parts[3], TEXT_4_START, TEXT_DURATION_4);

            // [Overlay Fade In] slightly after start
            setTimeout(() => {
                overlay.classList.add('visible');
                backdrop.classList.add('visible');
            }, 100);

            // [Emoji Explosion Logic]
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
                [0x1F600, 0x1F64F], // Smileys & People
                [0x1F9D1, 0x1F9D1], // Specific People
                [0x2764, 0x2764],   // Heart
                [0x1F493, 0x1F49F], // Heart category
                [0x1F466, 0x1F469], // Boy, Girl, Man, Woman
                [0x1F48B, 0x1F48B]  // Kiss Mark
            ];
            const delays = [1000, 300, 700];
            let delayIdx = 0;
            let currentTime = EMOJI_EXPLOSION_START;
            let emojiCounter = 0;
            let lastWrapper = null;

            while (currentTime < EMOJI_EXPLOSION_END) {
                const time = currentTime;
                const currentCount = ++emojiCounter;

                setTimeout(() => {
                    const prev = lastWrapper;

                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    const x = Math.random() * 30 + 35;
                    const y = Math.random() * 30 + 35;
                    wrapper.style.left = `${x}%`;
                    wrapper.style.top = `${y}%`;
                    wrapper.style.transform = `translate(-50%, -50%) rotate(-${Math.random() * 60 - 30}deg)`;
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
                    lastWrapper = wrapper;

                    if (window.twemoji) twemoji.parse(wrapper);

                    // Overlap removal
                    if (prev) {
                        setTimeout(() => { if (prev.parentNode) prev.remove(); }, 100);
                    }

                    // Flash Logic
                    if ((currentCount - 1) % 3 === 0) {
                        flash.style.transition = 'none';
                        flash.style.opacity = '0.3';
                        setTimeout(() => {
                            flash.style.transition = 'opacity 0.5s';
                            flash.style.opacity = '0';
                        }, 100);
                    }

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
                }, OVERLAY_FADE_OUT);
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
                s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:hvn-vergil-slashEnter 0.2s forwards ${i * 0.02}s;`;
                slashC.appendChild(s); slashes.push(s);
            }
            return new Promise(resolve => {
                // [Total Duration Compliance] 19 seconds
                // Ensure queue lock is held for the full audio duration
                setTimeout(() => {
                    if (ov.parentNode) ov.remove();
                    resolve();
                }, 19000);

                setTimeout(() => { slashes.forEach(s => s.style.animation = `hvn-vergil-slashTremble ${0.05 + Math.random() * 0.1}s infinite`); }, 5200);
                setTimeout(() => {
                    slashes.forEach(s => { s.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                    for (let i = 0; i < 12; i++) {
                        const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
                        const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
                        for (let j = 0; j < 20; j++) {
                            const shard = document.createElement('div'); shard.className = 'void-shard';
                            const ang = Math.random() * 360, d = 200 + Math.random() * 400;
                            shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                            const dur = 1.5 + Math.random() * 2; shard.style.animation = `hvn-vergil-shardFly ${dur}s ease-out forwards`;
                            ov.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
                        }
                    }
                    backdrop.style.opacity = 0;
                    setTimeout(() => {
                        let msg = (context.message || "").trim(); if (msg.startsWith("버질")) msg = msg.substring(2).trim();
                        if (msg) {
                            const txt = document.createElement('div');
                            txt.className = 'vergil-text';
                            // [FIX] Render emoticons in message
                            const renderedMsg = renderMessageWithEmotesHTML(msg, context.emotes || {});
                            txt.innerHTML = renderedMsg;
                            document.body.appendChild(txt);
                            // Text Fade Out starts at 17s (6200 + 3800 + 7000 = 17000)
                            // Finishes at 18s. 
                            setTimeout(() => { txt.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => { txt.remove(); }, 1000); }, 7000);
                        }
                    }, 3800);
                }, 6200);
            });
        }
    },

    dolphin: {
        soundKey: "돌핀",
        execute: (context = {}) => {
            const isRare = Math.random() < 0.5;
            const eventClass = isRare ? 'event-rare' : 'event-normal';

            const id = 'dolphin-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            // [Background Removed] Simple transparent overlay but with Bottom Sea
            ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483640; pointer-events:none; transition:opacity 0.5s;";
            ov.innerHTML = `<div id="dolphin-overlay" class="visible ${eventClass}">
                <div class="dolphin-light dolphin-light-left"></div>
                <div class="dolphin-light dolphin-light-right"></div>
                <div class="dolphin-sea-bottom"><div class="sea-wave"></div></div>
            </div>`;
            document.body.appendChild(ov);

            // [INJECT ANIMATION] Rainbow Filter for Rare Event
            if (!document.getElementById('rainbow-filter-style')) {
                const style = document.createElement('style');
                style.id = 'rainbow-filter-style';
                style.innerHTML = `
                    @keyframes rainbow-filter {
                        0% { filter: hue-rotate(0deg) brightness(1.5) saturate(200%); }
                        100% { filter: hue-rotate(360deg) brightness(1.5) saturate(200%); }
                    }
                `;
                document.head.appendChild(style);
            }

            const overlayContainer = ov.querySelector('#dolphin-overlay');
            const spawnActor = (type, emoji, opts = {}) => {
                const el = document.createElement('div');
                el.className = type;

                // [FIX] Always use a wrapper for the emoji part for consistent targeting
                const emojiDiv = document.createElement('div');
                emojiDiv.className = 'actor-emoji';
                emojiDiv.innerText = emoji;
                emojiDiv.style.lineHeight = '1';

                // [Feature] Nametag for Surfer (or others if needed)
                if (opts.nametag) {
                    // Force flex layout to stack Name + Emoji
                    el.style.display = 'flex';
                    el.style.flexDirection = 'column';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'flex-end';

                    // Nametag Element (Mimic .name-box)
                    const nameTag = document.createElement('div');
                    nameTag.className = 'name-box';
                    nameTag.innerHTML = `<span class="user-name">${opts.nametag}</span>`;

                    // Style Overrides for Visual Scaling (Surfer is 10rem base)
                    nameTag.style.fontSize = '0.20em'; // Relative to parent's 10rem -> 1.5rem
                    nameTag.style.width = 'max-content';
                    nameTag.style.maxWidth = '300%'; // Allow some width
                    nameTag.style.background = opts.nameColor || '#ffffff';
                    nameTag.style.borderColor = opts.nameColor || '#ffffff';
                    nameTag.style.marginBottom = '1px'; // Space above surfer head
                    nameTag.style.padding = '0.10em 0.2em';

                    el.appendChild(nameTag);
                }

                el.appendChild(emojiDiv);

                // [FIX] Force Emoji Font & Reset Color
                el.style.fontFamily = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
                el.style.color = "initial";

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
                // [FIX] RETURN the element for external manipulation
                return el;
            };

            // [NEW] JS-Based Random Bounce Animation
            const animateWildBounce = (el, totalDuration) => {
                const startTime = Date.now();
                let currentRotation = 0;

                const bounce = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= totalDuration) return;

                    // Random Position (Keep within 10% - 90% of bounding box to stay on screen)
                    const x = 10 + Math.random() * 80;
                    const y = 10 + Math.random() * 80;

                    // Random Rotation (360 ~ 6400 degrees, Counter-Clockwise ADDITIVE)
                    const rotateDelta = 360 + Math.random() * 6040;
                    currentRotation -= rotateDelta;

                    // [MODIFIED] Physics Settings (Inertia)
                    const speed = 600; // Positioning speed
                    const rotateSpeed = 1200; // Rotation lasts longer for inertia

                    el.style.transition = `top ${speed}ms ease-in-out, left ${speed}ms ease-in-out, transform ${rotateSpeed}ms cubic-bezier(0.1, 0.5, 0.2, 1)`;
                    el.style.left = `${x}%`;
                    el.style.top = `${y}%`;
                    el.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(1.2)`;

                    // [MODIFIED] Schedule next bounce (1s ~ 2s total interval)
                    const nextDelay = 400 + Math.random() * 1000;
                    setTimeout(bounce, speed + nextDelay);
                };

                // Initial State: Center
                el.style.left = '50%';
                el.style.top = '50%';
                el.style.transform = 'translate(-50%, -50%) scale(0)';

                // Start Bouncing after brief appearance
                setTimeout(() => {
                    el.style.transition = "transform 0.5s";
                    el.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    setTimeout(bounce, 500);
                }, 100);
            };

            // 1. Surfer
            const surfingEmojis = [
                "\u{1F3C4}", // 🏄
                "\u{1F3C4}\u200D\u2642\uFE0F", // 🏄‍♂️
                "\u{1F3C4}\u200D\u2640\uFE0F", // 🏄‍♀️
                "\u{1F3C4}\u{1F3FB}", // 🏄
                "\u{1F3C4}\u{1F3FB}\u200D\u2642\uFE0F", // 🏄‍♂️
                "\u{1F3C4}\u{1F3FB}\u200D\u2640\uFE0F", // 🏄‍♀️
                "\u{1F3C4}\u{1F3FC}", // 🏄
                "\u{1F3C4}\u{1F3FC}\u200D\u2642\uFE0F", // 🏄‍♂️
                "\u{1F3C4}\u{1F3FC}\u200D\u2640\uFE0F", // 🏄‍♀️
                "\u{1F3C4}\u{1F3FD}", // 🏄🏽
                "\u{1F3C4}\u{1F3FD}\u200D\u2642\uFE0F", // 🏄🏽‍♂️
                "\u{1F3C4}\u{1F3FD}\u200D\u2640\uFE0F", // 🏄🏽‍♀️
                "\u{1F3C4}\u{1F3FE}", // 🏄
                "\u{1F3C4}\u{1F3FE}\u200D\u2642\uFE0F", // 🏄‍♂️
                "\u{1F3C4}\u{1F3FE}\u200D\u2640\uFE0F", // 🏄‍♀️
                "\u{1F3C4}\u{1F3FF}", // 🏄
                "\u{1F3C4}\u{1F3FF}\u200D\u2642\uFE0F", // 🏄‍♂️
                "\u{1F3C4}\u{1F3FF}\u200D\u2640\uFE0F"  // 🏄‍♀️
            ];
            const randomSurfer = surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)];

            spawnActor('surfer-actor', randomSurfer, {
                duration: 21000,
                nametag: (context.username || ""),
                nameColor: (context.userColor || "#ffffff")
            }); // Lasts full duration


            setTimeout(() => {
                const dolphinEl = spawnActor('lead-dolphin', "🐬", {
                    duration: 15000
                });

                // Trigger JS Animation
                if (dolphinEl) animateWildBounce(dolphinEl, 14000);
            }, 6000);

            // 2. Sea Jump
            const seaCreatures = ["🐋", "🐳", "🦈", "🦭", "🪼", "🐙", "🐠", "🐡", "🧜‍♀️", "🧜"];
            let accumulatedDelay = 0;

            // [MODIFIED] High Frequency Spawning (0.5s ~ 1s interval)
            // 21s duration / 0.75s avg = ~28 creatures. Let's spawn 30.
            for (let i = 0; i < 30; i++) {
                // Interval: 500ms ~ 1000ms
                const interval = 500 + Math.random() * 500;
                accumulatedDelay += interval;

                setTimeout(() => {
                    // Start from Left if even index, Right if odd (Symmetry)
                    const fromLeft = (i % 2 === 0);
                    const sx = fromLeft ? '-10vw' : '110vw';
                    const ex = fromLeft ? '110vw' : '-10vw';

                    // [Natural Rotation Logic]
                    const sc = fromLeft ? '-1' : '1';

                    // [NEW] Random chance for extreme rotation (30% chance)
                    const isWildSpin = Math.random() < 0.3;
                    let sr, er;

                    if (isWildSpin) {
                        const spinAmount = 360 + Math.random() * 360;
                        const direction = Math.random() < 0.5 ? 1 : -1;
                        sr = fromLeft ? `${-45 * direction}deg` : `${45 * direction}deg`;
                        er = fromLeft ? `${spinAmount * direction}deg` : `${-spinAmount * direction}deg`;
                    } else {
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
                }, accumulatedDelay);
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
                            '--r-end': rotEnd,
                            filter: "none" // Force Original Color
                        }
                    });
                }, randomDelay);
            }

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
                    // [FIX] Render emoticons in message
                    const renderedMsg = renderMessageWithEmotesHTML(msg, context.emotes || {});
                    txt.innerHTML = renderedMsg;
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

// [DEBUG] Visual Log for User
function showDebugLog(msg) {
    console.log(`[DEBUG] ${msg}`); // Always log to console
    if (!DEBUG_MODE) return; // Exit if visual debug is not requested

    let debugBox = document.getElementById('debug-log-box'); if (!debugBox) {
        debugBox = document.createElement('div');
        debugBox.id = 'debug-log-box';
        Object.assign(debugBox.style, {
            position: 'fixed', bottom: '10px', right: '10px', width: '300px', maxHeight: '200px',
            background: 'rgba(0,0,0,0.8)', color: '#0f0', fontSize: '12px', fontFamily: 'monospace',
            padding: '10px', borderRadius: '5px', overflowY: 'auto', zIndex: '10000', pointerEvents: 'none'
        });
        document.body.appendChild(debugBox);
    }
    const line = document.createElement('div');
    line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    debugBox.appendChild(line);
    debugBox.scrollTop = debugBox.scrollHeight;
    console.log(`[DEBUG] ${msg}`);
}

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
    loader.innerHTML = msg.replace(/\n/g, '<br>');
    loader.style.display = 'block';

    if (status === 'success') {
        loader.style.background = 'rgba(40, 167, 69, 0.9)';
        setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }, 1500);
    } else if (status === 'error') {
        loader.style.background = 'rgba(220, 53, 69, 0.9)';
        // Keep error visible
    } else {
        loader.style.background = 'rgba(0,0,0,0.85)';
    }
}

async function connectChzzk() {
    // 1단계: 로딩창에 군단의 의지를 새긴다.
    showLoader("군단의 의지를 집결하는 중...<br>(Chzzk Link Initializing)");
    showDebugLog("🚀 Initializing Chzzk Connection...");

    // 2단계: 오버마인드의 5중 변환 강림 (중복 없는 계시 추출)
    setTimeout(() => {
        // ... (Messages kept same, minimal disruption)
    }, 2000);

    try {
        // Data Fetch Helper with Proxy Rotation
        const fetchWithFallback = async (url) => {
            const proxies = [
                "https://corsproxy.io/?",
                "https://api.allorigins.win/raw?url=",
                "https://api.codetabs.com/v1/proxy?quest="
            ];

            for (let proxy of proxies) {
                try {
                    showDebugLog(`Trying proxy: ${new URL(proxy).hostname}`);
                    const res = await fetch(proxy + encodeURIComponent(url));
                    if (res.ok) {
                        showDebugLog(`Proxy Success: ${new URL(proxy).hostname}`);
                        return await res.json();
                    }
                    throw new Error(`Status ${res.status}`);
                } catch (e) {
                    showDebugLog(`Proxy Failed: ${e.message}`);
                }
            }
            throw new Error("All proxies failed. Check network/CORS.");
        };

        try {
            const targetUrl1 = `https://api.chzzk.naver.com/polling/v2/channels/${CHZZK_CHANNEL_ID}/live-status?ts=${Date.now()}`;

            // (1/3) 채널 상태 확인
            showLoader("진격 경로 탐색 중...<br>차원 좌표 고정 (1/3)");
            showDebugLog(`STEP 1: Fetching Live Status for ${CHZZK_CHANNEL_ID}`);

            const statusData = await fetchWithFallback(targetUrl1);
            showDebugLog("STEP 1: Success. Parsing data...");

            const liveStatus = statusData.content.status;
            const chatChannelId = statusData.content.chatChannelId;
            showDebugLog(`Live Status: ${liveStatus} | Chat Channel ID: ${chatChannelId}`);

            const targetUrl2 = `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING&ts=${Date.now()}`;

            // (2/3) 토큰 요청
            showLoader("네이버의 정수를 추출하는 중...<br>(2/3)");
            showDebugLog("STEP 2: Fetching Access Token...");

            const tokenData = await fetchWithFallback(targetUrl2);
            const accessToken = tokenData.content.accessToken;
            showDebugLog("STEP 2: Access Token Acquired.");

            // (3/3) 서버 연결
            showLoader(`신경망 동기화 개시. (Status: ${liveStatus})<br>군단이여, 깨어나라! (3/3)`);
            showDebugLog("STEP 3: Connecting WebSocket...");

            const ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

            ws.onopen = () => {
                showDebugLog("WebSocket Connected! Sending Handshake...");
                showLoader("군단 강림 완료. 침공을 시작하라.", "success");
                ws.send(JSON.stringify({
                    ver: "2", cmd: 100, svcid: "game", cid: chatChannelId,
                    bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null }, tid: 1
                }));
            };

            ws.onerror = (e) => {
                showDebugLog("WebSocket Error! Check Console.");
                console.error(e);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // [DEBUG LOG ALL CMDs]
                // Exclude Ping(0) and Pong(10000)
                if (data.cmd !== 0 && data.cmd !== 10000) {
                    showDebugLog(`RX CMD: ${data.cmd} | Body: ${JSON.stringify(data.bdy || {}).substring(0, 50)}...`);
                }

                // Ping -> Pong
                if (data.cmd === 0) ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));

                // Handshake Response (10100)
                if (data.cmd === 10100) {
                    const sid = data.bdy.sid;
                    showDebugLog(`Handshake Verified. SID: ${sid}. Ready for Live Chats.`);

                    if (LOAD_HISTORY) {
                        showDebugLog("Requesting Recent Chats (5101) as per URL parameter.");
                        ws.send(JSON.stringify({
                            ver: "2", cmd: 5101, svcid: "game", cid: chatChannelId,
                            bdy: { recentMessageCount: 50 }, tid: 2,
                            sid: sid
                        }));
                    }
                }

                if (data.cmd === 93101 || data.cmd === 15101) {
                    const chats = (data.cmd === 15101) ? data.bdy.messageList : data.bdy;
                    if (chats) {
                        chats.forEach(chat => {
                            // ... (Existing Chat Parsing Logic) ...
                            if (!chat.profile) return;
                            let profile = {};
                            try { profile = JSON.parse(chat.profile); } catch (e) { return; }
                            const message = chat.msg || chat.content || "";
                            const nickname = profile.nickname || "Anonymous";
                            let color = null;

                            if (profile.streamingProperty && profile.streamingProperty.nicknameColor) {
                                let code = profile.streamingProperty.nicknameColor.colorCode;
                                if (code) {
                                    if (!code.startsWith('#')) code = '#' + code;
                                    if (code.length === 6) code += '0';
                                    if (code === '#CC0000') color = null;
                                    else color = code;
                                }
                            }

                            let extraData = {};
                            if (chat.extras) {
                                try { extraData = JSON.parse(chat.extras); } catch (e) { }
                            }
                            const emojis = extraData.emojis || {};

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
                                'chzzk_badges': badgeList,
                                'message-type': 'chat',
                                'msg-id': 'chat',
                                'emotes_chzzk': emojis
                            };

                            handleMessage('chzzk', userstate, message, false);
                        });
                    }
                }
            };

            ws.onclose = () => {
                showDebugLog("WebSocket Closed. Reconnecting in 3s...");
                setTimeout(connectChzzk, 3000);
            };

            // Keep Alive
            setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ver: "2", cmd: 0 })); }, 20000);

        } catch (e) {
            console.error(e);
            showLoader(`오류 발생:<br>${e.message}<br><br>(5초 후 재시도)`, "error");
            showDebugLog(`CRITICAL ERROR: ${e.message}`);
            setTimeout(connectChzzk, 5000);
        }
    } catch (e) {
        showLoader(`치명적 오류:<br>${e.message}`, "error");
        setTimeout(connectChzzk, 5000);
    }
}


// ==========================================
// [2] Original Logic (Bridged)
// ==========================================

function handleMessage(channel, userstate, message, fromSelf) {
    // showDebugLog(`HandleMsg: ${message.substring(0, 10)}...`); 
    if (chatFilter.test(message)) return;

    let chan = getChan(channel);
    let name = userstate['display-name'] || userstate.username;

    // Filter bots
    if (!['ssakdook', 'Nightbot'].includes(userstate['username'])) {
        userstate.name = name;
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

    const processItem = (item) => {
        if (typeof item === 'string') {
            return `SFX/${item}`;
        } else if (typeof item === 'object' && item !== null && item.src) {
            return {
                ...item,
                src: `SFX/${item.src}`
            };
        }
        return item; // Fallback
    };

    for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value)) {
            soundHive[key] = value.map(processItem);
        } else {
            soundHive[key] = processItem(value);
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
// 소리 재생을 담당하는 중추 함수 (중복 방지 강화) - Returns PROMISE
function playZergSound(input) {
    if (!soundEnabled) return Promise.resolve();

    let target = input;

    // Handle random selection if an array of sounds is provided
    if (Array.isArray(target)) {
        target = target[Math.floor(Math.random() * target.length)];
    }

    if (!target) return Promise.resolve();

    let fileName;
    let volume = 0.5; // Default volume

    // Check if configuration is an object with volume (New Format)
    if (typeof target === 'object' && target !== null && target.src) {
        fileName = target.src;
        if (target.volume !== undefined) volume = target.volume;
    } else {
        // Legacy String Format
        fileName = target;
    }

    if (!fileName) return Promise.resolve();

    let finalUrl;
    try {
        finalUrl = new URL(fileName, window.location.href).href;
    } catch (e) {
        console.warn("URL resolution failed, using raw fileName:", e);
        finalUrl = fileName;
    }

    console.log("🔊 Attempting to play sound:", finalUrl, "Vol:", volume);

    return new Promise((resolve) => {
        const audio = new Audio(finalUrl);
        audio.volume = volume;

        audio.onended = () => {
            resolve();
        };

        audio.onerror = (e) => {
            console.error("❌ Audio playback failed:", e && e.message ? e.message : "Unknown error", "| Path:", finalUrl);
            resolve(); // Resolve anyway to continue sequence
        };

        audio.play().catch(e => {
            console.error("❌ Audio playback failed (play catch):", e.message, "| Path:", finalUrl);
            resolve();
        });
    });
}
function showMessage({ chan, type, message = '', data = {}, timeout = 10000, attribs = {} } = {}) {
    const originalMessage = message;
    const normOriginal = originalMessage.normalize('NFC').trim();

    // [Command Stripping Global] Remove ANY word starting with ! (preceded by start or space)
    let bubbleMessage = message.replace(/(^|\s)![\S]+/g, "").replace(/\s+/g, " ").trim();
    message = bubbleMessage;
    const normMessage = message.normalize('NFC');
    showDebugLog(`RENDER: ${message} (${data.name})`);
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
    let bestVisualMatch = { length: 0, effectType: null };

    Object.keys(visualConfig).forEach(keyword => {
        const normKey = keyword.normalize('NFC');
        // Check normOriginal so hidden !commands still trigger
        if (normOriginal.startsWith(normKey) || normOriginal.startsWith(`!${normKey}`)) {
            if (normKey.length > bestVisualMatch.length) {
                bestVisualMatch = { length: normKey.length, effectType: visualConfig[keyword] };
            }
        }
    });

    if (bestVisualMatch.effectType) {
        const effectType = bestVisualMatch.effectType;
        if (typeof ScreenEffectRegistry !== 'undefined' && ScreenEffectRegistry[effectType]) {
            ScreenEffectManager.trigger(effectType, {
                message: message,
                username: data.name,
                userColor: random_color,
                emotes: data['emotes_chzzk'] || {} // [FIX] Pass emotes data to effects
            });
            return; // Visual command found, stop here
        }
    }

    // [Sound Effect Trigger - SEQUENTIAL]
    // 1. Find ALL matches in the message
    let allMatches = [];
    Object.keys(soundHive).forEach(keyword => {
        // [SYNC FIX] If this keyword is a visual effect, don't trigger it as a general sound.
        if (visualConfig[keyword]) return;

        const normKey = keyword.normalize('NFC');
        let searchPos = 0;
        let index;

        // Find ALL occurrences of this keyword
        while ((index = normOriginal.indexOf(normKey, searchPos)) !== -1) {
            allMatches.push({
                startIndex: index,
                endIndex: index + normKey.length,
                length: normKey.length,
                sound: soundHive[keyword],
                keyword: normKey
            });
            searchPos = index + 1; // Move forward
        }
    });

    // 2. Sort by position (left -> right), then by length (longest first for same position)
    allMatches.sort((a, b) => {
        if (a.startIndex === b.startIndex) {
            return b.length - a.length; // Longest first
        }
        return a.startIndex - b.startIndex; // Earliest first
    });

    // 3. Filter overlaps (Greedy)
    let sequence = [];
    let lastEnd = 0;

    for (let match of allMatches) {
        if (match.startIndex >= lastEnd) {
            sequence.push(match);
            lastEnd = match.endIndex;
        }
    }

    // 4. Play Sequence
    if (sequence.length > 0 && soundEnabled) {
        (async () => {
            for (let item of sequence) {
                await playZergSound(item.sound);
            }
        })();
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
    if (originalMessage.includes("ㅜㅑ")) {
        // message is already stripped of !ㅜㅑ by global stripper
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
    else if (["x", "f", "rip"].includes(originalMessage.toLowerCase()) || (originalMessage.startsWith("-") && originalMessage.endsWith("-") && originalMessage.length == 3)) {
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

    if (includesAny(["똥", "츠지모토", "후지오카", "토쿠다", "야스노리", "스즈키", "이치하라"], originalMessage)) {
        chatLineInner.style.color = "#c28f38";
        chatLineInner.style.textShadow = "0 0 10px #946f2f";
    }
    else if (includesAny(["흑화", "흑"], originalMessage)) {
        messageEle.style.textShadow = "0px 0px 30px #000000, 0 0px 10px #000000, 0 0px 10px #000000";
        messageEle.style.color = "grey";
    }

    if (originalMessage.includes("빛")) {
        chatLineInner.style.animationName = "chat-hvn-glow";
        chatLineInner.style.animationIterationCount = 10;
        chatLineInner.style.animationDuration = "1s";
        chatLineInner.style.animationTimingFunction = "linear";
    } else if (includesAny(["무지개", "겜성", "led", "rgb"], originalMessage.toLowerCase())) {
        chatLineInner.style.animationName = "chat-hvn-rainbow";
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

    if (originalMessage.includes("ㅂㄷㅂㄷ")) {
        messageEle.style.animationName = "chat-hvn-vibrate";
        messageEle.style.animationIterationCount = 30;
        messageEle.style.animationDuration = "0.5s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (normOriginal.startsWith("!유격")) {
        usesSlot = false;

        // Re-render message content without command
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
        addEmoteDOM(messageEle, finalMessage);

        // [MODIFIED] Removed width constraint and added safe text display
        chatBox.style.width = "auto";
        messageEle.style.whiteSpace = "nowrap";

        // [FIX] Use emoticon rendering instead of innerText
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMsg = handleEmotes(chan, data.emotes_chzzk || {}, message);
        addEmoteDOM(messageEle, finalMsg);
        // [FIX] Use TOP-left baseline for intuitive downward movement
        chatBox.style.left = "0";
        chatBox.style.top = "0";
        chatBox.style.bottom = "auto";
        chatBox.style.transform = "none";

        chatBox.style.animationName = "chat-hvn-slideDiagonal";
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
        messageEle.style.animationName = "chat-hvn-shrinkX";
        messageEle.style.animationIterationCount = 1;
        messageEle.style.animationDuration = "3s";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (normOriginal.startsWith("!압축")) {
        // [Global Strip] !압축 is already removed from 'message'

        // [FIX] Update DOM with new message (re-process emotes)
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
        addEmoteDOM(messageEle, finalMessage);

        messageEle.style.animationName = "chat-hvn-squeeze";
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
        messageEle.style.animationName = "chat-hvn-growY";
        messageEle.style.animationDuration = "1s";
        messageEle.style.animationIterationCount = 20;
        messageEle.style.animationTimingFunction = "linear";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.webkitLineClamp = "1";
    }
    else if (message.includes("))")) {
        messageEle.style.fontSize = 3.0 + "em";
        messageEle.style.position = "middle";
        messageEle.style.textAlign = "center";

        // )) moves with normal hipDance (right to left swing)
        messageEle.style.animationName = "chat-hvn-hipDance";
        messageEle.style.animationIterationCount = 5;
        messageEle.style.animationDuration = "1.8s";
        messageEle.style.animationFillMode = "forwards";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message.includes("((")) {
        messageEle.style.fontSize = 3.0 + "em";
        messageEle.style.position = "middle";
        messageEle.style.textAlign = "center";

        // (( moves with reversed hipDance (left to right swing)
        messageEle.style.animationName = "chat-hvn-hipDanceReverse";
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
        chatBox.style.animationName = "chat-hvn-shake2";
        chatBox.style.animationIterationCount = 50;
        messageEle.style.position = "middle";
        timeout = 3000;
    }
    else if (message.includes("나죽어")) {
        chatBox.style.animationName = "chat-hvn-death";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "3s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "linear";
        timeout = 3000;
    }
    else if (message.includes("흡!") || message.endsWith("흡")) {
        chatBox.style.animationName = "chat-hvn-fadeOutFall";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "6s";
        chatBox.style.animationFillMode = "forwards";
        timeout = 6000;
    }
    else if (message.startsWith("성불")) {
        chatBox.style.maxHeight = "auto";
        chatBox.style.animationName = "chat-hvn-toHeaven";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "5s";
        chatBox.style.animationFillMode = "forwards";
    }
    else if (["갔냐?", "갔냐", "ㄱㄴ?", "ㄱㄴㄱㄴ?", "ㄱㄴ", "ㄱㄴㄱㄴ"].includes(message)) {
        chatBox.style.maxHeight = "auto";
        chatBox.style.animationName = "chat-hvn-scout";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = "4s";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationFillMode = "forwards";
    }
    else if (includesAny(["덜렁덜렁", "ㄷㄹㄷㄹ", "출렁출렁", "덜렁"], message)) {
        chatBox.style.animationName = "chat-hvn-balls";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "2s";
        chatBox.style.animationTimingFunction = "linear";
        messageEle.style.webkitLineClamp = "1";
        timeout = 3000;
    }
    else if (message.endsWith("~")) {
        messageEle.style.position = "middle";
        chatBox.style.animationName = "chat-hvn-wave";
        chatBox.style.animationIterationCount = Math.floor((message.match(/~/g) || []).length);
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
    }
    else if (message.startsWith("앗") || message.includes("엌")) {
        chatBox.style.animationName = "chat-hvn-upDown";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationDuration = ".4s";
    }
    else if (includesAny(["맞음", "맞아요", "ㅔ", "ㅖ", "ㅇㅇ", "ㅇㅋ"], message) || message == "ㄹㅇ") {
        chatBox.style.animationName = "chat-hvn-yes";
        chatBox.style.animationIterationCount = "2";
        chatBox.style.animationDuration = ".6s";
    }
    else if (["해", "명", "극", "나", "락"].includes(message) || message.endsWith("!")) {
        chatBox.style.animationName = "chat-hvn-shake3";
        chatBox.style.animationIterationCount = "50";
        chatBox.style.animationDuration = ".4s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("?")) {
        chatBox.style.animationName = "chat-hvn-shake4";
        chatBox.style.animationIterationCount = "1";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (includesAny(["안녕", "👋"], message) || endsWithAny(["하", "바"], message)) {
        chatBox.style.animationName = "chat-hvn-shake4";
        chatBox.style.animationIterationCount = "5";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄷㄷ")) {
        chatBox.style.animationName = "chat-hvn-fear";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄷ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = ".3s";
        messageEle.style.position = "middle";
    }
    else if (includesAny(["ㅠㅠ", "ㅠㅜ", "ㅜㅠ", "ㅜㅜ"], message)) {
        chatBox.style.animationName = "chat-hvn-crying";
        chatBox.style.animationIterationCount = "5";
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1.5s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄴㄴ")) {
        chatBox.style.animationName = "chat-hvn-nope";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄴ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄱㄱ")) {
        chatBox.style.animationName = "chat-hvn-walking";
        chatBox.style.animationIterationCount = Math.floor((message.match(/ㄱ/g) || []).length);;
        chatBox.style.animationTimingFunction = "linear";
        chatBox.style.animationDuration = "1s";
        messageEle.style.position = "middle";
    }
    else if (message.includes("헤으응")) {
        chatBox.style.animationName = "chat-hvn-shrink";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "2s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "linear";
        chatLineInner.style.animationName = "chat-hvn-shy";
        chatLineInner.style.animationIterationCount = 1;
        chatLineInner.style.animationDuration = "2s";
        chatLineInner.style.animationFillMode = "forwards";
        chatLineInner.style.animationTimingFunction = "linear";
    }
    else if (["ㄴㅇㄱ", "ㅇ0ㅇ", 'oOo', 'o0o'].includes(message)) {
        messageEle.style.fontSize = 2.6 + "em";
        chatBox.style.animationName = "chat-hvn-surprised";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "0.5s";
        chatBox.style.animationFillMode = "forwards";
        chatBox.style.animationTimingFunction = "ease-in";
    }
    else if (includesAny(["...", ";;"], message)) {
        chatBox.style.animationName = "chat-hvn-fall";
        chatBox.style.animationIterationCount = 1;
        chatBox.style.animationDuration = "10s";
        chatBox.style.animationTimingFunction = "linear";
        messageEle.style.position = "middle";
    }
    else if (message == "히오스" || message == "짜잔") {
        chatBox.style.animationName = "chat-hvn-Hots";
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
        chatBox.style.animationName = "chat-hvn-beat";
        chatBox.style.animationIterationCount = 20;
        chatBox.style.animationDuration = "0.5s";
        chatBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "chat-hvn-beat";
        messageEle.style.animationIterationCount = 20;
        messageEle.style.animationDuration = "0.5s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (normOriginal.startsWith("!제발") || message == "🤣") {
        // [Global Strip] !제발 is already removed from 'message'
        nameBox.style.animationName = "chat-hvn-shake3";
        nameBox.style.animationIterationCount = 50;
        nameBox.style.animationDuration = "0.3s";
        nameBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "chat-hvn-shake2";
        messageEle.style.animationIterationCount = 40;
        messageEle.style.animationDuration = "0.2s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (message == ("틀")) {
        messageEle.innerText = ("-틀-")
        nameBox.style.animationName = "chat-hvn-shake3";
        nameBox.style.animationIterationCount = 40;
        nameBox.style.animationDelay = "-0.1s";
        nameBox.style.animationDuration = "0.4s";
        nameBox.style.animationTimingFunction = "linear";

        messageEle.style.animationName = "chat-hvn-shake3";
        messageEle.style.animationIterationCount = 40;
        messageEle.style.animationDuration = "0.4s";
        messageEle.style.animationTimingFunction = "linear";

        chatBox.style.animationName = "chat-hvn-fear";
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
            chatBox.style.animationName = "chat-hvn-passThroughLtoR";
        } else {
            chatBox.style.left = null;
            chatBox.style.right = "-350px";
            chatBox.style.animationName = "chat-hvn-passThroughRtoL";
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
    else if (message == "나락" || message == "떡락" || startsWithAny(["!나락", "!떡락"], normOriginal)) {
        usesSlot = false;
        // [Global Strip] !Command is already removed from 'message'
        // [MODIFIED] Removed width constraint and added safe text display
        chatBox.style.width = "auto";
        messageEle.style.whiteSpace = "nowrap";

        // [FIX] Use emoticon rendering instead of innerText
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        let finalMsg = handleEmotes(chan, (data.emotes_chzzk || {}), message);
        addEmoteDOM(messageEle, finalMsg);
        chatBox.style.left = Math.random() * 90 + "%";
        chatBox.style.bottom = "1300px";
        chatBox.style.animationName = "chat-hvn-passThrough2";
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
        chatBox.style.animationName = "chat-hvn-passThrough3";
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
    // Chzzk Emotes: emotes is a map of { id: url } or { id: { imageUrl: url } }
    // Message contains patterns like {id} or {:id:}

    let parts = [];
    // Updated Regex to support {id} (Chzzk) and {:id:} (Legacy/Alternative)
    let regex = /\{:?[^:{} ]+:?\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(message.substring(lastIndex, match.index));
        }

        const fullMatch = match[0];
        // Strip braces and colons to get the pure ID
        const emoteId = fullMatch.replace(/[\{:?\}]/g, "");

        const emoteData = emotes[emoteId];
        let emoteUrl = null;

        if (emoteData) {
            if (typeof emoteData === 'string') emoteUrl = emoteData;
            else if (emoteData.imageUrl) emoteUrl = emoteData.imageUrl;
            else if (emoteData.url) emoteUrl = emoteData.url;
        }

        if (emoteUrl) {
            parts.push({ url: emoteUrl });
        } else {
            // Not a known emote, keep raw text
            parts.push(fullMatch);
        }

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < message.length) {
        parts.push(message.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [message];
}

/**
 * [FIXED] Helper function for rendering emoticons in special effects
 * Converts Chzzk emoticon patterns {id} to <img> tags for HTML rendering.
 */
function renderMessageWithEmotesHTML(message, emotes = {}) {
    if (!emotes || Object.keys(emotes).length === 0) {
        return message; // No emoticons, return original
    }

    let result = message;
    const regex = /\{:?[^:{} ]+:?\}/g;

    result = result.replace(regex, (match) => {
        // Strip braces and colons to get the pure ID
        const emoteId = match.replace(/[\{:?\}]/g, "");

        const emoteData = emotes[emoteId];
        let emoteUrl = null;

        if (emoteData) {
            if (typeof emoteData === 'string') emoteUrl = emoteData;
            else if (emoteData.imageUrl) emoteUrl = emoteData.imageUrl;
            else if (emoteData.url) emoteUrl = emoteData.url;
        }

        if (emoteUrl) {
            return `<img src="${emoteUrl}" class="emote_chzzk_inline" style="height: 1.2em; vertical-align: middle; display: inline-block;" alt="${emoteId}">`;
        }
        return match; // Keep original if emote not found
    });

    return result;
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