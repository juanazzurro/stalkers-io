class WaveManager {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.wave = 1;
        this.state = 'announce'; // announce, active, break
        this.timer = 0;
        this.isBossWave = false;
        this.announceText = 'WAVE 1';
        this.announceDuration = 2000;
        this.breakDuration = 5000;
    }

    update(dt, enemies, player) {
        if (this.state === 'break') {
            this.timer += dt;
            if (this.timer >= this.breakDuration) {
                this.nextWave();
            }
            return null;
        }

        if (this.state === 'announce') {
            this.timer += dt;
            if (this.timer >= this.announceDuration) {
                this.state = 'active';
                return this.spawnWave(player);
            }
            return null;
        }

        if (this.state === 'active') {
            let alive = 0;
            for (let i = 0; i < enemies.length; i++) {
                if (!enemies[i].dying && !enemies[i].removed) { alive++; break; }
            }
            if (alive === 0) {
                this.state = 'break';
                this.timer = 0;
            }
        }

        return null;
    }

    nextWave() {
        this.wave++;
        this.isBossWave = this.wave % 5 === 0;
        this.state = 'announce';
        this.timer = 0;
        this.announceDuration = this.isBossWave ? 3000 : 2000;
        this.announceText = 'WAVE ' + this.wave;
    }

    spawnWave(player) {
        const enemies = [];
        const count = this.getEnemyCount();
        const types = this.getEnemyTypes();

        for (let i = 0; i < count; i++) {
            const typeName = this.pickType(types, i, count);
            const data = this.applyScaling({ ...ENEMIES[typeName] });
            const pos = this.getSpawnPos(player);
            enemies.push(new Enemy(data, pos.x, pos.y, this.mapWidth, this.mapHeight));
        }

        if (this.isBossWave) {
            const data = this.applyScaling({ ...ENEMIES.COMMANDER });
            if (data.shieldHp && this.wave > 20) {
                data.shieldHp = Math.round(data.shieldHp * (1 + (this.wave - 20) * 0.1));
            }
            const pos = this.getSpawnPos(player);
            enemies.push(new Enemy(data, pos.x, pos.y, this.mapWidth, this.mapHeight));
        }

        return enemies;
    }

    getEnemyCount() {
        if (this.wave <= 5) return 2 + this.wave;
        if (this.wave <= 10) return 4 + this.wave;
        if (this.wave <= 15) return 7 + this.wave;
        return Math.ceil((9 + this.wave) * 1.2);
    }

    getEnemyTypes() {
        if (this.wave <= 5) return ['RECRUIT'];
        if (this.wave <= 10) return ['RECRUIT', 'SCOUT'];
        if (this.wave <= 15) return ['RECRUIT', 'SCOUT', 'VETERAN', 'SNIPER'];
        return ['RECRUIT', 'SCOUT', 'VETERAN', 'SNIPER', 'KAMIKAZE'];
    }

    pickType(types, index, total) {
        if (types.length === 1) return types[0];
        const basicCount = Math.ceil(total * 0.5);
        if (index < basicCount) return types[0];
        const rest = types.slice(1);
        return rest[(index - basicCount) % rest.length];
    }

    applyScaling(data) {
        if (this.wave > 20) {
            const scale = 1 + (this.wave - 20) * 0.1;
            data.hp = Math.round(data.hp * scale);
            if (data.damage) data.damage = Math.round(data.damage * scale);
            if (data.explosionDamage) data.explosionDamage = Math.round(data.explosionDamage * scale);
        }
        return data;
    }

    getSpawnPos(player) {
        let x, y;
        do {
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { x = Math.random() * this.mapWidth; y = 50; }
            else if (edge === 1) { x = Math.random() * this.mapWidth; y = this.mapHeight - 50; }
            else if (edge === 2) { x = 50; y = Math.random() * this.mapHeight; }
            else { x = this.mapWidth - 50; y = Math.random() * this.mapHeight; }
        } while (Math.hypot(x - player.x, y - player.y) < 500);
        return { x, y };
    }

    getAnnouncement() {
        if (this.state !== 'announce') return null;

        const progress = this.timer / this.announceDuration;
        let alpha;
        if (progress < 0.25) alpha = progress / 0.25;
        else if (progress > 0.75) alpha = (1 - progress) / 0.25;
        else alpha = 1;

        return {
            text: this.announceText,
            alpha: alpha,
            isBoss: this.isBossWave,
            shakeX: this.isBossWave ? (Math.random() - 0.5) * 8 : 0,
            shakeY: this.isBossWave ? (Math.random() - 0.5) * 4 : 0
        };
    }
}
