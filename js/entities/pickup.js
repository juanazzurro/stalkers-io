const PICKUP_TYPES = {
    VODKA: {
        name: 'Vodka',
        color: '#ddeeff',
        glowColor: '#88ff88',
        duration: 0,
    },
    RED_STAR: {
        name: 'Red Star',
        color: '#ff2222',
        glowColor: '#ffd700',
        duration: 10000,
    },
    USHANKA: {
        name: 'Ushanka',
        color: '#8B5A2B',
        glowColor: '#ffd700',
        duration: 3000,
    },
    AMMO_CRATE: {
        name: 'Ammo Crate',
        color: '#337733',
        glowColor: '#44ff44',
        duration: 8000,
    }
};

const PICKUP_KEYS = Object.keys(PICKUP_TYPES);

class Pickup {
    constructor(type, x, y) {
        this.type = type;
        this.data = PICKUP_TYPES[type];
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.time = Math.random() * 6000;
        this.collected = false;
    }

    update(dt) {
        this.time += dt;
    }

    draw(ctx) {
        const floatY = Math.sin(this.time * 0.003) * 2;
        const rotation = this.time * 0.001;
        const glowPulse = 0.4 + Math.sin(this.time * 0.005) * 0.3;

        ctx.save();
        ctx.translate(this.x, this.y + floatY);

        // Glow
        ctx.shadowColor = this.data.glowColor;
        ctx.shadowBlur = 12 * glowPulse;

        // Background circle
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 8 * glowPulse;

        switch (this.type) {
            case 'VODKA': this.drawVodka(ctx, rotation); break;
            case 'RED_STAR': this.drawRedStar(ctx, rotation); break;
            case 'USHANKA': this.drawUshanka(ctx, rotation); break;
            case 'AMMO_CRATE': this.drawAmmoCrate(ctx, rotation); break;
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawVodka(ctx) {
        // Bottle shape
        ctx.fillStyle = '#ddeeff';
        ctx.fillRect(-4, -10, 8, 16);
        // Neck
        ctx.fillRect(-2, -14, 4, 5);
        // Cap
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-3, -15, 6, 3);
        // Label
        ctx.fillStyle = '#aaccee';
        ctx.fillRect(-3, -4, 6, 6);
    }

    drawRedStar(ctx, rotation) {
        ctx.save();
        ctx.rotate(rotation);
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
            const outerX = Math.cos(angle) * 12;
            const outerY = Math.sin(angle) * 12;
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * 5;
            const innerY = Math.sin(innerAngle) * 5;
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawUshanka(ctx) {
        // Main hat body (semicircle)
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.arc(0, -2, 10, Math.PI, 0);
        ctx.fill();
        // Top
        ctx.fillRect(-10, -4, 20, 4);
        // Ear flaps
        ctx.fillStyle = '#6B3A1B';
        ctx.fillRect(-12, -4, 5, 12);
        ctx.fillRect(7, -4, 5, 12);
        // Fur trim
        ctx.fillStyle = '#d4b896';
        ctx.fillRect(-12, -6, 24, 4);
        // Star badge
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.arc(0, -7, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAmmoCrate(ctx) {
        // Box
        ctx.fillStyle = '#337733';
        ctx.fillRect(-10, -8, 20, 16);
        ctx.strokeStyle = '#225522';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -8, 20, 16);
        // Cross
        ctx.strokeStyle = '#88ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
    }

    static randomType() {
        return PICKUP_KEYS[Math.floor(Math.random() * PICKUP_KEYS.length)];
    }
}
