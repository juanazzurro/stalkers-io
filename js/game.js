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

        // Spawn 5 recruits for testing
        for (let i = 0; i < 5; i++) {
            let x, y;
            do {
                x = 200 + Math.random() * (this.mapWidth - 400);
                y = 200 + Math.random() * (this.mapHeight - 400);
            } while (Math.hypot(x - this.player.x, y - this.player.y) < 400);
            this.enemies.push(new Enemy(ENEMIES.RECRUIT, x, y, this.mapWidth, this.mapHeight));
        }
    }

    update(dt) {
        if (this.state !== 'playing') return;

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
    }
}
