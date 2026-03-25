class LevelUpUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.options = [];
        this.upgradeSystem = null;
        this.hoveredCard = -1;
        this.selectedCard = -1;
        this.active = false;

        this.cardW = 180;
        this.cardH = 250;
        this.cardGap = 20;

        this.onMouseMove = this.handleMouseMove.bind(this);
        this.onClick = this.handleClick.bind(this);
    }

    show(options, upgradeSystem) {
        this.options = options;
        this.upgradeSystem = upgradeSystem;
        this.hoveredCard = -1;
        this.selectedCard = -1;
        this.active = true;
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('click', this.onClick);
    }

    hide() {
        this.active = false;
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('click', this.onClick);
    }

    getCardRect(index) {
        const total = this.options.length * this.cardW + (this.options.length - 1) * this.cardGap;
        const sx = (this.canvas.width - total) / 2;
        const sy = (this.canvas.height - this.cardH) / 2;
        return {
            x: sx + index * (this.cardW + this.cardGap),
            y: sy,
            w: this.cardW,
            h: this.cardH
        };
    }

    handleMouseMove(e) {
        this.hoveredCard = -1;
        for (let i = 0; i < this.options.length; i++) {
            const r = this.getCardRect(i);
            if (e.clientX >= r.x && e.clientX <= r.x + r.w &&
                e.clientY >= r.y && e.clientY <= r.y + r.h) {
                this.hoveredCard = i;
                break;
            }
        }
    }

    handleClick() {
        if (this.hoveredCard >= 0) {
            this.selectedCard = this.hoveredCard;
        }
    }

    getSelected() {
        if (this.selectedCard >= 0) return this.options[this.selectedCard];
        return null;
    }

    draw(ctx) {
        if (!this.active) return;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        ctx.save();
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillText('LEVEL UP!', this.canvas.width / 2, this.getCardRect(0).y - 30);
        ctx.shadowBlur = 0;
        ctx.restore();

        for (let i = 0; i < this.options.length; i++) {
            this.drawCard(ctx, i);
        }
    }

    drawCard(ctx, index) {
        const key = this.options[index];
        const stat = this.upgradeSystem.stats[key];
        const r = this.getCardRect(index);
        const hovered = index === this.hoveredCard;

        let borderColor = stat.color;

        ctx.save();

        if (hovered) {
            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;
            ctx.translate(cx, cy);
            ctx.scale(1.08, 1.08);
            ctx.translate(-cx, -cy);
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 20;
        }

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(r.x, r.y, r.w, r.h);

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = hovered ? 3 : 2;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.shadowBlur = 0;

        // Icon
        ctx.font = 'bold 40px monospace';
        ctx.fillStyle = borderColor;
        ctx.textAlign = 'center';
        ctx.fillText(stat.icon, r.x + r.w / 2, r.y + 65);

        // Name
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(stat.name, r.x + r.w / 2, r.y + 105);

        // Level transition
        ctx.font = '14px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('LVL ' + stat.level + ' \u2192 ' + (stat.level + 1), r.x + r.w / 2, r.y + 135);

        // Effect
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#7f7';
        ctx.fillText(this.upgradeSystem.getDescription(key), r.x + r.w / 2, r.y + 175);

        // Level pips
        const pipY = r.y + r.h - 30;
        const pipW = 16;
        const pipGap = 4;
        const totalPipW = stat.max * pipW + (stat.max - 1) * pipGap;
        const pipSX = r.x + (r.w - totalPipW) / 2;
        for (let j = 0; j < stat.max; j++) {
            ctx.fillStyle = j < stat.level ? borderColor : (j === stat.level ? '#fff' : '#333');
            ctx.fillRect(pipSX + j * (pipW + pipGap), pipY, pipW, 8);
        }

        ctx.restore();
    }
}
