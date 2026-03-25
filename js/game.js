class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.state = 'playing'; // menu, playing, paused, gameover, levelup

        this.mapWidth = 3000;
        this.mapHeight = 3000;

        this.camera = new Camera(canvas);
        this.renderer = new Renderer(this.mapWidth, this.mapHeight);
        this.input = new InputHandler(canvas, this.camera);

        this.player = new Player(CHARACTERS.MUTANT, this.mapWidth, this.mapHeight);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.xpOrbs = [];

        this.waveManager = new WaveManager(this.mapWidth, this.mapHeight);
        this.levelUpUI = new LevelUpUI(canvas);
    }

    update(dt) {
        // Level up selection
        if (this.state === 'levelup') {
            const selected = this.levelUpUI.getSelected();
            if (selected) {
                this.player.upgrades.applyUpgrade(selected);
                this.player.recalcStats();
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
                this.levelUpUI.hide();
                this.state = 'playing';
            }
            return;
        }

        if (this.state !== 'playing') return;

        // Wave system
        const spawned = this.waveManager.update(dt, this.enemies, this.player);
        if (spawned) this.enemies.push(...spawned);

        const dir = this.input.getDirection();
        this.player.update(dir, this.input.mouseWorld, dt);

        // Player shooting
        if (this.input.shooting) {
            const proj = this.player.tryShoot(this.input.mouseWorld.x, this.input.mouseWorld.y);
            if (proj) this.projectiles.push(proj);
        }

        // Update player projectiles
        for (const p of this.projectiles) p.update(this.mapWidth, this.mapHeight);
        this.projectiles = this.projectiles.filter(p => !p.dead);

        // Update enemies
        for (const enemy of this.enemies) {
            const proj = enemy.update(this.player, dt, this.enemies);
            if (proj) this.enemyProjectiles.push(proj);

            if (enemy.spawnRequested) {
                enemy.spawnRequested = false;
                for (let i = 0; i < 2; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const d = 50 + Math.random() * 30;
                    this.enemies.push(new Enemy(ENEMIES.RECRUIT,
                        enemy.x + Math.cos(a) * d,
                        enemy.y + Math.sin(a) * d,
                        this.mapWidth, this.mapHeight
                    ));
                }
            }
        }

        // Update enemy projectiles
        for (const p of this.enemyProjectiles) p.update(this.mapWidth, this.mapHeight);
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.dead);

        // Collisions
        CollisionSystem.check(this.player, this.enemies, this.projectiles, this.enemyProjectiles, this.xpOrbs);

        // Remove fully faded enemies
        this.enemies = this.enemies.filter(e => !e.removed);

        // XP orbs
        for (const orb of this.xpOrbs) {
            const dx = this.player.x - orb.x;
            const dy = this.player.y - orb.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                orb.x += (dx / dist) * 5;
                orb.y += (dy / dist) * 5;
            }
            if (dist < 20) {
                this.player.addXP(orb.value);
                orb.collected = true;
            }
        }
        this.xpOrbs = this.xpOrbs.filter(o => !o.collected);

        // Check level up (defer during wave announcement)
        if (this.player.levelUpPending && this.waveManager.state !== 'announce') {
            this.player.levelUpPending = false;
            const options = this.player.upgrades.getUpgradeOptions();
            if (options.length > 0) {
                this.levelUpUI.show(options, this.player.upgrades);
                this.state = 'levelup';
            }
        }

        this.camera.update(this.player);
        this.input.updateMouse(this.camera);
    }

    render(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        this.camera.apply(ctx);

        this.renderer.drawMap(ctx);

        // XP orbs
        for (const orb of this.xpOrbs) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffee88';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // All projectiles
        for (const p of this.projectiles) p.draw(ctx);
        for (const p of this.enemyProjectiles) p.draw(ctx);

        // Enemies
        for (const enemy of this.enemies) enemy.draw(ctx);

        // Player
        this.player.draw(ctx);

        ctx.restore();

        // HUD
        this.renderHUD(ctx);

        // Wave announcement
        this.renderWaveAnnouncement(ctx);

        // Level up UI
        if (this.state === 'levelup') {
            this.levelUpUI.draw(ctx);
        }
    }

    renderHUD(ctx) {
        // HP bar — top left
        const bx = 20;
        const by = 20;
        const bw = 200;
        const bh = 16;

        ctx.fillStyle = '#333';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(bx, by, Math.max(0, (this.player.hp / this.player.maxHp)) * bw, bh);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(this.player.hp) + ' / ' + Math.round(this.player.maxHp), bx + bw / 2, by + 12);

        // XP bar
        const xpY = by + bh + 4;
        const xpH = 10;
        const xpReq = this.player.xpToLevel();
        const xpProg = this.player.level >= 30 ? 1 : this.player.xp / xpReq;

        ctx.fillStyle = '#333';
        ctx.fillRect(bx, xpY, bw, xpH);
        if (bw * xpProg > 0) {
            const grad = ctx.createLinearGradient(bx, 0, bx + xpProg * bw, 0);
            grad.addColorStop(0, '#4488ff');
            grad.addColorStop(1, '#ffd700');
            ctx.fillStyle = grad;
            ctx.fillRect(bx, xpY, xpProg * bw, xpH);
        }
        ctx.strokeStyle = '#888';
        ctx.strokeRect(bx, xpY, bw, xpH);

        // Level
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'left';
        ctx.fillText('LVL ' + this.player.level, bx + bw + 10, by + 13);

        // Wave — top right
        ctx.save();
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'right';
        ctx.fillText('WAVE ' + this.waveManager.wave, this.canvas.width - 20, 30);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Upgraded stats — bottom left
        const upgraded = Object.entries(this.player.upgrades.stats)
            .filter(([_, s]) => s.level > 0);

        if (upgraded.length > 0) {
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
    }

    renderWaveAnnouncement(ctx) {
        const ann = this.waveManager.getAnnouncement();
        if (!ann) return;

        ctx.save();
        ctx.globalAlpha = ann.alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = this.canvas.width / 2 + ann.shakeX;
        const cy = this.canvas.height * 0.3 + ann.shakeY;

        if (ann.isBoss) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.font = 'bold 52px monospace';
            ctx.fillStyle = '#ff3333';
            ctx.fillText(ann.text, cx, cy - 30);
            ctx.font = 'bold 26px monospace';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('\u26A0 \u041A\u041E\u041C\u0410\u041D\u0414\u0418\u0420 APPROACHING \u26A0', cx, cy + 30);
        } else {
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 52px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText(ann.text, cx, cy);
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
