// --- script.js (Versão Atualizada com Trava de Ganhadores) ---

const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtivo = false;
let qtdCartelasJogando = 0;
let ganhadoresJaAlertados = new Set(); 

const imagemCentroBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAtGVYSWZJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAGAAAAABAAAAYAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA";
    
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function gerarNumerosCartelaFixa(idCartela) {
    const cartela = { b: [], i: [], n: [], g: [], o: [] };
    let seed = idCartela * 123.45; // Semente única por ID

    const intervalos = {
        b: [1, 15], i: [16, 30], n: [31, 45], g: [46, 60], o: [61, 75]
    };

    for (let letra in intervalos) {
        let min = intervalos[letra][0];
        let max = intervalos[letra][1];
        let possiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        for (let j = 0; j < 5; j++) {
            let index = Math.floor(seededRandom(seed++) * possiveis.length);
            cartela[letra].push(possiveis.splice(index, 1)[0]);
        }
        cartela[letra].sort((a, b) => a - b);
    }
    return cartela;
}

// --- 2. GERAÇÃO DE PDF (4 POR PÁGINA A4) ---

async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade de cartelas.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const logoBase64 = await carregarLogoBase64();
    const status = document.getElementById('status-bingo');

    // Função interna para processar em blocos
    async function processarBloco(inicio) {
        const tamanhoBloco = 20; // Processa 20 cartelas por vez para não travar
        const fim = Math.min(inicio + tamanhoBloco, qtd);

        for (let i = inicio; i <= fim; i++) {
            // Se não for a primeira cartela e for múltiplo de 4, nova página
            if (i > 1 && (i - 1) % 4 === 0) {
                doc.addPage();
            }
            const dados = gerarNumerosCartelaFixa(i);
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoBase64);
        }

        status.textContent = `Gerando: ${fim} de ${qtd} cartelas...`;

        if (fim < qtd) {
            // Pequena pausa para o navegador não congelar
            setTimeout(() => processarBloco(fim + 1), 10);
        } else {
            status.textContent = "Finalizando PDF... Aguarde.";
            // Pequeno delay para garantir que o último status apareça
            setTimeout(() => {
                doc.save(`bingo-casa-de-negocios-${qtd}-cartelas.pdf`);
                status.textContent = "PDF Gerado com sucesso!";
            }, 500);
        }
    }

    status.textContent = "Iniciando geração...";
    processarBloco(1); // Começa o processamento
}

function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoBase64) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10));
    const y = margemY + (linPDF * (altura + 15));

    if (logoBase64) doc.addImage(logoBase64, 'PNG', x, y, 35, 0);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 5, y + 5, { align: 'right' });

    const gridY = y + 15, tam = 16;
    const letras = ['B', 'I', 'N', 'G', 'O'];
    const raio = 3; // Ajuste aqui o nível do arredondamento

    // Cabeçalho BINGO com bordas arredondadas
    letras.forEach((l, i) => {
        const cor = (l === 'I' || l === 'G') ? COR_AMARELO : COR_AZUL;
        doc.setFillColor(...cor);
        
        // Trocamos rect por roundedRect
        // Os números 3, 3 no final são o raio do arredondamento (horizontal e vertical)
        doc.roundedRect(x + (i * tam), gridY, tam, tam, raio, raio, 'F');
        
        doc.setTextColor((l === 'I' || l === 'G') ? 0 : 255);
        doc.setFontSize(20);
        doc.text(l, x + (i * tam) + 8, gridY + 11, { align: 'center' });
    });

    doc.setTextColor(50);
    doc.setFontSize(16);
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cX = x + (c * tam), cY = gridY + tam + (r * tam);
            doc.setDrawColor(200);
            
            // Se quiser as células de números arredondadas também:
            doc.roundedRect(cX, cY, tam, tam, 2, 2, 'S'); 
            // 'S' é apenas o stroke (contorno)
            
            if (r === 2 && c === 2) {
                if (imagemCentroBase64) doc.addImage(imagemCentroBase64, 'PNG', cX + 2, cY + 2, tam - 4, tam - 4);
                else { 
                    doc.setFontSize(8); 
                    doc.text("FREE", cX + 8, cY + 9, { align: 'center' }); 
                    doc.setFontSize(16); 
                }
            } else {
                const num = dados[letras[c].toLowerCase()][r];
                doc.text(String(num), cX + 8, cY + 11, { align: 'center' });
            }
        }
    }
}

function carregarLogoBase64() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width; canvas.height = this.height;
            canvas.getContext('2d').drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = 'logo.png';
    });
}

// --- 3. LÓGICA DO SORTEIO E VALIDAÇÃO ---

function iniciarJogoCompleto() {
    qtdCartelasJogando = parseInt(document.getElementById('qtd-jogando').value);
    if (!qtdCartelasJogando) return alert("Digite a quantidade de cartelas.");

    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = [];
    statusGanhadores = {};
    ganhadoresJaAlertados.clear(); 
    
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
    status.textContent = `Monitorando cartelas de #1 a #${qtdCartelasJogando}...`;
    status.classList.remove('alerta-bingo');
}

function sortearNumero() {
    if (!jogoAtivo && numerosSorteados.length === 0) {
        alert("Clique em 'Iniciar Sorteio' primeiro!");
        return;
    }

    if (numerosDisponiveis.length === 0) {
        alert("Todos os números já foram sorteados!");
        return;
    }

    const status = document.getElementById('status-bingo');
    status.classList.remove('alerta-bingo');

    const idx = Math.floor(Math.random() * numerosDisponiveis.length);
    const num = numerosDisponiveis.splice(idx, 1)[0];
    numerosSorteados.push(num);

    document.getElementById('numero-sorteado-display').textContent = num;
    const el = document.getElementById(`num-${num}`);
    if (el) el.classList.add('drawn');

    // Validação de múltiplos vencedores
    const novosVencedores = verificarBingo();
    
    if (novosVencedores.length > 0) {
        novosVencedores.forEach(v => {
            // Registra que ESTE ID já ganhou ESTE MOTIVO
            if (!statusGanhadores[v.id]) statusGanhadores[v.id] = [];
            statusGanhadores[v.id].push(v.motivo);
        });

        const status = document.getElementById('status-bingo');
        const idsTexto = novosVencedores.map(v => `nº ${v.id} (${v.motivo})`).join(', ');
        
        status.textContent = `BINGO! ${idsTexto}! 🎉`;
        status.classList.add('alerta-bingo');
        alert(`🎉 BINGO!\n${idsTexto}`);
}

function verificarBingo() {
    const querLinhaColuna = document.getElementById('check-linha-coluna').checked;
    const querCheia = document.getElementById('check-cheia').checked;
    let vencedoresNestaRodada = [];

    for (let id = 1; id <= qtdCartelasJogando; id++) {
        // Se a cartela já ganhou "BINGO CHEIO", ela sai do jogo definitivamente
        if (statusGanhadores[id] && statusGanhadores[id].includes("FECHOU A CARTELA")) continue;

        const dados = gerarNumerosCartelaFixa(id);
        const letras = ['b', 'i', 'n', 'g', 'o'];
        let matriz = [];

        // Monta matriz de acertos
        for (let r = 0; r < 5; r++) {
            matriz[r] = [];
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) matriz[r][c] = true;
                else matriz[r][c] = numerosSorteados.includes(dados[letras[c]][r]);
            }
        }

        // 1. VERIFICAÇÃO DE LINHA/COLUNA
        if (querLinhaColuna) {
            // Só verifica linha/coluna se ela ainda NÃO ganhou isso
            if (!statusGanhadores[id] || !statusGanhadores[id].includes("fez LINHA/COLUNA")) {
                let ganhouLC = false;
                // Linhas
                for (let r = 0; r < 5; r++) {
                    if (matriz[r].every(v => v)) { ganhouLC = true; break; }
                }
                // Colunas (se não ganhou em linha)
                if (!ganhouLC) {
                    for (let c = 0; c < 5; c++) {
                        if ([0,1,2,3,4].every(r => matriz[r][c])) { ganhouLC = true; break; }
                    }
                }

                if (ganhouLC) {
                    vencedoresNestaRodada.push({ id, motivo: "fez LINHA/COLUNA" });
                    // Importante: Não damos "continue" aqui, pois ela pode fechar a cartela na mesma pedra!
                }
            }
        }

        // 2. VERIFICAÇÃO DE CARTELA CHEIA
        if (querCheia) {
            let total = 0;
            matriz.forEach(l => l.forEach(v => { if(v) total++; }));
            if (total === 25) {
                vencedoresNestaRodada.push({ id, motivo: "FECHOU A CARTELA" });
            }
        }
    }
    return vencedoresNestaRodada;
}
