class Enemy {
    constructor(data, x, y, mapWidth, mapHeight) {
        this.data = data;
        this.x = x;
        this.y = y;
        this.mapWidth = mapWidth || 3000;
        this.mapHeight = mapHeight || 3000;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.angle = 0;
        this.fireCooldown = 0;
        this.size = data.hitboxRadius;
        this.dying = false;
        this.removed = false;
        this.deathTimer = 0;

        // Flank
        this.flankSide = Math.random() < 0.5 ? 1 : -1;

        // Sniper
        this.isAiming = false;
        this.aimTimer = 0;

        // Boss
        this.shield = data.shieldHp || 0;
        this.maxShield = data.shieldHp || 0;
        this.spawnTimer = 0;
        this.spawnRequested = false;

        // Stun
        this.stunTimer = 0;
    }

    update(player, dt, enemies) {
        if (this.dying) {
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) this.removed = true;
            return null;
        }

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return null;
        }

        if (this.fireCooldown > 0) this.fireCooldown -= dt;

        let result = null;
        const b = this.data.behavior;
        if (b === 'chase') result = this.updateChase(player);
        else if (b === 'flank') result = this.updateFlank(player);
        else if (b === 'advance') result = this.updateAdvance(player);
        else if (b === 'snipe') result = this.updateSnipe(player, dt);
        else if (b === 'rush') result = this.updateRush(player);
        else if (b === 'boss') result = this.updateBoss(player, dt);

        // Clamp to map
        this.x = Math.max(this.size, Math.min(this.mapWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.mapHeight - this.size, this.y));

        return result;
    }

    updateChase(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        const attackRange = this.data.range * 60;
        if (dist > attackRange) {
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
        }
        if (dist <= attackRange) return this.tryShoot(player);
        return null;
    }

    updateFlank(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        const flankDist = this.data.range * 60 * 0.7;
        const baseAngle = Math.atan2(this.y - player.y, this.x - player.x);
        const targetAngle = baseAngle + (Math.PI / 2) * this.flankSide;
        const targetX = player.x + Math.cos(targetAngle) * flankDist;
        const targetY = player.y + Math.sin(targetAngle) * flankDist;

        const tdx = targetX - this.x;
        const tdy = targetY - this.y;
        const tDist = Math.sqrt(tdx * tdx + tdy * tdy);

        if (tDist > 10) {
            this.x += (tdx / tDist) * this.data.speed;
            this.y += (tdy / tDist) * this.data.speed;
        }

        if (dist <= this.data.range * 60) return this.tryShoot(player);
        return null;
    }

    updateAdvance(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        if (dist > 50) {
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
        }
        if (dist <= this.data.range * 60) return this.tryShoot(player);
        return null;
    }

    updateSnipe(player, dt) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        const attackRange = this.data.range * 60;

        if (dist > attackRange) {
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
            this.isAiming = false;
            this.aimTimer = 0;
        } else if (dist < attackRange * 0.5) {
            this.x -= (dx / dist) * this.data.speed;
            this.y -= (dy / dist) * this.data.speed;
            this.isAiming = false;
            this.aimTimer = 0;
        } else if (this.fireCooldown <= 0) {
            this.isAiming = true;
            this.aimTimer += dt;
            if (this.aimTimer >= 2000) {
                this.isAiming = false;
                this.aimTimer = 0;
                return this.tryShoot(player);
            }
        }
        return null;
    }

    updateRush(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        if (dist > 1) {
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
        }
        return null;
    }

    updateBoss(player, dt) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        const attackRange = this.data.range * 60;
        if (dist > attackRange) {
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
        }

        // Shield regen
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + 5 * dt / 1000);
        }

        // Spawn timer
        this.spawnTimer += dt;
        if (this.spawnTimer >= (this.data.spawnInterval || 8000)) {
            this.spawnTimer = 0;
            this.spawnRequested = true;
        }

        if (dist <= attackRange) return this.tryShoot(player);
        return null;
    }

    tryShoot(player) {
        if (this.fireCooldown > 0) return null;
        this.fireCooldown = 1000 / this.data.fireRate;

        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        let projType, projColor, projSpeed, aoe;

        switch (this.data.behavior) {
            case 'advance':
                projType = 'rpg'; projColor = '#555'; projSpeed = 4;
                aoe = this.data.aoeRadius || 0;
                break;
            case 'snipe':
                projType = 'sniper_round'; projColor = '#ff0'; projSpeed = 12;
                aoe = 0;
                break;
            default:
                projType = 'bullet'; projColor = '#ff0'; projSpeed = 6;
                aoe = 0;
        }

        return new Projectile(
            this.x + Math.cos(angle) * (this.size + 3),
            this.y + Math.sin(angle) * (this.size + 3),
            Math.cos(angle) * projSpeed,
            Math.sin(angle) * projSpeed,
            this.data.damage,
            this.data.range * 60,
            projType, projColor, this, aoe
        );
    }

    takeDamage(amount) {
        if (this.data.behavior === 'boss' && this.shield > 0) {
            this.shield -= amount;
            if (this.shield < 0) {
                this.hp += this.shield;
                this.shield = 0;
            }
        } else {
            this.hp -= amount;
        }
    }

    die() {
        this.dying = true;
        this.deathTimer = 500;
    }

    draw(ctx) {
        if (this.dying) ctx.globalAlpha = Math.max(0, this.deathTimer / 500);

        // Sniper laser
        if (this.data.behavior === 'snipe' && this.isAiming) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(this.angle) * this.data.range * 60,
                this.y + Math.sin(this.angle) * this.data.range * 60
            );
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Body (oval)
        ctx.fillStyle = this.data.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headR = this.size * 0.45;
        const headX = this.size * 0.55;
        ctx.beginPath();
        ctx.arc(headX, 0, headR, 0, Math.PI * 2);
        ctx.fill();

        // Bandana
        ctx.fillStyle = this.data.bandanaColor;
        ctx.beginPath();
        ctx.arc(headX, 0, headR + 1, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.fill();

        ctx.restore();

        // Boss shield
        if (this.data.behavior === 'boss' && this.shield > 0) {
            const alpha = 0.2 + 0.3 * (this.shield / this.maxShield);
            ctx.strokeStyle = 'rgba(50, 100, 255, ' + alpha + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Stun indicator
        if (this.stunTimer > 0 && !this.dying) {
            ctx.fillStyle = '#ffff00';
            const t = Date.now() * 0.01;
            for (let i = 0; i < 3; i++) {
                const sa = t + i * 2.094;
                ctx.beginPath();
                ctx.arc(
                    this.x + Math.cos(sa) * (this.size + 4),
                    this.y - this.size - 6 + Math.sin(sa) * 3,
                    2, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }

        // HP bar
        if (this.hp < this.maxHp && !this.dying) {
            const barW = 30;
            const barH = 3;
            const barY = this.y - this.size - 8;
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x - barW / 2, barY, barW, barH);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barW / 2, barY, (this.hp / this.maxHp) * barW, barH);
        }

        if (this.dying) ctx.globalAlpha = 1;
    }
}
