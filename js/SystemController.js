// [Class 6] System Controller (Toggles)
// ==========================================
class SystemController {
    constructor(audio, visual, renderer) {
        this.audio = audio;
        this.visual = visual;
        this.renderer = renderer;
        this.commands = {
            '!소리끄기': {
                action: () => {
                    this.audio.setEnabled(false);
                    this.audio.playSound(window.soundHive['윈도우종료'], { force: true });
                },
                msg: "🔇 사운드 효과가 꺼졌습니다."
            },
            '!음소거': {
                action: () => {
                    this.audio.setEnabled(false);
                    this.audio.playSound(window.soundHive['윈도우종료'], { force: true });
                },
                msg: "🔇 사운드 효과가 꺼졌습니다."
            },
            '!소리켜기': { action: () => this.audio.setEnabled(true), msg: "🔊 사운드 효과가 켜졌습니다." },
            '!사운드': {
                action: () => {
                    const next = !this.audio.enabled;
                    this.audio.setEnabled(next);
                    if (!next) {
                        this.audio.playSound(window.soundHive['윈도우종료'], { force: true });
                    }
                    return next ? "🔊 사운드 효과가 켜졌습니다." : "🔇 사운드 효과가 꺼졌습니다.";
                },
                msg: ""
            },
            '!이펙트끄기': { action: () => this.visual.setEnabled(false), msg: "🚫 비주얼 이펙트가 꺼졌습니다." },
            '!이펙트켜기': { action: () => this.visual.setEnabled(true), msg: "✨ 비주얼 이펙트가 켜졌습니다." },
            '!비주얼': {
                action: () => {
                    const next = !this.visual.enabled;
                    this.visual.setEnabled(next);
                    return next ? "✨ 비주얼 이펙트가 켜졌습니다." : "🚫 비주얼 이펙트가 꺼졌습니다.";
                },
                msg: ""
            },
            '!알람끄기': { action: () => this.visual.setAlertsEnabled(false), msg: "🔔 알람(구독/후원) 이펙트가 꺼졌습니다." },
            '!알람켜기': { action: () => this.visual.setAlertsEnabled(true), msg: "🔔 알람(구독/후원) 이펙트가 켜졌습니다." },
            '!전체끄기': {
                action: () => {
                    this.audio.setEnabled(false);
                    this.visual.setEnabled(false);
                    this.visual.setAlertsEnabled(false);
                    this.audio.playSound(window.soundHive['윈도우종료'], { force: true });
                },
                msg: "🔒 모든 효과가 꺼졌습니다."
            },
            '!전체켜기': {
                action: () => {
                    this.audio.setEnabled(true);
                    this.visual.setEnabled(true);
                    this.visual.setAlertsEnabled(true);
                },
                msg: "🔓 모든 효과가 켜졌습니다."
            },
            '!데모': {
                action: (args) => {
                    if (args[0] === '끝' || args[0] === '중단') {
                        window.stopDemoSequence();
                        return "🎬 데모를 중단합니다.";
                    }
                    const duration = args[0] ? parseInt(args[0], 10) : 60;
                    window.runDemoSequence(duration);
                    if (args[0]) return `🎬 ${args[0]}초간 데모 모드를 실행합니다.`;
                    return "🎬 데모 모드를 실행합니다.";
                },
                msg: "🎬 데모 모드를 실행합니다."
            },
            '!볼륨평준화': {
                action: (args) => {
                    const cmd = args[0];
                    if (cmd === '켜기') return this.audio.updateConfig('all', true);
                    if (cmd === '끄기') return this.audio.updateConfig('all', false);
                    if (cmd === '도네') return this.audio.updateConfig('visual');
                    if (cmd === '채팅') return this.audio.updateConfig('sfx');
                    return "❓ 사용법: !볼륨평준화 [켜기/끄기/도네/채팅]";
                },
                msg: ""
            },
            // [New] Volume Control (Streamer Only)
            // Usage: set sfx 0.5 | !set visual 1.0
            'set': {
                action: (args) => this._handleSetVolume(args),
                msg: ""
            },
            '!set': {
                action: (args) => this._handleSetVolume(args),
                msg: ""
            }
        };
    }

    // [Helper] Volume Control Logic
    _handleSetVolume(args) {
        if (args.length < 2) return "❓ 사용법: set [sfx/visual/master] [0.0~1.0]";

        const target = args[0].toLowerCase();
        const value = parseFloat(args[1]);

        if (!['sfx', 'visual', 'master'].includes(target)) return "🚫 대상은 sfx, visual, master 중 하나여야 합니다.";
        if (isNaN(value) || value < 0 || value > 2.0) return "🚫 값은 0.0 ~ 2.0 사이의 숫자여야 합니다.";

        // Update AudioManager
        if (this.audio && this.audio.volumeConfig) {
            this.audio.updateVolumeConfig({ [target]: value });

            // Persist to LocalStorage
            try {
                const current = JSON.parse(localStorage.getItem('HIVE_VOLUME_CONFIG') || "{}");
                current[target] = value;
                localStorage.setItem('HIVE_VOLUME_CONFIG', JSON.stringify(current));

                // Update Global Config (for reference)
                if (!window.HIVE_VOLUME_CONFIG) window.HIVE_VOLUME_CONFIG = {};
                window.HIVE_VOLUME_CONFIG[target] = value;

            } catch (e) {
                console.error("Save Failed:", e);
            }

            return `🔊 [Sound] ${target.toUpperCase()} 볼륨이 ${value}로 설정되었습니다. (저장됨)`;
        }
        return "🚫 오디오 매니저를 찾을 수 없습니다.";
    }

    handle(msgData) {
        if (!msgData.isStreamer) return false;
        const fullCmd = msgData.message.trim();
        const parts = fullCmd.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        const config = this.commands[cmd];
        if (config) {
            const resultMsg = config.action(args);
            const confirmMsg = resultMsg || config.msg;
            this.renderer.render({ ...msgData, message: confirmMsg });
            return true;
        }
        return false;
    }
}

