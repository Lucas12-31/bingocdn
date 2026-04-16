// --- script.js ---

let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtivo = false;

// Configuração do Bingo (B I N G O) - Intervalos
const configColunas = {
    'b': { container: 'cells-b', range: [1, 15] },
    'i': { container: 'cells-i', range: [16, 30] },
    'n': { container: 'cells-n', range: [31, 45] },
    'g': { container: 'cells-g', range: [46, 60] },
    'o': { container: 'cells-o', range: [61, 75] }
};

// Função para popular o tabuleiro com as bolinhas (células)
function popularTabuleiro() {
    for (const letra in configColunas) {
        const coluna = configColunas[letra];
        const container = document.getElementById(coluna.container);
        if (!container) continue; // Segurança caso o elemento não exista
        container.innerHTML = ''; // Limpa antes de popular

        for (let i = coluna.range[0]; i <= coluna.range[1]; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.id = `num-${i}`;
            cellDiv.textContent = i;
            container.appendChild(cellDiv);
        }
    }
}

// Inicializa o jogo e o tabuleiro
function inicializarJogo() {
    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = [];
    document.getElementById('numero-sorteado-display').textContent = '--';
    popularTabuleiro();
    jogoAtivo = true;
}

// Função principal de sorteio
function sortearNumero() {
    if (!jogoAtivo || numerosDisponiveis.length === 0) {
        alert("Todos os números já foram sorteados!");
        jogoAtivo = false;
        return;
    }

    // Sorteia um índice aleatório
    const indexSorteado = Math.floor(Math.random() * numerosDisponiveis.length);
    
    // Remove o número da lista de disponíveis e guarda na lista de sorteados
    const numeroSorteado = numerosDisponiveis.splice(indexSorteado, 1)[0];
    numerosSorteados.push(numeroSorteado);

    // --- Atualização Visual ---
    
    // 1. Atualiza o número grande no topo
    document.getElementById('numero-sorteado-display').textContent = numeroSorteado;

    // 2. Acende a bolinha correspondente no tabuleiro
    const cellElement = document.getElementById(`num-${numeroSorteado}`);
    if (cellElement) {
        cellElement.classList.add('drawn');
    }
}

// Função para reiniciar o jogo
function reiniciar() {
    if (confirm("Deseja reiniciar o sorteio do Bingo? Isso apagará o histórico atual.")) {
        inicializarJogo();
    }
}

// Inicia o jogo automaticamente quando a página carrega
document.addEventListener('DOMContentLoaded', inicializarJogo);
