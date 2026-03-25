const ENEMIES = {
    RECRUIT: {
        hp: 20, damage: 5, speed: 2, fireRate: 1, range: 5,
        hitboxRadius: 14, color: '#4a5', bandanaColor: '#3a5',
        behavior: 'chase'
    },
    SCOUT: {
        hp: 12, damage: 3, speed: 4.5, fireRate: 3, range: 4,
        hitboxRadius: 12, color: '#333', bandanaColor: '#111',
        behavior: 'flank'
    },
    VETERAN: {
        hp: 60, damage: 10, speed: 1.5, fireRate: 0.3, range: 8,
        hitboxRadius: 18, color: '#654', bandanaColor: '#a22',
        behavior: 'advance', aoeRadius: 40
    },
    SNIPER: {
        hp: 15, damage: 18, speed: 1, fireRate: 0.2, range: 12,
        hitboxRadius: 12, color: '#555', bandanaColor: '#fff',
        behavior: 'snipe'
    },
    KAMIKAZE: {
        hp: 30, explosionDamage: 40, speed: 5,
        hitboxRadius: 14, color: '#665', bandanaColor: '#dd0',
        behavior: 'rush', explosionRadius: 50
    },
    COMMANDER: {
        hp: 300, damage: 15, speed: 2, fireRate: 1, range: 7,
        hitboxRadius: 25, color: '#444', bandanaColor: '#da0',
        behavior: 'boss', shieldHp: 50, spawnInterval: 8000
    }
};
