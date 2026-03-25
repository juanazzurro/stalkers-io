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
    }

    update(dt) {
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

            // Boss spawn
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
                this.player.xp += orb.value;
                orb.collected = true;
            }
        }
        this.xpOrbs = this.xpOrbs.filter(o => !o.collected);

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
            ctx.fillStyle = '#39ff14';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#7fff7f';
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

        // HUD (screen space)
        this.renderHUD(ctx);
    }

    renderHUD(ctx) {
        // Wave number — top right
        ctx.save();
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'right';
        ctx.fillText('WAVE ' + this.waveManager.wave, this.canvas.width - 20, 30);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Wave announcement
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
