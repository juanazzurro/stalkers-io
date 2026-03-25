class CollisionSystem {
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

    static check(player, enemies, playerProj, enemyProj, xpOrbs) {
        // Player projectiles vs enemies
        for (const proj of playerProj) {
            if (proj.dead) continue;
            const pr = this.projRadius(proj.type);

            for (const enemy of enemies) {
                if (enemy.dying) continue;
                if (proj.hitTargets.has(enemy)) continue;
                if (!this.circleHit(proj.x, proj.y, pr, enemy.x, enemy.y, enemy.size)) continue;

                enemy.takeDamage(proj.damage);
                proj.hitTargets.add(enemy);

                // AOE
                if (proj.aoeRadius > 0) {
                    for (const other of enemies) {
                        if (other === enemy || other.dying) continue;
                        if (this.circleHit(proj.x, proj.y, proj.aoeRadius, other.x, other.y, other.size)) {
                            other.takeDamage(proj.damage * 0.5);
                            if (other.hp <= 0 && !other.dying) {
                                other.die();
                                this.spawnXP(other, xpOrbs);
                            }
                        }
                    }
                }

                if (enemy.hp <= 0 && !enemy.dying) {
                    enemy.die();
                    this.spawnXP(enemy, xpOrbs);
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
            const pr = this.projRadius(proj.type);
            if (!this.circleHit(proj.x, proj.y, pr, player.x, player.y, player.size)) continue;

            let dmg = proj.damage;
            if (player.data.passiveDmgReduction) {
                dmg *= (1 - player.data.passiveDmgReduction);
            }
            player.hp = Math.max(0, player.hp - dmg);
            proj.dead = true;
        }

        // Kamikaze contact
        for (const enemy of enemies) {
            if (enemy.dying || enemy.data.behavior !== 'rush') continue;
            if (!this.circleHit(enemy.x, enemy.y, enemy.size, player.x, player.y, player.size)) continue;

            let dmg = enemy.data.explosionDamage || 40;
            if (player.data.passiveDmgReduction) {
                dmg *= (1 - player.data.passiveDmgReduction);
            }
            player.hp = Math.max(0, player.hp - dmg);
            enemy.hp = 0;
            enemy.die();
            this.spawnXP(enemy, xpOrbs);
        }
    }

    static spawnXP(enemy, xpOrbs) {
        const totalXP = enemy.data.xpValue || 10;
        const count = 3;
        const value = Math.ceil(totalXP / count);
        for (let i = 0; i < count; i++) {
            xpOrbs.push({
                x: enemy.x + (Math.random() - 0.5) * 30,
                y: enemy.y + (Math.random() - 0.5) * 30,
                value: value,
                collected: false
            });
        }
    }
}
