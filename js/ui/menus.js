class MainMenu {
    constructor(canvas) {
        this.canvas = canvas;
        this.particles = [];
        this.hoverPlay = false;
        this.clicked = null;
        this.timer = 0;

        for (let i = 0; i < 60; i++) {
            this.particles.push(this.makeParticle());
        }
    }

    makeParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            speed: 0.3 + Math.random() * 0.7,
            size: 1 + Math.random() * 3,
            alpha: 0.2 + Math.random() * 0.5
        };
    }

    update(dt, mouseX, mouseY, clicked) {
        this.timer += dt;
        this.clicked = null;

        for (const p of this.particles) {
            p.y += p.speed;
            p.x += Math.sin(p.y * 0.01) * 0.3;
            if (p.y > this.canvas.height) {
                p.y = -5;
                p.x = Math.random() * this.canvas.width;
            }
        }

        const cx = this.canvas.width / 2;
        const btnY = this.canvas.height * 0.6;
        const btnW = 220;
        const btnH = 50;
        this.hoverPlay = mouseX > cx - btnW / 2 && mouseX < cx + btnW / 2 &&
                         mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2;

        if (clicked && this.hoverPlay) {
            this.clicked = 'play';
        }
    }

    draw(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0a0f');
        grad.addColorStop(0.5, '#1a1a2e');
        grad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Snow particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#cce';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const cx = w / 2;

        // Title glow
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const pulse = 0.7 + Math.sin(this.timer * 0.003) * 0.3;
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 30 * pulse;
        ctx.font = 'bold 72px monospace';
        ctx.fillStyle = '#ff6633';
        ctx.fillText('\u0421\u0422\u0410\u041B\u041A\u0415\u0420\u042B', cx, h * 0.3);

        ctx.shadowBlur = 0;
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('.io', cx + 220, h * 0.3 + 10);

        // Subtitle
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('SURVIVE THE ZONE', cx, h * 0.3 + 50);
        ctx.restore();

        // Play button
        const btnY = h * 0.6;
        const btnW = 220;
        const btnH = 50;
        ctx.save();
        if (this.hoverPlay) {
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff4400';
        } else {
            ctx.fillStyle = '#cc3300';
        }
        ctx.fillRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH);
        ctx.strokeStyle = '#ff6633';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u25B6  PLAY', cx, btnY);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Best score
        let scores = [];
        try {
            const stored = localStorage.getItem('stalkers_scores');
            if (stored) scores = JSON.parse(stored);
        } catch (e) {}
        if (scores.length > 0) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('BEST: ' + scores[0].score, cx, btnY + btnH / 2 + 30);
        }

        // Version
        ctx.font = '11px monospace';
        ctx.fillStyle = '#444';
        ctx.textAlign = 'right';
        ctx.fillText('v0.5', w - 15, h - 15);

        // Controls hint
        ctx.textAlign = 'center';
        ctx.font = '13px monospace';
        ctx.fillStyle = '#555';
        ctx.fillText('WASD move  \u2022  LMB shoot  \u2022  RMB ability', cx, h * 0.85);
    }
}

class CharSelectUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.selected = null;
        this.hoverIndex = -1;
        this.chars = [
            { key: 'MUTANT', data: CHARACTERS.MUTANT, title: 'G\u042FIGO\u042FI', subtitle: 'THE MUTANT', desc: 'Toxic aura melts nearby foes', color: '#39ff14' },
            { key: 'OLIGARCH', data: CHARACTERS.OLIGARCH, title: 'VIK\u0422O\u042F', subtitle: 'THE OLIGARCH', desc: '+15% XP from all sources', color: '#ffd700' },
            { key: 'TANK', data: CHARACTERS.TANK, title: 'T-72', subtitle: 'THE TANK', desc: '25% damage reduction', color: '#5a6a3a' },
            { key: 'BEAR', data: CHARACTERS.BEAR, title: 'MISH\u0410', subtitle: 'THE BEAR', desc: '+30% speed when low HP', color: '#8B4513' }
        ];
    }

    update(mouseX, mouseY, clicked) {
        this.selected = null;
        this.hoverIndex = -1;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const cardW = 180;
        const cardH = 280;
        const gap = 24;
        const totalW = this.chars.length * cardW + (this.chars.length - 1) * gap;
        const startX = (w - totalW) / 2;
        const cardY = h * 0.3;

        for (let i = 0; i < this.chars.length; i++) {
            const cx = startX + i * (cardW + gap);
            if (mouseX > cx && mouseX < cx + cardW && mouseY > cardY && mouseY < cardY + cardH) {
                this.hoverIndex = i;
                if (clicked) {
                    this.selected = this.chars[i];
                }
            }
        }
    }

    draw(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0a0f');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ccc';
        ctx.fillText('SELECT STALKER', w / 2, h * 0.12);
        ctx.restore();

        const cardW = 180;
        const cardH = 280;
        const gap = 24;
        const totalW = this.chars.length * cardW + (this.chars.length - 1) * gap;
        const startX = (w - totalW) / 2;
        const cardY = h * 0.3;

        for (let i = 0; i < this.chars.length; i++) {
            const ch = this.chars[i];
            const cx = startX + i * (cardW + gap);
            const hover = i === this.hoverIndex;

            ctx.save();
            if (hover) {
                ctx.shadowColor = ch.color;
                ctx.shadowBlur = 20;
            }

            // Card bg
            ctx.fillStyle = hover ? '#2a2a3a' : '#1a1a24';
            ctx.fillRect(cx, cardY, cardW, cardH);
            ctx.strokeStyle = hover ? ch.color : '#333';
            ctx.lineWidth = hover ? 2 : 1;
            ctx.strokeRect(cx, cardY, cardW, cardH);
            ctx.shadowBlur = 0;

            // Character preview
            const previewX = cx + cardW / 2;
            const previewY = cardY + 65;
            ctx.save();
            ctx.translate(previewX, previewY);
            ctx.scale(2, 2);
            this.drawCharPreview(ctx, ch.key);
            ctx.restore();

            // Name
            ctx.textAlign = 'center';
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = ch.color;
            ctx.fillText(ch.title, cx + cardW / 2, cardY + 130);

            ctx.font = '11px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText(ch.subtitle, cx + cardW / 2, cardY + 148);

            // Stat bars
            const stats = [
                { label: 'HP', val: ch.data.hp / 200, col: '#cc0000' },
                { label: 'SPD', val: ch.data.speed / 5, col: '#4488ff' },
                { label: 'DMG', val: ch.data.damage / 25, col: '#ff6644' },
                { label: 'ROF', val: ch.data.fireRate / 5, col: '#ffaa00' }
            ];

            const barX = cx + 14;
            const barW = cardW - 28;
            let barY = cardY + 165;
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';

            for (const s of stats) {
                ctx.fillStyle = '#666';
                ctx.fillText(s.label, barX, barY);
                ctx.fillStyle = '#222';
                ctx.fillRect(barX + 30, barY - 8, barW - 30, 8);
                ctx.fillStyle = s.col;
                ctx.fillRect(barX + 30, barY - 8, (barW - 30) * Math.min(1, s.val), 8);
                barY += 16;
            }

            // Passive description
            ctx.textAlign = 'center';
            ctx.font = '10px monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText(ch.desc, cx + cardW / 2, cardY + cardH - 16);

            ctx.restore();
        }

        // Back hint
        ctx.textAlign = 'center';
        ctx.font = '13px monospace';
        ctx.fillStyle = '#555';
        ctx.fillText('ESC to go back', w / 2, h * 0.9);
    }

    drawCharPreview(ctx, key) {
        // Draw pixel art sprite at origin (0,0), facing right, scaled up for preview
        var sprite;
        var scale = 2;
        switch (key) {
            case 'MUTANT': sprite = SPRITE_MUTANT; break;
            case 'OLIGARCH': sprite = SPRITE_OLIGARCH; break;
            case 'TANK': sprite = SPRITE_TANK; scale = 1.5; break;
            case 'BEAR': sprite = SPRITE_BEAR; break;
            default: return;
        }
        var rows = sprite.length;
        var cols = sprite[0].length;
        var pw = PIXEL_SIZE * scale;
        var ox = -(cols * pw) / 2;
        var oy = -(rows * pw) / 2;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var color = sprite[r][c];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(ox + c * pw, oy + r * pw, pw, pw);
            }
        }
    }
}

class GameOverUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.clicked = null;
        this.hoverRetry = false;
        this.stats = null;
        this.fadeIn = 0;
    }

    show(stats, finalScore) {
        this.stats = stats;
        this.finalScore = finalScore || 0;
        this.fadeIn = 0;
    }

    update(dt, mouseX, mouseY, clicked) {
        this.clicked = null;
        this.fadeIn = Math.min(1, this.fadeIn + dt * 0.002);

        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;

        const btnW = 180;
        const btnH = 44;
        const retryY = h * 0.82;

        this.hoverRetry = mouseX > cx - btnW / 2 && mouseX < cx + btnW / 2 &&
                          mouseY > retryY - btnH / 2 && mouseY < retryY + btnH / 2;

        if (clicked && this.hoverRetry) {
            this.clicked = 'retry';
        }
    }

    draw(ctx) {
        if (!this.stats) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,' + (0.8 * this.fadeIn) + ')';
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = this.fadeIn;

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 60px monospace';
        ctx.fillStyle = '#ff3333';
        ctx.fillText('G\u0410ME OVE\u042F', cx, h * 0.2);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Stats
        ctx.textAlign = 'center';
        ctx.font = '16px monospace';
        ctx.fillStyle = '#aaa';

        const stats = this.stats;
        const lines = [
            'Wave reached:  ' + stats.wave,
            'Enemies killed:  ' + stats.kills,
            'Damage dealt:  ' + Math.floor(stats.damageDealt),
            'Best streak:  ' + stats.bestStreak,
            'Time survived:  ' + this.formatTime(stats.timeElapsed),
            'Level:  ' + stats.level
        ];

        let ly = h * 0.35;
        for (const line of lines) {
            ctx.fillStyle = '#999';
            ctx.fillText(line, cx, ly);
            ly += 28;
        }

        // Score
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('SCORE: ' + this.finalScore, cx, ly + 10);
        ly += 40;

        // Top scores
        let scores = [];
        try {
            const stored = localStorage.getItem('stalkers_scores');
            if (stored) scores = JSON.parse(stored);
        } catch (e) {}

        if (scores.length > 0) {
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('TOP SCORES', cx, ly);
            ly += 20;
            ctx.font = '13px monospace';
            for (let i = 0; i < Math.min(5, scores.length); i++) {
                const s = scores[i];
                const isCurrentScore = (s.score === this.finalScore && i === scores.findIndex(sc => sc.score === this.finalScore));
                ctx.fillStyle = isCurrentScore ? '#ffd700' : '#777';
                ctx.fillText((i + 1) + '. ' + s.score + '  (W' + s.wave + ' K' + s.kills + ' L' + s.level + ')', cx, ly);
                ly += 18;
            }
        }

        // Buttons
        const btnW = 180;
        const btnH = 44;

        this.drawButton(ctx, cx, h * 0.82, btnW, btnH, '\u21BB  RETRY', this.hoverRetry, '#cc3300');

        ctx.globalAlpha = 1;
    }

    drawButton(ctx, x, y, w, h, text, hover, baseColor) {
        ctx.save();
        if (hover) {
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 12;
        }
        ctx.fillStyle = hover ? baseColor : '#222';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        ctx.shadowBlur = 0;

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }
}

class PauseUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.clicked = null;
        this.hoverResume = false;
        this.hoverQuit = false;
    }

    update(mouseX, mouseY, clicked) {
        this.clicked = null;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const btnW = 180;
        const btnH = 44;
        const resumeY = h * 0.55;
        const quitY = h * 0.55 + 60;

        this.hoverResume = mouseX > cx - btnW / 2 && mouseX < cx + btnW / 2 &&
                           mouseY > resumeY - btnH / 2 && mouseY < resumeY + btnH / 2;
        this.hoverQuit = mouseX > cx - btnW / 2 && mouseX < cx + btnW / 2 &&
                         mouseY > quitY - btnH / 2 && mouseY < quitY + btnH / 2;

        if (clicked) {
            if (this.hoverResume) this.clicked = 'resume';
            if (this.hoverQuit) this.clicked = 'quit';
        }
    }

    draw(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;

        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('\u0420\u0410US\u0415D', cx, h * 0.35);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Buttons
        const btnW = 180;
        const btnH = 44;
        this.drawButton(ctx, cx, h * 0.55, btnW, btnH, '\u25B6  \u042F\u0415SU\u041C\u0415', this.hoverResume, '#4488ff');
        this.drawButton(ctx, cx, h * 0.55 + 60, btnW, btnH, '\u0415\u0425I\u0422', this.hoverQuit, '#cc3300');

        // Hint
        ctx.textAlign = 'center';
        ctx.font = '13px monospace';
        ctx.fillStyle = '#555';
        ctx.fillText('ESC to resume', cx, h * 0.85);
    }

    drawButton(ctx, x, y, w, h, text, hover, baseColor) {
        ctx.save();
        if (hover) {
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 12;
        }
        ctx.fillStyle = hover ? baseColor : '#222';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        ctx.shadowBlur = 0;

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}
