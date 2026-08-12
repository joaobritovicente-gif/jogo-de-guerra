
// =====================================================
// TANK BATTLE 3D
// =====================================================


// -----------------------------------------------------
// CENA
// -----------------------------------------------------

const cena = new THREE.Scene();

cena.background =
    new THREE.Color(0x87a96b);


// -----------------------------------------------------
// CÂMERA
// -----------------------------------------------------

const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );


// -----------------------------------------------------
// RENDERIZADOR
// -----------------------------------------------------

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled = true;


document.body.appendChild(
    renderer.domElement
);


// -----------------------------------------------------
// LUZ
// -----------------------------------------------------

const luzAmbiente =
    new THREE.HemisphereLight(
        0xffffff,
        0x444444,
        2
    );

cena.add(luzAmbiente);


const luzSol =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


luzSol.position.set(
    20,
    40,
    20
);


luzSol.castShadow = true;

cena.add(luzSol);


// =====================================================
// CHÃO
// =====================================================

const chaoGeometria =
    new THREE.PlaneGeometry(
        200,
        200
    );


const chaoMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x385c2c
    });


const chao =
    new THREE.Mesh(
        chaoGeometria,
        chaoMaterial
    );


chao.rotation.x =
    -Math.PI / 2;


chao.receiveShadow = true;


cena.add(chao);


// =====================================================
// OBSTÁCULOS
// =====================================================

const obstaculos = [];


function criarObstaculo(
    x,
    z,
    largura,
    altura,
    profundidade
) {

    const geometria =
        new THREE.BoxGeometry(
            largura,
            altura,
            profundidade
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x555555
        });


    const bloco =
        new THREE.Mesh(
            geometria,
            material
        );


    bloco.position.set(
        x,
        altura / 2,
        z
    );


    bloco.castShadow = true;

    bloco.receiveShadow = true;


    cena.add(bloco);


    obstaculos.push(bloco);
}


// Criar cenário

criarObstaculo(
    -15,
    -10,
    10,
    3,
    3
);


criarObstaculo(
    15,
    -8,
    8,
    4,
    4
);


criarObstaculo(
    -18,
    15,
    5,
    5,
    10
);


criarObstaculo(
    18,
    15,
    10,
    3,
    3
);


criarObstaculo(
    0,
    -20,
    20,
    2,
    3
);


// =====================================================
// TANQUE DO JOGADOR
// =====================================================

function criarTanque(
    cor
) {

    const tanque =
        new THREE.Group();


    // Corpo

    const corpoGeometria =
        new THREE.BoxGeometry(
            3,
            1.2,
            4
        );


    const corpoMaterial =
        new THREE.MeshStandardMaterial({
            color: cor
        });


    const corpo =
        new THREE.Mesh(
            corpoGeometria,
            corpoMaterial
        );


    corpo.position.y =
        1;


    corpo.castShadow = true;


    tanque.add(corpo);


    // Torre

    const torreGeometria =
        new THREE.CylinderGeometry(
            1.25,
            1.25,
            0.8,
            16
        );


    const torreMaterial =
        new THREE.MeshStandardMaterial({
            color: cor
        });


    const torre =
        new THREE.Mesh(
            torreGeometria,
            torreMaterial
        );


    torre.position.y =
        1.8;


    torre.castShadow = true;


    tanque.add(torre);


    // Canhão

    const canhaoGeometria =
        new THREE.BoxGeometry(
            0.45,
            0.45,
            3
        );


    const canhaoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222
        });


    const canhao =
        new THREE.Mesh(
            canhaoGeometria,
            canhaoMaterial
        );


    canhao.position.set(
        0,
        1.9,
        -1.8
    );


    canhao.castShadow = true;


    tanque.add(canhao);


    // Esteiras

    const esteiraMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x151515
        });


    const esteiraGeometria =
        new THREE.BoxGeometry(
            0.6,
            0.8,
            4.2
        );


    const esteiraEsquerda =
        new THREE.Mesh(
            esteiraGeometria,
            esteiraMaterial
        );


    esteiraEsquerda.position.set(
        -1.7,
        0.6,
        0
    );


    tanque.add(
        esteiraEsquerda
    );


    const esteiraDireita =
        new THREE.Mesh(
            esteiraGeometria,
            esteiraMaterial
        );


    esteiraDireita.position.set(
        1.7,
        0.6,
        0
    );


    tanque.add(
        esteiraDireita
    );


    return tanque;
}


// =====================================================
// JOGADOR
// =====================================================

const jogador =
    criarTanque(0x229944);


jogador.position.set(
    0,
    0,
    10
);


cena.add(jogador);


// =====================================================
// VARIÁVEIS
// =====================================================

let vida = 100;

let pontos = 0;

let jogoAtivo = false;

let ultimoTiro = 0;


// =====================================================
// CONTROLES
// =====================================================

const teclas = {};


window.addEventListener(
    "keydown",
    function(event) {

        teclas[
            event.key.toLowerCase()
        ] = true;

    }
);


window.addEventListener(
    "keyup",
    function(event) {

        teclas[
            event.key.toLowerCase()
        ] = false;

    }
);


// =====================================================
// MOUSE
// =====================================================

const mouse = {

    x: 0,

    y: 0,

    clicando: false
};


window.addEventListener(
    "mousemove",
    function(event) {

        mouse.x =
            event.clientX;

        mouse.y =
            event.clientY;

    }
);


window.addEventListener(
    "mousedown",
    function() {

        mouse.clicando = true;

    }
);


window.addEventListener(
    "mouseup",
    function() {

        mouse.clicando = false;

    }
);


// =====================================================
// INIMIGOS
// =====================================================

const inimigos = [];


function criarInimigo() {

    const inimigo =
        criarTanque(0xaa2222);


    inimigo.position.set(

        (Math.random() - 0.5) * 60,

        0,

        -30 -
        Math.random() * 30

    );


    inimigo.userData = {

        vida: 50,

        ultimoTiro: 0

    };


    cena.add(inimigo);

    inimigos.push(inimigo);
}


// Criar 5 inimigos

for (
    let i = 0;
    i < 5;
    i++
) {

    criarInimigo();
}


// =====================================================
// BALAS
// =====================================================

const balas = [];


function criarBala(
    origem,
    direcao,
    inimiga
) {

    const geometria =
        new THREE.SphereGeometry(
            0.25,
            8,
            8
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                inimiga
                    ? 0xff2222
                    : 0xffff00

        });


    const bala =
        new THREE.Mesh(
            geometria,
            material
        );


    bala.position.copy(
        origem
    );


    bala.userData = {

        direcao:
            direcao.clone(),

        inimiga:

            inimiga,

        velocidade: 0.7

    };


    cena.add(bala);

    balas.push(bala);
}


// =====================================================
// TIRO DO JOGADOR
// =====================================================

function atirar() {

    const agora =
        Date.now();


    if (
        agora -
        ultimoTiro
        <
        400
    ) {

        return;
    }


    ultimoTiro =
        agora;


    const direcao =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direcao.applyQuaternion(
        jogador.quaternion
    );


    const origem =
        jogador.position.clone();


    origem.y = 2;


    origem.add(
        direcao.clone()
            .multiplyScalar(3)
    );


    criarBala(
        origem,
        direcao,
        false
    );
}


// =====================================================
// INIMIGO ATIRA
// =====================================================

function inimigoAtirar(
    inimigo
) {

    const agora =
        Date.now();


    if (
        agora -
        inimigo.userData.ultimoTiro
        <
        1500
    ) {

        return;
    }


    inimigo.userData.ultimoTiro =
        agora;


    const direcao =
        jogador.position.clone()
            .sub(
                inimigo.position
            )
            .normalize();


    direcao.y = 0;

    direcao.normalize();


    const origem =
        inimigo.position.clone();


    origem.y = 2;


    criarBala(
        origem,
        direcao,
        true
    );
}


// =====================================================
// MOVIMENTO DO JOGADOR
// =====================================================

function atualizarJogador() {

    const velocidade = 0.18;


    if (
        teclas["w"]
    ) {

        jogador.translateZ(
            -velocidade
        );
    }


    if (
        teclas["s"]
    ) {

        jogador.translateZ(
            velocidade
        );
    }


    if (
        teclas["a"]
    ) {

        jogador.rotation.y +=
            0.04;
    }


    if (
        teclas["d"]
    ) {

        jogador.rotation.y -=
            0.04;
    }


    if (
        mouse.clicando
    ) {

        atirar();
    }
}


// =====================================================
// IA DOS INIMIGOS
// =====================================================

function atualizarInimigos() {

    for (
        const inimigo
        of inimigos
    ) {

        const direcao =
            jogador.position.clone()
                .sub(
                    inimigo.position
                );


        direcao.y = 0;


        const distancia =
            direcao.length();


        if (
            distancia > 12
        ) {

            direcao.normalize();


            inimigo.position.x +=
                direcao.x * 0.04;


            inimigo.position.z +=
                direcao.z * 0.04;
        }


        // Virar para o jogador

        inimigo.lookAt(
            jogador.position.x,
            inimigo.position.y,
            jogador.position.z
        );


        // Atirar

        if (
            distancia < 40
        ) {

            inimigoAtirar(
                inimigo
            );
        }
    }
}


// =====================================================
// BALAS
// =====================================================

function atualizarBalas() {

    for (
        let i =
        balas.length - 1;

        i >= 0;

        i--
    ) {

        const bala =
            balas[i];


        bala.position.add(

            bala.userData.direcao
                .clone()
                .multiplyScalar(
                    bala.userData.velocidade
                )

        );


        // Tempo de vida

        bala.userData.tempo =
            (bala.userData.tempo || 0)
            + 1;


        if (
            bala.userData.tempo
            > 150
        ) {

            removerBala(i);

            continue;
        }


        // Bala inimiga acertou jogador

        if (
            bala.userData.inimiga
        ) {

            const distancia =
                bala.position.distanceTo(
                    jogador.position
                );


            if (
                distancia < 2
            ) {

                vida -= 10;


                removerBala(i);


                atualizarInterface();


                if (
                    vida <= 0
                ) {

                    fimDeJogo();
                }


                continue;
            }
        }


        // Bala do jogador acertou inimigo

        if (
            !bala.userData.inimiga
        ) {

            for (
                let j =
                inimigos.length - 1;

                j >= 0;

                j--
            ) {

                const inimigo =
                    inimigos[j];


                const distancia =
                    bala.position.distanceTo(
                        inimigo.position
                    );


                if (
                    distancia < 2.5
                ) {

                    inimigo.userData.vida -=
                        25;


                    removerBala(i);


                    if (
                        inimigo.userData.vida
                        <= 0
                    ) {

                        cena.remove(
                            inimigo
                        );


                        inimigos.splice(
                            j,
                            1
                        );


                        pontos += 100;


                        atualizarInterface();


                        // Novo inimigo

                        setTimeout(
                            criarInimigo,
                            1000
                        );
                    }


                    break;
                }
            }
        }
    }
}


// =====================================================
// REMOVER BALA
// =====================================================

function removerBala(
    indice
) {

    const bala =
        balas[indice];


    cena.remove(bala);


    balas.splice(
        indice,
        1
    );
}


// =====================================================
// CÂMERA
// =====================================================

function atualizarCamera() {

    const distancia = 12;


    const offset =
        new THREE.Vector3(
            0,
            10,
            distancia
        );


    offset.applyQuaternion(
        jogador.quaternion
    );


    const destino =
        jogador.position.clone()
            .add(offset);


    camera.position.lerp(
        destino,
        0.08
    );


    camera.lookAt(
        jogador.position
    );
}


// =====================================================
// INTERFACE
// =====================================================

function atualizarInterface() {

    document.getElementById(
        "vida"
    ).textContent =
        Math.max(
            0,
            vida
        );


    document.getElementById(
        "pontos"
    ).textContent =
        pontos;


    document.getElementById(
        "inimigos"
    ).textContent =
        inimigos.length;
}


// =====================================================
// COMEÇAR
// =====================================================

document.getElementById(
    "comecar"
).onclick =
function() {

    jogoAtivo = true;


    document.getElementById(
        "mensagem"
    ).classList.add(
        "escondido"
    );

};


// =====================================================
// GAME OVER
// =====================================================

function fimDeJogo() {

    jogoAtivo = false;


    document.getElementById(
        "pontuacaoFinal"
    ).textContent =
        pontos;


    document.getElementById(
        "gameOver"
    ).classList.remove(
        "escondido"
    );
}


// =====================================================
// REINICIAR
// =====================================================

document.getElementById(
    "reiniciar"
).onclick =
function() {

    location.reload();

};


// =====================================================
// REDIMENSIONAMENTO
// =====================================================

window.addEventListener(
    "resize",
    function() {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// =====================================================
// LOOP
// =====================================================

function animar() {

    requestAnimationFrame(
        animar
    );


    if (
        jogoAtivo
    ) {

        atualizarJogador();

        atualizarInimigos();

        atualizarBalas();

        atualizarCamera();

        atualizarInterface();

    }


    renderer.render(
        cena,
        camera
    );
}


animar();
