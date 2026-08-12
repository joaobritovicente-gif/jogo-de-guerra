const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

const tank = {
    x: 400,
    y: 500,
    angle: 0,
    speed: 0,
    maxSpeed: 3,
    rotSpeed: 0.05,
    radius: 20
};

const bullets = [];
const enemies = [];
let score = 0;
let lastShot = 0;

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * 200 + 50,
        radius: 18
    });
}

for (let i = 0; i < 3; i++) {
    spawnEnemy();
}

function update() {
    if (keys['KeyA'] || keys['ArrowLeft']) tank.angle -= tank.rotSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) tank.angle += tank.rotSpeed;

    if (keys['KeyW'] || keys['ArrowUp']) tank.speed = tank.maxSpeed;
    else if (keys['KeyS'] || keys['ArrowDown']) tank.speed = -tank.maxSpeed / 2;
    else tank.speed = 0;

    tank.x += Math.cos(tank.angle) * tank.speed;
    tank.y += Math.sin(tank.angle) * tank.speed;

    tank.x = Math.max(tank.radius, Math.min(canvas.width - tank.radius, tank.x));
    tank.y = Math.max(tank.radius, Math.min(canvas.height - tank.radius, tank.y));

    const now = Date.now();
    if (keys['Space'] && now - lastShot > 300) {
        bullets.push({
            x: tank.x + Math.cos(tank.angle) * 30,
            y: tank.y + Math.sin(tank.angle) * 30,
            dx: Math.cos(tank.angle) * 7,
            dy: Math.sin(tank.angle) * 7
        });
        lastShot = now;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);

            if (dist < e.radius + 4) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                spawnEnemy();
                break;
            }
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#f1c40f';
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Pontos: ${score}`, 20, 35);
}

update();
