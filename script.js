const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');

let score = 0;
let health = 100;
let gameOver = false;

// Estado das teclas
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && !gameOver) {
        player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Jogador (Tanque Principal)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    speed: 4,
    angle: 0,
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Corpo do tanque
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // Canhão
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(0, -4, this.size / 1.2, 8);

        ctx.restore();
    },
    move() {
        if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
        if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
        if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;

        // Limites da tela
        this.x = Math.max(this.size / 2, Math.min(canvas.width - this.size / 2, this.x));
        this.y = Math.max(this.size / 2, Math.min(canvas.height - this.size / 2, this.y));
    },
    shoot() {
        bullets.push(new Bullet(this.x, this.y, this.angle));
    }
};

// Projeto de Tiro
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 7;
        this.radius = 4;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}

// Inimigos
class Enemy {
    constructor() {
        this.size = 30;
        this.speed = 1.5;
        // Surge fora das bordas da tela
        if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? 0 : canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() < 0.5 ? 0 : canvas.height;
        }
    }
    draw() {
        ctx.fillStyle = '#f44336';
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);

        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}

const bullets = [];
const enemies = [];

// Gerar inimigos periodicamente
setInterval(() => {
    if (!gameOver) {
        enemies.push(new Enemy());
    }
}, 1500);

// Apontar o tanque para o mouse
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

// Loop Principal do Jogo
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FIM DE JOGO', canvas.width / 2, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Jogador
    player.move();
    player.draw();

    // Tiros
    bullets.forEach((bullet, bIndex) => {
        bullet.update();
        bullet.draw();

        // Remover tiros fora da tela
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(bIndex, 1);
        }
    });

    // Inimigos
    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        enemy.draw();

        // Colisão entre Tiro e Inimigo
        bullets.forEach((bullet, bIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < enemy.size / 2 + bullet.radius) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                scoreEl.textContent = score;
            }
        });

        // Colisão entre Inimigo e Jogador
        const distPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distPlayer < player.size / 2 + enemy.size / 2) {
            enemies.splice(eIndex, 1);
            health -= 20;
            healthEl.textContent = health;

            if (health <= 0) {
                gameOver = true;
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
