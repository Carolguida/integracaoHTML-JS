function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

// funções construtoras
function Barreira(reversa = false) {
  this.elemento = novoElemento("div", "barreira");

  const borda = novoElemento("div", "borda");
  const corpo = novoElemento("div", "corpo");

  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  //seta a altura do corpo
  this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
}

function ParDeBarreiras(altura, abertura, posX) {
  this.elemento = novoElemento("div", "par-de-barreiras");

  this.superior = new Barreira(true);
  this.inferior = new Barreira(false);

  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturainferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturainferior);
  };

  // posições e tamanho da barra
  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
  this.setX = (x) => (this.elemento.style.left = `${x}px`);
  this.getLargura = () => this.elemento.clientWidth; // width de ambas as barras com a abertura entre elas (toda a div)
  

  this.sortearAbertura();
  this.setX(posX);
}

// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, posX, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, posX),
        new ParDeBarreiras(altura, abertura, posX + espaco),
        new ParDeBarreiras(altura, abertura, posX + espaco * 2),
        new ParDeBarreiras(altura, abertura, posX + espaco * 3),
    ]

    const deslocamento = 3 // velocidade em que os elementos percorrem a tela
    this.animar = () => {
        this.pares.forEach(par => {
            // setando a pos x com o deslocamento
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo (1200px), faço um sorteio para recuperar as 4 barreiras
            // criadas em novas posições x (left -> setX)
            // no momento que a pos x for menor que a largura da barreira, então a barreira sumiu da tela
            if(par.getX() < -par.getLargura()) {
                // mudo a posição da barreira, direcionando-o para o final
                // seto a barreira a 400px da ultima barreira
                par.setX(par.getX() + espaco * this.pares.length)

                // diferentes aberturas para as barreiras
                par.sortearAbertura()
            }
            const meio = posX / 2
            const cruzouOMeio = (par.getX() + deslocamento) >= meio && par.getX() < meio
            if(cruzouOMeio) notificarPonto() // caso o passaro passe o meio notifica ponto
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = "imgs/passaro.png"

    // para saber a altura que o passaro esta voando
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = (y) => this.elemento.style.bottom = `${y}px`

    window.onkeydown  = e => voando = true // aperta o botao
    window.onkeyup  = e => voando = false // solta o botao

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        // validação para o passaro não ultrapassar a altura máxima da tela definida
        if(novoY <= 0) {
            this.setY(0) // máx ele pode chegar no chão e não descer
        } else if(novoY >= alturaMaxima) {
            this.setY(alturaMaxima) // setando para a altMax para nao ultrapassar
        } else {
            this.setY(novoY) // caso nao viole nem o min e max, ai seto o novoY
        }
    }

    this.setY(alturaJogo / 2) 
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizaPontos = pontos => {
        this.elemento.innerHTML = pontos
    }

    this.atualizaPontos(0)
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)

// barreiras.pares.forEach(par => {
//     areaDoJogo.appendChild(par.elemento)
//     console.log(par.getLargura())
// })

// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect() // pego todas as dimensões
    const b = elementoB.getBoundingClientRect()

    // há sobreposição horizontal e vertical?
    // a.left + a.width => obtenho lado direito
    // a.top + a.height -> obtenho parte de baixo
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    // const areaDoJogo = document.querySelector('[wm-flappy]')

    barreiras.pares.forEach(par => {
        if(!colidiu) {
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento
            // const topo = areaDoJogo.clientHeight

            colidiu =
              estaoSobrepostos(passaro.elemento, superior) ||
              estaoSobrepostos(passaro.elemento, inferior) 
        }
    })
    return colidiu
}


function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizaPontos(++pontos))

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()