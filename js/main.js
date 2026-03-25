const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const game = new Game(canvas, ctx);

const FIXED_DT = 1000 / 60;
let accumulator = 0;
let lastTime = performance.now();

function gameLoop(currentTime) {
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;

    accumulator += elapsed;

    while (accumulator >= FIXED_DT) {
        game.update(FIXED_DT);
        accumulator -= FIXED_DT;
    }

    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
