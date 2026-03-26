// ===== TILE SYSTEM CONSTANTS =====
const TILE_SIZE = 32;
const MAP_TILES_X = 94;
const MAP_TILES_Y = 94;
const MAP_PIXEL_W = MAP_TILES_X * TILE_SIZE; // 3008
const MAP_PIXEL_H = MAP_TILES_Y * TILE_SIZE; // 3008

const TILE = {
    FLOOR_CONCRETE: 0,
    FLOOR_TILE: 1,
    FLOOR_DIRT: 2,
    FLOOR_SNOW: 3,
    WALL: 4,
    WALL_DESTROYED: 5
};

const TILE_PALETTES = {
    [TILE.FLOOR_CONCRETE]: ['#4a4a4a', '#474747', '#4d4d4d', '#444444'],
    [TILE.FLOOR_TILE]:     ['#5a5a50', '#585848', '#5c5c52', '#565646'],
    [TILE.FLOOR_DIRT]:     ['#5a4a3a', '#584838', '#5c4c3c', '#564636'],
    [TILE.FLOOR_SNOW]:     ['#c8c8cc', '#c4c4c8', '#ccccce', '#c0c0c4'],
    [TILE.WALL]:           ['#3a3a3a', '#383838', '#3c3c3c'],
    [TILE.WALL_DESTROYED]: ['#5a4a4a', '#584848', '#5c4c4c']
};

// ===== PIXEL ART SPRITE DATA =====
const SPRITE_USSR_FLAG = [
    ['#555', '#555', null,    null,    null,    null,    null,    null],
    ['#555', '#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a', null, null],
    ['#555', '#8b1a1a','#cc9900','#cc9900','#8b1a1a','#8b1a1a','#8b1a1a', null],
    ['#555', '#8b1a1a','#cc9900','#8b1a1a','#cc9900','#8b1a1a','#8b1a1a', null],
    ['#555', '#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a', null,  null],
    ['#555', '#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a', null,    null,   null],
    ['#555', '#8b1a1a','#8b1a1a','#8b1a1a', null,    null,    null,    null],
    ['#555', null,    null,    null,    null,    null,    null,    null],
    ['#555', null,    null,    null,    null,    null,    null,    null],
    ['#555', null,    null,    null,    null,    null,    null,    null],
];

const SPRITE_POSTER = [
    ['#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60'],
    ['#8a7a60','#b0a080','#b0a080','#b0a080','#b0a080','#b0a080','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#b0a080','#8b1a1a','#8b1a1a','#b0a080','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#8b1a1a','#8b1a1a','#8b1a1a','#8b1a1a','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#b0a080','#8b1a1a','#8b1a1a','#b0a080','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#b0a080','#b0a080','#b0a080','#b0a080','#b0a080','#8a7a60'],
    ['#8a7a60','#b0a080','#b0a080','#cc9900','#cc9900','#b0a080','#b0a080','#8a7a60'],
    ['#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60','#8a7a60'],
];

const SPRITE_CAR_WRECK = [
    [null,    null,    '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', null,   null],
    ['#222', '#555', '#555', '#555', '#555', '#4a6a8a','#4a6a8a','#555', '#555', '#555', '#555', '#222'],
    ['#222', '#666', '#666', '#666', '#666', '#666', '#666', '#666', '#666', '#666', '#666', '#222'],
    ['#222', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#222'],
    [null,    null,    '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', null,   null],
    [null,    '#222', null,   null,   null,   null,   null,   null,   null,   null,   '#222', null],
];

const SPRITE_TANK_WRECK = [
    [null,    null,    null,    null,    null,    null,    '#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a',null,    null],
    [null,    null,    null,    null,    null,    null,    '#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a',null,    null],
    ['#333', '#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#333'],
    ['#333', '#3a4a1a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#5a6a3a','#5a6a3a','#5a6a3a','#5a6a3a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#3a4a1a','#333'],
    ['#333', '#3a4a1a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#5a6a3a','#5a6a3a','#5a6a3a','#5a6a3a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#3a4a1a','#333'],
    ['#333', '#3a4a1a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#5a6a3a','#5a6a3a','#5a6a3a','#5a6a3a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#3a4a1a','#333'],
    ['#333', '#3a4a1a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#3a4a1a','#333'],
    ['#333', '#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#4a5a2a','#333'],
    [null,    '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', null],
    [null,    null,    '#333', null,   null,   '#333', null,   null,   null,   null,   '#333', null,   null,   '#333', null,   null],
];

// ===== TILE HELPERS =====
function getTile(tiles, tx, ty) {
    if (tx < 0 || tx >= MAP_TILES_X || ty < 0 || ty >= MAP_TILES_Y) return -1;
    return tiles[ty * MAP_TILES_X + tx];
}

function setTile(tiles, tx, ty, val) {
    if (tx >= 0 && tx < MAP_TILES_X && ty >= 0 && ty < MAP_TILES_Y) {
        tiles[ty * MAP_TILES_X + tx] = val;
    }
}

function fillTileRect(tiles, tx, ty, tw, th, val) {
    for (let dy = 0; dy < th; dy++) {
        for (let dx = 0; dx < tw; dx++) {
            setTile(tiles, tx + dx, ty + dy, val);
        }
    }
}

function drawWallRect(tiles, tx, ty, tw, th) {
    for (let dx = 0; dx < tw; dx++) {
        setTile(tiles, tx + dx, ty, TILE.WALL);
        setTile(tiles, tx + dx, ty + th - 1, TILE.WALL);
    }
    for (let dy = 0; dy < th; dy++) {
        setTile(tiles, tx, ty + dy, TILE.WALL);
        setTile(tiles, tx + tw - 1, ty + dy, TILE.WALL);
    }
}

function carveDoor(tiles, tx, ty, width) {
    for (let i = 0; i < width; i++) {
        setTile(tiles, tx + i, ty, TILE.FLOOR_TILE);
    }
}

function carveHDoor(tiles, tx, ty, width) {
    for (let i = 0; i < width; i++) {
        setTile(tiles, tx, ty + i, TILE.FLOOR_TILE);
    }
}

// ===== BUILDING DEFINITIONS =====
function buildRoom(tiles, bx, by, bw, bh, floorType, doors) {
    // Fill interior
    fillTileRect(tiles, bx + 1, by + 1, bw - 2, bh - 2, floorType);
    // Draw walls on edges
    drawWallRect(tiles, bx, by, bw, bh);
    // Carve doors
    for (const door of doors) {
        if (door.side === 'south') {
            carveDoor(tiles, bx + door.offset, by + bh - 1, door.width || 2);
        } else if (door.side === 'north') {
            carveDoor(tiles, bx + door.offset, by, door.width || 2);
        } else if (door.side === 'east') {
            carveHDoor(tiles, bx + bw - 1, by + door.offset, door.width || 2);
        } else if (door.side === 'west') {
            carveHDoor(tiles, bx, by + door.offset, door.width || 2);
        }
    }
}

// ===== MAP LAYOUT GENERATOR =====
function generateMapLayout() {
    const tiles = new Uint8Array(MAP_TILES_X * MAP_TILES_Y);
    const tileVariants = new Uint8Array(MAP_TILES_X * MAP_TILES_Y);
    const spawnPoints = [];
    const decorations = [];

    // 1. Fill everything with snow
    tiles.fill(TILE.FLOOR_SNOW);

    // 2. Perimeter wall (inset 2 tiles from edge)
    const PW = 2; // perimeter wall inset
    const PW_END = 91; // 94 - 3
    for (let tx = PW; tx <= PW_END; tx++) {
        setTile(tiles, tx, PW, TILE.WALL);
        setTile(tiles, tx, PW_END, TILE.WALL);
    }
    for (let ty = PW; ty <= PW_END; ty++) {
        setTile(tiles, PW, ty, TILE.WALL);
        setTile(tiles, PW_END, ty, TILE.WALL);
    }

    // Some destroyed wall sections near entries
    const destroyedWallSpots = [
        {tx: 42, ty: 2}, {tx: 49, ty: 2},
        {tx: 42, ty: 91}, {tx: 49, ty: 91},
        {tx: 2, ty: 42}, {tx: 91, ty: 42},
        {tx: 91, ty: 49}, {tx: 2, ty: 49},
    ];
    for (const spot of destroyedWallSpots) {
        setTile(tiles, spot.tx, spot.ty, TILE.WALL_DESTROYED);
    }

    // 6 entry gaps (3 tiles wide)
    const gaps = [
        { name: 'NORTH', tiles: [{tx:45,ty:2},{tx:46,ty:2},{tx:47,ty:2}] },
        { name: 'SOUTH', tiles: [{tx:45,ty:91},{tx:46,ty:91},{tx:47,ty:91}] },
        { name: 'WEST',  tiles: [{tx:2,ty:45},{tx:2,ty:46},{tx:2,ty:47}] },
        { name: 'EAST',  tiles: [{tx:91,ty:45},{tx:91,ty:46},{tx:91,ty:47}] },
        { name: 'NE',    tiles: [{tx:91,ty:15},{tx:91,ty:16},{tx:91,ty:17}] },
        { name: 'SW',    tiles: [{tx:2,ty:75},{tx:2,ty:76},{tx:2,ty:77}] },
    ];

    for (const gap of gaps) {
        for (const t of gap.tiles) {
            setTile(tiles, t.tx, t.ty, TILE.FLOOR_DIRT);
        }
        // Spawn point at center of gap
        const cx = gap.tiles[1].tx * TILE_SIZE + TILE_SIZE / 2;
        const cy = gap.tiles[1].ty * TILE_SIZE + TILE_SIZE / 2;
        spawnPoints.push({ x: cx, y: cy });
    }

    // 3. Courtyard (central open area)
    fillTileRect(tiles, 15, 20, 64, 38, TILE.FLOOR_CONCRETE); // tiles 15-78, 20-57

    // Dirt patches in courtyard
    fillTileRect(tiles, 20, 30, 8, 5, TILE.FLOOR_DIRT);
    fillTileRect(tiles, 55, 40, 10, 4, TILE.FLOOR_DIRT);
    fillTileRect(tiles, 35, 48, 6, 6, TILE.FLOOR_DIRT);
    fillTileRect(tiles, 45, 25, 5, 3, TILE.FLOOR_DIRT);

    // 4. Main building (center-north) — 22,4 size 20x14
    const MB = { x: 22, y: 4, w: 50, h: 14 };
    fillTileRect(tiles, MB.x, MB.y, MB.w, MB.h, TILE.FLOOR_TILE);
    drawWallRect(tiles, MB.x, MB.y, MB.w, MB.h);

    // Internal vertical walls (partitions)
    for (let dy = 0; dy < MB.h; dy++) {
        setTile(tiles, MB.x + 12, MB.y + dy, TILE.WALL);
        setTile(tiles, MB.x + 25, MB.y + dy, TILE.WALL);
        setTile(tiles, MB.x + 38, MB.y + dy, TILE.WALL);
    }
    // Internal horizontal wall in left section
    for (let dx = 0; dx < 12; dx++) {
        setTile(tiles, MB.x + dx, MB.y + 7, TILE.WALL);
    }
    // Internal horizontal wall in middle section
    for (let dx = 13; dx < 25; dx++) {
        setTile(tiles, MB.x + dx, MB.y + 7, TILE.WALL);
    }

    // Doors — south wall
    carveDoor(tiles, MB.x + 5, MB.y + MB.h - 1, 3);
    carveDoor(tiles, MB.x + 15, MB.y + MB.h - 1, 3);
    carveDoor(tiles, MB.x + 30, MB.y + MB.h - 1, 3);
    carveDoor(tiles, MB.x + 42, MB.y + MB.h - 1, 3);
    // Doors — east wall
    carveHDoor(tiles, MB.x + MB.w - 1, MB.y + 5, 3);
    // Doors — west wall
    carveHDoor(tiles, MB.x, MB.y + 5, 3);
    // Internal doors (gaps in partition walls)
    carveDoor(tiles, MB.x + 12, MB.y + 3, 1); // door through first vertical partition top
    carveDoor(tiles, MB.x + 12, MB.y + 10, 1); // door through first vertical partition bottom
    carveDoor(tiles, MB.x + 25, MB.y + 3, 1);
    carveDoor(tiles, MB.x + 25, MB.y + 10, 1);
    carveDoor(tiles, MB.x + 38, MB.y + 5, 1);
    carveDoor(tiles, MB.x + 38, MB.y + 10, 1);
    // Horizontal partition doors
    carveDoor(tiles, MB.x + 5, MB.y + 7, 2);
    carveDoor(tiles, MB.x + 18, MB.y + 7, 2);

    // 5. Secondary building (south) — 30,62 size 14x10
    const SB = { x: 30, y: 62, w: 14, h: 10 };
    fillTileRect(tiles, SB.x, SB.y, SB.w, SB.h, TILE.FLOOR_TILE);
    drawWallRect(tiles, SB.x, SB.y, SB.w, SB.h);
    // Internal partition
    for (let dy = 0; dy < SB.h; dy++) {
        setTile(tiles, SB.x + 7, SB.y + dy, TILE.WALL);
    }
    // Doors
    carveDoor(tiles, SB.x + 3, SB.y, 2); // north left
    carveDoor(tiles, SB.x + 9, SB.y, 2); // north right
    carveHDoor(tiles, SB.x + SB.w - 1, SB.y + 4, 2); // east
    carveDoor(tiles, SB.x + 7, SB.y + 4, 1); // internal

    // 6. Guard post NW (5,5,6,6)
    buildRoom(tiles, 5, 5, 6, 6, TILE.FLOOR_CONCRETE, [
        { side: 'south', offset: 2 },
        { side: 'east', offset: 2 }
    ]);

    // Guard post NE (83,5,6,6)
    buildRoom(tiles, 83, 5, 6, 6, TILE.FLOOR_CONCRETE, [
        { side: 'south', offset: 2 },
        { side: 'west', offset: 2 }
    ]);

    // 7. Storage east (70,30,10,7)
    buildRoom(tiles, 70, 30, 10, 7, TILE.FLOOR_CONCRETE, [
        { side: 'west', offset: 2 },
        { side: 'south', offset: 4 }
    ]);

    // 8. Barracks west (5,35,12,9)
    const BK = { x: 5, y: 35, w: 12, h: 9 };
    fillTileRect(tiles, BK.x, BK.y, BK.w, BK.h, TILE.FLOOR_TILE);
    drawWallRect(tiles, BK.x, BK.y, BK.w, BK.h);
    // Partition
    for (let dy = 0; dy < BK.h; dy++) {
        setTile(tiles, BK.x + 6, BK.y + dy, TILE.WALL);
    }
    // Doors
    carveHDoor(tiles, BK.x + BK.w - 1, BK.y + 3, 2);
    carveDoor(tiles, BK.x + 6, BK.y + 4, 1); // internal

    // 9. Worn dirt paths from perimeter entries toward buildings
    // North entry path
    fillTileRect(tiles, 45, 3, 3, 17, TILE.FLOOR_DIRT);
    // South entry path
    fillTileRect(tiles, 45, 58, 3, 33, TILE.FLOOR_DIRT);
    // West entry path
    fillTileRect(tiles, 3, 45, 12, 3, TILE.FLOOR_DIRT);
    // East entry path
    fillTileRect(tiles, 80, 45, 11, 3, TILE.FLOOR_DIRT);
    // NE entry path
    fillTileRect(tiles, 80, 15, 11, 3, TILE.FLOOR_DIRT);
    // SW entry path
    fillTileRect(tiles, 3, 75, 12, 3, TILE.FLOOR_DIRT);

    // Small connecting building (between main and courtyard)
    buildRoom(tiles, 55, 18, 8, 6, TILE.FLOOR_TILE, [
        { side: 'north', offset: 3 },
        { side: 'south', offset: 3 },
        { side: 'west', offset: 2 }
    ]);

    // 10. Generate tile variants
    for (let i = 0; i < tiles.length; i++) {
        const palette = TILE_PALETTES[tiles[i]];
        tileVariants[i] = Math.floor(Math.random() * (palette ? palette.length : 1));
    }

    // 11. Generate decorations
    // USSR flags — on exterior walls of main building
    decorations.push({ type: 'ussr_flag', x: (MB.x + 2) * TILE_SIZE, y: (MB.y - 1) * TILE_SIZE, animated: false, variant: 0 });
    decorations.push({ type: 'ussr_flag', x: (MB.x + 20) * TILE_SIZE, y: (MB.y - 1) * TILE_SIZE, animated: false, variant: 1 });
    decorations.push({ type: 'ussr_flag', x: (MB.x + 35) * TILE_SIZE, y: (MB.y - 1) * TILE_SIZE, animated: false, variant: 0 });
    decorations.push({ type: 'ussr_flag', x: (MB.x + 48) * TILE_SIZE, y: (MB.y - 1) * TILE_SIZE, animated: false, variant: 1 });

    // Propaganda posters — on walls
    decorations.push({ type: 'poster', x: (SB.x + 2) * TILE_SIZE, y: (SB.y - 1) * TILE_SIZE, animated: false, variant: 0 });
    decorations.push({ type: 'poster', x: (BK.x + 3) * TILE_SIZE, y: (BK.y - 1) * TILE_SIZE, animated: false, variant: 1 });
    decorations.push({ type: 'poster', x: 84 * TILE_SIZE, y: 4 * TILE_SIZE, animated: false, variant: 0 });

    // Fire barrels — courtyard and near guard posts
    decorations.push({ type: 'fire_barrel', x: 18 * TILE_SIZE, y: 22 * TILE_SIZE, animated: true, variant: 0 });
    decorations.push({ type: 'fire_barrel', x: 75 * TILE_SIZE, y: 22 * TILE_SIZE, animated: true, variant: 1 });
    decorations.push({ type: 'fire_barrel', x: 18 * TILE_SIZE, y: 55 * TILE_SIZE, animated: true, variant: 2 });
    decorations.push({ type: 'fire_barrel', x: 75 * TILE_SIZE, y: 55 * TILE_SIZE, animated: true, variant: 0 });
    decorations.push({ type: 'fire_barrel', x: 8 * TILE_SIZE, y: 12 * TILE_SIZE, animated: true, variant: 1 });
    decorations.push({ type: 'fire_barrel', x: 86 * TILE_SIZE, y: 12 * TILE_SIZE, animated: true, variant: 2 });

    // Craters — courtyard and near perimeter
    decorations.push({ type: 'crater', x: 30 * TILE_SIZE, y: 35 * TILE_SIZE, animated: false, radius: 14 });
    decorations.push({ type: 'crater', x: 60 * TILE_SIZE, y: 28 * TILE_SIZE, animated: false, radius: 10 });
    decorations.push({ type: 'crater', x: 50 * TILE_SIZE, y: 50 * TILE_SIZE, animated: false, radius: 16 });
    decorations.push({ type: 'crater', x: 25 * TILE_SIZE, y: 52 * TILE_SIZE, animated: false, radius: 12 });
    decorations.push({ type: 'crater', x: 70 * TILE_SIZE, y: 48 * TILE_SIZE, animated: false, radius: 11 });
    decorations.push({ type: 'crater', x: 10 * TILE_SIZE, y: 82 * TILE_SIZE, animated: false, radius: 13 });

    // Puddles — courtyard
    decorations.push({ type: 'puddle', x: 38 * TILE_SIZE, y: 32 * TILE_SIZE, animated: false, w: 40, h: 24 });
    decorations.push({ type: 'puddle', x: 55 * TILE_SIZE, y: 45 * TILE_SIZE, animated: false, w: 30, h: 20 });
    decorations.push({ type: 'puddle', x: 22 * TILE_SIZE, y: 48 * TILE_SIZE, animated: false, w: 35, h: 18 });
    decorations.push({ type: 'puddle', x: 65 * TILE_SIZE, y: 38 * TILE_SIZE, animated: false, w: 28, h: 22 });

    // Barbed wire — near perimeter gaps
    decorations.push({ type: 'barbed_wire', x: 43 * TILE_SIZE, y: 3 * TILE_SIZE, animated: false, length: 64, horizontal: true });
    decorations.push({ type: 'barbed_wire', x: 49 * TILE_SIZE, y: 3 * TILE_SIZE, animated: false, length: 64, horizontal: true });
    decorations.push({ type: 'barbed_wire', x: 3 * TILE_SIZE, y: 43 * TILE_SIZE, animated: false, length: 64, horizontal: false });
    decorations.push({ type: 'barbed_wire', x: 3 * TILE_SIZE, y: 49 * TILE_SIZE, animated: false, length: 64, horizontal: false });

    // Car wrecks — courtyard (visual only)
    decorations.push({ type: 'car_wreck', x: 40 * TILE_SIZE, y: 40 * TILE_SIZE, animated: false, variant: 0 });
    decorations.push({ type: 'car_wreck', x: 62 * TILE_SIZE, y: 34 * TILE_SIZE, animated: false, variant: 1 });

    // Tank wreck — courtyard center
    decorations.push({ type: 'tank_wreck', x: 47 * TILE_SIZE, y: 38 * TILE_SIZE, animated: false, variant: 0 });

    return { tiles, tileVariants, spawnPoints, decorations };
}

// ===== GREEDY WALL MERGE =====
function mergeWallTiles(tiles) {
    const visited = new Uint8Array(MAP_TILES_X * MAP_TILES_Y);
    const rects = [];

    for (let ty = 0; ty < MAP_TILES_Y; ty++) {
        for (let tx = 0; tx < MAP_TILES_X; tx++) {
            const idx = ty * MAP_TILES_X + tx;
            if (visited[idx]) continue;
            const tileType = tiles[idx];
            if (tileType !== TILE.WALL && tileType !== TILE.WALL_DESTROYED) continue;

            // Extend right
            let w = 1;
            while (tx + w < MAP_TILES_X) {
                const nIdx = ty * MAP_TILES_X + tx + w;
                const nt = tiles[nIdx];
                if ((nt !== TILE.WALL && nt !== TILE.WALL_DESTROYED) || visited[nIdx]) break;
                w++;
            }

            // Extend down
            let h = 1;
            let canExtend = true;
            while (canExtend && ty + h < MAP_TILES_Y) {
                for (let dx = 0; dx < w; dx++) {
                    const cIdx = (ty + h) * MAP_TILES_X + tx + dx;
                    const ct = tiles[cIdx];
                    if ((ct !== TILE.WALL && ct !== TILE.WALL_DESTROYED) || visited[cIdx]) {
                        canExtend = false;
                        break;
                    }
                }
                if (canExtend) h++;
            }

            // Mark visited
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    visited[(ty + dy) * MAP_TILES_X + tx + dx] = 1;
                }
            }

            rects.push({
                type: 'wall',
                x: tx * TILE_SIZE,
                y: ty * TILE_SIZE,
                w: w * TILE_SIZE,
                h: h * TILE_SIZE,
                destructible: false,
                color: '#3a3a3a'
            });
        }
    }

    return rects;
}
