const MAP_OBSTACLES = [
    // === DESTRUCTIBLE: Barrels (~8) ===
    { type: 'barrel', x: 400, y: 400, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 850, y: 300, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 2600, y: 450, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 2200, y: 2100, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 500, y: 2500, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 1800, y: 600, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 700, y: 1800, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 2400, y: 1400, radius: 15, hp: 50, destructible: true, color: '#7A5234' },

    // === DESTRUCTIBLE: Cars (~6) ===
    { type: 'car', x: 600, y: 700, w: 60, h: 30, hp: 50, destructible: true, color: '#6a6a6a' },
    { type: 'car', x: 2100, y: 500, w: 60, h: 30, hp: 50, destructible: true, color: '#4a5a3a' },
    { type: 'car', x: 1200, y: 2300, w: 60, h: 30, hp: 50, destructible: true, color: '#7a3333' },
    { type: 'car', x: 2500, y: 2400, w: 60, h: 30, hp: 50, destructible: true, color: '#5a5a6a' },
    { type: 'car', x: 350, y: 1400, w: 60, h: 30, hp: 50, destructible: true, color: '#6a6a6a' },
    { type: 'car', x: 1900, y: 1800, w: 60, h: 30, hp: 50, destructible: true, color: '#4a5a3a' },

    // === DESTRUCTIBLE: Brick Walls (~6) ===
    { type: 'brick_wall', x: 1000, y: 400, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 2000, y: 1000, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 800, y: 2200, w: 20, h: 50, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 2700, y: 800, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 400, y: 1100, w: 20, h: 50, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 1600, y: 2600, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },

    // === INDESTRUCTIBLE: Buildings (~6) ===
    { type: 'building', x: 300, y: 200, w: 120, h: 100, destructible: false, color: '#555' },
    { type: 'building', x: 2600, y: 200, w: 100, h: 120, destructible: false, color: '#4a4a4a' },
    { type: 'building', x: 200, y: 2600, w: 130, h: 90, destructible: false, color: '#555' },
    { type: 'building', x: 2650, y: 2600, w: 110, h: 110, destructible: false, color: '#4a4a4a' },
    { type: 'building', x: 1200, y: 800, w: 100, h: 80, destructible: false, color: '#505050' },
    { type: 'building', x: 1800, y: 2200, w: 90, h: 110, destructible: false, color: '#555' },

    // === INDESTRUCTIBLE: Concrete Walls (~4) ===
    { type: 'concrete_wall', x: 900, y: 1200, w: 80, h: 25, destructible: false, color: '#444' },
    { type: 'concrete_wall', x: 2100, y: 1600, w: 25, h: 80, destructible: false, color: '#3a3a3a' },
    { type: 'concrete_wall', x: 1400, y: 400, w: 80, h: 25, destructible: false, color: '#444' },
    { type: 'concrete_wall', x: 600, y: 2000, w: 25, h: 80, destructible: false, color: '#3a3a3a' },
];
