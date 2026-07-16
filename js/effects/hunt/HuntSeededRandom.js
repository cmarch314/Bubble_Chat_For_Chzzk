class HuntSeededRandom {
    constructor(seed = 1) {
        this.state = Number(seed) >>> 0;
    }

    next() {
        this.state = (this.state + 0x6D2B79F5) >>> 0;
        let value = this.state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntSeededRandom;
else window.HuntSeededRandom = HuntSeededRandom;
