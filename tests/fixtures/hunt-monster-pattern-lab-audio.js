'use strict';

class HuntMonsterPatternLabAudio {
    constructor(options = {}) {
        this.monsterProvider = options.monsterProvider || (() => null);
        this.enabled = true;
        this.generation = 0;
        this.scheduled = new ManagedTimers();
        this.activeAudio = new Set();
        this.statusButton = null;
        this.audioManager = new HuntAudioManager({
            audioManager: {
                createNativeAudio: (path, audioOptions = {}) => this.createNativeAudio(path, audioOptions),
                playSound: input => this.playConfiguredInput(input)
            }
        }, {});
    }

    resolveAssetPath(path) {
        const source = String(path || '');
        if (!source || /^(?:https?:|data:|blob:)/i.test(source)) return source;
        return new URL(`../../${source.replace(/^\.?\//, '')}`, window.location.href).href;
    }

    createNativeAudio(path, options = {}) {
        const resolvedPath = this.resolveAssetPath(path);
        const audio = new Audio(resolvedPath);
        audio.preload = 'auto';
        audio.loop = options.loop === true;
        audio.volume = Math.max(0, Math.min(1, Number(options.baseVolume ?? options.volume ?? .7)));
        audio.hidden = true;
        audio.dataset.patternLabAudio = 'true';
        // Keep preview audio DOM-owned while it plays. This mirrors OBS media
        // ownership and avoids Chromium discarding a detached Audio element.
        document.body?.appendChild(audio);
        if (this.statusButton) this.statusButton.title = resolvedPath.split('/').pop() || resolvedPath;
        const nativePlay = audio.play.bind(audio);
        audio.play = () => {
            if (!this.enabled) return Promise.resolve();
            this.activeAudio.add(audio);
            this.setStatus('playing');
            return nativePlay().catch(error => {
                this.setStatus('blocked');
                throw error;
            });
        };
        audio.addEventListener('ended', () => {
            this.activeAudio.delete(audio);
            audio.remove();
            if (!this.activeAudio.size) this.setStatus('ready');
        }, { once: true });
        audio.addEventListener('error', () => {
            this.activeAudio.delete(audio);
            audio.remove();
            this.setStatus('blocked');
        }, { once: true });
        return audio;
    }

    playConfiguredInput(input) {
        const choices = Array.isArray(input) ? input : [input];
        const selected = choices.find(Boolean);
        const source = typeof selected === 'string' ? selected : selected?.src;
        if (!source) return false;
        const audio = this.createNativeAudio(source, {
            baseVolume: typeof selected === 'object' ? selected.volume : .7
        });
        audio.play().catch(() => {});
        return true;
    }

    installToggle(container) {
        if (!container || this.statusButton) return;
        const button = document.createElement('button');
        button.id = 'lab-audio-toggle';
        button.className = 'lab-audio-toggle';
        button.type = 'button';
        button.setAttribute('aria-pressed', 'true');
        button.addEventListener('click', () => this.setEnabled(!this.enabled));
        container.insertBefore(button, container.querySelector('#run-readout'));
        this.statusButton = button;
        this.setStatus('ready');
    }

    setStatus(status) {
        if (!this.statusButton) return;
        this.statusButton.dataset.audioStatus = status;
        this.statusButton.textContent = !this.enabled
            ? '🔇 음향 끔'
            : status === 'blocked' ? '⚠️ 재생 차단'
                : status === 'playing' ? '🔊 재생 중'
                    : '🔊 음향 켬';
    }

    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        this.statusButton?.setAttribute('aria-pressed', String(this.enabled));
        if (!this.enabled) {
            this.cancelPatternAudio();
            this.activeAudio.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
                audio.remove();
            });
            this.activeAudio.clear();
        }
        this.setStatus(this.enabled ? 'ready' : 'muted');
    }

    cancelPatternAudio() {
        this.generation += 1;
        this.scheduled.clearAll();
    }

    audioContext(pattern, audioPhase, event = null) {
        return {
            patternId: pattern.id,
            patternName: pattern.name,
            patternType: pattern.tags?.includes('burrow-emerge') ? 'burrow' : pattern.type,
            patternTags: pattern.tags,
            patternDelivery: pattern.delivery,
            audioPhase,
            impactEventKind: event?.eventKind || null,
            impactTimelineIndex: event?.timelineIndex
        };
    }

    playPattern(pattern, timeline = []) {
        this.cancelPatternAudio();
        if (!this.enabled || !pattern) return;
        const monster = this.monsterProvider();
        if (!monster) return;
        const actionKind = pattern.type === 'roar' ? 'roar' : 'attack';
        this.audioManager.playMonsterAction(monster, actionKind,
            this.audioContext(pattern, 'action-start'));

        const generation = this.generation;
        timeline.forEach((event, timelineIndex) => {
            const delayMs = Math.max(0, Number(event.atTicks || 0) * 100);
            this.scheduled.timeout(() => {
                if (!this.enabled || generation !== this.generation) return;
                const impactEvent = { ...event, timelineIndex };
                if (event.audioCue === 'somersault') {
                    this.audioManager.playMonsterAction(monster, 'telegraph', {
                        ...this.audioContext(pattern, null, impactEvent),
                        patternType: 'somersault'
                    });
                }
                if (pattern.type !== 'roar') {
                    this.audioManager.playMonsterAction(monster, 'attack',
                        this.audioContext(pattern, 'impact', impactEvent));
                }
            }, delayMs);
        });
    }

    playProjectileLaunch(monster, pattern = {}) {
        if (!this.enabled || !monster) return false;
        const context = this.audioContext(pattern, null);
        if (this.audioManager.playMonsterAction(monster, 'projectile_launch', context)) return true;
        return this.audioManager.playMonsterAction(monster, 'telegraph', context);
    }

    playEngineAsset(fileName, fallbackKey, context = {}) {
        if (!this.enabled) return false;
        return this.audioManager.playMHAsset(fileName, fallbackKey, context);
    }

    playState(state) {
        if (!this.enabled) return;
        const monster = this.monsterProvider();
        if (!monster) return;
        const kind = state === 'knockdown' || state === 'stunned' ? 'knockdown' : null;
        if (kind) this.audioManager.playMonsterAction(monster, kind, { audioPhase: 'action-start' });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPatternLabAudio;
else window.HuntMonsterPatternLabAudio = HuntMonsterPatternLabAudio;
