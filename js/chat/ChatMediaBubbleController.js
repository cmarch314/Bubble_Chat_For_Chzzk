class ChatMediaBubbleController {
    constructor(owner) {
        this.owner = owner;
    }

    get audioManager() { return this.owner.audioManager; }

    get eventBus() { return this.owner.eventBus; }

    get timers() { return this.owner.timers; }

    get boxPos() { return this.owner.boxPos; }

    set boxPos(value) { this.owner.boxPos = value; }

    mount(originalMessage, elements, videoQueue) {
        const { chatBox, chatLineInner, messageEle } = elements;
            // Build the unified queue of video commands and SFX keywords in the exact order they appear
            const sfxMatches = (this.audioManager && typeof this.audioManager.getSFXSequence === 'function')
                ? this.audioManager.getSFXSequence(originalMessage)
                : [];
            
            const sfxList = sfxMatches.map(match => {
                const originalIndex = typeof mapIndexSpaceRemovedToOriginal === 'function'
                    ? mapIndexSpaceRemovedToOriginal(match.startIndex, originalMessage)
                    : match.startIndex;
                return {
                    type: 'audio',
                    sound: match.sound,
                    startIndex: originalIndex
                };
            });

            // Filter out any SFX matches that are actually part of a video command token (e.g. "오호" inside "#오호")
            const filteredSfxList = sfxList.filter(sfx => {
                return !videoQueue.some(vid => {
                    return sfx.startIndex >= vid.startIndex && sfx.startIndex < vid.startIndex + vid.length;
                });
            });

            const unifiedQueue = [...videoQueue, ...filteredSfxList];
            unifiedQueue.sort((a, b) => a.startIndex - b.startIndex);

            // Track active video count
            window._activeVideoCount = (window._activeVideoCount || 0) + 1;

            // Override max-height limits to prevent video from clipping
            chatBox.style.maxHeight = 'none';
            elements.chatLine.style.maxHeight = 'none';
            chatLineInner.style.overflow = 'hidden'; // Rounded corner clips for video

            // Adjust message element style for video
            messageEle.style.display = 'block';
            messageEle.style.webkitLineClamp = 'none';
            messageEle.style.lineClamp = 'none';
            messageEle.style.webkitBoxOrient = 'horizontal';
            messageEle.style.overflow = 'visible';
            messageEle.style.textOverflow = 'clip';
            messageEle.style.padding = '0'; // flush edge-to-edge inside the borders

            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.display = 'block';
            video.style.borderRadius = '0 0 16px 16px'; // match bottom corners of chat bubble
            video.style.marginTop = '4px';
            video.playsInline = true;

            // Native media stays compatible with OBS file:// sources while using
            // the measured per-file loudness profile.
            this.audioManager?.connectMediaElement(video, 'visual');

            // Clear standard text timeout

            let hasCleanedUp = false;
            const cleanupVideoBubble = () => {
                if (hasCleanedUp) return;
                hasCleanedUp = true;
                this.timers.clear(safetyTimeout);

                // Decrement active video count
                window._activeVideoCount = Math.max(0, (window._activeVideoCount || 0) - 1);

                // If no more videos are playing, trigger event to process queue
                if (window._activeVideoCount === 0) {
                    if (this.eventBus) {
                        this.eventBus.emit('chat:videoFinished');
                    }
                }

                if (chatBox.parentElement) {
                    chatBox.classList.remove('visible');
                    this.timers.timeout(() => chatBox.remove(), 1000);
                }
            };

            // Safety net: force remove after a timeout based on video count
            let safetyTimeout = this.timers.timeout(() => {
                cleanupVideoBubble();
            }, Math.max(30000, unifiedQueue.length * 15000));

            let hasTriggeredNext = false;
            let currentIdx = 0;
            const playNext = async () => {
                if (currentIdx >= unifiedQueue.length) {
                    cleanupVideoBubble();
                    return;
                }

                hasTriggeredNext = false;
                const item = unifiedQueue[currentIdx];
                currentIdx++;

                // Stop and unload previous video to prevent race conditions and overlapping audio
                try {
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                } catch (e) {}

                if (item.type === 'video') {
                    video.style.display = 'block';
                    video.src = `AI CMC/${encodeURIComponent(item.name)}.mp4`;
                    this.audioManager?.applyNativeVolume(video, { type: 'visual', path: video.src });
                    video.play().catch(e => {
                        console.error("CMC video play failed, skipping:", e);
                        if (!hasTriggeredNext) {
                            hasTriggeredNext = true;
                            playNext();
                        }
                    });
                } else if (item.type === 'audio') {
                    // Hide video player so we don't see a frozen frame
                    video.style.display = 'none';

                    if (this.audioManager) {
                        try {
                            if (typeof this.audioManager._updateCompressorSettings === 'function') {
                                this.audioManager._updateCompressorSettings();
                            }
                            await this.audioManager.playSound(item.sound, { force: true, type: 'sfx' });
                        } catch (e) {
                            console.error("AudioManager.playSound failed, skipping:", e);
                        }
                    }

                    if (!hasTriggeredNext) {
                        hasTriggeredNext = true;
                        playNext();
                    }
                }
            };

            video.addEventListener('ended', () => {
                if (!hasTriggeredNext) {
                    hasTriggeredNext = true;
                    playNext();
                }
            });

            video.addEventListener('timeupdate', () => {
                if (!hasTriggeredNext && video.duration && video.duration > 0.5) {
                    if (video.currentTime >= video.duration - 0.5) {
                        hasTriggeredNext = true;
                        playNext();
                    }
                }
            });

            video.addEventListener('error', (e) => {
                console.error("CMC video error, skipping:", e);
                if (!hasTriggeredNext) {
                    hasTriggeredNext = true;
                    playNext();
                }
            });

            messageEle.appendChild(video);
            playNext();

            // Set left positioning
            this.boxPos = this.boxPos % 100;
            chatBox.style.left = this.boxPos + "%";

        return { timeout: null };
    }
}
