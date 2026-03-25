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
}
