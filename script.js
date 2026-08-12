// =====================================================
// VERIFICAR THREE.JS
// =====================================================

if (typeof THREE === "undefined") {

    alert(
        "Erro: o Three.js não carregou. " +
        "Verifique sua conexão com a internet."
    );

    throw new Error(
        "Three.js não carregado."
    );
}


// =====================================================
// VARIÁVEIS
// =====================================================

let jogoAtivo = false;

let vida = 100;

let pontos = 0;

let ultimoTiro = 0;


// =====================================================
// CENA
// =====================================================

const cena =
    new THREE.Scene();

cena.background =
    new THREE.Color(0x6f9558);


// =====================================================
// CÂMERA
// =====================================================

const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );


// =====================================================
// RENDERIZADOR
// =====================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled =
    true;


document.body.appendChild(
    renderer.domElement
);


// =====================================================
// LUZ
// =====================================================

const luz =
    new THREE.HemisphereLight(
        0xffffff,
        0x444444,
        2
    );


cena.add(luz);


const sol =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


sol.position.set(
    20,
    40,
    20
);


sol.castShadow = true;


cena.add(sol);


// =====================================================
// TERRENO
// =====================================================

const terreno =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            150,
            150
        ),

        new THREE.MeshStandardMaterial({
            color: 0x426d32
        })

    );


terreno.rotation.x =
    -Math.PI / 2;


terreno.receiveShadow =
    true;


cena.add(terreno);


// =====================================================
// TANQUE
// =====================================================

function criarTanque(cor) {

    const tanque =
        new THREE.Group();


    // CORPO

    const corpo =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3,
                1.2,
                4
            ),

            new THREE.MeshStandardMaterial({
                color: cor
            })

        );


    corpo.position.y = 1;

    corpo.castShadow = true;

    tanque.add(corpo);


    // TORRE

    const torre =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                1.2,
                1.2,
                0.8,
                16
            ),

            new THREE.MeshStandardMaterial({
                color: cor
            })

        );


    torre.position.y = 1.8;

    torre.castShadow = true;

    tanque.add(torre);


    // CANHÃO

    const canhao =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.4,
                0.4,
                3
            ),

            new THREE.MeshStandardMaterial({
                color: 0x222222
            })

        );


    canhao.position.set(
        0,
        1.9,
        -1.8
    );


    canhao.castShadow = true;

    tanque.add(canhao);


    // ESTEIRA ESQUERDA

    const esteira1 =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                0.8,
                4.2
            ),

            new THREE.MeshStandardMaterial({
                color: 0x111111
            })

        );


    esteira1.position.set(
        -1.7,
        0.6,
        0
    );


    tanque.add(esteira1);


    // ESTEIRA DIREITA

    const esteira2 =
        esteira1.clone();


    esteira2.position.x =
        1.7;


    tanque.add(esteira2);


    return tanque;
}


// =====================================================
// JOGADOR
// =====================================================

const jogador =
    criarTanque(0x20a040);


jogador.position.set(
    0,
    0,
    15
);


cena.add(jogador);


// =====================================================
// INIMIGOS
// =====================================================

const inimigos = [];


function criarInimigo() {

    const inimigo =
        criarTanque(0xb52222);


    inimigo.position.set(

        (Math.random() - 0.5) * 60,

        0,

        -20 -
        Math.random() * 40

    );


    inimigo.userData.vida =
        50;


    inimigo.userData.ultimoTiro =
        0;


    cena.add(inimigo);

    inimigos.push(
        inimigo
    );
}


// Criar inimigos

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
    posicao,
    direcao,
    inimiga
) {

    const bala =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.25,
                8,
                8
            ),

            new THREE.MeshStandardMaterial({

                color:
                    inimiga
                        ? 0xff2222
                        : 0xffff00

            })

        );


    bala.position.copy(
        posicao
    );


    bala.userData.direcao =
        direcao.clone();


    bala.userData.inimiga =
        inimiga;


    bala.userData.tempo =
        0;


    cena.add(bala);

    balas.push(bala);
}


// =====================================================
// ATIRAR
// =====================================================

function atirar() {

    const agora =
        Date.now();


    if (
        agora - ultimoTiro
        < 400
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


    direcao.y = 0;

    direcao.normalize();


    const posicao =
        jogador.position.clone();


    posicao.y = 2;


    posicao.add(
        direcao
            .clone()
            .multiplyScalar(3)
    );


    criarBala(
        posicao,
        direcao,
        false
    );
}


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

let atirando = false;


window.addEventListener(
    "mousedown",
    function(event) {

        if (
            event.button === 0 &&
            jogoAtivo
        ) {

            atirando = true;

        }

    }
);


window.addEventListener(
    "mouseup",
    function(event) {

        if (
            event.button === 0
        ) {

            atirando = false;

        }

    }
);


// =====================================================
// MOVIMENTO
// =====================================================

function atualizarJogador() {

    const velocidade =
        0.18;


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
        atirando
    ) {

        atirar();

    }
}


// =====================================================
// INIMIGOS
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
            distancia > 10
        ) {

            direcao.normalize();


            inimigo.position.x +=
                direcao.x * 0.035;


            inimigo.position.z +=
                direcao.z * 0.035;

        }


        // Virar para jogador

        inimigo.lookAt(
            jogador.position.x,
            0,
            jogador.position.z
        );


        // Atirar

        if (
            distancia < 45
        ) {

            atirarInimigo(
                inimigo
            );

        }
    }
}


// =====================================================
// TIRO DOS INIMIGOS
// =====================================================

function atirarInimigo(
    inimigo
) {

    const agora =
        Date.now();


    if (
        agora -
        inimigo.userData.ultimoTiro
        < 1500
    ) {

        return;
    }


    inimigo.userData.ultimoTiro =
        agora;


    const direcao =
        jogador.position.clone()
            .sub(
                inimigo.position
            );


    direcao.y = 0;

    direcao.normalize();


    const posicao =
        inimigo.position.clone();


    posicao.y = 2;


    criarBala(
        posicao,
        direcao,
        true
    );
}


// =====================================================
// ATUALIZAR BALAS
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
                .multiplyScalar(0.8)

        );


        bala.userData.tempo++;


        if (
            bala.userData.tempo
            > 100
        ) {

            removerBala(i);

            continue;
        }


        // BALA INIMIGA

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

                    terminarJogo();

                }


                continue;
            }
        }


        // BALA DO JOGADOR

        else {

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


                        pontos +=
                            100;


                        atualizarInterface();


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

    cena.remove(
        balas[indice]
    );


    balas.splice(
        indice,
        1
    );
}


// =====================================================
// CÂMERA
// =====================================================

function atualizarCamera() {

    const posicao =
        jogador.position.clone();


    posicao.y += 10;

    posicao.z += 14;


    camera.position.lerp(
        posicao,
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
        "numeroInimigos"
    ).textContent =
        inimigos.length;
}


// =====================================================
// BOTÃO COMEÇAR
// =====================================================

document
    .getElementById("btnComecar")
    .addEventListener(
        "click",
        function() {

            console.log(
                "Jogo iniciado!"
            );


            jogoAtivo = true;


            document
                .getElementById("menu")
                .style.display =
                "none";


            atualizarInterface();

        }
    );


// =====================================================
// GAME OVER
// =====================================================

function terminarJogo() {

    jogoAtivo = false;

    atirando = false;


    document.getElementById(
        "pontuacaoFinal"
    ).textContent =
        pontos;


    document.getElementById(
        "gameOver"
    ).style.display =
        "block";
}


// =====================================================
// REINICIAR
// =====================================================

document
    .getElementById("btnReiniciar")
    .addEventListener(
        "click",
        function() {

            location.reload();

        }
    );


// =====================================================
// TAMANHO DA TELA
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
