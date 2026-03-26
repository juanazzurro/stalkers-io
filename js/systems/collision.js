class CollisionSystem {
    static CELL_SIZE = 150;

    static circleHit(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return (dx * dx + dy * dy) < (r1 + r2) * (r1 + r2);
    }

    static projRadius(type) {
        switch (type) {
            case 'bullet': return 3;
            case 'rpg': return 5;
            case 'sniper_round': return 3;
            case 'shell': return 8;
            case 'bottle': return 5;
            case 'vomit': return 6;
            case 'poop': return 5;
            default: return 4;
        }
    }

    static buildGrid(enemies, mapW, mapH) {
        const cs = this.CELL_SIZE;
        const cols = Math.ceil(mapW / cs);
        const rows = Math.ceil(mapH / cs);
        const grid = new Array(cols * rows);
        for (let i = 0; i < grid.length; i++) grid[i] = null;

        for (const e of enemies) {
            if (e.dying || e.removed) continue;
            const cx = Math.min(Math.floor(e.x / cs), cols - 1);
            const cy = Math.min(Math.floor(e.y / cs), rows - 1);
            const idx = cy * cols + cx;
            if (!grid[idx]) grid[idx] = [];
            grid[idx].push(e);
        }
        return { grid, cols, rows };
    }

    static getNearby(gridData, x, y, radius) {
        const cs = this.CELL_SIZE;
        const { grid, cols, rows } = gridData;
        const minCx = Math.max(0, Math.floor((x - radius) / cs));
        const maxCx = Math.min(cols - 1, Math.floor((x + radius) / cs));
        const minCy = Math.max(0, Math.floor((y - radius) / cs));
        const maxCy = Math.min(rows - 1, Math.floor((y + radius) / cs));
        const result = [];
        for (let cy = minCy; cy <= maxCy; cy++) {
            for (let cx = minCx; cx <= maxCx; cx++) {
                const cell = grid[cy * cols + cx];
                if (cell) {
                    for (const e of cell) result.push(e);
                }
            }
        }
        return result;
    }

    static check(player, enemies, playerProj, enemyProj, xpOrbs, stats, gridData) {
        // Player projectiles vs enemies (using spatial grid)
        for (const proj of playerProj) {
            if (proj.dead) continue;
            const pr = this.projRadius(proj.type);
            const searchRadius = pr + 30 + (proj.aoeRadius || 0);
            const nearby = gridData ? this.getNearby(gridData, proj.x, proj.y, searchRadius) : enemies;

            for (const enemy of nearby) {
                if (enemy.dying) continue;
                if (proj.hitTargets.has(enemy)) continue;
                if (!this.circleHit(proj.x, proj.y, pr, enemy.x, enemy.y, enemy.size)) continue;

                enemy.takeDamage(proj.damage);
                if (stats) stats.damageDealt += proj.damage;
                proj.hitTargets.add(enemy);

                // AOE
                if (proj.aoeRadius > 0) {
                    const aoeNearby = gridData ? this.getNearby(gridData, proj.x, proj.y, proj.aoeRadius + 30) : enemies;
                    for (const other of aoeNearby) {
                        if (other === enemy || other.dying) continue;
                        if (this.circleHit(proj.x, proj.y, proj.aoeRadius, other.x, other.y, other.size)) {
                            other.takeDamage(proj.damage * 0.5);
                            if (stats) stats.damageDealt += proj.damage * 0.5;
                            if (other.hp <= 0 && !other.dying) {
                                other.die();
                                this.spawnXP(other, xpOrbs);
                                if (stats) { stats.kills++; stats.streak++; stats.bestStreak = Math.max(stats.bestStreak, stats.streak); }
                            }
                        }
                    }
                }

                if (enemy.hp <= 0 && !enemy.dying) {
                    enemy.die();
                    this.spawnXP(enemy, xpOrbs);
                    if (stats) { stats.kills++; stats.streak++; stats.bestStreak = Math.max(stats.bestStreak, stats.streak); }
                }

                // Penetration
                if (proj.pierceLeft > 0) {
                    proj.pierceLeft--;
                } else {
                    proj.dead = true;
                    break;
                }
            }
        }

        // Enemy projectiles vs player
        for (const proj of enemyProj) {
            if (proj.dead) continue;
            if (player.invulnerable) continue;
            const pr = this.projRadius(proj.type);
            if (!this.circleHit(proj.x, proj.y, pr, player.x, player.y, player.size)) continue;

            let dmg = proj.damage;
            if (player.data.passiveDmgReduction) {
                dmg *= (1 - player.data.passiveDmgReduction);
            }
            player.hp = Math.max(0, player.hp - dmg);
            if (stats) stats.streak = 0;
            proj.dead = true;
        }

        // Kamikaze contact
        for (const enemy of enemies) {
            if (enemy.dying || enemy.data.behavior !== 'rush') continue;
            if (player.invulnerable) continue;
            if (!this.circleHit(enemy.x, enemy.y, enemy.size, player.x, player.y, player.size)) continue;

            let dmg = enemy.data.explosionDamage || 40;
            if (player.data.passiveDmgReduction) {
                dmg *= (1 - player.data.passiveDmgReduction);
            }
            player.hp = Math.max(0, player.hp - dmg);
            if (stats) { stats.streak = 0; }
            enemy.hp = 0;
            enemy.die();
            this.spawnXP(enemy, xpOrbs);
            if (stats) { stats.kills++; stats.streak++; stats.bestStreak = Math.max(stats.bestStreak, stats.streak); }
        }
    }

    // Circle vs AABB overlap test
    static circleRect(cx, cy, cr, rx, ry, rw, rh) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) < (cr * cr);
    }

    // Push circle out of rect, returns true if collision occurred
    static pushCircleOutOfRect(entity, rx, ry, rw, rh) {
        const closestX = Math.max(rx, Math.min(entity.x, rx + rw));
        const closestY = Math.max(ry, Math.min(entity.y, ry + rh));
        const dx = entity.x - closestX;
        const dy = entity.y - closestY;
        const distSq = dx * dx + dy * dy;
        const r = entity.size;
        if (distSq < r * r && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = r - dist;
            entity.x += (dx / dist) * overlap;
            entity.y += (dy / dist) * overlap;
            return true;
        }
        if (distSq === 0) {
            // Entity center is inside rect — push to nearest edge
            const toLeft = entity.x - rx;
            const toRight = (rx + rw) - entity.x;
            const toTop = entity.y - ry;
            const toBottom = (ry + rh) - entity.y;
            const minDist = Math.min(toLeft, toRight, toTop, toBottom);
            if (minDist === toLeft) entity.x = rx - r;
            else if (minDist === toRight) entity.x = rx + rw + r;
            else if (minDist === toTop) entity.y = ry - r;
            else entity.y = ry + rh + r;
            return true;
        }
        return false;
    }

    static pushCircleOutOfCircle(entity, ox, oy, or) {
        const dx = entity.x - ox;
        const dy = entity.y - oy;
        const distSq = dx * dx + dy * dy;
        const minDist = entity.size + or;
        if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;
            entity.x += (dx / dist) * overlap;
            entity.y += (dy / dist) * overlap;
            return true;
        }
        return false;
    }

    static checkObstacles(player, enemies, playerProj, enemyProj, obstacles, particles) {
        for (const obs of obstacles) {
            if (obs.destroyed) continue;

            const isCircle = obs.type === 'barrel';

            // Player vs obstacle
            if (isCircle) {
                if (this.pushCircleOutOfCircle(player, obs.x, obs.y, obs.radius)) {
                    player.x = Math.max(player.size, Math.min(player.mapWidth - player.size, player.x));
                    player.y = Math.max(player.size, Math.min(player.mapHeight - player.size, player.y));
                }
            } else {
                if (this.pushCircleOutOfRect(player, obs.x, obs.y, obs.w, obs.h)) {
                    player.x = Math.max(player.size, Math.min(player.mapWidth - player.size, player.x));
                    player.y = Math.max(player.size, Math.min(player.mapHeight - player.size, player.y));
                }
            }

            // Enemies vs obstacle
            for (const enemy of enemies) {
                if (enemy.dying) continue;
                if (isCircle) {
                    if (this.pushCircleOutOfCircle(enemy, obs.x, obs.y, obs.radius)) {
                        enemy.x = Math.max(enemy.size, Math.min(enemy.mapWidth - enemy.size, enemy.x));
                        enemy.y = Math.max(enemy.size, Math.min(enemy.mapHeight - enemy.size, enemy.y));
                    }
                } else {
                    if (this.pushCircleOutOfRect(enemy, obs.x, obs.y, obs.w, obs.h)) {
                        enemy.x = Math.max(enemy.size, Math.min(enemy.mapWidth - enemy.size, enemy.x));
                        enemy.y = Math.max(enemy.size, Math.min(enemy.mapHeight - enemy.size, enemy.y));
                    }
                }
            }

            // Player projectiles vs obstacle
            for (const proj of playerProj) {
                if (proj.dead) continue;
                const pr = this.projRadius(proj.type);
                let hit = false;
                if (isCircle) {
                    hit = this.circleHit(proj.x, proj.y, pr, obs.x, obs.y, obs.radius);
                } else {
                    hit = this.circleRect(proj.x, proj.y, pr, obs.x, obs.y, obs.w, obs.h);
                }
                if (hit) {
                    proj.dead = true;
                    if (obs.destructible) {
                        obs.hp -= proj.damage;
                        if (obs.hp <= 0) {
                            obs.destroyed = true;
                            if (particles) {
                                const px = isCircle ? obs.x : obs.x + obs.w / 2;
                                const py = isCircle ? obs.y : obs.y + obs.h / 2;
                                particles.emit(px, py, 12, {
                                    color: obs.color, speed: 3, life: 500, size: 4, gravity: 0.1
                                });
                            }
                        }
                    }
                }
            }

            // Enemy projectiles vs obstacle
            for (const proj of enemyProj) {
                if (proj.dead) continue;
                const pr = this.projRadius(proj.type);
                let hit = false;
                if (isCircle) {
                    hit = this.circleHit(proj.x, proj.y, pr, obs.x, obs.y, obs.radius);
                } else {
                    hit = this.circleRect(proj.x, proj.y, pr, obs.x, obs.y, obs.w, obs.h);
                }
                if (hit) {
                    proj.dead = true;
                    if (obs.destructible) {
                        obs.hp -= proj.damage;
                        if (obs.hp <= 0) {
                            obs.destroyed = true;
                            if (particles) {
                                const px = isCircle ? obs.x : obs.x + obs.w / 2;
                                const py = isCircle ? obs.y : obs.y + obs.h / 2;
                                particles.emit(px, py, 12, {
                                    color: obs.color, speed: 3, life: 500, size: 4, gravity: 0.1
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    static spawnXP(enemy, xpOrbs) {
        const totalXP = enemy.data.xpValue || 10;
        const color = enemy.data.xpColor || '#ffd700';
        const count = 3;
        const value = Math.ceil(totalXP / count);
        for (let i = 0; i < count; i++) {
            xpOrbs.push({
                x: enemy.x + (Math.random() - 0.5) * 30,
                y: enemy.y + (Math.random() - 0.5) * 30,
                value: value,
                color: color,
                collected: false
            });
        }
    }
}
