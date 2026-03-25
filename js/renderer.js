class Renderer {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.gridSize = 100;
    }

    drawMap(ctx) {
        // Background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);

        // Grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.mapWidth; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.mapHeight);
            ctx.stroke();
        }

        for (let y = 0; y <= this.mapHeight; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.mapWidth, y);
            ctx.stroke();
        }

        // Map border
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    }

    drawBloodStains(ctx, bloodStains) {
        for (const stain of bloodStains) {
            if (stain.alpha <= 0) continue;
            ctx.fillStyle = 'rgba(80, 0, 0, ' + (0.3 * stain.alpha) + ')';
            ctx.beginPath();
            ctx.arc(stain.x, stain.y, stain.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawObstacles(ctx, obstacles) {
        for (const obs of obstacles) {
            if (obs.destroyed) continue;
            const dmgRatio = obs.destructible ? obs.hp / 50 : 1;

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
                case 'building':
                    this.drawBuilding(ctx, obs);
                    break;
                case 'concrete_wall':
                    this.drawConcreteWall(ctx, obs);
                    break;
            }
        }
    }

    drawBarrel(ctx, obs, dmgRatio) {
        // Base circle
        const darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.fillStyle = obs.color;
        ctx.globalAlpha = darken;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();

        // Rust streaks
        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.arc(obs.x - 3, obs.y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(obs.x + 4, obs.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Rim
        ctx.strokeStyle = '#6a4e2e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawCar(ctx, obs, dmgRatio) {
        const darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.globalAlpha = darken;

        // Body
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Wheels (dark circles at corners)
        ctx.fillStyle = '#222';
        const wr = 5;
        ctx.beginPath(); ctx.arc(obs.x + 8, obs.y, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + obs.w - 8, obs.y, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + 8, obs.y + obs.h, wr, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + obs.w - 8, obs.y + obs.h, wr, 0, Math.PI * 2); ctx.fill();

        // Windshield
        ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
        ctx.fillRect(obs.x + obs.w * 0.6, obs.y + 3, obs.w * 0.25, obs.h - 6);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        ctx.globalAlpha = 1;
    }

    drawBrickWall(ctx, obs, dmgRatio) {
        const darken = dmgRatio < 0.5 ? 0.7 : 1;
        ctx.globalAlpha = darken;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Brick lines
        ctx.strokeStyle = '#5a2020';
        ctx.lineWidth = 1;
        const brickH = Math.min(8, obs.h / 2);
        for (let by = obs.y + brickH; by < obs.y + obs.h; by += brickH) {
            ctx.beginPath();
            ctx.moveTo(obs.x, by);
            ctx.lineTo(obs.x + obs.w, by);
            ctx.stroke();
        }
        const brickW = 12;
        let row = 0;
        for (let by = obs.y; by < obs.y + obs.h; by += brickH) {
            const offset = (row % 2) * (brickW / 2);
            for (let bx = obs.x + offset; bx < obs.x + obs.w; bx += brickW) {
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx, Math.min(by + brickH, obs.y + obs.h));
                ctx.stroke();
            }
            row++;
        }

        ctx.strokeStyle = '#6a2a2a';
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        ctx.globalAlpha = 1;
    }

    drawBuilding(ctx, obs) {
        // Main structure
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Windows
        const winSize = 8;
        const winGap = 14;
        ctx.fillStyle = '#7a8a6a';
        for (let wx = obs.x + 10; wx < obs.x + obs.w - 10; wx += winGap) {
            for (let wy = obs.y + 10; wy < obs.y + obs.h - 10; wy += winGap) {
                ctx.fillRect(wx, wy, winSize, winSize);
            }
        }

        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }

    drawConcreteWall(ctx, obs) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Subtle line texture
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        const step = 6;
        if (obs.w > obs.h) {
            for (let ly = obs.y + step; ly < obs.y + obs.h; ly += step) {
                ctx.beginPath(); ctx.moveTo(obs.x, ly); ctx.lineTo(obs.x + obs.w, ly); ctx.stroke();
            }
        } else {
            for (let lx = obs.x + step; lx < obs.x + obs.w; lx += step) {
                ctx.beginPath(); ctx.moveTo(lx, obs.y); ctx.lineTo(lx, obs.y + obs.h); ctx.stroke();
            }
        }

        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }
}
