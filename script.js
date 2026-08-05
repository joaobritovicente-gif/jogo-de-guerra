// --- CONFIGURAÇÃO DA CENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- ILUMINAÇÃO ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(60, 90, 60);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 250;
const d = 70;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
scene.add(sunLight);

// --- TERRENO E ESTRUTURAS ---
const groundGeo = new THREE.PlaneGeometry(250, 250);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4e6e3e, roughness: 0.9, metalness: 0.1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const obstacles = [];
const wallMat = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.7, metalness: 0.2 });
for (let i = 0; i < 20; i++) {
    const wallGeo = new THREE.BoxGeometry(6, 4, 6);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set((Math.random() - 0.5) * 160, 2, (Math.random() - 0.5) * 160);
    if (wall.position.length() > 25) {
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        obstacles.push(wall);
    }
}

// --- CONSTRUTOR DE TANQUES ---
function createTank(bodyColor, turretColor) {
    const tankGroup = new THREE.Group();

    // Chassi
    const bodyGeo = new THREE.BoxGeometry(3.2, 1.2, 4.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.4, metalness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    body.receiveShadow = true;
    tankGroup.add(body);

    // Esteiras
    const trackGeo = new THREE.BoxGeometry(0.7, 0.8, 5.0);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const trackLeft = new THREE.Mesh(trackGeo, trackMat);
    trackLeft.position.set(-1.7, 0.5, 0);
    trackLeft.castShadow = true;
    const trackRight = trackLeft.clone();
    trackRight.position.x = 1.7;
    tankGroup.add(trackLeft, trackRight);

    // Torre
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 1.5, 0);

    const turretGeo = new THREE.BoxGeometry(2.2, 0.8, 2.2);
    const turretMat = new THREE.MeshStandardMaterial({ color: turretColor, roughness: 0.3, metalness: 0.7 });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.castShadow = true;
    turretGroup.add(turret);

    // Canhão
    const barrelGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.2, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 1.9);
    barrel.castShadow = true;
    turretGroup.add(barrel);

    tankGroup.add(turretGroup);

    return { mesh: tankGroup, turret: turretGroup };
}

// --- JOGADOR ---
const player = createTank(0x2d5a27, 0x1d3f1a);
scene.add(player.mesh);

let health = 100;
let score = 0;
let gameOver = false;

// --- SISTEMA DE TIRO ---
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.25, 8, 8);
const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });

function shoot(ownerMesh, turretMesh) {
    if (gameOver) return;
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);

    const barrelWorldPos = new THREE.Vector3();
    turretMesh.getWorldPosition(barrelWorldPos);

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(turretMesh.getWorldQuaternion(new THREE.Quaternion()));

    bullet.position.copy(barrelWorldPos).add(direction.clone().multiplyScalar(2.2));
    bullet.userData = {
        direction: direction,
        speed: 1.4,
        owner: ownerMesh,
        life: 100
    };

    scene.add(bullet);
    bullets.push(bullet);
}

// --- GERENCIAMENTO DE INIMIGOS ---
const enemies = [];

function spawnEnemy() {
    if (enemies.length >= 6 || gameOver) return;

    const enemy = createTank(0x8b0000, 0x4a0000);
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 40;

    enemy.mesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    enemy.lastShoot = Date.now();

    scene.add(enemy.mesh);
    enemies.push(enemy);
}

for (let i = 0; i < 3; i++) spawnEnemy();
setInterval(spawnEnemy, 5000);

// --- CONTROLES DA INTERFACE ---
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') shoot(player.mesh, player.turret);
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => shoot(player.mesh, player.turret));

// --- LOOP DO JOGO ---
function animate() {
    requestAnimationFrame(animate);
    if (gameOver) return;

    // Movimentação do Tanque Principal
    const moveSpeed = 0.22;
    const rotateSpeed = 0.035;

    if (keys['KeyW']) player.mesh.translateZ(moveSpeed);
    if (keys['KeyS']) player.mesh.translateZ(-moveSpeed);
    if (keys['KeyA']) player.mesh.rotation.y += rotateSpeed;
    if (keys['KeyD']) player.mesh.rotation.y -= rotateSpeed;

    // Apontar Torre para o Mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const targetPoint = intersects[0].point;
        player.turret.lookAt(targetPoint.x, player.turret.position.y + player.mesh.position.y, targetPoint.z);
    }

    // Posição Dinâmica da Câmera
    const camOffset = new THREE.Vector3(0, 14, -20).applyQuaternion(player.mesh.quaternion);
    camera.position.copy(player.mesh.position).add(camOffset);
    camera.lookAt(player.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)));

    // Inteligência Artificial Inimiga
    const now = Date.now();
    enemies.forEach((enemy) => {
        const distToPlayer = enemy.mesh.position.distanceTo(player.mesh.position);

        enemy.turret.lookAt(player.mesh.position.x, enemy.turret.position.y + enemy.mesh.position.y, player.mesh.position.z);

        if (distToPlayer > 10 && distToPlayer < 70) {
            enemy.mesh.lookAt(player.mesh.position.x, 0, player.mesh.position.z);
            enemy.mesh.translateZ(0.09);
        }

        if (distToPlayer < 50 && now - enemy.lastShoot > 2200) {
            shoot(enemy.mesh, enemy.turret);
            enemy.lastShoot = now;
        }
    });

    // Balas e Verificação de Dano
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.userData.direction.clone().multiplyScalar(b.userData.speed));
        b.userData.life--;

        // Dano no Jogador
        if (b.userData.owner !== player.mesh && b.position.distanceTo(player.mesh.position) < 2.2) {
            health -= 15;
            document.getElementById('health').innerText = Math.max(0, health);
            scene.remove(b);
            bullets.splice(i, 1);

            if (health <= 0) {
                gameOver = true;
                document.getElementById('game-over').classList.remove('hidden');
            }
            continue;
        }

        // Dano nos Inimigos
        let bulletHit = false;
        enemies.forEach((enemy, eIdx) => {
            if (!bulletHit && b.userData.owner === player.mesh && b.position.distanceTo(enemy.mesh.position) < 2.2) {
                scene.remove(enemy.mesh);
                enemies.splice(eIdx, 1);
                scene.remove(b);
                bullets.splice(i, 1);
                bulletHit = true;

                score += 100;
                document.getElementById('score').innerText = score;
            }
        });

        if (bulletHit) continue;

        if (b.userData.life <= 0) {
            scene.remove(b);
            bullets.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updatePointerMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
Quer ajuda para hospedar e ativar o GitHub Pages para rodar seu jogo direto no navegador?

Sim
