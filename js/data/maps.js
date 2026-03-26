// Generate tile map layout and merge wall tiles into collision rects
const MAP_LAYOUT = generateMapLayout();
const MAP_WALL_OBSTACLES = mergeWallTiles(MAP_LAYOUT.tiles);

// Manually placed destructible obstacles on walkable floor tiles
const MAP_DESTRUCTIBLE_OBSTACLES = [
    // Barrels — courtyard and buildings
    { type: 'barrel', x: 24 * TILE_SIZE + 16, y: 22 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 68 * TILE_SIZE + 16, y: 24 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 30 * TILE_SIZE + 16, y: 45 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 65 * TILE_SIZE + 16, y: 50 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 50 * TILE_SIZE + 16, y: 30 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 35 * TILE_SIZE + 16, y: 65 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#7A5234' },
    { type: 'barrel', x: 8 * TILE_SIZE + 16, y: 38 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#8B5E3C' },
    { type: 'barrel', x: 74 * TILE_SIZE + 16, y: 33 * TILE_SIZE + 16, radius: 15, hp: 50, destructible: true, color: '#7A5234' },

    // Cars — courtyard
    { type: 'car', x: 28 * TILE_SIZE, y: 28 * TILE_SIZE, w: 60, h: 30, hp: 50, destructible: true, color: '#6a6a6a' },
    { type: 'car', x: 58 * TILE_SIZE, y: 52 * TILE_SIZE, w: 60, h: 30, hp: 50, destructible: true, color: '#4a5a3a' },
    { type: 'car', x: 42 * TILE_SIZE, y: 55 * TILE_SIZE, w: 60, h: 30, hp: 50, destructible: true, color: '#7a3333' },

    // Brick walls — low cover in courtyard
    { type: 'brick_wall', x: 35 * TILE_SIZE, y: 25 * TILE_SIZE, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 55 * TILE_SIZE, y: 42 * TILE_SIZE, w: 20, h: 50, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 40 * TILE_SIZE, y: 48 * TILE_SIZE, w: 50, h: 20, hp: 50, destructible: true, color: '#8B3A3A' },
    { type: 'brick_wall', x: 25 * TILE_SIZE, y: 38 * TILE_SIZE, w: 20, h: 50, hp: 50, destructible: true, color: '#8B3A3A' },
];

const MAP_OBSTACLES = [...MAP_WALL_OBSTACLES, ...MAP_DESTRUCTIBLE_OBSTACLES];
const MAP_SPAWN_POINTS = MAP_LAYOUT.spawnPoints;
