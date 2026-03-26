const PIXEL_SIZE = 2;

class Renderer {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.mapLayout = null;
        this.animatedDecorations = [];
        this.time = 0;
    }

    // ===== PIXEL ART HELPERS =====

    drawPixel(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    drawPixelSprite(ctx, cx, cy, spriteData, scale) {
        scale = scale || 1;
        const rows = spriteData.length;
        const cols = spriteData[0].length;
        const pw = PIXEL_SIZE * scale;
        const offsetX = -(cols * pw) / 2;
        const offsetY = -(rows * pw) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const color = spriteData[r][c];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(cx + offsetX + c * pw, cy + offsetY + r * pw, pw, pw);
            }
        }
    }

    // ===== TILE MAP INIT =====

    initTileMap(mapLayout) {
        this.mapLayout = mapLayout;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = MAP_PIXEL_W;
        this.offscreenCanvas.height = MAP_PIXEL_H;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        this.renderTilesToOffscreen();
        this.renderStaticDecorationsToOffscreen();

        this.animatedDecorations = mapLayout.decorations.filter(function(d) { return d.animated; });
    }

    // ===== TILE RENDERING =====

    renderTilesToOffscreen() {
        var ctx = this.offscreenCtx;
        var tiles = this.mapLayout.tiles;
        var variants = this.mapLayout.tileVariants;

        for (var ty = 0; ty < MAP_TILES_Y; ty++) {
            for (var tx = 0; tx < MAP_TILES_X; tx++) {
                var idx = ty * MAP_TILES_X + tx;
                var tileType = tiles[idx];
                var variant = variants[idx];
                var palette = TILE_PALETTES[tileType];
                if (!palette) continue;
                var color = palette[variant % palette.length];

                var px = tx * TILE_SIZE;
                var py = ty * TILE_SIZE;

                ctx.fillStyle = color;
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

                this.renderTileDetail(ctx, px, py, tileType, variant);
            }
        }
    }

    renderTileDetail(ctx, px, py, tileType, variant) {
        switch (tileType) {
            case TILE.WALL:
                // Brick mortar pattern
                ctx.strokeStyle = 'rgba(0,0,0,0.25)';
                ctx.lineWidth = 1;
                // Horizontal mortar
                ctx.beginPath();
                ctx.moveTo(px, py + 16);
                ctx.lineTo(px + 32, py + 16);
                ctx.stroke();
                // Vertical mortar lines (offset on alternate rows)
                var offset = (variant % 2) * 8;
                for (var bx = px + offset; bx < px + 32; bx += 16) {
                    ctx.beginPath();
                    ctx.moveTo(bx, py);
                    ctx.lineTo(bx, py + 16);
                    ctx.stroke();
                }
                for (var bx2 = px + 8 - offset; bx2 < px + 32; bx2 += 16) {
                    ctx.beginPath();
                    ctx.moveTo(bx2, py + 16);
                    ctx.lineTo(bx2, py + 32);
                    ctx.stroke();
                }
                // Top edge highlight
                ctx.fillStyle = 'rgba(255,255,255,0.04)';
                ctx.fillRect(px, py, 32, 1);
                // Bottom edge shadow
                ctx.fillStyle = 'rgba(0,0,0,0.08)';
                ctx.fillRect(px, py + 31, 32, 1);
                break;

            case TILE.FLOOR_TILE:
                // Soviet institutional floor — 16x16 sub-tiles
                ctx.strokeStyle = 'rgba(0,0,0,0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + 16, py);
                ctx.lineTo(px + 16, py + 32);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(px, py + 16);
                ctx.lineTo(px + 32, py + 16);
                ctx.stroke();
                // Slight color variation on alternating sub-tiles
                if ((variant + Math.floor(px / 16) + Math.floor(py / 16)) % 3 === 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.03)';
                    ctx.fillRect(px, py, 16, 16);
                    ctx.fillRect(px + 16, py + 16, 16, 16);
                }
                break;

            case TILE.FLOOR_CONCRETE:
                // Random speckles
                if (variant > 1) {
                    ctx.fillStyle = 'rgba(0,0,0,0.06)';
                    ctx.fillRect(px + (variant * 7) % 28, py + (variant * 13) % 28, 2, 2);
                }
                if (variant === 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.04)';
                    ctx.fillRect(px + 12, py + 8, 3, 2);
                }
                // Occasional crack line
                if (variant === 3 && (px + py) % 256 < 64) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px + 4, py + 12);
                    ctx.lineTo(px + 18, py + 20);
                    ctx.lineTo(px + 28, py + 18);
                    ctx.stroke();
                }
                break;

            case TILE.FLOOR_DIRT:
                // Pebbles and texture
                if (variant === 0) {
                    ctx.fillStyle = 'rgba(80,70,60,0.3)';
                    ctx.fillRect(px + 12, py + 18, 3, 2);
                    ctx.fillRect(px + 22, py + 8, 2, 2);
                }
                if (variant === 2) {
                    ctx.fillStyle = 'rgba(100,90,70,0.2)';
                    ctx.fillRect(px + 6, py + 24, 4, 3);
                }
                break;

            case TILE.FLOOR_SNOW:
                // Wind-blown texture lines
                if (variant < 2) {
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.fillRect(px + 4, py + 8 + variant * 12, 24, 1);
                }
                // Dirt specks in snow
                if (variant === 3) {
                    ctx.fillStyle = 'rgba(80,70,60,0.1)';
                    ctx.fillRect(px + 14, py + 20, 3, 2);
                }
                break;

            case TILE.WALL_DESTROYED:
                // Cracked look
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + 6, py + 2);
                ctx.lineTo(px + 14, py + 18);
                ctx.lineTo(px + 26, py + 30);
                ctx.stroke();
                // Rubble dots
                ctx.fillStyle = 'rgba(80,70,60,0.2)';
                ctx.fillRect(px + 10, py + 12, 3, 3);
                ctx.fillRect(px + 20, py + 22, 4, 2);
                break;
        }
    }

    // ===== DECORATIONS =====

    renderStaticDecorationsToOffscreen() {
        var ctx = this.offscreenCtx;
        var decos = this.mapLayout.decorations;
        for (var i = 0; i < decos.length; i++) {
            if (!decos[i].animated) {
                this.drawDecoration(ctx, decos[i], 0);
            }
        }
    }

    drawDecoration(ctx, deco, time) {
        switch (deco.type) {
            case 'ussr_flag':
                this.drawPixelSprite(ctx, deco.x + 8, deco.y + 10, SPRITE_USSR_FLAG);
                break;

            case 'poster':
                this.drawPixelSprite(ctx, deco.x + 8, deco.y + 9, SPRITE_POSTER);
                break;

            case 'car_wreck':
                this.drawPixelSprite(ctx, deco.x + 12, deco.y + 6, SPRITE_CAR_WRECK);
                break;

            case 'tank_wreck':
                this.drawPixelSprite(ctx, deco.x + 16, deco.y + 10, SPRITE_TANK_WRECK);
                break;

            case 'fire_barrel':
                this.drawFireBarrel(ctx, deco, time);
                break;

            case 'crater':
                this.drawCrater(ctx, deco);
                break;

            case 'puddle':
                this.drawPuddle(ctx, deco);
                break;

            case 'barbed_wire':
                this.drawBarbedWire(ctx, deco);
                break;
        }
    }

    drawFireBarrel(ctx, deco, time) {
        // Brown barrel base
        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a5234';
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // Rim
        ctx.strokeStyle = '#4a2a0a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Animated flame tongues
        var phase = time * 0.006 + deco.variant * 2;
        var flames = [
            { dx: -3, color: '#ff6600', h: 6 + Math.sin(phase) * 3 },
            { dx: 0,  color: '#ffaa00', h: 8 + Math.sin(phase + 1.5) * 3 },
            { dx: 3,  color: '#ff4400', h: 5 + Math.sin(phase + 3) * 3 },
            { dx: -1, color: '#ffcc00', h: 4 + Math.sin(phase + 0.8) * 2 },
        ];
        for (var i = 0; i < flames.length; i++) {
            var f = flames[i];
            ctx.fillStyle = f.color;
            ctx.fillRect(deco.x + f.dx - 1, deco.y - 4 - f.h, 2, f.h);
        }
        // Glow
        ctx.fillStyle = 'rgba(255, 150, 0, 0.08)';
        ctx.beginPath();
        ctx.arc(deco.x, deco.y - 6, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCrater(ctx, deco) {
        var r = deco.radius || 12;
        // Outer dirt ring
        ctx.fillStyle = 'rgba(60, 50, 40, 0.3)';
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, r + 4, 0, Math.PI * 2);
        ctx.fill();
        // Inner dark
        ctx.fillStyle = 'rgba(30, 25, 20, 0.4)';
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, r, 0, Math.PI * 2);
        ctx.fill();
        // Highlight edge
        ctx.strokeStyle = 'rgba(90, 80, 70, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(deco.x, deco.y, r, -0.5, 1.5);
        ctx.stroke();
    }

    drawPuddle(ctx, deco) {
        var w = deco.w || 30;
        var h = deco.h || 20;
        // Dark water
        ctx.fillStyle = 'rgba(20, 35, 50, 0.35)';
        ctx.beginPath();
        ctx.ellipse(deco.x, deco.y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Reflection highlight
        ctx.fillStyle = 'rgba(60, 80, 100, 0.15)';
        ctx.beginPath();
        ctx.ellipse(deco.x - 3, deco.y - 2, w / 4, h / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBarbedWire(ctx, deco) {
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
        ctx.lineWidth = 1;
        var len = deco.length || 64;

        if (deco.horizontal) {
            ctx.beginPath();
            ctx.moveTo(deco.x, deco.y);
            ctx.lineTo(deco.x + len, deco.y);
            ctx.stroke();
            // Spikes
            ctx.strokeStyle = 'rgba(140, 140, 140, 0.6)';
            for (var i = 0; i < len; i += 8) {
                ctx.beginPath();
                ctx.moveTo(deco.x + i, deco.y - 3);
                ctx.lineTo(deco.x + i + 2, deco.y);
                ctx.lineTo(deco.x + i + 4, deco.y + 3);
                ctx.stroke();
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(deco.x, deco.y);
            ctx.lineTo(deco.x, deco.y + len);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(140, 140, 140, 0.6)';
            for (var j = 0; j < len; j += 8) {
                ctx.beginPath();
                ctx.moveTo(deco.x - 3, deco.y + j);
                ctx.lineTo(deco.x, deco.y + j + 2);
                ctx.lineTo(deco.x + 3, deco.y + j + 4);
                ctx.stroke();
            }
        }
    }

    // ===== TIME UPDATE =====

    updateTime(dt) {
        this.time += dt;
    }

    // ===== MAP DRAWING =====

    drawMap(ctx) {
        if (this.offscreenCanvas) {
            ctx.drawImage(this.offscreenCanvas, 0, 0);
            // Animated decorations (fire barrels)
            for (var i = 0; i < this.animatedDecorations.length; i++) {
                this.drawDecoration(ctx, this.animatedDecorations[i], this.time);
            }
        } else {
            // Fallback: plain background
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
        }
    }

    // ===== BLOOD STAINS =====

    drawBloodStains(ctx, bloodStains) {
        for (var i = 0; i < bloodStains.length; i++) {
            var stain = bloodStains[i];
            if (stain.alpha <= 0) continue;
            ctx.fillStyle = 'rgba(80, 0, 0, ' + (0.3 * stain.alpha) + ')';
            ctx.beginPath();
            ctx.arc(stain.x, stain.y, stain.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ===== OBSTACLE DRAWING =====

    drawObstacles(ctx, obstacles) {
        for (var i = 0; i < obstacles.length; i++) {
            var obs = obstacles[i];
            if (obs.destroyed) continue;
            if (obs.type === 'wall') continue; // walls rendered on offscreen canvas
            var dmgRatio = obs.destructible ? obs.hp / 50 : 1;

            switch (obs.type) {
                case 'barrel':
                    this.drawBarrel(ctx, obs, dmgRatio);
                    break;
                case 'car':
                    this.drawCar(ctx, obs, dmgRatio);
                    break;
                case 'brick_wall':
                    this.drawBrickWall(ctx, obs, dmgRatio);
                    break;
            }
        }
    }

    drawBarrel(ctx, obs, dmgRatio) {
        var darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.fillStyle = obs.color;
        ctx.globalAlpha = darken;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.arc(obs.x - 3, obs.y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(obs.x + 4, obs.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#6a4e2e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawCar(ctx, obs, dmgRatio) {
        var darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.globalAlpha = darken;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        ctx.fillStyle = '#222';
        var wr = 5;
        ctx.beginPath(); ctx.arc(obs.x + 8, obs.y, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + obs.w - 8, obs.y, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + 8, obs.y + obs.h, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + obs.w - 8, obs.y + obs.h, wr, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
        ctx.fillRect(obs.x + obs.w * 0.6, obs.y + 3, obs.w * 0.25, obs.h - 6);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        ctx.globalAlpha = 1;
    }

    drawBrickWall(ctx, obs, dmgRatio) {
        var darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.globalAlpha = darken;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        ctx.strokeStyle = '#5a2020';
        ctx.lineWidth = 1;
        var brickH = Math.min(8, obs.h / 2);
        for (var by = obs.y + brickH; by < obs.y + obs.h; by += brickH) {
            ctx.beginPath();
            ctx.moveTo(obs.x, by);
            ctx.lineTo(obs.x + obs.w, by);
            ctx.stroke();
        }
        var brickW = 12;
        var row = 0;
        for (var by2 = obs.y; by2 < obs.y + obs.h; by2 += brickH) {
            var bOffset = (row % 2) * (brickW / 2);
            for (var bx = obs.x + bOffset; bx < obs.x + obs.w; bx += brickW) {
                ctx.beginPath();
                ctx.moveTo(bx, by2);
                ctx.lineTo(bx, Math.min(by2 + brickH, obs.y + obs.h));
                ctx.stroke();
            }
            row++;
        }

        ctx.strokeStyle = '#6a2a2a';
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        ctx.globalAlpha = 1;
    }

    // ===== POST-PROCESSING =====

    drawScanlines(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (var y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    drawFilmGrain(ctx, w, h) {
        var count = 10 + Math.floor(Math.random() * 6);
        for (var i = 0; i < count; i++) {
            var gx = Math.random() * w;
            var gy = Math.random() * h;
            var size = 1 + Math.random() * 2;
            var alpha = 0.02 + Math.random() * 0.02;
            ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            ctx.fillRect(gx, gy, size, size);
        }
    }

    drawVignette(ctx, w, h) {
        var cx = w / 2;
        var cy = h / 2;
        var maxDim = Math.max(w, h);
        var grad = ctx.createRadialGradient(cx, cy, maxDim * 0.25, cx, cy, maxDim * 0.75);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }
}
