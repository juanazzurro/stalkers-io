class HUD {
    constructor(canvas) {
        this.canvas = canvas;
        // Snow/ash particles
        this.snowParticles = [];
        for (let i = 0; i < 40; i++) {
            this.snowParticles.push(this.makeSnow());
        }
    }

    makeSnow() {
        return {
            x: Math.random() * (this.canvas.width || 1920),
            y: Math.random() * (this.canvas.height || 1080),
            speed: 0.3 + Math.random() * 0.5,
            size: 1 + Math.random() * 2,
            alpha: 0.15 + Math.random() * 0.3,
            drift: (Math.random() - 0.5) * 0.5
        };
    }

    draw(ctx, player, waveManager, enemies, stats, xpOrbs, killPopTimer) {
        this.drawBars(ctx, player);
        this.drawWaveInfo(ctx, waveManager, enemies);
        this.drawKillCounter(ctx, stats, killPopTimer);
        this.drawUpgradeIcons(ctx, player);
        this.drawCooldown(ctx, player);
        this.drawMinimap(ctx, player, enemies, xpOrbs);
        this.drawPortrait(ctx, player);
        this.drawLowHPVignette(ctx, player);
        this.drawSnow(ctx);
    }

    drawBars(ctx, player) {
        const bx = 70;
        const by = 20;
        const bw = 180;
        const bh = 16;

        // HP bar
        ctx.fillStyle = '#222';
        ctx.fillRect(bx, by, bw, bh);
        const hpRatio = Math.max(0, player.hp / player.maxHp);
        if (hpRatio > 0) {
            const hpColor = hpRatio > 0.3 ? '#cc0000' : '#ff3300';
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, hpRatio * bw, bh);
        }
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(player.hp) + ' / ' + Math.round(player.maxHp), bx + bw / 2, by + 12);

        // XP bar
        const xpY = by + bh + 4;
        const xpH = 10;
        const xpReq = player.xpToLevel();
        const xpProg = player.level >= 30 ? 1 : player.xp / xpReq;

        ctx.fillStyle = '#222';
        ctx.fillRect(bx, xpY, bw, xpH);
        if (bw * xpProg > 0) {
            const grad = ctx.createLinearGradient(bx, 0, bx + xpProg * bw, 0);
            grad.addColorStop(0, '#4488ff');
            grad.addColorStop(1, '#ffd700');
            ctx.fillStyle = grad;
            ctx.fillRect(bx, xpY, xpProg * bw, xpH);
        }
        ctx.strokeStyle = '#555';
        ctx.strokeRect(bx, xpY, bw, xpH);

        // Level
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'left';
        ctx.fillText('LVL ' + player.level, bx + bw + 10, by + 13);
    }

    drawWaveInfo(ctx, waveManager, enemies) {
        const w = this.canvas.width;
        ctx.save();
        ctx.textAlign = 'right';

        // Wave number
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText('WAVE ' + waveManager.wave, w - 20, 30);

        // Enemies remaining
        if (waveManager.state === 'active') {
            const alive = enemies.filter(e => !e.dying && !e.removed).length;
            ctx.font = '13px monospace';
            ctx.fillStyle = '#cc4444';
            ctx.fillText(alive + ' remaining', w - 20, 50);
        } else if (waveManager.state === 'break') {
            ctx.font = '13px monospace';
            ctx.fillStyle = '#888';
            const timeLeft = Math.ceil((waveManager.breakDuration - waveManager.timer) / 1000);
            ctx.fillText('next wave in ' + timeLeft + 's', w - 20, 50);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawUpgradeIcons(ctx, player) {
        const upgraded = Object.entries(player.upgrades.stats)
            .filter(([_, s]) => s.level > 0);

        if (upgraded.length === 0) return;

        let ix = 20;
        const iy = this.canvas.height - 40;
        for (const [, stat] of upgraded) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(ix - 2, iy - 18, 28, 32);
            ctx.font = '18px monospace';
            ctx.fillStyle = stat.color;
            ctx.textAlign = 'center';
            ctx.fillText(stat.icon, ix + 12, iy);
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText(stat.level.toString(), ix + 12, iy + 14);
            ix += 32;
        }
    }

    drawCooldown(ctx, player) {
        const cx = 40;
        const cy = this.canvas.height - 90;
        const r = 20;
        const cd = player.abilityCooldown;
        const maxCd = player.abilityMaxCooldown;
        const ready = cd <= 0;

        // Background circle
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        if (ready) {
            // Pulse glow
            const pulse = 0.4 + Math.sin(Date.now() * 0.006) * 0.2;
            ctx.strokeStyle = 'rgba(100, 200, 255, ' + pulse + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#adf';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SPACE', cx, cy);
        } else {
            // Sweep arc (remaining cooldown)
            const ratio = cd / maxCd;
            ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (1 - ratio) * Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#456';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Seconds remaining
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.ceil(cd / 1000).toString(), cx, cy);
        }
    }

    drawMinimap(ctx, player, enemies, xpOrbs) {
        const mmSize = 160;
        const mmX = (this.canvas.width - mmSize) / 2;
        const mmY = this.canvas.height - mmSize - 12;
        const scale = mmSize / 3000;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(mmX, mmY, mmSize, mmSize);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(mmX, mmY, mmSize, mmSize);

        // XP orbs
        if (xpOrbs) {
            for (const orb of xpOrbs) {
                if (orb.collected) continue;
                ctx.fillStyle = orb.color || '#ffd700';
                ctx.beginPath();
                ctx.arc(mmX + orb.x * scale, mmY + orb.y * scale, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Enemies (red dots)
        ctx.fillStyle = '#ff3333';
        for (const e of enemies) {
            if (e.dying || e.removed) continue;
            const ex = mmX + e.x * scale;
            const ey = mmY + e.y * scale;
            const r = e.data.behavior === 'boss' ? 3 : 1.5;
            ctx.beginPath();
            ctx.arc(ex, ey, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player (green dot)
        ctx.fillStyle = '#33ff33';
        ctx.beginPath();
        ctx.arc(mmX + player.x * scale, mmY + player.y * scale, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPortrait(ctx, player) {
        const px = 10;
        const py = 10;
        const ps = 50;

        // Portrait frame
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px, py, ps, ps);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, ps, ps);

        // Clip and draw character
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, ps, ps);
        ctx.clip();
        ctx.translate(px + ps / 2, py + ps / 2);
        ctx.scale(1.2, 1.2);

        const type = player.data.projectileType;
        if (type === 'vomit') this.drawMutantMini(ctx);
        else if (type === 'bottle') this.drawOligarchMini(ctx);
        else if (type === 'shell') this.drawTankMini(ctx);
        else if (type === 'poop') this.drawBearMini(ctx);

        ctx.restore();
    }

    drawMutantMini(ctx) {
        ctx.fillStyle = '#2d8a2d';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff0000';
        for (const off of [-0.3, 0.3]) {
            ctx.beginPath();
            ctx.arc(Math.cos(off) * 6, Math.sin(off) * 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawOligarchMini(ctx) {
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-4, -1.5, 8, 3);
        ctx.fillStyle = '#ddd';
        for (const off of [-0.35, 0.35]) {
            ctx.beginPath();
            ctx.arc(Math.cos(off) * 7, Math.sin(off) * 7, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTankMini(ctx) {
        ctx.save();
        ctx.fillStyle = '#4a5a2a';
        ctx.fillRect(-16, -10, 32, 20);
        ctx.fillStyle = '#5a6a3a';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(6, -2, 14, 4);
        ctx.restore();
    }

    drawBearMini(ctx) {
        ctx.fillStyle = '#6b3410';
        for (const off of [-0.5, 0.5]) {
            ctx.beginPath();
            ctx.arc(Math.cos(Math.PI + off) * 16, Math.sin(Math.PI + off) * 16, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c49a6c';
        ctx.beginPath();
        ctx.arc(7, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(11, 0, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawKillCounter(ctx, stats, killPopTimer) {
        if (!stats) return;
        const w = this.canvas.width;

        ctx.save();
        ctx.textAlign = 'right';

        // Pop scale effect
        let scale = 1;
        if (killPopTimer > 0) {
            const t = killPopTimer / 300;
            scale = 1 + t * 0.3;
        }

        const x = w - 20;
        const y = 72;

        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);

        // Skull icon + count
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#ff6644';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText('\u2620 ' + stats.kills, x, y);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawLowHPVignette(ctx, player) {
        const hpRatio = player.hp / player.maxHp;
        if (hpRatio >= 0.3) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const intensity = (1 - hpRatio / 0.3);
        const pulse = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;
        const alpha = intensity * 0.4 * pulse;

        const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
        grad.addColorStop(0, 'rgba(180, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(180, 0, 0, ' + alpha + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    drawSnow(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (const p of this.snowParticles) {
            p.y += p.speed;
            p.x += p.drift + Math.sin(p.y * 0.01) * 0.2;
            if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#ccd';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}
