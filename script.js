// Garantir que o script só rode após o Three.js e a página carregarem
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        alert('Erro ao carregar a biblioteca 3D. Verifique sua conexão com a internet!');
        return;
    }

    // Configuração da Cena e Renderizador
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Chão / Grade de Referência
    const gridHelper = new THREE.GridHelper(100, 50, 0x4caf50, 0x444444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Estado do Jogo
    let score = 0;
    let health = 100;
    let gameOver = false;
    const keys = {};

    const scoreEl = document.getElementById('score');
    const healthEl = document.getElementById('health');
    const gameOverEl = document.getElementById('game-over');

    // Tanque do Jogador
    function createPlayerTank() {
        const group = new THREE.Group();

        // Corpo
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 3),
            new THREE.MeshBasicMaterial({ color: 0x4caf50 })
        );
        body.position.y = 0.5;
        group.add(body);

        // Torre
        const turret = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.6, 1.2),
            new THREE.MeshBasicMaterial({ color: 0x2e7d32 })
        );
        turret.position.y = 1.3;
        group.add(turret);

        // Canhão
        const cannon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.8),
            new THREE.MeshBasicMaterial({ color: 0x1b5e20 })
        );
        cannon.rotation.x = Math.PI / 2;
        cannon.position.set(0, 1.3, 1.2);
        group.add(cannon);

        scene.add(group);
        return group;
    }

    const player = createPlayerTank();
    const bullets = [];
    const enemies = [];

    // Controles
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space' && !gameOver) {
            shootBullet();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Função de Tiro
    function shootBullet() {
        const bullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffeb3b })
        );

        bullet.position.copy(player.position);
        bullet.position.y = 1.3;

        const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        bullet.userData = { direction: direction, speed: 0.8 };

        bullets.push(bullet);
        scene.add(bullet);
    }

    // Criar Inimigos
    function spawnEnemy() {
        if (gameOver) return;

        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 2),
            new THREE.MeshBasicMaterial({ color: 0xf44336 })
        );
        body.position.y = 0.5;
        group.add(body);

        const angle = Math.random() * Math.PI * 2;
        const distance = 35;
        group.position.x = Math.cos(angle) * distance;
        group.position.z = Math.sin(angle) * distance;

        enemies.push(group);
        scene.add(group);
    }

    setInterval(spawnEnemy, 2000);

    // Loop do Jogo
    function animate() {
        if (gameOver) return;

        requestAnimationFrame(animate);

        const speed = 0.15;
        const rotSpeed = 0.04;

        if (keys['KeyW'] || keys['ArrowUp']) player.translateZ(speed);
        if (keys['KeyS'] || keys['ArrowDown']) player.translateZ(-speed);
        if (keys['KeyA'] || keys['ArrowLeft']) player.rotation.y += rotSpeed;
        if (keys['KeyD'] || keys['ArrowRight']) player.rotation.y -= rotSpeed;

        // Limites do mapa
        player.position.x = Math.max(-45, Math.min(45, player.position.x));
        player.position.z = Math.max(-45, Math.min(45, player.position.z));

        // Câmera em 3ª pessoa
        camera.position.x = player.position.x - Math.sin(player.rotation.y) * 10;
        camera.position.z = player.position.z - Math.cos(player.rotation.y) * 10;
        camera.position.y = player.position.y + 6;
        camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

        // Projetéis
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.addScaledVector(b.userData.direction, b.userData.speed);

            if (b.position.distanceTo(player.position) > 50) {
                scene.remove(b);
                bullets.splice(i, 1);
                continue;
            }

            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (b.position.distanceTo(e.position) < 1.5) {
                    scene.remove(e);
                    scene.remove(b);
                    enemies.splice(j, 1);
                    bullets.splice(i, 1);

                    score += 10;
                    scoreEl.textContent = score;
                    break;
                }
            }
        }

        // Inimigos
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.lookAt(player.position);
            e.translateZ(0.06);

            if (e.position.distanceTo(player.position) < 2) {
                scene.remove(e);
                enemies.splice(i, 1);

                health -= 20;
                healthEl.textContent = health;

                if (health <= 0) {
                    gameOver = true;
                    gameOverEl.classList.remove('hidden');
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate();
});
