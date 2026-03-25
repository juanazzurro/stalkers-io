class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
    }

    update(target) {
        this.x = target.x - this.canvas.width / 2;
        this.y = target.y - this.canvas.height / 2;
    }

    apply(ctx) {
        ctx.translate(-this.x, -this.y);
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
}
