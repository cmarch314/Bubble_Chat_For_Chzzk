// ==========================================
// [Class 1.5] Event Bus (Pub/Sub)
// ==========================================
class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * 특정 이벤트에 리스너(콜백)를 등록합니다.
     * @param {string} event - 이벤트 이름 (예: 'chat:received')
     * @param {function} callback - 실행할 함수
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * 특정 이벤트의 리스너를 해제합니다.
     * @param {string} event 
     * @param {function} callback 
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * 이벤트를 발생시키고 등록된 모든 리스너에게 데이터를 전달합니다.
     * @param {string} event - 이벤트 이름
     * @param  {...any} args - 리스너에게 전달할 인자들
     */
    emit(event, ...args) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error in listener for event '${event}':`, error);
            }
        });
    }
}
