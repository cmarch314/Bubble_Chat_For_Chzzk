'use strict';

class HuntMonsterProfileMotionRuntime {
    static bank() {
        if (typeof HUNT_MONSTER_PROFILE_KEYFRAMES !== 'undefined') return HUNT_MONSTER_PROFILE_KEYFRAMES;
        if (typeof require === 'function') return require('./data/MonsterProfileKeyframes.generated.js');
        return {};
    }

    static keyframes() { return this.bank().keyframes || this.bank(); }
    static profiles() { return this.bank().profiles || {}; }

    static animationName(profileId, pattern = {}, rig = 'generic') {
        if (profileId === 'close-strike') {
            if (['quadruped', 'herbivore'].includes(rig)) return 'monster-motion-close-strike-quadruped';
            if (rig === 'winged') return 'monster-motion-close-strike-winged';
            if (['serpentine', 'cephalopod'].includes(rig)) return 'monster-motion-close-strike-serpentine';
            if (rig === 'arthropod') return 'monster-motion-close-strike-arthropod';
        }
        if (pattern?.chargeLaunchStyle === 'stomp-burst') {
            if (profileId === 'ground-charge') return 'monster-motion-ground-charge-stomp-burst';
            if (profileId === 'ground-charge-double') return 'monster-motion-ground-charge-double-stomp-burst';
        }
        const bank = this.keyframes();
        const canonical = `monster-motion-${profileId}`;
        if (bank[canonical]) return canonical;
        if (bank[profileId]) return profileId;
        return null;
    }

    static frames(profileId, pattern = {}, rig = 'generic') {
        const name = this.animationName(profileId, pattern, rig);
        const frames = name ? this.keyframes()[name] : null;
        return Array.isArray(frames) ? frames.map(frame => ({ ...frame })) : null;
    }

    static timing(profileId) {
        const profile = this.profiles()[profileId] || {};
        return { easing: profile.easing || 'linear', origin: profile.origin || null };
    }
}

if (typeof window !== 'undefined') window.HuntMonsterProfileMotionRuntime = HuntMonsterProfileMotionRuntime;
if (typeof module !== 'undefined') module.exports = HuntMonsterProfileMotionRuntime;
