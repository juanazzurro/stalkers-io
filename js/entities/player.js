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
        this.time = 0;

        // Ability system
        this.abilityCooldown = 0;
        this.toxicPool = null;
        this.rublesZone = null;
        this.charging = false;
        this.invulnerable = false;
        this.chargeVx = 0;
        this.chargeVy = 0;
        this.chargeTimer = 0;
        this.chargeHitEnemies = new Set();

        const type = charData.projectileType;
        if (type === 'vomit') { this.abilityMaxCooldown = 15000; }
        else if (type === 'bottle') { this.abilityMaxCooldown = 20000; }
        else if (type === 'shell') { this.abilityMaxCooldown = 25000; }
        else if (type === 'poop') { this.abilityMaxCooldown = 12000; }
        else { this.abilityMaxCooldown = 15000; }

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

    tryAbility(mouseWorld) {
        if (this.abilityCooldown > 0) return null;
        this.abilityCooldown = this.abilityMaxCooldown;

        const type = this.data.projectileType;

        if (type === 'vomit') {
            this.toxicPool = { x: this.x, y: this.y, timer: 0, duration: 5000, radius: 100 };
            return 'toxicPool';
        }
        if (type === 'bottle') {
            this.rublesZone = { x: this.x, y: this.y, timer: 0, duration: 3000, radius: 150 };
            return 'rubles';
        }
        if (type === 'shell') {
            const angle = Math.atan2(mouseWorld.y - this.y, mouseWorld.x - this.x);
            const chargeSpeed = this.effectiveSpeed * 4;
            this.chargeVx = Math.cos(angle) * chargeSpeed;
            this.chargeVy = Math.sin(angle) * chargeSpeed;
            this.charging = true;
            this.invulnerable = true;
            this.chargeTimer = 1500;
            this.chargeHitEnemies = new Set();
            return 'charge';
        }
        if (type === 'poop') {
            return 'roar';
        }
        return null;
    }

    update(dir, mouseWorld, dt) {
        this.time += dt;

        // Cooldown
        if (this.abilityCooldown > 0) this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);

        // Tank charge
        if (this.charging) {
            this.x += this.chargeVx;
            this.y += this.chargeVy;
            this.x = Math.max(this.size, Math.min(this.mapWidth - this.size, this.x));
            this.y = Math.max(this.size, Math.min(this.mapHeight - this.size, this.y));
            this.chargeTimer -= dt;
            if (this.chargeTimer <= 0) {
                this.charging = false;
                this.invulnerable = false;
            }
            this.angle = Math.atan2(this.chargeVy, this.chargeVx);
            if (this.fireCooldown > 0) this.fireCooldown -= dt;
            return;
        }

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

        // Toxic pool timer
        if (this.toxicPool) {
            this.toxicPool.timer += dt;
            if (this.toxicPool.timer >= this.toxicPool.duration) this.toxicPool = null;
        }

        // Rubles zone timer
        if (this.rublesZone) {
            this.rublesZone.timer += dt;
            if (this.rublesZone.timer >= this.rublesZone.duration) this.rublesZone = null;
        }
    }

    tryShoot(targetX, targetY) {
        if (this.fireCooldown > 0) return null;
        if (this.charging) return null;

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
        // Passive visuals (behind character)
        this.drawPassiveEffects(ctx);

        // Ability zone visuals (behind character)
        this.drawAbilityZones(ctx);

        const type = this.data.projectileType;
        if (type === 'vomit') this.drawMutant(ctx);
        else if (type === 'bottle') this.drawOligarch(ctx);
        else if (type === 'shell') this.drawTank(ctx);
        else if (type === 'poop') this.drawBear(ctx);
        this.drawHPBar(ctx);
    }

    drawPassiveEffects(ctx) {
        // Mutant radiation aura
        if (this.data.passiveRadius) {
            const pulse = 0.15 + Math.sin(this.time * 0.004) * 0.08;
            ctx.fillStyle = 'rgba(57, 255, 20, ' + pulse + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.data.passiveRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(57, 255, 20, ' + (pulse + 0.05) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.data.passiveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Bear low HP visual
        if (this.data.passiveSpeedBoost && this.hp / this.maxHp < 0.3) {
            // Red claw marks on sides
            ctx.strokeStyle = '#ff2200';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 6;
            const perpAngle = this.angle + Math.PI / 2;
            for (const side of [-1, 1]) {
                const bx = this.x + Math.cos(perpAngle) * side * (this.size + 8);
                const by = this.y + Math.sin(perpAngle) * side * (this.size + 8);
                for (let c = -1; c <= 1; c++) {
                    ctx.beginPath();
                    const offset = c * 4;
                    ctx.moveTo(bx + Math.cos(this.angle) * (offset - 5), by + Math.sin(this.angle) * (offset - 5));
                    ctx.lineTo(bx + Math.cos(this.angle) * (offset + 5), by + Math.sin(this.angle) * (offset + 5));
                    ctx.stroke();
                }
            }
            ctx.shadowBlur = 0;
        }
    }

    drawAbilityZones(ctx) {
        // Toxic pool
        if (this.toxicPool) {
            const p = this.toxicPool;
            const fade = p.timer > p.duration - 1000 ? (p.duration - p.timer) / 1000 : 1;
            ctx.fillStyle = 'rgba(30, 180, 30, ' + (0.2 * fade) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Concentric waves
            const waveCount = 3;
            for (let i = 0; i < waveCount; i++) {
                const phase = ((this.time * 0.002 + i / waveCount) % 1);
                ctx.strokeStyle = 'rgba(57, 255, 20, ' + ((1 - phase) * 0.3 * fade) + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * phase, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Bubbles
            for (let i = 0; i < 5; i++) {
                const bPhase = ((this.time * 0.001 + i * 0.2) % 1);
                const bAngle = i * 1.256;
                const bDist = p.radius * 0.6 * Math.random();
                const bx = p.x + Math.cos(bAngle) * bDist;
                const by = p.y + Math.sin(bAngle) * bDist - bPhase * 20;
                ctx.fillStyle = 'rgba(57, 255, 20, ' + ((1 - bPhase) * 0.5 * fade) + ')';
                ctx.beginPath();
                ctx.arc(bx, by, 2 + bPhase * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Rubles zone
        if (this.rublesZone) {
            const rz = this.rublesZone;
            const fade = rz.timer > rz.duration - 500 ? (rz.duration - rz.timer) / 500 : 1;
            ctx.fillStyle = 'rgba(0, 100, 0, ' + (0.12 * fade) + ')';
            ctx.beginPath();
            ctx.arc(rz.x, rz.y, rz.radius, 0, Math.PI * 2);
            ctx.fill();

            // Falling bills
            for (let i = 0; i < 12; i++) {
                const seed = i * 137.5;
                const bx = rz.x + Math.cos(seed) * (rz.radius * 0.7 * ((i % 3 + 1) / 3));
                const fallY = ((this.time * 0.05 + seed) % (rz.radius * 2)) - rz.radius;
                const by = rz.y + fallY;
                const dist = Math.sqrt((bx - rz.x) ** 2 + (by - rz.y) ** 2);
                if (dist > rz.radius) continue;
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(Math.sin(this.time * 0.003 + i) * 0.5);
                ctx.fillStyle = 'rgba(50, 160, 50, ' + (0.7 * fade) + ')';
                ctx.fillRect(-5, -3, 10, 6);
                ctx.fillStyle = 'rgba(80, 200, 80, ' + (0.9 * fade) + ')';
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', 0, 0);
                ctx.restore();
            }
        }
    }

    drawMutant(ctx) {
        ctx.fillStyle = '#2d8a2d';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

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
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        const backAngle = this.angle + Math.PI;
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(backAngle) * 4,
            this.y + Math.sin(backAngle) * 4,
            this.size * 0.6, backAngle - 0.8, backAngle + 0.8
        );
        ctx.fill();

        ctx.fillStyle = '#ffd700';
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();

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
        // Charge trail
        if (this.charging) {
            ctx.fillStyle = 'rgba(100, 80, 60, 0.3)';
            const backAngle = this.angle + Math.PI;
            for (let i = 0; i < 5; i++) {
                const tx = this.x + Math.cos(backAngle) * (20 + i * 15) + (Math.random() - 0.5) * 10;
                const ty = this.y + Math.sin(backAngle) * (20 + i * 15) + (Math.random() - 0.5) * 10;
                ctx.beginPath();
                ctx.arc(tx, ty, 6 + i * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#4a5a2a';
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);

        ctx.fillStyle = '#333';
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, 5);
        ctx.fillRect(-this.size, this.size * 0.6 - 5, this.size * 2, 5);

        ctx.fillStyle = '#5a6a3a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(10, -3, this.size, 6);

        ctx.restore();

        // Invulnerability glow
        if (this.invulnerable) {
            ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawBear(ctx) {
        const lowHP = this.data.passiveSpeedBoost && this.hp / this.maxHp < 0.3;

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

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c49a6c';
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 10,
            this.y + Math.sin(this.angle) * 10,
            10, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 16,
            this.y + Math.sin(this.angle) * 16,
            3, 0, Math.PI * 2
        );
        ctx.fill();

        // Eyes — glow red when low HP
        if (lowHP) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = '#111';
        }
        for (const offset of [-0.4, 0.4]) {
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(this.angle + offset) * 13,
                this.y + Math.sin(this.angle + offset) * 13,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }
        if (lowHP) ctx.shadowBlur = 0;

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
