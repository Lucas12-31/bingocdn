// --- script.js (Versão Final Unificada e Corrigida) ---

const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtivo = false;
let qtdCartelasJogando = 0;
let statusGanhadores = {}; 

// --- 1. CARREGAMENTO DE IMAGENS ---

function carregarImagem(caminho) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => resolve(null), 2000);

        img.onload = function () {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.getContext('2d').drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
        };
        img.src = caminho;
    });
}

// --- 2. UTILITÁRIOS DE GERAÇÃO ---

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function gerarNumerosCartelaFixa(idCartela) {
    const cartela = { b: [], i: [], n: [], g: [], o: [] };
    let seed = idCartela * 123.45;
    const intervalos = {
        b: [1, 15], i: [16, 30], n: [31, 45], g: [46, 60], o: [61, 75]
    };

    for (let letra in intervalos) {
        let min = intervalos[letra][0], max = intervalos[letra][1];
        let possiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        for (let j = 0; j < 5; j++) {
            let index = Math.floor(seededRandom(seed++) * possiveis.length);
            cartela[letra].push(possiveis.splice(index, 1)[0]);
        }
        cartela[letra].sort((a, b) => a - b);
    }
    return cartela;
}

// --- 3. GERAÇÃO DO PDF ---

async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-bingo');

    status.textContent = "Carregando logos...";
    const logoCompleta = await carregarImagem('logo.png');
    const simboloCentro = await carregarImagem('simbolo.png');

    status.textContent = "Iniciando geração...";

    async function processarBloco(inicio) {
        const tamanhoBloco = 20; 
        const fim = Math.min(inicio + tamanhoBloco, qtd);

        for (let i = inicio; i <= fim; i++) {
            // Nova página a cada 4 cartelas
            if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
            
            const dados = gerarNumerosCartelaFixa(i);
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoCompleta, simboloCentro);
        }

        status.textContent = `Gerando: ${fim} de ${qtd}...`;

        if (fim < qtd) {
            setTimeout(() => processarBloco(fim + 1), 10);
        } else {
            doc.save(`bingo-casa-de-negocios.pdf`);
            status.textContent = "PDF Gerado com sucesso!";
        }
    }

    processarBloco(1);
}

function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoTopo, logoCentro) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10));
    const y = margemY + (linPDF * (altura + 15));

    // Logo no Topo
    if (logoTopo) {
        try { doc.addImage(logoTopo, 'PNG', x, y, 35, 0); } catch(e){}
    }
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 5, y + 5, { align: 'right' });

    const gridY = y + 15, tam = 16, raio = 3;
    const letras = ['B', 'I', 'N', 'G', 'O'];

    // Cabeçalho BINGO
    letras.forEach((l, i) => {
        const cor = (l === 'I' || l === 'G') ? COR_AMARELO : COR_AZUL;
        doc.setFillColor(...cor);
        doc.roundedRect(x + (i * tam), gridY, tam, tam, raio, raio, 'F');
        doc.setTextColor((l === 'I' || l === 'G') ? 0 : 255);
        doc.setFontSize(20);
        doc.text(l, x + (i * tam) + 8, gridY + 11, { align: 'center' });
    });

    // Células dos números
    doc.setTextColor(50);
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cX = x + (c * tam), cY = gridY + tam + (r * tam);
            doc.setDrawColor(200);
            doc.roundedRect(cX, cY, tam, tam, 1.5, 1.5, 'S');
            
            if (r === 2 && c === 2) {
                // Logo no Centro
                if (logoCentro) {
                    try { doc.addImage(logoCentro, 'PNG', cX + 3, cY + 3, tam - 6, tam - 6); } catch(e){}
                } else { 
                    doc.setFontSize(7); doc.text("FREE", cX + 8, cY + 9, { align: 'center' });
                }
            } else {
                doc.setFontSize(16);
                const letraChave = letras[c].toLowerCase();
                const num = dados[letraChave][r];
                doc.text(String(num), cX + 8, cY + 11, { align: 'center' });
            }
        }
    }
}

// --- 4. LÓGICA DO JOGO ---

function iniciarJogoCompleto() {
    qtdCartelasJogando = parseInt(document.getElementById('qtd-jogando').value);
    if (!qtdCartelasJogando) return alert("Digite a quantidade de cartelas.");

    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = [];
    statusGanhadores = {}; 

    document.getElementById('numero-sorteado-display').textContent = '--';
    
    const letras = ['b','i','n','g','o'];
    letras.forEach(l => {
        const container = document.getElementById(`cells-${l}`);
        container.innerHTML = '';
        const min = (l==='b'?1:l==='i'?16:l==='n'?31:l==='g'?46:61);
        for(let i=min; i<min+15; i++){
            const d = document.createElement('div');
            d.className = 'cell'; d.id = `num-${i}`; d.textContent = i;
            container.appendChild(d);
        }
    });

    jogoAtivo = true;
    document.getElementById('area-sorteio').classList.remove('escondida');
    const status = document.getElementById('status-bingo');
    status.textContent = `Jogo iniciado! Monitorando de #1 a #${qtdCartelasJogando}`;
    status.classList.remove('alerta-bingo');
}

function sortearNumero() {
    if (!jogoAtivo) return alert("Inicie o sorteio primeiro!");
    if (numerosDisponiveis.length === 0) return alert("Todos os números já saíram!");

    const status = document.getElementById('status-bingo');
    status.classList.remove('alerta-bingo');

    const idx = Math.floor(Math.random() * numerosDisponiveis.length);
    const num = numerosDisponiveis.splice(idx, 1)[0];
    numerosSorteados.push(num);

    document.getElementById('numero-sorteado-display').textContent = num;
    const el = document.getElementById(`num-${num}`);
    if (el) el.classList.add('drawn');

    const novosVencedores = verificarBingo();
    
    if (novosVencedores.length > 0) {
        novosVencedores.forEach(v => {
            if (!statusGanhadores[v.id]) statusGanhadores[v.id] = [];
            statusGanhadores[v.id].push(v.motivo);
        });

        const idsTexto = novosVencedores.map(v => `nº ${v.id} (${v.motivo})`).join(', ');
        status.textContent = `BINGO! ${idsTexto}! 🎉`;
        status.classList.add('alerta-bingo');
        setTimeout(() => { alert(`🎉 BINGO!\n${idsTexto}`); }, 100);
    } else {
        status.textContent = `Pedras sorteadas: ${numerosSorteados.length}`;
    }
}

function verificarBingo() {
    const querLinhaColuna = document.getElementById('check-linha-coluna').checked;
    const querCheia = document.getElementById('check-cheia').checked;
    let vencedoresNestaRodada = [];

    for (let id = 1; id <= qtdCartelasJogando; id++) {
        if (statusGanhadores[id] && statusGanhadores[id].includes("FECHOU A CARTELA")) continue;

        const dados = gerarNumerosCartelaFixa(id);
        const letras = ['b', 'i', 'n', 'g', 'o'];
        let matriz = [];

        for (let r = 0; r < 5; r++) {
            matriz[r] = [];
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) matriz[r][c] = true;
                else matriz[r][c] = numerosSorteados.includes(dados[letras[c]][r]);
            }
        }

        if (querLinhaColuna && (!statusGanhadores[id] || !statusGanhadores[id].includes("fez LINHA/COLUNA"))) {
            let ganhouLC = false;
            for (let r = 0; r < 5; r++) if (matriz[r].every(v => v)) ganhouLC = true;
            for (let c = 0; c < 5; c++) if ([0,1,2,3,4].every(r => matriz[r][c])) ganhouLC = true;

            if (ganhouLC) vencedoresNestaRodada.push({ id, motivo: "fez LINHA/COLUNA" });
        }

        if (querCheia) {
            let total = 0;
            matriz.forEach(l => l.forEach(v => { if(v) total++; }));
            if (total === 25) vencedoresNestaRodada.push({ id, motivo: "FECHOU A CARTELA" });
        }
    }
    return vencedoresNestaRodada;
}

function reiniciarJogo() {
    if (confirm("Deseja mesmo reiniciar o bingo?")) {
        iniciarJogoCompleto();
    }
}
