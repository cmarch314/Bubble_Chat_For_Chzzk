class AudioMediaStager {
    constructor({ configManager, levelProfile, getVolumeConfig, audioContext, compressor }) {
        this.configManager = configManager;
        this.levelProfile = levelProfile;
        this.getVolumeConfig = getVolumeConfig;
        this.audioContext = audioContext;
        this.compressor = compressor;
        this.nativeEntries = [];
        this.webAudioEntries = [];
        this.disposed = false;
    }

    profileGain(path, type) {
        const config = this.configManager?.getNormalizerConfig?.() || {
            enabled: true, visual: true, sfx: true
        };
        const categoryEnabled = type === 'sfx' ? config.sfx !== false : config.visual !== false;
        return config.enabled !== false && categoryEnabled ? this.levelProfile.gain(path) : 1;
    }

    outputVolume(path, type = 'visual', baseVolume = 1) {
        const volume = this.getVolumeConfig() || { master: 1, visual: 1, sfx: 1 };
        const typeMultiplier = type === 'sfx' ? volume.sfx : volume.visual;
        const staged = volume.master * typeMultiplier * baseVolume;
        return Math.min(1, Math.max(0, staged * this.profileGain(path, type)));
    }

    applyNativeVolume(mediaElement, options = {}) {
        if (!mediaElement) return 0;
        const type = options.type || 'visual';
        const baseVolume = options.baseVolume ?? mediaElement.__bubbleBaseVolume ?? 1;
        const path = options.path || mediaElement.currentSrc || mediaElement.src || '';
        mediaElement.__bubbleBaseVolume = baseVolume;
        mediaElement.muted = false;
        mediaElement.volume = this.outputVolume(path, type, baseVolume);
        return mediaElement.volume;
    }

    connectMediaElement(mediaElement, type = 'visual', options = {}) {
        if (!mediaElement || this.disposed) return;
        if (window.location.protocol === 'file:') {
            console.log('[MediaStaging] Local file protocol detected. Bypassing Web Audio Context to prevent CORS mute. Using native volume control.');
            const apply = () => this.applyNativeVolume(mediaElement, { type, ...options });
            apply();
            if (!this.nativeEntries.some(item => item.el === mediaElement)) {
                this.nativeEntries.push({ el: mediaElement, type, apply, detached: false });
            }
            return;
        }

        if (mediaElement.__webAudioConnected) return;
        try {
            const sourceNode = this.audioContext.createMediaElementSource(mediaElement);
            const preGainNode = this.audioContext.createGain();
            const path = options.path || mediaElement.currentSrc || mediaElement.src || '';
            const entry = { el: mediaElement, sourceNode, preGainNode, type, path };
            this.applyWebAudioGain(entry);
            sourceNode.connect(preGainNode);
            preGainNode.connect(this.compressor);
            mediaElement.__webAudioConnected = true;
            mediaElement.__bubbleWebAudioEntry = entry;
            this.webAudioEntries.push(entry);
        } catch (error) {
            console.warn('[AudioManager] Failed to connect media element:', error);
        }
    }

    applyWebAudioGain(entry) {
        const volume = this.getVolumeConfig() || { visual: 1, sfx: 1 };
        const typeMultiplier = entry.type === 'sfx' ? volume.sfx : volume.visual;
        entry.preGainNode.gain.value = typeMultiplier * this.profileGain(entry.path, entry.type);
    }

    createNativeAudio(path, options = {}) {
        const audio = new Audio(path);
        audio.loop = options.loop === true;
        audio.__bubbleBaseVolume = options.baseVolume ?? 1;
        const type = options.type || 'visual';
        const apply = () => this.applyNativeVolume(audio, {
            path,
            type,
            baseVolume: audio.__bubbleBaseVolume
        });
        apply();
        const entry = { el: audio, type, apply, detached: true };
        this.nativeEntries.push(entry);
        const release = () => this.releaseMediaElement(audio);
        audio.addEventListener?.('ended', release, { once: true });
        // BGM owners stop playback by clearing src and calling load(). That emits
        // `emptied`, not `ended`, so it must also release the global strong reference.
        audio.addEventListener?.('emptied', release, { once: true });
        return audio;
    }

    releaseMediaElement(mediaElement, options = {}) {
        if (!mediaElement) return false;
        const nativeCount = this.nativeEntries.length;
        const webCount = this.webAudioEntries.length;
        this.nativeEntries = this.nativeEntries.filter(item => item.el !== mediaElement);
        this.webAudioEntries = this.webAudioEntries.filter(entry => {
            if (entry.el !== mediaElement) return true;
            try { entry.sourceNode.disconnect(); } catch (error) {}
            try { entry.preGainNode.disconnect(); } catch (error) {}
            return false;
        });
        if (mediaElement.__bubbleWebAudioEntry) delete mediaElement.__bubbleWebAudioEntry;
        if (mediaElement.__webAudioConnected) delete mediaElement.__webAudioConnected;

        if (options.pause === true) {
            try { mediaElement.pause(); } catch (error) {}
        }
        if (options.unload === true) {
            try {
                mediaElement.removeAttribute?.('src');
                mediaElement.src = '';
                mediaElement.load?.();
            } catch (error) {}
        }
        return nativeCount !== this.nativeEntries.length || webCount !== this.webAudioEntries.length;
    }

    updateVolumes() {
        this.nativeEntries = this.nativeEntries.filter(item => {
            if (!item.el || (!item.detached && !document.body.contains(item.el)) || item.el.ended) return false;
            try { item.apply(); } catch (error) {
                console.warn('[MediaStaging] Failed to update native volume for element:', error);
            }
            return true;
        });
        this.webAudioEntries = this.webAudioEntries.filter(entry => {
            if (!entry.el || !document.body.contains(entry.el) || entry.el.ended) {
                try { entry.sourceNode.disconnect(); } catch (error) {}
                try { entry.preGainNode.disconnect(); } catch (error) {}
                if (entry.el?.__bubbleWebAudioEntry === entry) delete entry.el.__bubbleWebAudioEntry;
                if (entry.el?.__webAudioConnected) delete entry.el.__webAudioConnected;
                return false;
            }
            this.applyWebAudioGain(entry);
            return true;
        });
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for (const item of this.nativeEntries) {
            try { item.el.pause(); } catch (error) {}
        }
        for (const entry of this.webAudioEntries) {
            try { entry.sourceNode.disconnect(); } catch (error) {}
            try { entry.preGainNode.disconnect(); } catch (error) {}
        }
        this.nativeEntries = [];
        this.webAudioEntries = [];
    }
}
