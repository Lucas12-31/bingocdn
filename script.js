let numerosDisponiveis = [];
let numerosSorteados = [];

// Inicializa o tabuleiro
function inicializarTabuleiro() {
    const painel = document.getElementById('painel-numeros');
    painel.innerHTML = '';
    numerosDisponiveis = Array.from({length: 75}, (_, i) => i + 1);
    numerosSorteados = [];

    for (let i = 1; i <= 75; i++) {
        let div = document.createElement('div');
        div.id = `num-${i}`;
        div.className = 'bola';
        div.innerText = i;
        painel.appendChild(div);
    }
}

function sortearNumero() {
    if (numerosDisponiveis.length === 0) {
        alert("Todos os números já foram sorteados!");
        return;
    }

    const index = Math.floor(Math.random() * numerosDisponiveis.length);
    const numero = numerosDisponiveis.splice(index, 1)[0];
    
    // Atualiza a tela
    document.getElementById('numero-sorteado').innerText = numero;
    document.getElementById(`num-${numero}`).classList.add('sorteada');
}

function reiniciar() {
    if(confirm("Deseja reiniciar o bingo?")) {
        document.getElementById('numero-sorteado').innerText = '--';
        inicializarTabuleiro();
    }
}

inicializarTabuleiro();
