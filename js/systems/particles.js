class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            const angle = config.angle !== undefined
                ? config.angle + (Math.random() - 0.5) * (config.spread || 0)
                : Math.random() * Math.PI * 2;
            const speed = (config.speed || 2) * (0.5 + Math.random());
            this.particles.push({
                x: x + (Math.random() - 0.5) * (config.offsetX || 0),
                y: y + (Math.random() - 0.5) * (config.offsetY || 0),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: (config.life || 500) * (0.7 + Math.random() * 0.6),
                maxLife: config.life || 500,
                size: (config.size || 3) * (0.6 + Math.random() * 0.8),
                color: config.color || '#fff',
                gravity: config.gravity || 0,
                shrink: config.shrink !== false
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt / 16;
            p.y += p.vy * dt / 16;
            p.vy += p.gravity * dt / 16;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            const ratio = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = ratio;
            ctx.fillStyle = p.color;
            const s = p.shrink ? p.size * ratio : p.size;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, s), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    clear() {
        this.particles = [];
    }
}
