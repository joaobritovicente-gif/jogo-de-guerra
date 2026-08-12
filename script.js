const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// ==============================
// CONFIGURAÇÕES
// ==============================

const mundo = {
    largura: 2400,
    altura: 1800
};

let camera = {
    x: 0,
    y: 0
};

let teclas = {};

let mouse = {
    x: 0,
    y: 0,
    pressionado: false
};

let jogador;
let inimigos = [];
let tirosJogador = [];
let tirosInimigos = [];
let obstaculos = [];

let pontos = 0;
let onda = 1;
let jogoAtivo = true;

let tempoSpawn = 0;


// ==============================
// CONTROLES
// ==============================

window.addEventListener("keydown", function(event) {
    teclas[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", function(event) {
    teclas[event.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener("mousedown", function() {
    mouse.pressionado = true;
});

canvas.addEventListener("mouseup", function() {
    mouse.pressionado = false;
});


// ==============================
// UTILIDADES
// ==============================

function distancia(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}

function anguloEntre(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}


// ==============================
// JOGADOR
// ==============================

function criarJogador() {

    jogador = {
        x: mundo.largura / 2,
        y: mundo.altura / 2,

        tamanho: 28,

        velocidade: 4,

        vida: 100,

        angulo: 0,

        ultimoTiro: 0,

        intervaloTiro: 250
    };
}


// ==============================
// OBSTÁCULOS
// ==============================

function criarObstaculos() {

    obstaculos = [];

    // Paredes
    for (let i = 0; i < 15; i++) {

        obstaculos.push({
            tipo: "parede",

            x: Math.random() * (mundo.largura - 250),

            y: Math.random() * (mundo.altura - 200),

            largura: 120 + Math.random() * 120,

            altura: 35
        });
    }


    // Árvores e pedras
    for (let i = 0; i < 50; i++) {

        obstaculos.push({
            tipo: Math.random() < 0.6 ? "arvore" : "pedra",

            x: Math.random() * (mundo.largura - 100),

            y: Math.random() * (mundo.altura - 100),

            largura: 35 + Math.random() * 25,

            altura: 35 + Math.random() * 25
        });
    }
}


// ==============================
// INIMIGOS
// ==============================

function criarInimigo() {

    let lado = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (lado === 0) {
        x = 100;
        y = Math.random() * mundo.altura;
    }

    if (lado === 1) {
        x = mundo.largura - 100;
        y = Math.random() * mundo.altura;
    }

    if (lado === 2) {
        x = Math.random() * mundo.largura;
        y = 100;
    }

    if (lado === 3) {
        x = Math.random() * mundo.largura;
        y = mundo.altura - 100;
    }

    inimigos.push({

        x: x,
        y: y,

        tamanho: 26,

        velocidade: 1.2 + onda * 0.05,

        vida: 50 + onda * 5,

        angulo: 0,

        ultimoTiro: 0,

        intervaloTiro: 900 + Math.random() * 700
    });
}


// ==============================
// TIRO DO JOGADOR
// ==============================

function atirarJogador() {

    const agora = Date.now();

    if (agora - jogador.ultimoTiro < jogador.intervaloTiro) {
        return;
    }

    jogador.ultimoTiro = agora;

    tirosJogador.push({

        x: jogador.x + Math.cos(jogador.angulo) * 35,

        y: jogador.y + Math.sin(jogador.angulo) * 35,

        velocidade: 9,

        angulo: jogador.angulo,

        dano: 25
    });
}


// ==============================
// TIRO DOS INIMIGOS
// ==============================

function atirarInimigo(inimigo) {

    const agora = Date.now();

    if (agora - inimigo.ultimoTiro < inimigo.intervaloTiro) {
        return;
    }

    inimigo.ultimoTiro = agora;

    const angulo = anguloEntre(inimigo, jogador);

    tirosInimigos.push({

        x: inimigo.x + Math.cos(angulo) * 30,

        y: inimigo.y + Math.sin(angulo) * 30,

        velocidade: 5,

        angulo: angulo,

        dano: 10
    });
}


// ==============================
// COLISÃO
// ==============================

function colisaoCirculos(a, b) {

    return distancia(a, b) <
        a.tamanho + b.tamanho;
}


// ==============================
// ATUALIZAR JOGADOR
// ==============================

function atualizarJogador() {

    let dx = 0;
    let dy = 0;

    if (teclas["w"] || teclas["arrowup"]) {
        dy -= 1;
    }

    if (teclas["s"] || teclas["arrowdown"]) {
        dy += 1;
    }

    if (teclas["a"] || teclas["arrowleft"]) {
        dx -= 1;
    }

    if (teclas["d"] || teclas["arrowright"]) {
        dx += 1;
    }


    // Normalizar movimento diagonal
    if (dx !== 0 || dy !== 0) {

        const tamanho = Math.sqrt(dx * dx + dy * dy);

        dx /= tamanho;
        dy /= tamanho;

        jogador.x += dx * jogador.velocidade;
        jogador.y += dy * jogador.velocidade;
    }


    jogador.x = limitar(
        jogador.x,
        30,
        mundo.largura - 30
    );

    jogador.y = limitar(
        jogador.y,
        30,
        mundo.altura - 30
    );


    // Mirar no mouse
    const mouseMundo = {
        x: mouse.x + camera.x,
        y: mouse.y + camera.y
    };

    jogador.angulo = anguloEntre(
        jogador,
        mouseMundo
    );


    if (mouse.pressionado) {
        atirarJogador();
    }
}


// ==============================
// ATUALIZAR INIMIGOS
// ==============================

function atualizarInimigos() {

    for (let inimigo of inimigos) {

        inimigo.angulo = anguloEntre(
            inimigo,
            jogador
        );


        const distanciaJogador =
            distancia(inimigo, jogador);


        // Perseguir jogador
        if (distanciaJogador > 180) {

            inimigo.x +=
                Math.cos(inimigo.angulo) *
                inimigo.velocidade;

            inimigo.y +=
                Math.sin(inimigo.angulo) *
                inimigo.velocidade;
        }


        // Atirar quando estiver perto
        if (distanciaJogador < 600) {

            atirarInimigo(inimigo);
        }


        // Colisão com jogador
        if (colisaoCirculos(inimigo, jogador)) {

            jogador.vida -= 0.5;

            inimigo.x -=
                Math.cos(inimigo.angulo) * 2;

            inimigo.y -=
                Math.sin(inimigo.angulo) * 2;
        }
    }
}


// ==============================
// ATUALIZAR TIROS
// ==============================

function atualizarTiros() {

    // Tiros do jogador
    for (let i = tirosJogador.length - 1; i >= 0; i--) {

        const tiro = tirosJogador[i];

        tiro.x += Math.cos(tiro.angulo) * tiro.velocidade;

        tiro.y += Math.sin(tiro.angulo) * tiro.velocidade;


        // Fora do mapa
        if (
            tiro.x < 0 ||
            tiro.x > mundo.largura ||
            tiro.y < 0 ||
            tiro.y > mundo.altura
        ) {

            tirosJogador.splice(i, 1);

            continue;
        }


        // Acertar inimigos
        for (let j = inimigos.length - 1; j >= 0; j--) {

            const inimigo = inimigos[j];

            if (distancia(tiro, inimigo) < 30) {

                inimigo.vida -= tiro.dano;

                tirosJogador.splice(i, 1);

                if (inimigo.vida <= 0) {

                    inimigos.splice(j, 1);

                    pontos += 100;

                    document.getElementById("pontos")
                        .textContent = pontos;
                }

                break;
            }
        }
    }


    // Tiros dos inimigos
    for (let i = tirosInimigos.length - 1; i >= 0; i--) {

        const tiro = tirosInimigos[i];

        tiro.x += Math.cos(tiro.angulo) * tiro.velocidade;

        tiro.y += Math.sin(tiro.angulo) * tiro.velocidade;


        if (
            tiro.x < 0 ||
            tiro.x > mundo.largura ||
            tiro.y < 0 ||
            tiro.y > mundo.altura
        ) {

            tirosInimigos.splice(i, 1);

            continue;
        }


        if (distancia(tiro, jogador) < 30) {

            jogador.vida -= tiro.dano;

            tirosInimigos.splice(i, 1);
        }
    }
}


// ==============================
// CÂMERA
// ==============================

function atualizarCamera() {

    camera.x =
        jogador.x - canvas.width / 2;

    camera.y =
        jogador.y - canvas.height / 2;


    camera.x = limitar(
        camera.x,
        0,
        mundo.largura - canvas.width
    );

    camera.y = limitar(
        camera.y,
        0,
        mundo.altura - canvas.height
    );
}


// ==============================
// DESENHAR CENÁRIO
// ==============================

function desenharCenario() {

    ctx.fillStyle = "#4d7c3a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grade do terreno
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;

    for (
        let x = -camera.x % 80;
        x < canvas.width;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }


    for (
        let y = -camera.y % 80;
        y < canvas.height;
        y += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }


    // Obstáculos
    for (let o of obstaculos) {

        const x = o.x - camera.x;
        const y = o.y - camera.y;


        if (o.tipo === "parede") {

            ctx.fillStyle = "#555";

            ctx.fillRect(
                x,
                y,
                o.largura,
                o.altura
            );

            ctx.strokeStyle = "#333";

            ctx.strokeRect(
                x,
                y,
                o.largura,
                o.altura
            );
        }


        if (o.tipo === "arvore") {

            // Tronco
            ctx.fillStyle = "#654321";

            ctx.fillRect(
                x + 15,
                y + 20,
                12,
                30
            );

            // Copa
            ctx.fillStyle = "#185c28";

            ctx.beginPath();

            ctx.arc(
                x + 20,
                y + 20,
                25,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }


        if (o.tipo === "pedra") {

            ctx.fillStyle = "#777";

            ctx.beginPath();

            ctx.arc(
                x + 20,
                y + 20,
                20,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ==============================
// DESENHAR TANQUE
// ==============================

function desenharTanque(tanque, cor) {

    const x = tanque.x - camera.x;
    const y = tanque.y - camera.y;


    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(tanque.angulo);


    // Esteiras
    ctx.fillStyle = "#222";

    ctx.fillRect(
        -25,
        -22,
        50,
        12
    );

    ctx.fillRect(
        -25,
        10,
        50,
        12
    );


    // Corpo
    ctx.fillStyle = cor;

    ctx.fillRect(
        -20,
        -17,
        40,
        34
    );


    // Torre
    ctx.fillStyle = cor === "#3ca64c"
        ? "#24702e"
        : "#9d2020";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Canhão
    ctx.fillStyle = "#222";

    ctx.fillRect(
        0,
        -4,
        38,
        8
    );


    ctx.restore();


    // Barra de vida dos inimigos
    if (cor === "#c62828") {

        const vidaMaxima =
            50 + onda * 5;

        const largura = 45;

        ctx.fillStyle = "#400";

        ctx.fillRect(
            x - largura / 2,
            y - 42,
            largura,
            5
        );

        ctx.fillStyle = "#0f0";

        ctx.fillRect(
            x - largura / 2,
            y - 42,
            largura *
            (tanque.vida / vidaMaxima),
            5
        );
    }
}


// ==============================
// DESENHAR TIROS
// ==============================

function desenharTiros() {

    for (let tiro of tirosJogador) {

        ctx.fillStyle = "#ffe600";

        ctx.beginPath();

        ctx.arc(
            tiro.x - camera.x,
            tiro.y - camera.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    for (let tiro of tirosInimigos) {

        ctx.fillStyle = "#ff3333";

        ctx.beginPath();

        ctx.arc(
            tiro.x - camera.x,
            tiro.y - camera.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==============================
// SPAWN
// ==============================

function controlarSpawn() {

    tempoSpawn++;

    const quantidadeMaxima =
        3 + onda * 2;

    if (
        tempoSpawn > 120 &&
        inimigos.length < quantidadeMaxima
    ) {

        criarInimigo();

        tempoSpawn = 0;
    }


    // Nova onda
    if (
        inimigos.length === 0 &&
        tempoSpawn > 180
    ) {

        onda++;

        document.getElementById("onda")
            .textContent = onda;

        for (let i = 0; i < 2 + onda; i++) {

            criarInimigo();
        }

        tempoSpawn = 0;
    }
}


// ==============================
// DESENHAR
// ==============================

function desenhar() {

    desenharCenario();

    desenharTiros();

    for (let inimigo of inimigos) {

        desenharTanque(
            inimigo,
            "#c62828"
        );
    }

    desenharTanque(
        jogador,
        "#3ca64c"
    );
}


// ==============================
// ATUALIZAR INTERFACE
// ==============================

function atualizarInterface() {

    document.getElementById("vida")
        .textContent =
        Math.max(0, Math.floor(jogador.vida));


    document.getElementById("pontos")
        .textContent = pontos;
}


// ==============================
// GAME OVER
// ==============================

function gameOver() {

    jogoAtivo = false;

    document.getElementById(
        "pontuacaoFinal"
    ).textContent = pontos;

    document.getElementById(
        "mensagem"
    ).classList.remove("escondido");
}


// ==============================
// REINICIAR
// ==============================

function reiniciarJogo() {

    pontos = 0;
    onda = 1;

    inimigos = [];
    tirosJogador = [];
    tirosInimigos = [];

    jogoAtivo = true;

    document.getElementById("mensagem")
        .classList.add("escondido");

    document.getElementById("onda")
        .textContent = onda;

    criarJogador();

    criarObstaculos();
}


// ==============================
// LOOP PRINCIPAL
// ==============================

function atualizar() {

    if (!jogoAtivo) {
        return;
    }

    atualizarJogador();

    atualizarInimigos();

    atualizarTiros();

    atualizarCamera();

    controlarSpawn();

    atualizarInterface();


    if (jogador.vida <= 0) {

        gameOver();
    }
}


function loop() {

    atualizar();

    desenhar();

    requestAnimationFrame(loop);
}


// ==============================
// REDIMENSIONAR
// ==============================

window.addEventListener("resize", function() {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;
});


// ==============================
// INICIAR
// ==============================

criarJogador();

criarObstaculos();

for (let i = 0; i < 3; i++) {

    criarInimigo();
}

loop();
