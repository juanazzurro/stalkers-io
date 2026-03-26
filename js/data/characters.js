const CHARACTERS = {
    MUTANT: {
        name: 'Grigori',
        hp: 100,
        speed: 3.5,
        damage: 8,
        fireRate: 4,
        range: 5,
        hitboxRadius: 18,
        projectileColor: '#39ff14',
        projectileType: 'vomit',
        passiveRadius: 80,
        passiveDmg: 1
    },
    OLIGARCH: {
        name: 'Viktor',
        hp: 88,
        speed: 3,
        damage: 12,
        fireRate: 2,
        range: 7,
        hitboxRadius: 18,
        projectileColor: '#c0c0c0',
        projectileType: 'bottle',
        aoeRadius: 30,
        passiveXPBonus: 0.15
    },
    TANK: {
        name: 'T-72',
        hp: 220,
        speed: 1.5,
        damage: 25,
        fireRate: 0.5,
        range: 10,
        hitboxRadius: 30,
        projectileColor: '#444',
        projectileType: 'shell',
        aoeRadius: 60,
        passiveDmgReduction: 0.25
    },
    BEAR: {
        name: 'Misha',
        hp: 143,
        speed: 3,
        damage: 6,
        fireRate: 5,
        range: 4,
        hitboxRadius: 25,
        projectileColor: '#8B4513',
        projectileType: 'poop',
        passiveSpeedBoost: 0.3
    }
};
