class InputHandler {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        this.keys = {};
        this.mouseScreen = { x: 0, y: 0 };
        this.mouseWorld = { x: 0, y: 0 };
        this.shooting = false;
        this.ability = false;

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                this.ability = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key === ' ') this.ability = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            this.mouseScreen.x = e.clientX;
            this.mouseScreen.y = e.clientY;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.shooting = true;
            if (e.button === 2) this.ability = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.shooting = false;
            if (e.button === 2) this.ability = false;
        });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getDirection() {
        let dx = 0;
        let dy = 0;

        if (this.keys['w']) dy -= 1;
        if (this.keys['s']) dy += 1;
        if (this.keys['a']) dx -= 1;
        if (this.keys['d']) dx += 1;

        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        return { x: dx, y: dy };
    }

    updateMouse(camera) {
        this.mouseWorld = camera.screenToWorld(this.mouseScreen.x, this.mouseScreen.y);
    }
}
