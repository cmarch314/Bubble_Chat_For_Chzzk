class CoupleEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const flashback = document.getElementById('flashback-overlay');
        const overlay = document.getElementById('heart-overlay');
        if (!flashback || !overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().couple) ? this.config.getVisualConfig().couple : {
            duration: 21000,
            fontSize: '13rem',
            flashbackDuration: 11800
        };

        let displayMsg = (context.message || "").trim();
        const triggerKw = "!커플";
        displayMsg = displayMsg.replace(new RegExp(triggerKw, 'i'), '').trim();

        const wrappedMsg = this.director._wrapText(displayMsg, 200);
        const centerMsgSnippet = document.createElement('div');
        centerMsgSnippet.className = 'couple-premium-text';
        centerMsgSnippet.style.fontSize = conf.fontSize; // Apply config font size
        centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(wrappedMsg, context.emotes || {}, 2.0);
        centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards";

        document.body.appendChild(centerMsgSnippet);

        return new Promise(resolve => {
            const fadeInTime = 1000;
            const messageTotalTime = conf.flashbackDuration;
            const emojiPhaseDuration = conf.duration - conf.flashbackDuration;

            flashback.classList.add('visible');

            // Fade out message shortly before flashback ends
            setTimeout(() => { centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; }, messageTotalTime - 1500);

            setTimeout(() => {
                if (centerMsgSnippet) centerMsgSnippet.remove();
                flashback.classList.remove('visible');
                overlay.classList.add('visible');
                const emojiContainer = overlay.querySelector('.heart-emoji');

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

                const personRanges = conf.personEmojiRanges || [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                const heartRanges = conf.heartEmojiRanges || [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];

                const p1 = getRandomFromRanges(personRanges), p2 = getRandomFromRanges(personRanges), h3 = getRandomFromRanges(heartRanges);

                const updateState = (step) => {
                    const hue = Math.floor(Math.random() * 360);
                    const dim = (conf.bgOpacity !== undefined) ? conf.bgOpacity : 0.3;
                    overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${dim})`;
                    emojiContainer.classList.remove('grow-effect'); void emojiContainer.offsetWidth; emojiContainer.classList.add('grow-effect');

                    if (step === 3) {
                        emojiContainer.style.fontSize = conf.fontSize;
                    } else {
                        emojiContainer.style.fontSize = `calc(${conf.fontSize} * ${conf.intermediateScale || 1.5})`;
                    }

                    if (step === 0) emojiContainer.innerText = p1;
                    else if (step === 1) emojiContainer.innerText = p2;
                    else if (step === 2) emojiContainer.innerText = h3;
                    else if (step === 3) emojiContainer.innerText = `${p1}${h3}${p2}`;
                };

                const phaseStep = emojiPhaseDuration / 4;
                updateState(0);
                setTimeout(() => updateState(1), phaseStep);
                setTimeout(() => updateState(2), phaseStep * 2);
                setTimeout(() => updateState(3), phaseStep * 2.5);

                setTimeout(() => {
                    overlay.style.backgroundColor = ''; overlay.classList.remove('visible');
                    emojiContainer.innerText = '❤️‍🩹'; emojiContainer.style.fontSize = '';
                    resolve();
                }, emojiPhaseDuration);
            }, conf.flashbackDuration);
        });
    }
}
