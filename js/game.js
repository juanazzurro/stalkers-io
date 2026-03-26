class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.state = 'menu'; // menu, charSelect, playing, paused, levelup, gameover

        this.mapWidth = MAP_PIXEL_W;
        this.mapHeight = MAP_PIXEL_H;

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
        this.particles = new ParticleSystem();
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;

        this.obstacles = [];
        this.pickups = [];
        this.pickupSpawnTimer = 0;
        this.bloodStains = [];
        this.lastKillCount = 0;
        this.killPopTimer = 0;

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
        this.particles.clear();
        this.shakeTimer = 0;
        this.obstacles = MAP_OBSTACLES.map(o => ({ ...o }));
        this.renderer.initTileMap(MAP_LAYOUT);
        this.pickups = [];
        this.pickupSpawnTimer = 15000; // First pickup at 15s
        this.bloodStains = [];
        this.lastKillCount = 0;
        this.killPopTimer = 0;
        this.state = 'playing';
        this.input.clearInputs();
    }

    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    saveScore() {
        const score = this.stats.wave * this.stats.kills * this.stats.level;
        let scores = [];
        try {
            const stored = localStorage.getItem('stalkers_scores');
            if (stored) scores = JSON.parse(stored);
        } catch (e) { scores = []; }

        scores.push({
            score: score,
            wave: this.stats.wave,
            kills: this.stats.kills,
            level: this.stats.level,
            character: this.lastCharKey || '?',
            date: new Date().toISOString().split('T')[0]
        });

        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5);
        localStorage.setItem('stalkers_scores', JSON.stringify(scores));
        return score;
    }

    applyPickup(type) {
        switch (type) {
            case 'VODKA':
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.2);
                this.player.flashTimer = 500;
                this.player.flashColor = '#88ff88';
                break;
            case 'RED_STAR':
                this.player.xpMultiplier = 2;
                this.player.xpMultiplierTimer = 10000;
                break;
            case 'USHANKA':
                this.player.invulnerable = true;
                this.player.pickupInvulnTimer = 3000;
                break;
            case 'AMMO_CRATE':
                this.player.doubleShot = true;
                this.player.doubleShotTimer = 8000;
                break;
        }
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
        this.renderer.updateTime(dt);
        this.stats.timeElapsed += dt;

        // Wave system
        const spawned = this.waveManager.update(dt, this.enemies, this.player);
        if (spawned) this.enemies.push(...spawned);
        this.stats.wave = this.waveManager.wave;

        const dir = this.input.getDirection();
        this.player.update(dir, this.input.mouseWorld, dt);

        // Ability input
        if (this.input.ability) {
            const result = this.player.tryAbility(this.input.mouseWorld);
            if (result === 'roar') {
                // Bear roar: knockback + stun
                for (const enemy of this.enemies) {
                    if (enemy.dying) continue;
                    const dx = enemy.x - this.player.x;
                    const dy = enemy.y - this.player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const pushDist = 200;
                        enemy.x += (dx / dist) * pushDist;
                        enemy.y += (dy / dist) * pushDist;
                        enemy.stunTimer = 1500;
                    }
                }
                // Shockwave particles
                this.particles.emit(this.player.x, this.player.y, 30, {
                    color: '#ffffaa', speed: 6, life: 400, size: 4, shrink: true
                });
                this.particles.emit(this.player.x, this.player.y, 15, {
                    color: '#fff', speed: 3, life: 300, size: 2, gravity: 0.1
                });
            }
            if (result === 'charge') {
                this.triggerShake(3, 1500);
            }
        }

        // Player shooting
        if (this.input.shooting) {
            const result = this.player.tryShoot(this.input.mouseWorld.x, this.input.mouseWorld.y);
            if (result) this.projectiles.push(...result);
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

        // Collisions (spatial grid for performance)
        const gridData = CollisionSystem.buildGrid(this.enemies, this.mapWidth, this.mapHeight);
        CollisionSystem.check(this.player, this.enemies, this.projectiles, this.enemyProjectiles, this.xpOrbs, this.stats, gridData);

        // Kamikaze explosion shake
        for (const enemy of this.enemies) {
            if (enemy.data.behavior === 'rush' && enemy.dying && enemy.deathTimer > 480) {
                this.triggerShake(3, 200);
                this.particles.emit(enemy.x, enemy.y, 15, {
                    color: '#ff6600', speed: 5, life: 400, size: 5, gravity: 0.1
                });
            }
        }

        // Obstacle collisions
        CollisionSystem.checkObstacles(this.player, this.enemies, this.projectiles, this.enemyProjectiles, this.obstacles, this.particles);
        this.obstacles = this.obstacles.filter(o => !o.destroyed);

        // Mutant passive radiation
        if (this.player.data.passiveRadius) {
            for (const enemy of this.enemies) {
                if (enemy.dying) continue;
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                if (dx * dx + dy * dy < this.player.data.passiveRadius * this.player.data.passiveRadius) {
                    enemy.hp -= this.player.data.passiveDmg * dt / 1000;
                    if (enemy.hp <= 0 && !enemy.dying) {
                        enemy.die();
                        CollisionSystem.spawnXP(enemy, this.xpOrbs);
                        if (this.stats) { this.stats.kills++; this.stats.streak++; this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streak); }
                    }
                }
            }
        }

        // Toxic pool damage
        if (this.player.toxicPool) {
            const pool = this.player.toxicPool;
            for (const enemy of this.enemies) {
                if (enemy.dying) continue;
                const dx = enemy.x - pool.x;
                const dy = enemy.y - pool.y;
                if (dx * dx + dy * dy < pool.radius * pool.radius) {
                    enemy.hp -= 5 * dt / 1000;
                    if (enemy.hp <= 0 && !enemy.dying) {
                        enemy.die();
                        CollisionSystem.spawnXP(enemy, this.xpOrbs);
                        if (this.stats) { this.stats.kills++; this.stats.streak++; this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streak); }
                    }
                }
            }
        }

        // Oligarch rubles stun
        if (this.player.rublesZone) {
            const rz = this.player.rublesZone;
            for (const enemy of this.enemies) {
                if (enemy.dying) continue;
                const dx = enemy.x - rz.x;
                const dy = enemy.y - rz.y;
                if (dx * dx + dy * dy < rz.radius * rz.radius) {
                    enemy.stunTimer = Math.max(enemy.stunTimer, 100);
                    // Slowly walk toward money
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 10) {
                        enemy.x -= (dx / dist) * 0.5;
                        enemy.y -= (dy / dist) * 0.5;
                    }
                }
            }
        }

        // Tank charge collision
        if (this.player.charging) {
            for (const enemy of this.enemies) {
                if (enemy.dying) continue;
                if (this.player.chargeHitEnemies.has(enemy)) continue;
                if (!CollisionSystem.circleHit(this.player.x, this.player.y, this.player.size, enemy.x, enemy.y, enemy.size)) continue;
                enemy.hp -= 40;
                this.player.chargeHitEnemies.add(enemy);
                if (this.stats) this.stats.damageDealt += 40;
                // Knockback
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                enemy.x += (dx / dist) * 60;
                enemy.y += (dy / dist) * 60;
                if (enemy.hp <= 0 && !enemy.dying) {
                    enemy.die();
                    CollisionSystem.spawnXP(enemy, this.xpOrbs);
                    if (this.stats) { this.stats.kills++; this.stats.streak++; this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streak); }
                }
                this.particles.emit(enemy.x, enemy.y, 8, { color: '#ff8844', speed: 3, life: 300, size: 3 });
            }
            // Smoke trail
            this.particles.emit(this.player.x, this.player.y, 1, {
                color: '#888', speed: 0.5, life: 600, size: 6, gravity: -0.02, shrink: true
            });
        }

        // Pickup spawning
        this.pickupSpawnTimer += dt;
        if (this.pickupSpawnTimer >= 30000 && this.pickups.length < 5) {
            this.pickupSpawnTimer = 0;
            const px = 100 + Math.random() * (this.mapWidth - 200);
            const py = 100 + Math.random() * (this.mapHeight - 200);
            this.pickups.push(new Pickup(Pickup.randomType(), px, py));
        }

        // Pickup collection
        for (const pickup of this.pickups) {
            pickup.update(dt);
            if (pickup.collected) continue;
            const dx = this.player.x - pickup.x;
            const dy = this.player.y - pickup.y;
            if (dx * dx + dy * dy < (this.player.size + pickup.radius) * (this.player.size + pickup.radius)) {
                pickup.collected = true;
                this.applyPickup(pickup.type);
            }
        }
        this.pickups = this.pickups.filter(p => !p.collected);

        // Blood stains + kill tracking for shakes
        const prevKills = this.lastKillCount;
        this.lastKillCount = this.stats.kills;
        if (this.stats.kills > prevKills) {
            this.killPopTimer = 300;
            // Spawn blood stains for newly dead enemies
            for (const enemy of this.enemies) {
                if (enemy.dying && enemy.deathTimer > 450) {
                    this.bloodStains.push({
                        x: enemy.x + (Math.random() - 0.5) * 10,
                        y: enemy.y + (Math.random() - 0.5) * 10,
                        radius: 8 + Math.random() * 7,
                        alpha: 1,
                        timer: 10000
                    });
                    // Boss death shake
                    if (enemy.data.behavior === 'boss') {
                        this.triggerShake(5, 300);
                    }
                }
            }
            if (this.bloodStains.length > 50) {
                this.bloodStains = this.bloodStains.slice(-50);
            }
        }
        if (this.killPopTimer > 0) this.killPopTimer -= dt;

        // Update blood stains
        for (const stain of this.bloodStains) {
            stain.timer -= dt;
            stain.alpha = Math.max(0, stain.timer / 10000);
        }
        this.bloodStains = this.bloodStains.filter(s => s.timer > 0);

        // Shake timer
        if (this.shakeTimer > 0) this.shakeTimer -= dt;

        // Particles
        this.particles.update(dt);

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
            const finalScore = this.saveScore();
            this.gameOverUI.show(this.stats, finalScore);
            return;
        }

        this.camera.update(this.player);
        this.input.updateMouse(this.camera);
        this.input.updateAutoAim(this.player, this.enemies);
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
                this.hud.draw(ctx, this.player, this.waveManager, this.enemies, this.stats, this.xpOrbs, this.killPopTimer);
                this.input.drawTouchControls(ctx);
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

        // Screen shake
        if (this.shakeTimer > 0) {
            const dur = this.shakeDuration || 1500;
            const intensity = this.shakeIntensity * (this.shakeTimer / dur);
            ctx.translate((Math.random() - 0.5) * intensity * 2, (Math.random() - 0.5) * intensity * 2);
        }

        this.renderer.drawMap(ctx);

        // Blood stains (on ground)
        this.renderer.drawBloodStains(ctx, this.bloodStains);

        // Obstacles
        this.renderer.drawObstacles(ctx, this.obstacles);

        // Pickups
        for (const pickup of this.pickups) pickup.draw(ctx);

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

        // Particles
        this.particles.draw(ctx);

        ctx.restore();

        // Post-processing (screen space)
        this.renderer.drawVignette(ctx, this.canvas.width, this.canvas.height);
        this.renderer.drawScanlines(ctx, this.canvas.width, this.canvas.height);
        this.renderer.drawFilmGrain(ctx, this.canvas.width, this.canvas.height);
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
