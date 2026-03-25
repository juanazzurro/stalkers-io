class Projectile {
    constructor(x, y, vx, vy, damage, range, type, color, owner, aoeRadius) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.maxRange = range;
        this.distanceTraveled = 0;
        this.type = type;
        this.color = color;
        this.owner = owner;
        this.dead = false;
        this.angle = 0;
        this.trail = [];
        this.speed = Math.sqrt(vx * vx + vy * vy);
        this.aoeRadius = aoeRadius || 0;
        this.pierceLeft = 0;
        this.hitTargets = new Set();
    }

    update(mapWidth, mapHeight) {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.distanceTraveled += this.speed;

        if (this.type === 'bottle') this.angle += 0.2;

        if (this.distanceTraveled >= this.maxRange) this.dead = true;
        if (this.x < 0 || this.x > mapWidth || this.y < 0 || this.y > mapHeight) this.dead = true;
    }

    draw(ctx) {
        if (this.type === 'vomit') this.drawVomit(ctx);
        else if (this.type === 'bottle') this.drawBottle(ctx);
        else if (this.type === 'shell') this.drawShell(ctx);
        else if (this.type === 'poop') this.drawPoop(ctx);
        else if (this.type === 'bullet') this.drawBullet(ctx);
        else if (this.type === 'rpg') this.drawRpg(ctx);
        else if (this.type === 'sniper_round') this.drawSniperRound(ctx);
    }

    drawTrail(ctx, color, baseRadius) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / (this.trail.length + 1) * 0.5;
            const radius = baseRadius * (0.5 + (i / this.trail.length) * 0.5);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawVomit(ctx) {
        this.drawTrail(ctx, '#39ff14', 5);
        ctx.fillStyle = '#39ff14';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y - 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBottle(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(-4, -8, 8, 16);
        ctx.fillRect(-2, -12, 4, 4);
        ctx.restore();
    }

    drawShell(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / (this.trail.length + 1) * 0.3;
            const radius = 6 + (i / this.trail.length) * 4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#999';
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPoop(ctx) {
        this.drawTrail(ctx, '#a0522d', 4);
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBullet(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRpg(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            ctx.globalAlpha = (i + 1) / (this.trail.length + 1) * 0.3;
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSniperRound(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillStyle = this.color;
        ctx.fillRect(-6, -1.5, 12, 3);
        ctx.restore();
    }
}
