class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.state = 'playing'; // menu, playing, paused, gameover, levelup

        this.mapWidth = 3000;
        this.mapHeight = 3000;

        this.camera = new Camera(canvas);
        this.renderer = new Renderer(this.mapWidth, this.mapHeight);
        this.input = new InputHandler(canvas, this.camera);

        // Test player — red square
        this.player = {
            x: this.mapWidth / 2,
            y: this.mapHeight / 2,
            size: 30,
            speed: 3
        };
    }

    update(dt) {
        if (this.state !== 'playing') return;

        const dir = this.input.getDirection();
        this.player.x += dir.x * this.player.speed;
        this.player.y += dir.y * this.player.speed;

        // Clamp to map bounds
        const half = this.player.size / 2;
        this.player.x = Math.max(half, Math.min(this.mapWidth - half, this.player.x));
        this.player.y = Math.max(half, Math.min(this.mapHeight - half, this.player.y));

        this.camera.update(this.player);
        this.input.updateMouse(this.camera);
    }

    render(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        this.camera.apply(ctx);

        this.renderer.drawMap(ctx);

        // Draw test player
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(
            this.player.x - this.player.size / 2,
            this.player.y - this.player.size / 2,
            this.player.size,
            this.player.size
        );

        ctx.restore();
    }
}
