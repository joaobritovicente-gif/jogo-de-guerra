// ======================================================
// SUPER TANK ARENA
// ======================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// ======================================================
// TAMANHO
// ======================================================

function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);


// ======================================================
// ESTADO DO JOGO
// ======================================================

let estado = "menu";

let pontos = 0;

let onda = 1;

let moedas =
    Number(localStorage.getItem("tankMoedas")) || 0;


// ======================================================
// UPGRADES
// ======================================================

let upgrades = {

    dano: Number(
        localStorage.getItem("tankDano")
    ) || 20,

    vida: Number(
        localStorage.getItem("tankVida")
    ) || 100,

    velocidade: Number(
        localStorage.getItem("tankVelocidade")
    ) || 4
};


// ======================================================
// INPUT
// ======================================================

const teclas = {};

const mouse = {

    x: 0,

    y: 0,

    pressionado: false
};


window.addEventListener("keydown", e => {

    teclas[e.key.toLowerCase()] = true;
});


window.addEventListener("keyup", e => {

    teclas[e.key.toLowerCase()] = false;
});


canvas.addEventListener(
    "mousemove",
    e => {

        const rect =
            canvas.getBoundingClientRect();

        mouse.x =
            e.clientX - rect.left;

        mouse.y =
            e.clientY - rect.top;
    }
);


canvas.addEventListener(
    "mousedown",
    () => {

        mouse.pressionado = true;
    }
);


window.addEventListener(
    "mouseup",
    () => {

        mouse.pressionado = false;
    }
);


// ======================================================
// JOGADOR
// ======================================================

let jogador;


function criarJogador() {

    jogador = {

        x: canvas.width / 2,

        y: canvas.height / 2,

        raio: 25,

        velocidade:
            upgrades.velocidade,

        vida:
            upgrades.vida,

        vidaMax:
            upgrades.vida,

        dano:
            upgrades.dano,

        angulo: 0,

        ultimoTiro: 0,

        intervaloTiro: 280
    };
}


// ======================================================
// BALAS
// ======================================================

let balas = [];

let balasInimigas = [];


// ======================================================
// INIMIGOS
// ======================================================

let inimigos = [];


function criarInimigo() {

    const margem = 80;

    let x;
    let y;


    const lado =
        Math.floor(Math.random() * 4);


    if (lado === 0) {

        x = margem;

        y =
            Math.random() *
            canvas.height;
    }


    if (lado === 1) {

        x =
            canvas.width - margem;

        y =
            Math.random() *
            canvas.height;
    }


    if (lado === 2) {

        x =
            Math.random() *
            canvas.width;

        y = margem;
    }


    if (lado === 3) {

        x =
            Math.random() *
            canvas.width;

        y =
            canvas.height - margem;
    }


    const vida =
        50 + onda * 10;


    inimigos.push({

        x,

        y,

        raio: 23,

        vida,

        vidaMax: vida,

        velocidade:
            1.0 +
            onda * 0.08,

        angulo: 0,

        ultimoTiro: 0,

        intervaloTiro:
            900 +
            Math.random() * 700
    });
}


// ======================================================
// OBSTÁCULOS
// ======================================================

let obstaculos = [];


function criarObstaculos() {

    obstaculos = [];


    for (let i = 0; i < 14; i++) {

        obstaculos.push({

            x:
                Math.random() *
                (canvas.width - 160),

            y:
                Math.random() *
                (canvas.height - 120),

            largura:
                70 +
                Math.random() * 80,

            altura:
                30 +
                Math.random() * 30
        });
    }
}


// ======================================================
// DISTÂNCIA
// ======================================================

function distancia(a, b) {

    const dx =
        a.x - b.x;

    const dy =
        a.y - b.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ======================================================
// ÂNGULO
// ======================================================

function mirar(a, b) {

    return Math.atan2(
        b.y - a.y,
        b.x - a.x
    );
}


// ======================================================
// TIRO DO JOGADOR
// ======================================================

function atirar() {

    const agora =
        Date.now();


    if (
        agora -
        jogador.ultimoTiro
        <
        jogador.intervaloTiro
    ) {

        return;
    }


    jogador.ultimoTiro =
        agora;


    const velocidade = 9;


    balas.push({

        x:
            jogador.x +
            Math.cos(jogador.angulo) *
            35,

        y:
            jogador.y +
            Math.sin(jogador.angulo) *
            35,

        vx:
            Math.cos(jogador.angulo) *
            velocidade,

        vy:
            Math.sin(jogador.angulo) *
            velocidade,

        dano:
            jogador.dano,

        vida: 100
    });
}


// ======================================================
// TIRO INIMIGO
// ======================================================

function inimigoAtira(inimigo) {

    const agora =
        Date.now();


    if (
        agora -
        inimigo.ultimoTiro
        <
        inimigo.intervaloTiro
    ) {

        return;
    }


    inimigo.ultimoTiro =
        agora;


    const angulo =
        mirar(
            inimigo,
            jogador
        );


    balasInimigas.push({

        x:
            inimigo.x +
            Math.cos(angulo) *
            30,

        y:
            inimigo.y +
            Math.sin(angulo) *
            30,

        vx:
            Math.cos(angulo) *
            5,

        vy:
            Math.sin(angulo) *
            5,

        dano:
            8 +
            onda * 1.5
    });
}


// ======================================================
// MOVIMENTO DO JOGADOR
// ======================================================

function atualizarJogador() {

    let dx = 0;

    let dy = 0;


    if (
        teclas["w"] ||
        teclas["arrowup"]
    ) {

        dy--;
    }


    if (
        teclas["s"] ||
        teclas["arrowdown"]
    ) {

        dy++;
    }


    if (
        teclas["a"] ||
        teclas["arrowleft"]
    ) {

        dx--;
    }


    if (
        teclas["d"] ||
        teclas["arrowright"]
    ) {

        dx++;
    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const tamanho =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= tamanho;

        dy /= tamanho;


        jogador.x +=
            dx *
            jogador.velocidade;


        jogador.y +=
            dy *
            jogador.velocidade;
    }


    jogador.x =
        Math.max(
            jogador.raio,
            Math.min(
                canvas.width -
                jogador.raio,
                jogador.x
            )
        );


    jogador.y =
        Math.max(
            jogador.raio,
            Math.min(
                canvas.height -
                jogador.raio,
                jogador.y
            )
        );


    jogador.angulo =
        Math.atan2(
            mouse.y -
            jogador.y,

            mouse.x -
            jogador.x
        );


    if (
        mouse.pressionado
    ) {

        atirar();
    }
}


// ======================================================
// IA DOS INIMIGOS
// ======================================================

function atualizarInimigos() {

    for (
        const inimigo
        of inimigos
    ) {

        const d =
            distancia(
                inimigo,
                jogador
            );


        inimigo.angulo =
            mirar(
                inimigo,
                jogador
            );


        // ==========================================
        // PERSEGUIR
        // ==========================================

        if (d > 250) {

            inimigo.x +=
                Math.cos(
                    inimigo.angulo
                ) *
                inimigo.velocidade;

            inimigo.y +=
                Math.sin(
                    inimigo.angulo
                ) *
                inimigo.velocidade;
        }


        // ==========================================
        // MANTER DISTÂNCIA
        // ==========================================

        if (d < 130) {

            inimigo.x -=
                Math.cos(
                    inimigo.angulo
                ) *
                inimigo.velocidade;

            inimigo.y -=
                Math.sin(
                    inimigo.angulo
                ) *
                inimigo.velocidade;
        }


        // ==========================================
        // ATIRAR
        // ==========================================

        if (d < 650) {

            inimigoAtira(
                inimigo
            );
        }


        // ==========================================
        // LIMITES
        // ==========================================

        inimigo.x =
            Math.max(
                inimigo.raio,
                Math.min(
                    canvas.width -
                    inimigo.raio,
                    inimigo.x
                )
            );


        inimigo.y =
            Math.max(
                inimigo.raio,
                Math.min(
                    canvas.height -
                    inimigo.raio,
                    inimigo.y
                )
            );
    }
}


// ======================================================
// ATUALIZAR BALAS
// ======================================================

function atualizarBalas() {

    // ==========================================
    // BALAS DO JOGADOR
    // ==========================================

    for (
        let i =
        balas.length - 1;

        i >= 0;

        i--
    ) {

        const bala =
            balas[i];


        bala.x += bala.vx;

        bala.y += bala.vy;

        bala.vida--;


        if (
            bala.x < 0 ||
            bala.x > canvas.width ||
            bala.y < 0 ||
            bala.y > canvas.height ||
            bala.vida <= 0
        ) {

            balas.splice(i, 1);

            continue;
        }


        // ======================================
        // COLISÃO COM INIMIGO
        // ======================================

        for (
            let j =
            inimigos.length - 1;

            j >= 0;

            j--
        ) {

            const inimigo =
                inimigos[j];


            if (
                distancia(
                    bala,
                    inimigo
                )
                <
                inimigo.raio
            ) {

                inimigo.vida -=
                    bala.dano;


                criarExplosao(
                    bala.x,
                    bala.y
                );


                balas.splice(
                    i,
                    1
                );


                if (
                    inimigo.vida <= 0
                ) {

                    destruirInimigo(
                        j
                    );
                }


                break;
            }
        }
    }


    // ==========================================
    // BALAS DOS INIMIGOS
    // ==========================================

    for (
        let i =
        balasInimigas.length - 1;

        i >= 0;

        i--
    ) {

        const bala =
            balasInimigas[i];


        bala.x += bala.vx;

        bala.y += bala.vy;


        if (
            bala.x < 0 ||
            bala.x > canvas.width ||
            bala.y < 0 ||
            bala.y > canvas.height
        ) {

            balasInimigas.splice(i, 1);

            continue;
        }


        if (
            distancia(
                bala,
                jogador
            )
            <
            jogador.raio
        ) {

            jogador.vida -=
                bala.dano;


            criarExplosao(
                jogador.x,
                jogador.y
            );


            balasInimigas.splice(
                i,
                1
            );
        }
    }
}


// ======================================================
// DESTRUIR INIMIGO
// ======================================================

function destruirInimigo(index) {

    const inimigo =
        inimigos[index];


    criarExplosao(
        inimigo.x,
        inimigo.y
    );


    inimigos.splice(
        index,
        1
    );


    pontos +=
        100 * onda;


    moedas +=
        5 + onda;


    salvarDados();


    atualizarInterface();
}


// ======================================================
// EXPLOSÕES
// ======================================================

let explosoes = [];


function criarExplosao(x, y) {

    explosoes.push({

        x,

        y,

        raio: 5,

        maxRaio: 45,

        vida: 25
    });
}


function atualizarExplosoes() {

    for (
        let i =
        explosoes.length - 1;

        i >= 0;

        i--
    ) {

        const e =
            explosoes[i];


        e.raio += 2;

        e.vida--;


        if (
            e.vida <= 0
        ) {

            explosoes.splice(
                i,
                1
            );
        }
    }
}


// ======================================================
// DESENHAR CENÁRIO
// ======================================================

function desenharCenario() {

    // Fundo

    ctx.fillStyle =
        "#31552b";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grade

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    for (
        let x = 0;
        x < canvas.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < canvas.height;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }


    // Obstáculos

    for (
        const o
        of obstaculos
    ) {

        ctx.fillStyle =
            "#4d4d4d";


        ctx.fillRect(
            o.x,
            o.y,
            o.largura,
            o.altura
        );


        ctx.strokeStyle =
            "#242424";


        ctx.lineWidth = 4;


        ctx.strokeRect(
            o.x,
            o.y,
            o.largura,
            o.altura
        );
    }
}


// ======================================================
// DESENHAR TANQUE
// ======================================================

function desenharTanque(
    tanque,
    jogadorTanque = false
) {

    ctx.save();


    ctx.translate(
        tanque.x,
        tanque.y
    );


    // ==========================================
    // CORPO
    // ==========================================

    ctx.rotate(
        jogadorTanque
            ? tanque.angulo
            : tanque.angulo
    );


    // Esteira esquerda

    ctx.fillStyle =
        "#151515";


    ctx.fillRect(
        -30,
        -25,
        60,
        13
    );


    // Esteira direita

    ctx.fillRect(
        -30,
        12,
        60,
        13
    );


    // Corpo

    ctx.fillStyle =
        jogadorTanque
            ? "#3fa34d"
            : "#c73535";


    ctx.fillRect(
        -23,
        -18,
        46,
        36
    );


    // Detalhes

    ctx.fillStyle =
        jogadorTanque
            ? "#286f32"
            : "#8e2424";


    ctx.fillRect(
        -18,
        -13,
        36,
        26
    );


    // ==========================================
    // TORRE
    // ==========================================

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        16,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        jogadorTanque
            ? "#287b36"
            : "#962626";


    ctx.fill();


    // ==========================================
    // CANHÃO
    // ==========================================

    ctx.fillStyle =
        "#202020";


    ctx.fillRect(
        5,
        -5,
        38,
        10
    );


    ctx.restore();


    // ==========================================
    // BARRA DE VIDA
    // ==========================================

    if (!jogadorTanque) {

        const largura = 45;


        ctx.fillStyle =
            "#301010";


        ctx.fillRect(
            tanque.x -
            largura / 2,

            tanque.y -
            40,

            largura,

            5
        );


        ctx.fillStyle =
            "#45ff45";


        ctx.fillRect(
            tanque.x -
            largura / 2,

            tanque.y -
            40,

            largura *
            (
                tanque.vida /
                tanque.vidaMax
            ),

            5
        );
    }
}


// ======================================================
// DESENHAR BALAS
// ======================================================

function desenharBalas() {

    for (
        const bala
        of balas
    ) {

        ctx.fillStyle =
            "#ffe600";


        ctx.shadowBlur = 10;

        ctx.shadowColor =
            "#ffff00";


        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;
    }


    for (
        const bala
        of balasInimigas
    ) {

        ctx.fillStyle =
            "#ff3333";


        ctx.shadowBlur = 10;

        ctx.shadowColor =
            "red";


        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;
    }
}


// ======================================================
// DESENHAR EXPLOSÕES
// ======================================================

function desenharExplosoes() {

    for (
        const e
        of explosoes
    ) {

        const transparencia =
            e.vida / 25;


        ctx.beginPath();

        ctx.arc(
            e.x,
            e.y,
            e.raio,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,120,20,${transparencia})`;


        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            e.x,
            e.y,
            e.raio * .5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,240,100,${transparencia})`;


        ctx.fill();
    }
}


// ======================================================
// NOVA ONDA
// ======================================================

function verificarOnda() {

    if (
        inimigos.length === 0
    ) {

        onda++;


        document.getElementById(
            "onda"
        ).textContent =
            onda;


        const quantidade =
            2 + onda;


        for (
            let i = 0;
            i < quantidade;
            i++
        ) {

            criarInimigo();
        }
    }
}


// ======================================================
// INTERFACE
// ======================================================

function atualizarInterface() {

    document.getElementById(
        "vida"
    );


    document.getElementById(
        "moedas"
    ).textContent =
        moedas;


    document.getElementById(
        "pontos"
    ).textContent =
        pontos;


    const porcentagem =
        Math.max(
            0,
            jogador.vida /
            jogador.vidaMax *
            100
        );


    document.getElementById(
        "barraVida"
    ).style.width =
        porcentagem + "%";
}


// ======================================================
// SALVAR
// ======================================================

function salvarDados() {

    localStorage.setItem(
        "tankMoedas",
        moedas
    );


    localStorage.setItem(
        "tankDano",
        upgrades.dano
    );


    localStorage.setItem(
        "tankVida",
        upgrades.vida
    );


    localStorage.setItem(
        "tankVelocidade",
        upgrades.velocidade
    );
}


// ======================================================
// GAME OVER
// ======================================================

function gameOver() {

    estado =
        "gameover";


    document.getElementById(
        "pontuacaoFinal"
    ).textContent =
        pontos;


    document.getElementById(
        "gameOver"
    ).classList.remove(
        "escondido"
    );


    salvarDados();
}


// ======================================================
// INICIAR BATALHA
// ======================================================

function iniciarJogo() {

    estado =
        "jogando";


    document.getElementById(
        "menu"
    ).classList.add(
        "escondido"
    );


    document.getElementById(
        "garagem"
    ).classList.add(
        "escondido"
    );


    document.getElementById(
        "jogo"
    ).classList.remove(
        "escondido"
    );


    document.getElementById(
        "gameOver"
    ).classList.add(
        "escondido"
    );


    pontos = 0;

    onda = 1;

    balas = [];

    balasInimigas = [];

    inimigos = [];

    explosoes = [];


    criarJogador();

    criarObstaculos();


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        criarInimigo();
    }


    atualizarInterface();
}


// ======================================================
// MENU
// ======================================================

function mostrarMenu() {

    estado =
        "menu";


    document.getElementById(
        "jogo"
    ).classList.add(
        "escondido"
    );


    document.getElementById(
        "garagem"
    ).classList.add(
        "escondido"
    );


    document.getElementById(
        "menu"
    ).classList.remove(
        "escondido"
    );
}


// ======================================================
// GARAGEM
// ======================================================

function atualizarGaragem() {

    document.getElementById(
        "moedasLoja"
    ).textContent =
        moedas;


    document.getElementById(
        "danoAtual"
    ).textContent =
        upgrades.dano;


    document.getElementById(
        "vidaAtual"
    ).textContent =
        upgrades.vida;


    document.getElementById(
        "velocidadeAtual"
    ).textContent =
        upgrades.velocidade;
}


function abrirGaragem() {

    estado =
        "garagem";


    document.getElementById(
        "menu"
    ).classList.add(
        "escondido"
    );


    document.getElementById(
        "garagem"
    ).classList.remove(
        "escondido"
    );


    atualizarGaragem();
}


// ======================================================
// COMPRAR UPGRADE
// ======================================================

function comprarUpgrade(tipo) {

    let preco;


    if (
        tipo === "dano"
    ) {

        preco =
            upgrades.dano * 4;


        if (
            moedas >= preco
        ) {

            moedas -= preco;

            upgrades.dano += 5;
        }
    }


    if (
        tipo === "vida"
    ) {

        preco =
            upgrades.vida;


        if (
            moedas >= preco
        ) {

            moedas -= preco;

            upgrades.vida += 20;
        }
    }


    if (
        tipo === "velocidade"
    ) {

        preco =
            Math.floor(
                upgrades.velocidade * 80
            );


        if (
            moedas >= preco
        ) {

            moedas -= preco;

            upgrades.velocidade += .5;
        }
    }


    salvarDados();

    atualizarGaragem();
}


// ======================================================
// BOTÕES
// ======================================================

document
    .getElementById(
        "btnJogar"
    )
    .onclick =
    iniciarJogo;


document
    .getElementById(
        "btnLoja"
    )
    .onclick =
    abrirGaragem;


document
    .getElementById(
        "btnVoltar"
    )
    .onclick =
    mostrarMenu;


document
    .getElementById(
        "btnMenu"
    )
    .onclick =
    mostrarMenu;


document
    .getElementById(
        "upgradeDano"
    )
    .onclick =
    () =>
        comprarUpgrade(
            "dano"
        );


document
    .getElementById(
        "upgradeVida"
    )
    .onclick =
    () =>
        comprarUpgrade(
            "vida"
        );


document
    .getElementById(
        "upgradeVelocidade"
    )
    .onclick =
    () =>
        comprarUpgrade(
            "velocidade"
        );


// ======================================================
// LOOP
// ======================================================

function atualizar() {

    if (
        estado !== "jogando"
    ) {

        return;
    }


    atualizarJogador();

    atualizarInimigos();

    atualizarBalas();

    atualizarExplosoes();

    verificarOnda();


    if (
        jogador.vida <= 0
    ) {

        gameOver();
    }


    atualizarInterface();
}


function desenhar() {

    if (
        estado !== "jogando"
    ) {

        return;
    }


    desenharCenario();

    desenharExplosoes();

    desenharBalas();


    for (
        const inimigo
        of inimigos
    ) {

        desenharTanque(
            inimigo,
            false
        );
    }


    desenharTanque(
        jogador,
        true
    );
}


function loop() {

    atualizar();

    desenhar();

    requestAnimationFrame(
        loop
    );
}


loop();
