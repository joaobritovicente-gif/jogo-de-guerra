/ Configuração da Cena, Câmera e Renderizador Three.js
const container = document.getElementById('canvas-container');
const cena = new THREE.Scene();
cena.background = new THREE.Color(0x1e272c); // Cor do céu/ambiente
cena.fog = new THREE.FogExp2(0x1e272c, 0.015); // Névoa de guerra

const camera = new THREE.PerspectiveCamera(60, 800 / 500, 0.1, 1000);
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(800, 500);
renderizador.shadowMap.enabled = true;
container.appendChild(renderizador.domElement);

// Iluminação
const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.4);
cena.add(luzAmbiente);

const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDirecional.position.set(20, 40, 20);
luzDirecional.castShadow = true;
cena.add(luzDirecional);

// HUD UI
const vidaText = document.getElementById('vidaText');
const pontosText = document.getElementById('pontosText');

let jogoRodando = true;
let pontos = 0;
let frameCount = 0;

// Terreno (Campo de Batalha)
const soloGeo = new THREE.PlaneGeometry(100, 100);
const soloMat = new THREE.MeshStandardMaterial({ color: 0x3b5323 });
const solo = new THREE.Mesh(soloGeo, soloMat);
solo.rotation.x = -Math.PI / 2;
solo.receiveShadow = true;
cena.add(solo);

// Obstáculos 3D
const obstaculos = [];
function criarObstaculo(x, z, w, d) {
  const geo = new THREE.BoxGeometry(w, 4, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  cena.add(mesh);
  obstaculos.push({ mesh, bounds: { x, z, w, d } });
}

criarObstaculo(-15, -10, 15, 4);
criarObstaculo(15, -10, 15, 4);
criarObstaculo(0, 10, 12, 4);
criarObstaculo(-12, 25, 10, 4);
criarObstaculo(12, 25, 10, 4);

// Entradas de Teclado
const teclas = {};
window.addEventListener('keydown', e => {
  teclas[e.code] = true;
  if (e.code === 'Space' && jogoRodando) {
    jogador.atirar();
  }
});
window.addEventListener('keyup', e => teclas[e.code] = false);

// Classe do Tiro 3D
class Tiro3D {
  constructor(pos, dir, eJogador, vel = 1.2, cor = 0xffcc00) {
    this.dir = dir.clone().normalize();
    this.vel = vel;
    this.eJogador = eJogador;
    
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: cor });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(pos);
    this.mesh.position.y = 1.5;
    cena.add(this.mesh);
  }

  atualizar() {
    this.mesh.position.addScaledVector(this.dir, this.vel);
  }

  destruir() {
    cena.remove(this.mesh);
  }
}

// Classe Tanque Jogador 3D
class TanqueJogador3D {
  constructor() {
    this.grupo = new THREE.Group();
    
    // Corpo
    const corpoGeo = new THREE.BoxGeometry(3, 1.5, 4);
    const corpoMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff });
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.y = 0.75;
    corpo.castShadow = true;
    this.grupo.add(corpo);

    // Canhão
    const canhaoGeo = new THREE.CylinderGeometry(0.2, 0.2, 3);
    const canhaoMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    this.canhao = new THREE.Mesh(canhaoGeo, canhaoMat);
    this.canhao.rotation.x = Math.PI / 2;
    this.canhao.position.set(0, 1.2, 1.5);
    this.grupo.add(this.canhao);

    this.grupo.position.set(0, 0, 35);
    cena.add(this.grupo);

    this.vel = 0.25;
    this.rotVel = 0.04;
    this.vida = 100;
  }

  mover() {
    if (teclas['KeyW'] || teclas['ArrowUp']) {
      this.grupo.translateZ(-this.vel);
    }
    if (teclas['KeyS'] || teclas['ArrowDown']) {
      this.grupo.translateZ(this.vel);
    }
    if (teclas['KeyA'] || teclas['ArrowLeft']) {
      this.grupo.rotation.y += this.rotVel;
    }
    if (teclas['KeyD'] || teclas['ArrowRight']) {
      this.grupo.rotation.y -= this.rotVel;
    }

    // Limites do campo
    this.grupo.position.x = Math.max(-45, Math.min(45, this.grupo.position.x));
    this.grupo.position.z = Math.max(-45, Math.min(45, this.grupo.position.z));
  }

  atirar() {
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.grupo.quaternion);
    tiros.push(new Tiro3D(this.grupo.position, dir, true, 1.5));
  }
}

// Classe Tanque Inimigo 3D (5 Níveis)
class TanqueInimigo3D {
  constructor(x, z, nivel = 1) {
    this.nivel = nivel;
    this.grupo = new THREE.Group();
    
    let escala = 1;
    let cor = 0xe74c3c;
    this.vel = 0.1;
    this.cadencia = 120;
    this.vidaMax = 1;

    switch(nivel) {
      case 1: cor = 0xe74c3c; this.vel = 0.10; this.cadencia = 120; break; // Leve
      case 2: cor = 0x9b59b6; this.vel = 0.18; this.cadencia = 80; break;  // Rápido
      case 3: cor = 0x34495e; escala = 1.3; this.vel = 0.07; this.vidaMax = 2; break; // Blindado
      case 4: cor = 0xe67e22; this.vel = 0.12; this.cadencia = 50; break;  // Atirador
      case 5: cor = 0x111111; escala = 1.6; this.vel = 0.05; this.cadencia = 40; this.vidaMax = 4; break; // Chefão
    }

    this.vida = this.vidaMax;

    const corpoGeo = new THREE.BoxGeometry(3 * escala, 1.5 * escala, 4 * escala);
    const corpoMat = new THREE.MeshStandardMaterial({ color });
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.y = (1.5 * escala) / 2;
    corpo.castShadow = true;
    this.grupo.add(corpo);

    this.grupo.position.set(x, 0, z);
    cena.add(this.grupo);

    this.tempoTiro = Math.floor(Math.random() * this.cadencia);
  }

  atualizar(alvoPos) {
    // Olhar em direção ao jogador
    this.grupo.lookAt(alvoPos.x, this.grupo.position.y, alvoPos.z);
    this.grupo.translateZ(this.vel);

    this.tempoTiro++;
    if (this.tempoTiro >= this.cadencia) {
      this.tempoTiro = 0;
      const dir = new THREE.Vector3().subVectors(alvoPos, this.grupo.position).normalize();
      const corTiro = this.nivel === 5 ? 0xff0000 : 0xffcc00;
      tiros.push(new Tiro3D(this.grupo.position, dir, false, 0.9, corTiro));
    }
  }

  destruir() {
    cena.remove(this.grupo);
  }
}

// Instâncias
const jogador = new TanqueJogador3D();
const inimigos = [];
const tiros = [];

function sortearNivelInimigo() {
  const rand = Math.random();
  if (rand < 0.35) return 1;
  if (rand < 0.60) return 2;
  if (rand < 0.80) return 3;
  if (rand < 0.93) return 4;
  return 5;
}

// Loop Principal 3D
function loop() {
  if (!jogoRodando) return;

  frameCount++;

  // Movimentação e atualização da câmera em 3ª pessoa
  jogador.mover();
  const offsetCam = new THREE.Vector3(0, 18, 22).applyQuaternion(jogador.grupo.quaternion);
  camera.position.copy(jogador.grupo.position).add(offsetCam);
  camera.lookAt(jogador.grupo.position);

  // Spawna inimigos topo do mapa
  if (frameCount % 140 === 0) {
    const posX = (Math.random() - 0.5) * 70;
    inimigos.push(new TanqueInimigo3D(posX, -40, sortearNivelInimigo()));
  }

  // Atualiza inimigos
  inimigos.forEach(inimigo => inimigo.atualizar(jogador.grupo.position));

  // Atualiza projéteis e colisões 3D
  for (let i = tiros.length - 1; i >= 0; i--) {
    const tiro = tiros[i];
    tiro.atualizar();

    // Limites de alcance
    if (tiro.mesh.position.length() > 80) {
      tiro.destruir();
      tiros.splice(i, 1);
      continue;
    }

    // Colisão Tiro vs Inimigo
    if (tiro.eJogador) {
      for (let j = inimigos.length - 1; j >= 0; j--) {
        const inimigo = inimigos[j];
        const dist = tiro.mesh.position.distanceTo(inimigo.grupo.position);
        if (dist < 2.5) {
          inimigo.vida--;
          tiro.destruir();
          tiros.splice(i, 1);

          if (inimigo.vida <= 0) {
            pontos += inimigo.nivel * 20;
            pontosText.textContent = `Pontos: ${pontos}`;
            inimigo.destruir();
            inimigos.splice(j, 1);
          }
          break;
        }
      }
    } 
    // Colisão Tiro vs Jogador
    else {
      const dist = tiro.mesh.position.distanceTo(jogador.grupo.position);
      if (dist < 2.2) {
        jogador.vida -= 10;
        vidaText.textContent = `Vida: ${jogador.vida}`;
        tiro.destruir();
        tiros.splice(i, 1);

        if (jogador.vida <= 0) {
          jogoRodando = false;
          alert(`FIM DE JOGO! Sua pontuação final em 3D foi: ${pontos}`);
        }
      }
    }
  }

  renderizador.render(cena, camera);
  requestAnimationFrame(loop);
}

loop();
