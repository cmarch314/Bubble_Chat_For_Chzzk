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
            execute(context) {
                return this.instance.execute(context);
            }
        };
        return this;
    }

    static createDefault(director) {
        return new EffectRegistry()
            .register('usho', '우쇼', new UshoEffect(director))
            .register('skull', '해골', new SkullEffect(director))
            .register('couple', '커플', new CoupleEffect(director))
            .register('vergil', '버질', new VergilEffect(director))
            .register('dolphin', '돌핀', new DolphinEffect(director))
            .register('valstrax', '발파', new ValstraxEffect(director))
            .register('bangjong', '방종송', new BangjongEffect(director))
            .register('dango', '당고', new DangoEffect(director))
            .register('king', '몬창왕', new KingEffect(director))
            .register('godsong', '갓겜송', new GodsongEffect(director))
            .register('gazabu', '가자부송', new GazabuEffect(director))
            .register('mulsulsan', '물설산', new MulsulsanEffect(director))
            .register('random_dance', '랜덤댄스', new RandomDanceEffect(director))
            .register('sound_quiz', null, new SoundQuizEffect(director), { kind: 'game' })
            .register('racing', null, new RacingEffect(director), { kind: 'game' })
            .register('raid', null, new RaidEffect(director), { kind: 'game' })
            .register('hunt', null, new HuntEffect(director), { kind: 'game' })
            .register('game_help', null, new GameHelpEffect(director), { kind: 'system' })
            .register('commands_scroll', null, new CommandsScrollEffect(director), { kind: 'system' });
    }
}
