class UpgradeSystem {
    constructor() {
        this.stats = {
            maxHP:           { level: 0, max: 5, name: 'Max HP',      icon: '\u2665', perLevel: 20,   type: 'flat',  color: '#4488ff' },
            regen:           { level: 0, max: 5, name: 'Regen',       icon: '\u271A', perLevel: 0.5,  type: 'flat',  color: '#4488ff' },
            damage:          { level: 0, max: 5, name: 'Damage',      icon: '\u2694', perLevel: 0.10, type: 'mult',  color: '#ff4444' },
            fireRate:        { level: 0, max: 5, name: 'Fire Rate',   icon: '\u26A1', perLevel: 0.15, type: 'mult',  color: '#ff4444' },
            moveSpeed:       { level: 0, max: 5, name: 'Speed',       icon: '\u25BA', perLevel: 0.08, type: 'mult',  color: '#4488ff' },
            range:           { level: 0, max: 5, name: 'Range',       icon: '\u25CE', perLevel: 0.12, type: 'mult',  color: '#4488ff' },
            penetration:     { level: 0, max: 5, name: 'Pierce',      icon: '\u00BB', perLevel: 1,    type: 'flat',  color: '#ffd700' },
            projectileSpeed: { level: 0, max: 5, name: 'Proj Speed',  icon: '\u2192', perLevel: 0.15, type: 'mult',  color: '#4488ff' }
        };
    }

    getMultiplier(statName) {
        const s = this.stats[statName];
        if (s.type === 'mult') return 1 + s.level * s.perLevel;
        return s.level * s.perLevel;
    }

    getUpgradeOptions() {
        const available = Object.keys(this.stats).filter(k => this.stats[k].level < this.stats[k].max);
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }
        return available.slice(0, 3);
    }

    applyUpgrade(statName) {
        const s = this.stats[statName];
        if (s.level < s.max) s.level++;
    }

    getDescription(statName) {
        const s = this.stats[statName];
        if (statName === 'maxHP') return '+' + s.perLevel + ' HP';
        if (statName === 'regen') return '+' + s.perLevel + ' HP/s';
        if (statName === 'penetration') return '+' + s.perLevel + ' pierce';
        return '+' + Math.round(s.perLevel * 100) + '%';
    }
}
