class Player {
    constructor(charData, mapWidth, mapHeight) {
        this.data = charData;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.x = mapWidth / 2;
        this.y = mapHeight / 2;
        this.hp = charData.hp;
        this.maxHp = charData.hp;
        this.level = 1;
        this.xp = 0;
        this.angle = 0;
        this.fireCooldown = 0;
        this.size = charData.hitboxRadius;
        this.upgrades = new UpgradeSystem();
        this.levelUpPending = false;
        this.recalcStats();
    }

    recalcStats() {
        const u = this.upgrades;
        this.maxHp = this.data.hp + u.getMultiplier('maxHP');
        this.effectiveSpeed = this.data.speed * u.getMultiplier('moveSpeed');
        this.effectiveDamage = this.data.damage * u.getMultiplier('damage');
        this.effectiveFireRate = this.data.fireRate * u.getMultiplier('fireRate');
        this.effectiveRange = this.data.range * u.getMultiplier('range');
        this.effectiveProjSpeed = 8 * u.getMultiplier('projectileSpeed');
        this.penetration = Math.floor(u.getMultiplier('penetration'));
        this.regen = u.getMultiplier('regen');
    }

    xpToLevel() {
        return Math.floor(100 * Math.pow(this.level, 1.3));
    }

    addXP(amount) {
        if (this.level >= 30) return;
        if (this.data.passiveXPBonus) amount *= (1 + this.data.passiveXPBonus);
        this.xp += amount;
        const required = this.xpToLevel();
        if (this.xp >= required) {
            this.xp -= required;
            this.level++;
            this.levelUpPending = true;
        }
    }

    update(dir, mouseWorld, dt) {
        let speed = this.effectiveSpeed;
        if (this.data.passiveSpeedBoost && this.hp / this.maxHp < 0.3) {
            speed *= (1 + this.data.passiveSpeedBoost);
        }

        this.x += dir.x * speed;
        this.y += dir.y * speed;

        this.x = Math.max(this.size, Math.min(this.mapWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.mapHeight - this.size, this.y));

        this.angle = Math.atan2(mouseWorld.y - this.y, mouseWorld.x - this.x);

        if (this.fireCooldown > 0) this.fireCooldown -= dt;

        // Regen
        if (this.regen > 0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.regen * dt / 1000);
        }
    }

    tryShoot(targetX, targetY) {
        if (this.fireCooldown > 0) return null;

        this.fireCooldown = 1000 / this.effectiveFireRate;

        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const range = this.effectiveRange * 60;

        const proj = new Projectile(
            this.x + Math.cos(angle) * (this.size + 5),
            this.y + Math.sin(angle) * (this.size + 5),
            Math.cos(angle) * this.effectiveProjSpeed,
            Math.sin(angle) * this.effectiveProjSpeed,
            this.effectiveDamage,
            range,
            this.data.projectileType,
            this.data.projectileColor,
            this,
            this.data.aoeRadius || 0
        );
        proj.pierceLeft = this.penetration;
        return proj;
    }

    draw(ctx) {
        const type = this.data.projectileType;
        if (type === 'vomit') this.drawMutant(ctx);
        else if (type === 'bottle') this.drawOligarch(ctx);
        else if (type === 'shell') this.drawTank(ctx);
        else if (type === 'poop') this.drawBear(ctx);
        this.drawHPBar(ctx);
    }

    drawMutant(ctx) {
        // Body
        ctx.fillStyle = '#2d8a2d';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Protuberances
        ctx.fillStyle = '#1a6b1a';
        for (let i = 0; i < 4; i++) {
            const a = this.angle + (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(a) * (this.size - 2),
                this.y + Math.sin(a) * (this.size - 2),
                7, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Red glowing eyes
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff0000';
        for (const offset of [-0.3, 0.3]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(this.angle + offset) * 8,
                this.y + Math.sin(this.angle + offset) * 8,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    drawOligarch(ctx) {
        // Body (suit)
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Hair (back of head)
        ctx.fillStyle = '#111';
        const backAngle = this.angle + Math.PI;
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(backAngle) * 4,
            this.y + Math.sin(backAngle) * 4,
            this.size * 0.6, backAngle - 0.8, backAngle + 0.8
        );
        ctx.fill();

        // Gold chain
        ctx.fillStyle = '#ffd700';
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();

        // Eyes
        ctx.fillStyle = '#ddd';
        for (const offset of [-0.35, 0.35]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(this.angle + offset) * 9,
                this.y + Math.sin(this.angle + offset) * 9,
                2.5, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawTank(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Body
        ctx.fillStyle = '#4a5a2a';
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);

        // Tracks
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, 5);
        ctx.fillRect(-this.size, this.size * 0.6 - 5, this.size * 2, 5);

        // Turret base
        ctx.fillStyle = '#5a6a3a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Barrel
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(10, -3, this.size, 6);

        ctx.restore();
    }

    drawBear(ctx) {
        // Ears (behind body)
        ctx.fillStyle = '#6b3410';
        const backAngle = this.angle + Math.PI;
        for (const offset of [-0.5, 0.5]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(backAngle + offset) * (this.size + 2),
                this.y + Math.sin(backAngle + offset) * (this.size + 2),
                8, 0, Math.PI * 2
            );
            ctx.fill();
        }
        // Inner ears
        ctx.fillStyle = '#d4956a';
        for (const offset of [-0.5, 0.5]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(backAngle + offset) * (this.size + 2),
                this.y + Math.sin(backAngle + offset) * (this.size + 2),
                4, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle
        ctx.fillStyle = '#c49a6c';
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 10,
            this.y + Math.sin(this.angle) * 10,
            10, 0, Math.PI * 2
        );
        ctx.fill();

        // Nose
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 16,
            this.y + Math.sin(this.angle) * 16,
            3, 0, Math.PI * 2
        );
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111';
        for (const offset of [-0.4, 0.4]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(this.angle + offset) * 13,
                this.y + Math.sin(this.angle + offset) * 13,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Fez hat
        ctx.save();
        const fezX = this.x + Math.cos(backAngle) * 5;
        const fezY = this.y + Math.sin(backAngle) * 5;
        ctx.translate(fezX, fezY);
        ctx.rotate(this.angle - Math.PI / 2);
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.moveTo(-7, 5);
        ctx.lineTo(0, -10);
        ctx.lineTo(7, 5);
        ctx.closePath();
        ctx.fill();
        // Tassel
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawHPBar(ctx) {
        if (this.hp >= this.maxHp) return;
        const barWidth = 40;
        const barHeight = 4;
        const barY = this.y - this.size - 12;

        ctx.fillStyle = '#555';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);

        ctx.fillStyle = '#ff0000';
        const fillWidth = (this.hp / this.maxHp) * barWidth;
        ctx.fillRect(this.x - barWidth / 2, barY, fillWidth, barHeight);
    }
}
