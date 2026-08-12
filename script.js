
// ======================================================
// SUPER TANK ARENA - VERSÃO REVISADA
// ======================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// ======================================================
// CONFIGURAÇÃO
// ======================================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (jogador) {
        jogador.x = Math.max(
            jogador.raio,
            Math.min(canvas.width - jogador.raio, jogador.x)
        );

        jogador.y = Math.max(
            jogador.raio,
            Math.min(canvas.height - jogador.raio, jogador.y)
        );
    }
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ======================================================
// ESTADO
// ======================================================

let estado = "menu";

let pontos = 0;
let onda = 1;

let inimigos = [];
let balas = [];
let balasInimigas = [];
let explosoes = [];
let obstaculos = [];


// ======================================================
// DADOS SALVOS
// ======================================================

let moedas =
    Number(localStorage.getItem("tankMoedas")) || 0;

let upgrades = {
    dano:
        Number(localStorage.getItem("tankDano")) || 20,

    vida:
        Number(localStorage.getItem("tankVida")) || 100,

    velocidade:
        Number(localStorage.getItem("tankVelocidade")) || 4
};


// ======================================================
// CONTROLES
// ======================================================

const teclas = {};

const mouse = {
    x: 0,
    y: 0,
    pressionado: false
};

window.addEventListener("keydown", (event) => {
    teclas[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    teclas[event.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", (event) => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener("mousedown", (event) => {

    if (event.button === 0) {
        mouse.pressionado = true;
    }
});

window.addEventListener("mouseup", (event) => {

    if (event.button === 0) {
        mouse.pressionado = false;
    }
});


// ======================================================
// JOGADOR
// ======================================================

let jogador = null;

function criarJogador() {

    jogador = {
        x: canvas.width / 2,
        y: canvas.height / 2,

        raio: 25,

        velocidade: upgrades.velocidade,

        vida: upgrades.vida,
        vidaMax: upgrades.vida,

        dano: upgrades.dano,

        angulo: 0,

        ultimoTiro: 0,
        intervaloTiro: 280
    };
}


// ======================================================
// UTILIDADES
// ======================================================

function distancia(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}


function limitar(valor, minimo, maximo) {

    return Math.max(
        minimo,
        Math.min(maximo, valor)
    );
}


function anguloEntre(a, b) {

    return Math.atan2(
        b.y - a.y,
        b.x - a.x
    );
}


function pontoDentroRetangulo(x, y, r) {

    return (
        x > r.x &&
        x < r.x + r.largura &&
        y > r.y &&
        y < r.y + r.altura
    );
}


function circuloRetanguloColide(circulo, retangulo) {

    const pontoX = limitar(
        circulo.x,
        retangulo.x,
        retangulo.x + retangulo.largura
    );

    const pontoY = limitar(
        circulo.y,
        retangulo.y,
        retangulo.y + retangulo.altura
    );

    const dx = circulo.x - pontoX;
    const dy = circulo.y - pontoY;

    return (
        dx * dx +
        dy * dy
    ) < circulo.raio * circulo.raio;
}


// ======================================================
// MOVIMENTO COM COLISÃO
// ======================================================

function moverComColisao(objeto, dx, dy) {

    const novoX = objeto.x + dx;

    const testeX = {
        x: novoX,
        y: objeto.y,
        raio: objeto.raio
    };

    let bloqueadoX = false;

    for (const obstaculo of obstaculos) {

        if (
            circuloRetanguloColide(
                testeX,
                obstaculo
            )
        ) {
            bloqueadoX = true;
            break;
        }
    }

    if (!bloqueadoX) {
        objeto.x = novoX;
    }


    const novoY = objeto.y + dy;

    const testeY = {
        x: objeto.x,
        y: novoY,
        raio: objeto.raio
    };

    let bloqueadoY = false;

    for (const obstaculo of obstaculos) {

        if (
            circuloRetanguloColide(
                testeY,
                obstaculo
            )
        ) {
            bloqueadoY = true;
            break;
        }
    }

    if (!bloqueadoY) {
        objeto.y = novoY;
    }


    objeto.x = limitar(
        objeto.x,
        objeto.raio,
        canvas.width - objeto.raio
    );

    objeto.y = limitar(
        objeto.y,
        objeto.raio,
        canvas.height - objeto.raio
    );
}


// ======================================================
// OBSTÁCULOS
// ======================================================

function criarObstaculos() {

    obstaculos = [];

    let tentativas = 0;

    while (
        obstaculos.length < 12 &&
        tentativas < 300
    ) {

        tentativas++;

        const novo = {

            x: 100 + Math.random() *
                (canvas.width - 300),

            y: 100 + Math.random() *
                (canvas.height - 250),

            largura:
                70 + Math.random() * 90,

            altura:
                35 + Math.random() * 35
        };


        // Não colocar obstáculo sobre o jogador

        const centro = {
            x:
                novo.x +
                novo.largura / 2,

            y:
                novo.y +
                novo.altura / 2,

            raio: 100
        };


        if (
            distancia(
                centro,
                jogador
            ) < 150
        ) {
            continue;
        }


        obstaculos.push(novo);
    }
}


// ======================================================
// CRIAR INIMIGO
// ======================================================

function criarInimigo() {

    let x;
    let y;

    let tentativas = 0;

    do {

        tentativas++;

        const lado =
            Math.floor(
                Math.random() * 4
            );

        if (lado === 0) {
            x = 40;
            y = 40 + Math.random() *
                (canvas.height - 80);
        }

        else if (lado === 1) {
            x = canvas.width - 40;
            y = 40 + Math.random() *
                (canvas.height - 80);
        }

        else if (lado === 2) {
            x = 40 + Math.random() *
                (canvas.width - 80);
            y = 40;
        }

        else {
            x = 40 + Math.random() *
                (canvas.width - 80);
            y = canvas.height - 40;
        }

    } while (
        jogador &&
        distancia(
            { x, y },
            jogador
        ) < 300 &&
        tentativas < 100
    );


    const vida =
        50 + onda * 10;


    inimigos.push({

        x,
        y,

        raio: 23,

        vida,
        vidaMax: vida,

        velocidade:
            1.0 + onda * 0.07,

        angulo: 0,

        ultimoTiro: 0,

        intervaloTiro:
            Math.max(
                500,
                1200 - onda * 20
            )
    });
}


// ======================================================
// TIRO DO JOGADOR
// ======================================================

function atirarJogador() {

    const agora = Date.now();

    if (
        agora -
        jogador.ultimoTiro
        <
        jogador.intervaloTiro
    ) {
        return;
    }


    jogador.ultimoTiro = agora;


    const velocidade = 9;


    balas.push({

        x:
            jogador.x +
            Math.cos(jogador.angulo) * 36,

        y:
            jogador.y +
            Math.sin(jogador.angulo) * 36,

        vx:
            Math.cos(jogador.angulo) *
            velocidade,

        vy:
            Math.sin(jogador.angulo) *
            velocidade,

        dano:
            jogador.dano,

        raio: 5,

        vida: 100
    });
}


// ======================================================
// TIRO INIMIGO
// ======================================================

function atirarInimigo(inimigo) {

    const agora = Date.now();

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
        anguloEntre(
            inimigo,
            jogador
        );


    balasInimigas.push({

        x:
            inimigo.x +
            Math.cos(angulo) * 30,

        y:
            inimigo.y +
            Math.sin(angulo) * 30,

        vx:
            Math.cos(angulo) * 5,

        vy:
            Math.sin(angulo) * 5,

        dano:
            8 + onda * 1.2,

        raio: 5
    });
}


// ======================================================
// JOGADOR
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


        moverComColisao(
            jogador,
            dx * jogador.velocidade,
            dy * jogador.velocidade
        );
    }


    jogador.angulo =
        Math.atan2(
            mouse.y - jogador.y,
            mouse.x - jogador.x
        );


    if (mouse.pressionado) {
        atirarJogador();
    }
}


// ======================================================
// IA DOS INIMIGOS
// ======================================================

function atualizarInimigos() {

    for (const inimigo of inimigos) {

        const d =
            distancia(
                inimigo,
                jogador
            );


        inimigo.angulo =
            anguloEntre(
                inimigo,
                jogador
            );


        let movimento = 0;


        // Aproximar

        if (d > 300) {
            movimento = 1;
        }


        // Recuar

        if (d < 180) {
            movimento = -1;
        }


        if (movimento !== 0) {

            const dx =
                Math.cos(
                    inimigo.angulo
                ) *
                inimigo.velocidade *
                movimento;

            const dy =
                Math.sin(
                    inimigo.angulo
                ) *
                inimigo.velocidade *
                movimento;


            moverComColisao(
                inimigo,
                dx,
                dy
            );
        }


        // Atacar

        if (d < 650) {

            atirarInimigo(
                inimigo
            );
        }
    }


    resolverColisoesEntreTanques();
}


// ======================================================
// IMPEDIR TANQUES DE FICAREM DENTRO UM DO OUTRO
// ======================================================

function resolverColisoesEntreTanques() {

    for (let i = 0; i < inimigos.length; i++) {

        const inimigo = inimigos[i];


        // Inimigo x jogador

        const dJogador =
            distancia(
                inimigo,
                jogador
            );


        const distanciaMinima =
            inimigo.raio +
            jogador.raio;


        if (
            dJogador < distanciaMinima &&
            dJogador > 0
        ) {

            const dx =
                inimigo.x -
                jogador.x;

            const dy =
                inimigo.y -
                jogador.y;

            const tamanho =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const empurrao =
                distanciaMinima -
                dJogador;


            inimigo.x +=
                (dx / tamanho) *
                empurrao;


            inimigo.y +=
                (dy / tamanho) *
                empurrao;
        }


        // Inimigo x inimigo

        for (
            let j = i + 1;
            j < inimigos.length;
            j++
        ) {

            const outro =
                inimigos[j];


            const d =
                distancia(
                    inimigo,
                    outro
                );


            const minimo =
                inimigo.raio +
                outro.raio;


            if (
                d < minimo &&
                d > 0
            ) {

                const dx =
                    inimigo.x -
                    outro.x;

                const dy =
                    inimigo.y -
                    outro.y;

                const tamanho =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                const empurrao =
                    (minimo - d) / 2;


                inimigo.x +=
                    (dx / tamanho) *
                    empurrao;

                inimigo.y +=
                    (dy / tamanho) *
                    empurrao;


                outro.x -=
                    (dx / tamanho) *
                    empurrao;

                outro.y -=
                    (dy / tamanho) *
                    empurrao;
            }
        }
    }
}


// ======================================================
// BALAS
// ======================================================

function atualizarBalas() {

    // ------------------------------------------
    // BALAS DO JOGADOR
    // ------------------------------------------

    for (
        let i = balas.length - 1;
        i >= 0;
        i--
    ) {

        const bala = balas[i];

        bala.x += bala.vx;
        bala.y += bala.vy;

        bala.vida--;


        // Parede

        let acertouParede = false;

        for (const obstaculo of obstaculos) {

            if (
                pontoDentroRetangulo(
                    bala.x,
                    bala.y,
                    obstaculo
                )
            ) {

                acertouParede = true;

                criarExplosao(
                    bala.x,
                    bala.y
                );

                break;
            }
        }


        if (
            acertouParede ||
            bala.x < 0 ||
            bala.x > canvas.width ||
            bala.y < 0 ||
            bala.y > canvas.height ||
            bala.vida <= 0
        ) {

            balas.splice(i, 1);

            continue;
        }


        // Inimigos

        let acertou = false;

        for (
            let j = inimigos.length - 1;
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
                bala.raio +
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


                acertou = true;


                if (
                    inimigo.vida <= 0
                ) {

                    destruirInimigo(j);
                }


                break;
            }
        }


        if (acertou) {
            continue;
        }
    }


    // ------------------------------------------
    // BALAS INIMIGAS
    // ------------------------------------------

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


        let bateuParede = false;


        for (
            const obstaculo
            of obstaculos
        ) {

            if (
                pontoDentroRetangulo(
                    bala.x,
                    bala.y,
                    obstaculo
                )
            ) {

                bateuParede = true;

                criarExplosao(
                    bala.x,
                    bala.y
                );

                break;
            }
        }


        if (
            bateuParede ||
            bala.x < 0 ||
            bala.x > canvas.width ||
            bala.y < 0 ||
            bala.y > canvas.height
        ) {

            balasInimigas.splice(
                i,
                1
            );

            continue;
        }


        if (
            distancia(
                bala,
                jogador
            )
            <
            bala.raio +
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


    if (!inimigo) {
        return;
    }


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
}


// ======================================================
// EXPLOSÕES
// ======================================================

function criarExplosao(x, y) {

    explosoes.push({

        x,
        y,

        raio: 5,

        vida: 25,

        vidaMax: 25
    });
}


function atualizarExplosoes() {

    for (
        let i =
        explosoes.length - 1;

        i >= 0;

        i--
    ) {

        const explosao =
            explosoes[i];


        explosao.raio += 2;

        explosao.vida--;


        if (
            explosao.vida <= 0
        ) {

            explosoes.splice(
                i,
                1
            );
        }
    }
}


// ======================================================
// ONDAS
// ======================================================

function verificarOnda() {

    if (
        inimigos.length === 0 &&
        balas.length === 0 &&
        balasInimigas.length === 0
    ) {

        onda++;


        const quantidade =
            Math.min(
                12,
                2 + onda
            );


        for (
            let i = 0;
            i < quantidade;
            i++
        ) {

            criarInimigo();
        }


        document.getElementById(
            "onda"
        ).textContent = onda;
    }
}


// ======================================================
// DESENHAR CENÁRIO
// ======================================================

function desenharCenario() {

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

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

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

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }


    // Obstáculos

    for (
        const obstaculo
        of obstaculos
    ) {

        ctx.fillStyle =
            "#555";


        ctx.fillRect(
            obstaculo.x,
            obstaculo.y,
            obstaculo.largura,
            obstaculo.altura
        );


        ctx.strokeStyle =
            "#252525";

        ctx.lineWidth = 4;


        ctx.strokeRect(
            obstaculo.x,
            obstaculo.y,
            obstaculo.largura,
            obstaculo.altura
        );
    }
}


// ======================================================
// DESENHAR TANQUE
// ======================================================

function desenharTanque(
    tanque,
    jogadorTanque
) {

    ctx.save();


    ctx.translate(
        tanque.x,
        tanque.y
    );


    ctx.rotate(
        tanque.angulo
    );


    // Esteira

    ctx.fillStyle =
        "#151515";


    ctx.fillRect(
        -30,
        -25,
        60,
        13
    );


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


    // Corpo interno

    ctx.fillStyle =
        jogadorTanque
            ? "#286f32"
            : "#912525";


    ctx.fillRect(
        -17,
        -12,
        34,
        24
    );


    // Torre

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
            ? "#247732"
            : "#982626";


    ctx.fill();


    // Canhão

    ctx.fillStyle =
        "#202020";


    ctx.fillRect(
        5,
        -5,
        38,
        10
    );


    ctx.restore();


    // Vida inimiga

    if (!jogadorTanque) {

        const largura = 50;


        ctx.fillStyle =
            "#321010";


        ctx.fillRect(
            tanque.x -
            largura / 2,

            tanque.y - 42,

            largura,

            5
        );


        ctx.fillStyle =
            "#43ff43";


        ctx.fillRect(
            tanque.x -
            largura / 2,

            tanque.y - 42,

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

        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffe600";


        ctx.shadowBlur = 12;

        ctx.shadowColor =
            "#ffff00";


        ctx.fill();

        ctx.shadowBlur = 0;
    }


    for (
        const bala
        of balasInimigas
    ) {

        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ff3333";


        ctx.shadowBlur = 12;

        ctx.shadowColor =
            "#ff0000";


        ctx.fill();

        ctx.shadowBlur = 0;
    }
}


// ======================================================
// DESENHAR EXPLOSÕES
// ======================================================

function desenharExplosoes() {

    for (
        const explosao
        of explosoes
    ) {

        const alpha =
            explosao.vida /
            explosao.vidaMax;


        ctx.beginPath();

        ctx.arc(
            explosao.x,
            explosao.y,
            explosao.raio,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,100,10,${alpha})`;


        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            explosao.x,
            explosao.y,
            explosao.raio * .5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,240,80,${alpha})`;


        ctx.fill();
    }
}


// ======================================================
// INTERFACE
// ======================================================

function atualizarInterface() {

    if (!jogador) {
        return;
    }


    document.getElementById(
        "moedas"
    ).textContent =
        moedas;


    document.getElementById(
        "pontos"
    ).textContent =
        pontos;


    const porcentagem =
        limitar(
            jogador.vida /
            jogador.vidaMax *
            100,
            0,
            100
        );


    document.getElementById(
        "barraVida"
    ).style.width =
        porcentagem + "%";


    document.getElementById(
        "onda"
    ).textContent =
        onda;
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

    if (
        estado !== "jogando"
    ) {
        return;
    }


    estado = "gameover";


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
// COMEÇAR JOGO
// ======================================================

function iniciarJogo() {

    estado = "jogando";


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


    inimigos = [];

    balas = [];

    balasInimigas = [];

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

    estado = "menu";


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
        upgrades.velocidade.toFixed(1);
}


function abrirGaragem() {

    estado = "garagem";


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
// COMPRAR UPGRADES
// ======================================================

function comprarUpgrade(tipo) {

    let preco = 0;


    if (tipo === "dano") {

        preco =
            upgrades.dano * 4;


        if (moedas >= preco) {

            moedas -= preco;

            upgrades.dano += 5;
        }
    }


    if (tipo === "vida") {

        preco =
            upgrades.vida;


        if (moedas >= preco) {

            moedas -= preco;

            upgrades.vida += 20;
        }
    }


    if (tipo === "velocidade") {

        preco =
            Math.floor(
                upgrades.velocidade * 80
            );


        if (moedas >= preco) {

            moedas -= preco;

            upgrades.velocidade += 0.5;
        }
    }


    salvarDados();

    atualizarGaragem();
}


// ======================================================
// BOTÕES
// ======================================================

document.getElementById(
    "btnJogar"
).onclick = iniciarJogo;


document.getElementById(
    "btnLoja"
).onclick = abrirGaragem;


document.getElementById(
    "btnVoltar"
).onclick = mostrarMenu;


document.getElementById(
    "btnMenu"
).onclick = mostrarMenu;


document.getElementById(
    "upgradeDano"
).onclick = () => {

    comprarUpgrade("dano");
};


document.getElementById(
    "upgradeVida"
).onclick = () => {

    comprarUpgrade("vida");
};


document.getElementById(
    "upgradeVelocidade"
).onclick = () => {

    comprarUpgrade("velocidade");
};


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

    atualizarInterface();


    if (
        jogador.vida <= 0
    ) {

        jogador.vida = 0;

        gameOver();
    }
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
