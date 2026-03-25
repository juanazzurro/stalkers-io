class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.state = 'menu'; // menu, charSelect, playing, paused, levelup, gameover

        this.mapWidth = 3000;
        this.mapHeight = 3000;

        this.camera = new Camera(canvas);
        this.renderer = new Renderer(this.mapWidth, this.mapHeight);
        this.input = new InputHandler(canvas, this.camera);

        this.mainMenu = new MainMenu(canvas);
        this.charSelect = new CharSelectUI(canvas);
        this.gameOverUI = new GameOverUI(canvas);
        this.hud = new HUD(canvas);
        this.pauseUI = new PauseUI(canvas);
        this.levelUpUI = new LevelUpUI(canvas);

        this.player = null;
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.xpOrbs = [];
        this.waveManager = null;

        this.stats = { kills: 0, damageDealt: 0, streak: 0, bestStreak: 0, timeElapsed: 0, wave: 1, level: 1 };
        this.lastCharKey = null;

        this.wasClicked = false;
    }

    startGame(charData) {
        this.player = new Player(charData, this.mapWidth, this.mapHeight);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.xpOrbs = [];
        this.waveManager = new WaveManager(this.mapWidth, this.mapHeight);
        this.stats = { kills: 0, damageDealt: 0, streak: 0, bestStreak: 0, timeElapsed: 0, wave: 1, level: 1 };
        this.state = 'playing';
        this.input.clearInputs();
    }

    update(dt) {
        const clicked = this.input.shooting && !this.wasClicked;
        this.wasClicked = this.input.shooting;

        switch (this.state) {
            case 'menu':
                this.mainMenu.update(dt, this.input.mouseScreen.x, this.input.mouseScreen.y, clicked);
                this.canvas.style.cursor = this.mainMenu.hoverPlay ? 'pointer' : 'default';
                if (this.mainMenu.clicked === 'play') {
                    this.state = 'charSelect';
                    this.input.clearInputs();
                    this.wasClicked = true;
                }
                break;

            case 'charSelect':
                this.charSelect.update(this.input.mouseScreen.x, this.input.mouseScreen.y, clicked);
                this.canvas.style.cursor = this.charSelect.hoverIndex >= 0 ? 'pointer' : 'default';
                if (this.charSelect.selected) {
                    this.lastCharKey = this.charSelect.selected.key;
                    this.startGame(CHARACTERS[this.lastCharKey]);
                    this.canvas.style.cursor = 'default';
                }
                if (this.input.keys['escape']) {
                    this.state = 'menu';
                    this.input.keys['escape'] = false;
                }
                break;

            case 'playing':
                if (this.input.keys['escape']) {
                    this.input.keys['escape'] = false;
                    this.state = 'paused';
                    this.input.clearInputs();
                    break;
                }
                this.updateGameplay(dt);
                break;

            case 'paused':
                this.pauseUI.update(this.input.mouseScreen.x, this.input.mouseScreen.y, clicked);
                this.canvas.style.cursor = (this.pauseUI.hoverResume || this.pauseUI.hoverQuit) ? 'pointer' : 'default';
                if (this.pauseUI.clicked === 'resume' || this.input.keys['escape']) {
                    this.input.keys['escape'] = false;
                    this.state = 'playing';
                    this.canvas.style.cursor = 'default';
                    this.input.clearInputs();
                } else if (this.pauseUI.clicked === 'quit') {
                    this.state = 'charSelect';
                    this.canvas.style.cursor = 'default';
                    this.input.clearInputs();
                    this.wasClicked = true;
                }
                break;

            case 'levelup':
                const selected = this.levelUpUI.getSelected();
                if (selected) {
                    this.player.upgrades.applyUpgrade(selected);
                    this.player.recalcStats();
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
                    this.levelUpUI.hide();
                    this.state = 'playing';
                }
                break;

            case 'gameover':
                this.gameOverUI.update(dt, this.input.mouseScreen.x, this.input.mouseScreen.y, clicked);
                this.canvas.style.cursor = this.gameOverUI.hoverRetry ? 'pointer' : 'default';
                if (this.gameOverUI.clicked === 'retry') {
                    this.state = 'charSelect';
                    this.canvas.style.cursor = 'default';
                    this.input.clearInputs();
                    this.wasClicked = true;
                }
                break;
        }
    }

    updateGameplay(dt) {
        this.stats.timeElapsed += dt;

        // Wave system
        const spawned = this.waveManager.update(dt, this.enemies, this.player);
        if (spawned) this.enemies.push(...spawned);
        this.stats.wave = this.waveManager.wave;

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
                    this.enemies.push(new Enemy(ENEMIES.BOSS_MINION,
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
        CollisionSystem.check(this.player, this.enemies, this.projectiles, this.enemyProjectiles, this.xpOrbs, this.stats);

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
        this.stats.level = this.player.level;
        if (this.player.levelUpPending && this.waveManager.state !== 'announce') {
            this.player.levelUpPending = false;
            const options = this.player.upgrades.getUpgradeOptions();
            if (options.length > 0) {
                this.levelUpUI.show(options, this.player.upgrades);
                this.state = 'levelup';
            }
        }

        // Game over
        if (this.player.hp <= 0) {
            this.state = 'gameover';
            this.gameOverUI.show(this.stats);
            return;
        }

        this.camera.update(this.player);
        this.input.updateMouse(this.camera);
    }

    render(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.state) {
            case 'menu':
                this.mainMenu.draw(ctx);
                break;

            case 'charSelect':
                this.charSelect.draw(ctx);
                break;

            case 'playing':
            case 'levelup':
            case 'paused':
                this.renderWorld(ctx);
                this.hud.draw(ctx, this.player, this.waveManager, this.enemies, this.stats, this.xpOrbs);
                this.renderWaveAnnouncement(ctx);
                if (this.state === 'levelup') {
                    this.levelUpUI.draw(ctx);
                } else if (this.state === 'paused') {
                    this.pauseUI.draw(ctx);
                }
                break;

            case 'gameover':
                this.renderWorld(ctx);
                this.gameOverUI.draw(ctx);
                break;
        }
    }

    renderWorld(ctx) {
        ctx.save();
        this.camera.apply(ctx);

        this.renderer.drawMap(ctx);

        // XP orbs
        for (const orb of this.xpOrbs) {
            const oc = orb.color || '#ffd700';
            ctx.shadowColor = oc;
            ctx.shadowBlur = 6;
            ctx.fillStyle = oc;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // All projectiles
        for (const p of this.projectiles) p.draw(ctx);
        for (const p of this.enemyProjectiles) p.draw(ctx);

        // Enemies
        for (const enemy of this.enemies) enemy.draw(ctx);

        // Player
        if (this.player) this.player.draw(ctx);

        ctx.restore();
    }

    renderWaveAnnouncement(ctx) {
        if (!this.waveManager) return;
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
