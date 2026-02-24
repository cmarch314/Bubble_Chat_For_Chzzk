// [Class 6] System Controller (Toggles)
// ==========================================
class SystemController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.commands = {
            '!소리끄기': {
                action: () => {
                    this.eventBus.emit('system:muteAudio');
                },
                msg: "🔇 사운드 효과가 꺼졌습니다."
            },
            '!음소거': {
                action: () => {
                    this.eventBus.emit('system:muteAudio');
                },
                msg: "🔇 사운드 효과가 꺼졌습니다."
            },
            '!소리켜기': {
                action: () => {
                    this.eventBus.emit('system:unmuteAudio');
                },
                msg: "🔊 사운드 효과가 켜졌습니다."
            },
            '!사운드': {
                action: () => {
                    this.eventBus.emit('system:toggleAudio');
                    return "🔊 사운드 상태가 전환되었습니다.";
                },
                msg: ""
            },
            '!이펙트끄기': {
                action: () => {
                    this.eventBus.emit('system:disableVisuals');
                },
                msg: "🚫 비주얼 이펙트가 꺼졌습니다."
            },
            '!이펙트켜기': {
                action: () => {
                    this.eventBus.emit('system:enableVisuals');
                },
                msg: "✨ 비주얼 이펙트가 켜졌습니다."
            },
            '!비주얼': {
                action: () => {
                    this.eventBus.emit('system:toggleVisuals');
                    return "✨ 비주얼 이펙트 상태가 전환되었습니다.";
                },
                msg: ""
            },
            '!알람끄기': {
                action: () => {
                    this.eventBus.emit('system:disableAlerts');
                },
                msg: "🔔 알람(구독/후원) 이펙트가 꺼졌습니다."
            },
            '!알람켜기': {
                action: () => {
                    this.eventBus.emit('system:enableAlerts');
                },
                msg: "🔔 알람(구독/후원) 이펙트가 켜졌습니다."
            },
            '!전체끄기': {
                action: () => {
                    this.eventBus.emit('system:muteAudio');
                    this.eventBus.emit('system:disableVisuals');
                    this.eventBus.emit('system:disableAlerts');
                },
                msg: "🔒 모든 효과가 꺼졌습니다."
            },
            '!전체켜기': {
                action: () => {
                    this.eventBus.emit('system:unmuteAudio');
                    this.eventBus.emit('system:enableVisuals');
                    this.eventBus.emit('system:enableAlerts');
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
                    if (['켜기', '끄기', '도네', '채팅'].includes(cmd)) {
                        this.eventBus.emit('system:updateConfig', cmd);
                        return `🔊 볼륨 평준화 설정(${cmd})이 요청되었습니다.`;
                    }
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

        this.eventBus.emit('system:updateVolume', { [target]: value });
        return `🔊 [Sound] ${target.toUpperCase()} 볼륨이 ${value}로 설정되었습니다. (저장됨)`;
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
            if (confirmMsg) {
                this.eventBus.emit('chat:render', { ...msgData, message: confirmMsg });
            }
            return true;
        }
        return false;
    }
}

