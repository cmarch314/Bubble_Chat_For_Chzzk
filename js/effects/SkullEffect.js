class SkullEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().skull) ? this.config.getVisualConfig().skull : {
            duration: 8000,
            floatingTextDuration: 4000
        };
        return this.director._genericSkullLikeEffect('skull-overlay', '!해골', 'skull-style', 'skull-emoji', context, conf);
    }
}
