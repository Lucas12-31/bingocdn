// --- script.js (Telão e Validação) ---

const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtActive = false;
let qtdCartelasJogando = 0;
let statusGanhadores = {}; 

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// ALEATORIEDADE COMPLETA POR LINHA (Fisher-Yates)
function gerarNumerosCartelaFixa(idCartela) {
    const cartela = { b: [], i: [], n: [], g: [], o: [] };
    let seed = idCartela * 123.45;
    const intervalos = { b: [1, 15], i: [16, 30], n: [31, 45], g: [46, 60], o: [61, 75] };
    
    for (let letra in intervalos) {
        let min = intervalos[letra][0], max = intervalos[letra][1];
        let opçoes = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        for (let j = 0; j < 5; j++) {
            let index = Math.floor(seededRandom(seed++) * opçoes.length);
            cartela[letra].push(opçoes.splice(index, 1)[0]);
        }
        
        for (let r = cartela[letra].length - 1; r > 0; r--) {
            let j = Math.floor(seededRandom(seed++) * (r + 1));
            let temp = cartela[letra][r];
            cartela[letra][r] = cartela[letra][j];
            cartela[letra][j] = temp;
        }
    }
    return cartela;
}

function iniciarJogoCompleto() {
    qtdCartelasJogando = parseInt(document.getElementById('qtd-jogando').value);
    if (!qtdCartelasJogando) return alert("Digite a quantidade.");
    
    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = []; statusGanhadores = {};
    document.getElementById('numero-sorteado-display').textContent = '--';
    
    const letras = ['b','i','n','g','o'];
    letras.forEach(l => {
        const container = document.getElementById('cells-' + l); container.innerHTML = '';
        const min = (l==='b'?1:l==='i'?16:l==='n'?31:l==='g'?46:61);
        for(let i=min; i<min+15; i++){
            const d = document.createElement('div'); d.className = 'cell'; d.id = `num-${i}`; d.textContent = i;
            container.appendChild(d);
        }
    });
    
    jogoAtActive = true; 
    document.getElementById('area-sorteio').classList.remove('escondida');
    document.getElementById('painel-setup-jogo').classList.add('escondida');
    document.getElementById('status-bingo').textContent = "Jogo iniciado!";
}

function sortearNumero() {
    if (!jogoAtActive) return;
    if (numerosDisponiveis.length === 0) return alert("Fim do sorteio!");
    
    const status = document.getElementById('status-bingo');
    const idx = Math.floor(Math.random() * numerosDisponiveis.length);
    const num = numerosDisponiveis.splice(idx, 1)[0];
    numerosSorteados.push(num);
    
    document.getElementById('numero-sorteado-display').textContent = num;
    const el = document.getElementById(`num-${num}`); if (el) el.classList.add('drawn');
    
    const novosVencedores = verificarBingo();
    let textoStatus = `Último número sorteado: <strong>${num}</strong>`;
    
    if (novosVencedores.length > 0) {
        novosVencedores.forEach(v => { 
            if (!statusGanhadores[v.id]) statusGanhadores[v.id] = []; 
            statusGanhadores[v.id].push(v.motivo); 
        });
        
        const idsTexto = novosVencedores.map(v => `nº ${v.id}`).join(', ');
        
        // 🚨 CORREÇÃO: Removemos os números daqui e colocamos uma mensagem de suspense com um ID (texto-alerta-bingo)
        status.innerHTML = `${textoStatus} <br> <span style="color: var(--azul-escuro);" id="texto-alerta-bingo">🎉 BINGO! Revelando ganhador...</span>`;
        
        abrirModalBingo(num, idsTexto);
    } else { 
        status.innerHTML = `${textoStatus} (Total: ${numerosSorteados.length})`; 
    }
}

// Função do Botão de Olho Atualizada
function alternarRevelacaoCartelas() {
    const elementoCartelas = document.getElementById('modal-cartelas-vencedoras');
    const btnOlho = document.getElementById('btn-revelar');
    
    // Pega o aviso que ficou lá no painel de trás
    const textoFundo = document.getElementById('texto-alerta-bingo'); 
    
    if (elementoCartelas.classList.contains('censurado')) {
        // Tira o blur da modal
        elementoCartelas.classList.remove('censurado');
        btnOlho.textContent = '🙈';
        
        // 🚨 Sincroniza e revela os números lá no painel de fundo também!
        if (textoFundo) {
            textoFundo.innerHTML = `🎉 BINGO! Cartela(s) ${elementoCartelas.textContent}`;
        }
    } else {
        // Coloca o blur de volta na modal
        elementoCartelas.classList.add('censurado');
        btnOlho.textContent = '👁️';
        
        // Esconde os números do painel de fundo novamente
        if (textoFundo) {
            textoFundo.innerHTML = `🎉 BINGO! Revelando ganhador...`;
        }
    }
}

// Abertura da Modal com Censura Ativa
function abrirModalBingo(numero, cartelas) {
    document.getElementById('modal-numero-vencedor').textContent = numero;
    
    const elementoCartelas = document.getElementById('modal-cartelas-vencedoras');
    elementoCartelas.textContent = cartelas;
    elementoCartelas.classList.add('censurado');
    
    document.getElementById('btn-revelar').textContent = '👁️';
    document.getElementById('modal-bingo').classList.remove('escondida');
}

// Função do Botão de Olho
function alternarRevelacaoCartelas() {
    const elementoCartelas = document.getElementById('modal-cartelas-vencedoras');
    const btnOlho = document.getElementById('btn-revelar');
    
    if (elementoCartelas.classList.contains('censurado')) {
        elementoCartelas.classList.remove('censurado');
        btnOlho.textContent = '🙈';
    } else {
        elementoCartelas.classList.add('censurado');
        btnOlho.textContent = '👁️';
    }
}

function fecharModalBingo() { document.getElementById('modal-bingo').classList.add('escondida'); }

function verificarBingo() {
    const querLinhaColuna = document.getElementById('check-linha-coluna').checked;
    const querCheia = document.getElementById('check-cheia').checked;
    let vencedores = [];
    
    for (let id = 1; id <= qtdCartelasJogando; id++) {
        if (statusGanhadores[id] && statusGanhadores[id].includes("FECHOU A CARTELA")) continue;
        
        const dados = gerarNumerosCartelaFixa(id); 
        const letras = ['b', 'i', 'n', 'g', 'o']; 
        let matriz = [];
        
        for (let r = 0; r < 5; r++) { 
            matriz[r] = []; 
            for (let c = 0; c < 5; c++) {
                matriz[r][c] = (r === 2 && c === 2) ? true : numerosSorteados.includes(dados[letras[c]][r]); 
            }
        }
        
        if (querLinhaColuna && (!statusGanhadores[id] || !statusGanhadores[id].includes("LINHA/COLUNA"))) {
            let ganhou = false;
            for (let r = 0; r < 5; r++) if (matriz[r].every(v => v)) ganhou = true;
            for (let c = 0; c < 5; c++) if ([0,1,2,3,4].every(r => matriz[r][c])) ganhou = true;
            if (ganhou) vencedores.push({ id, motivo: "LINHA/COLUNA" });
        }
        
        if (querCheia) { 
            let total = 0; 
            matriz.forEach(l => l.forEach(v => { if(v) total++; })); 
            if (total === 25) vencedores.push({ id, motivo: "FECHOU A CARTELA" }); 
        }
    }
    return vencedores;
}

function reiniciarJogo() { 
    if (confirm("Deseja realmente reiniciar o sorteio atual?")) {
        document.getElementById('painel-setup-jogo').classList.remove('escondida');
        document.getElementById('area-sorteio').classList.add('escondida');
        document.getElementById('status-bingo').textContent = "Aguardando início do jogo...";
    } 
}
