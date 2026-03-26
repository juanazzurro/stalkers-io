class InputHandler {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        this.keys = {};
        this.mouseScreen = { x: 0, y: 0 };
        this.mouseWorld = { x: 0, y: 0 };
        this.shooting = false;
        this.ability = false;

        // Touch state
        this.isTouchDevice = false;
        this.joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0, touchId: null };
        this.abilityBtn = { active: false, touchId: null };
        this.autoAimTarget = null;

        // Keyboard
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

        // Mouse
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

        // Touch
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
    }

    onTouchStart(e) {
        e.preventDefault();
        this.isTouchDevice = true;
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (const touch of e.changedTouches) {
            const tx = touch.clientX;
            const ty = touch.clientY;

            // Ability button zone: bottom-right 120x120
            if (tx > w - 120 && ty > h - 120) {
                this.abilityBtn.active = true;
                this.abilityBtn.touchId = touch.identifier;
                this.ability = true;
                continue;
            }

            // Joystick zone: bottom-left 200x200
            if (tx < 200 && ty > h - 200) {
                this.joystick.active = true;
                this.joystick.touchId = touch.identifier;
                this.joystick.startX = tx;
                this.joystick.startY = ty;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                continue;
            }

            // Tap anywhere else = set mouse position for menu clicks
            this.mouseScreen.x = tx;
            this.mouseScreen.y = ty;
            this.shooting = true;
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.joystick.touchId && this.joystick.active) {
                const dx = touch.clientX - this.joystick.startX;
                const dy = touch.clientY - this.joystick.startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 50;
                if (dist > 0) {
                    const clamped = Math.min(dist, maxDist);
                    this.joystick.dx = (dx / dist) * (clamped / maxDist);
                    this.joystick.dy = (dy / dist) * (clamped / maxDist);
                }
            }
        }
    }

    onTouchEnd(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.joystick.touchId) {
                this.joystick.active = false;
                this.joystick.touchId = null;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
            }
            if (touch.identifier === this.abilityBtn.touchId) {
                this.abilityBtn.active = false;
                this.abilityBtn.touchId = null;
                this.ability = false;
            }
        }
        // Release shooting if no touches remain
        if (e.touches.length === 0) {
            this.shooting = false;
        }
    }

    getDirection() {
        // Touch joystick overrides keyboard
        if (this.isTouchDevice && this.joystick.active) {
            return { x: this.joystick.dx, y: this.joystick.dy };
        }

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

    updateAutoAim(player, enemies) {
        if (!this.isTouchDevice) return;
        let closest = null;
        let closestDist = Infinity;
        for (const e of enemies) {
            if (e.dying || e.removed) continue;
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = dx * dx + dy * dy;
            if (dist < closestDist) {
                closestDist = dist;
                closest = e;
            }
        }
        if (closest) {
            this.mouseWorld.x = closest.x;
            this.mouseWorld.y = closest.y;
            this.autoAimTarget = closest;
            // Auto-shoot when enemy in range
            const range = player.range * 60;
            this.shooting = closestDist < range * range;
        } else {
            this.autoAimTarget = null;
            this.shooting = false;
            // Aim in movement direction if no enemies
            if (this.joystick.active && (this.joystick.dx !== 0 || this.joystick.dy !== 0)) {
                this.mouseWorld.x = player.x + this.joystick.dx * 200;
                this.mouseWorld.y = player.y + this.joystick.dy * 200;
            }
        }
    }

    drawTouchControls(ctx) {
        if (!this.isTouchDevice) return;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Joystick base
        const jx = 100;
        const jy = h - 100;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(jx, jy, 60, 0, Math.PI * 2);
        ctx.fill();

        // Joystick knob
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(jx + this.joystick.dx * 50, jy + this.joystick.dy * 50, 22, 0, Math.PI * 2);
        ctx.fill();

        // Ability button
        const ax = w - 70;
        const ay = h - 70;
        ctx.globalAlpha = this.abilityBtn.active ? 0.6 : 0.3;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(ax, ay, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SKILL', ax, ay);

        ctx.globalAlpha = 1;
    }

    clearInputs() {
        this.shooting = false;
        this.ability = false;
    }

    updateMouse(camera) {
        if (!this.isTouchDevice) {
            this.mouseWorld = camera.screenToWorld(this.mouseScreen.x, this.mouseScreen.y);
        }
    }
}
