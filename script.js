const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const vidaText = document.getElementById('vidaText');
const pontosText = document.getElementById('pontosText');

let jogoRodando = true;
let pontos = 0;
let frameCount = 0;

const teclas = {};
window.addEventListener('keydown', e => {
  teclas[e.code] = true;
  if (e.code === 'Space' && jogoRodando) {
    jogador.atirar();
  }
});
window.addEventListener('keyup', e => teclas[e.code] = false);

// Obstáculos do cenário
const obstaculos = [
  { x: 100, y: 150, width: 140, height: 35 },
  { x: 560, y: 150, width: 140, height: 35 },
  { x: 340, y: 300, width: 120, height: 40 },
  { x: 180, y: 440, width: 100, height: 30 },
  { x: 520, y: 440, width: 100, height: 30 }
];

const itensVida = [];

class Tiro {
  constructor(x, y, dx, dy, eJogador, vel = 7, raio = 4, cor = '#ffcc00') {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.velocidade = vel;
    this.raio = raio;
    this.eJogador = eJogador;
    this.cor = cor;
  }

  atualizar() {
    this.x += this.dx * this.velocidade;
    this.y += this.dy * this.velocidade;
  }

  desenhar() {
    ctx.fillStyle = this.cor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fill();
  }
}

class TanqueJogador {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tam = 30;
    this.vel = 3.5;
    this.vida = 100;
    this.dirX = 0;
    this.dirY = -1;
  }

  mover() {
    let dx = 0;
    let dy = 0;

    if (teclas['KeyW'] || teclas['ArrowUp']) dy -= 1;
    if (teclas['KeyS'] || teclas['ArrowDown']) dy += 1;
    if (teclas['KeyA'] || teclas['ArrowLeft']) dx -= 1;
    if (teclas['KeyD'] || teclas['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const mag = Math.hypot(dx, dy);
      this.dirX = dx / mag;
      this.dirY = dy / mag;
      this.x += this.dirX * this.vel;
      this.y += this.dirY * this.vel;
    }

    this.x = Math.max(this.tam / 2, Math.min(canvas.width - this.tam / 2, this.x));
    this.y = Math.max(this.tam / 2, Math.min(canvas.height - this.tam / 2, this.y));
  }

  atirar() {
    tiros.push(new Tiro(this.x, this.y, this.dirX, this.dirY, true));
  }

  desenhar() {
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(this.x - this.tam / 2, this.y - this.tam / 2, this.tam, this.tam);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.dirX * 25, this.y + this.dirY * 25);
    ctx.stroke();
  }
}

class TanqueInimigo {
  constructor(x, y, nivel = 1) {
    this.x = x;
    this.y = y;
    this.nivel = nivel;
    this.dirX = 0;
    this.dirY = 1;

    switch(nivel) {
      case 1:
        this.tam = 26;
        this.vel = 1.3;
        this.cor = '#e74c3c';
        this.cadenciaTiro = 110;
        this.velTiro = 6;
        this.vidaInimigo = 1;
        break;
      case 2:
        this.tam = 24;
        this.vel = 2.4;
        this.cor = '#9b59b6';
        this.cadenciaTiro = 70;
        this.velTiro = 8;
        this.vidaInimigo = 1;
        break;
      case 3:
        this.tam = 36;
        this.vel = 0.9;
        this.cor = '#34495e';
        this.cadenciaTiro = 90;
        this.velTiro = 7;
        this.vidaInimigo = 2;
        break;
      case 4:
        this.tam = 28;
        this.vel = 1.5;
        this.cor = '#e67e22';
        this.cadenciaTiro = 45;
        this.velTiro = 11;
        this.vidaInimigo = 1;
        break;
      case 5:
        this.tam = 42;
        this.vel = 0.7;
        this.cor = '#111111';
        this.cadenciaTiro = 40;
        this.velTiro = 9;
        this.vidaInimigo = 4;
        break;
    }

    this.tempoTiro = Math.floor(Math.random() * this.cadenciaTiro);
  }

  atualizar(alvoX, alvoY) {
    const dx = alvoX - this.x;
    const dy = alvoY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist !== 0) {
      this.dirX = dx / dist;
      this.dirY = dy / dist;
      this.x += this.dirX * this.vel;
      this.y += this.dirY * this.vel;
    }

    this.tempoTiro++;
    if (this.tempoTiro >= this.cadenciaTiro) {
      this.tempoTiro = 0;
      const corTiro = this.nivel === 5 ? '#ff0000' : '#ffcc00';
      tiros.push(new Tiro(this.x, this.y, this.dirX, this.dirY, false, this.velTiro, 5, corTiro));
    }
  }

  desenhar() {
    ctx.fillStyle = this.cor;
    ctx.fillRect(this.x - this.tam / 2, this.y - this.tam / 2, this.tam, this.tam);

    if (this.nivel === 3 || this.nivel === 5) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - this.tam / 2, this.y - this.tam / 2, this.tam, this.tam);
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = this.nivel === 5 ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.dirX * (this.tam / 2 + 10), this.y + this.dirY * (this.tam / 2 + 10));
    ctx.stroke();
  }
}

const jogador = new TanqueJogador(canvas.width / 2, canvas.height - 50);
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

function loop() {
  if (!jogoRodando) return;

  frameCount++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4a3b2c';
  obstaculos.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  jogador.mover();
  jogador.desenhar();

  if (frameCount % 600 === 0) {
    itensVida.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 150) + 50,
      tam: 15
    });
  }

  for (let i = itensVida.length - 1; i >= 0; i--) {
    const item = itensVida[i];
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(item.x - item.tam/2, item.y - item.tam/2, item.tam, item.tam);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('+', item.x - 4, item.y + 4);

    if (Math.hypot(jogador.x - item.x, jogador.y - item.y) < jogador.tam / 2 + item.tam / 2) {
      jogador.vida = Math.min(100, jogador.vida + 25);
      vidaText.textContent = `Vida: ${jogador.vida}`;
      itensVida.splice(i, 1);
    }
  }

  if (frameCount % 120 === 0) {
    const posX = Math.random() * (canvas.width - 100) + 50;
    const nivel = sortearNivelInimigo();
    inimigos.push(new TanqueInimigo(posX, 20, nivel));
  }

  inimigos.forEach(inimigo => {
    inimigo.atualizar(jogador.x, jogador.y);
    inimigo.desenhar();
  });

  for (let i = tiros.length - 1; i >= 0; i--) {
    const tiro = tiros[i];
    tiro.atualizar();
    tiro.desenhar();

    if (tiro.x < 0 || tiro.x > canvas.width || tiro.y < 0 || tiro.y > canvas.height) {
      tiros.splice(i, 1);
      continue;
    }

    let tiroColidiuObs = false;
    for (const obs of obstaculos) {
      if (tiro.x > obs.x && tiro.x < obs.x + obs.width &&
          tiro.y > obs.y && tiro.y < obs.y + obs.height) {
        tiros.splice(i, 1);
        tiroColidiuObs = true;
        break;
      }
    }
    if (tiroColidiuObs) continue;

    if (tiro.eJogador) {
      for (let j = inimigos.length - 1; j >= 0; j--) {
        const inimigo = inimigos[j];
        const dist = Math.hypot(tiro.x - inimigo.x, tiro.y - inimigo.y);

        if (dist < inimigo.tam / 2) {
          inimigo.vidaInimigo -= 1;
          tiros.splice(i, 1);

          if (inimigo.vidaInimigo <= 0) {
            pontos += inimigo.nivel * 15;
            pontosText.textContent = `Pontos: ${pontos}`;
            inimigos.splice(j, 1);
          }
          break;
        }
      }
    } else {
      const dist = Math.hypot(tiro.x - jogador.x, tiro.y - jogador.y);
      if (dist < jogador.tam / 2) {
        jogador.vida -= 10;
        vidaText.textContent = `Vida: ${jogador.vida}`;
        tiros.splice(i, 1);

        if (jogador.vida <= 0) {
          jogoRodando = false;
          alert(`FIM DE JOGO! Sua pontuação final foi: ${pontos}`);
        }
      }
    }
  }

  requestAnimationFrame(loop);
}

loop();
