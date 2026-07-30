class EffectRegistry {
    constructor() {
        this.entries = Object.create(null);
    }

    register(key, soundKey, instance, options = {}) {
        if (!key) throw new Error('Effect key is required.');
        if (this.entries[key]) throw new Error(`Duplicate effect key: ${key}`);
        if (!instance || typeof instance.execute !== 'function') {
            throw new Error(`Effect '${key}' must implement execute(context).`);
        }

        this.entries[key] = {
            key,
            soundKey: soundKey || null,
            kind: options.kind || 'visual',
            instance,
            async execute(context) {
                this.instance.beginExecution?.();
                try {
                    return await this.instance.execute(context);
                } finally {
                    this.instance.endExecution?.();
                }
            }
        };
        return this;
    }

    static createDefault(director) {
        return new EffectRegistry()
            .register('usho', '우쇼', new LazyFeatureEffect(director, 'usho'))
            .register('skull', '해골', new LazyFeatureEffect(director, 'skull'))
            .register('couple', '커플', new LazyFeatureEffect(director, 'couple'))
            .register('vergil', '버질', new LazyFeatureEffect(director, 'vergil'))
            .register('dolphin', '돌핀', new LazyFeatureEffect(director, 'dolphin'))
            .register('valstrax', '발파', new LazyFeatureEffect(director, 'valstrax'))
            .register('bangjong', '방종송', new LazyFeatureEffect(director, 'bangjong'))
            .register('dango', '당고', new LazyFeatureEffect(director, 'dango'))
            .register('king', '몬창왕', new LazyFeatureEffect(director, 'king'))
            .register('godsong', '갓겜송', new LazyFeatureEffect(director, 'godsong'))
            .register('gazabu', '가자부송', new LazyFeatureEffect(director, 'gazabu'))
            .register('mulsulsan', '물설산', new LazyFeatureEffect(director, 'mulsulsan'))
            .register('random_dance', '랜덤댄스', new LazyFeatureEffect(director, 'random_dance'))
            .register('sound_quiz', null, new LazyFeatureEffect(director, 'sound_quiz', { captureChat: true }), { kind: 'game' })
            .register('racing', null, new LazyFeatureEffect(director, 'racing', { captureChat: true }), { kind: 'game' })
            .register('raid', null, new LazyFeatureEffect(director, 'raid', { captureChat: true }), { kind: 'game' })
            .register('hunt', null, new LazyHuntEffect(director), { kind: 'game' })
            .register('game_help', null, new LazyFeatureEffect(director, 'game_help'), { kind: 'system' })
            .register('commands_scroll', null, new LazyFeatureEffect(director, 'commands_scroll', { captureChat: true }), { kind: 'system' });
    }
}
