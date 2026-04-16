// --- script.js (Versão Gestor de Bingo Profissional) ---

// Cores oficiais para o PDF (em formato Array RGB para o jsPDF)
const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

// Variáveis do Jogo de Sorteio
let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtivo = false;

// Estrutura para validar as cartelas em tempo real
let cartelasEmJogo = []; // Guarda a lista de números de cada cartela
let qtdCartelasJogando = 0;

// *** LOCAL PARA SUBIR A IMAGEM CENTRAL ***
// Gere o código Base64 da sua imagem (ícone pequeno) e cole entre as aspas abaixo.
// Se deixar vazio, aparecerá o texto "FREE".
const imagemCentroBase64 = ""; // Ex: "data:image/png;base64,iVBORw0KGgoAAAAN..."

// --- FUNÇÕES DE GERAÇÃO DE CARTELAS "ETERNAS" ---

// Função Seeded Random (Garante que a Cartela #X tenha sempre os mesmos números)
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Gera os 25 números de uma cartela baseada no seu ID
function gerarNumerosCartelaFixa(idCartela) {
    const cartela = { b: [], i: [], n: [], g: [], o: [] };
    let seed = idCartela * 1000; // Cria uma base única para esta cartela

    const intervalos = {
        b: [1, 15], i: [16, 30], n: [31, 45], g: [46, 60], o: [61, 75]
    };

    for (let letra in intervalos) {
        let min = intervalos[letra][0];
        let max = intervalos[letra][1];
        let possiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        // Sorteia 5 números do intervalo de forma "seedada" (pseudo-aleatória)
        for (let j = 0; j < 5; j++) {
            let index = Math.floor(seededRandom(seed++) * possiveis.length);
            cartela[letra].push(possiveis.splice(index, 1)[0]);
        }
        // Ordena os números na coluna para facilitar a leitura
        cartela[letra].sort((a, b) => a - b);
    }
    return cartela;
}

// --- FUNÇÃO PARA GERAR O PDF A4 COM 4 CARTELAS ---

async function gerarPDFCartelas() {
    const qtdStr = document.getElementById('qtd-imprimir').value;
    const qtd = parseInt(qtdStr);

    if (!qtd || qtd <= 0) {
        alert("Por favor, digite uma quantidade válida.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Retrato, Milímetros, A4
    const logoBase64 = await carregarLogoBase64(); // Função auxiliar para a logo

    const statusHtml = document.getElementById('status-bingo');
    statusHtml.textContent = `Gerando PDF para ${qtd} cartelas... (Pode demorar um pouco)`;

    for (let i = 1; i <= qtd; i++) {
        const indexNaPagina = (i - 1) % 4; // 0, 1, 2, 3 (posição na folha)
        
        // Cria nova página a cada 4 cartelas
        if (i > 1 && indexNaPagina === 0) {
            doc.addPage();
        }

        const dadosCartela = gerarNumerosCartelaFixa(i);
        desenharCartelaNoPDF(doc, i, dadosCartela, indexNaPagina, logoBase64);
    }

    statusHtml.textContent = "Aguardando início do jogo...";
    doc.save(`bingo-casa-de-negocios-${qtd}-cartelas.pdf`);
}

// Função auxiliar para desenhar uma única cartela no PDF
function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoBase64) {
    // Definições de layout (coordenadas em mm)
    const larguraCartela = 90;
    const alturaCartela = 110;
    const margemEsquerdaPai = 15;
    const margemTopoPai = 15;
    const espacamentoHoriz = 10;
    const espacamentoVert = 15;

    // Calcula a posição (X, Y) da cartela na página A4
    const colPDF = indexPagina % 2;
    const linPDF = Math.floor(indexPagina / 2);

    const cartelaX = margemEsquerdaPai + (colPDF * (larguraCartela + espacamentoHoriz));
    const cartelaY = margemTopoPai + (linPDF * (alturaCartela + espacamentoVert));

    // --- DESENHO DA CARTELA ---

    // 1. Logo e ID (Cabeçalho da Cartela)
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', cartelaX, cartelaY, 40, 0); // Logo à esquerda
    }
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, cartelaX + larguraCartela - 5, cartelaY + 5, { align: 'right' }); // ID à direita

    const topoGridY = cartelaY + 15;

    // 2. Grid (Linhas e Colunas)
    doc.setDrawColor(200); // Cinza claro para as bordas
    doc.setLineWidth(0.3);
    const tamanhoCelula = 16;
    const topoLetrasY = topoGridY;
    const topoNumerosY = topoGridY + tamanhoCelula;

    // Fundo colorido para as letras (B, I, N, G, O)
    doc.setFillColor(...COR_AZUL);
    doc.rect(cartelaX, topoLetrasY, tamanhoCelula, tamanhoCelula, 'F'); // B
    doc.rect(cartelaX + tamañoCelula * 2, topoLetrasY, tamanhoCelula, tamanhoCelula, 'F'); // N
    doc.rect(cartelaX + tamanhoCelula * 4, topoLetrasY, tamanhoCelula, tamanhoCelula, 'F'); // O

    doc.setFillColor(...COR_AMARELO);
    doc.rect(cartelaX + tamañoCelula, topoLetrasY, tamanhoCelula, tamanhoCelula, 'F'); // I
    doc.rect(cartelaX + tamanhoCelula * 3, topoLetrasY, tamanhoCelula, tamanhoCelula, 'F'); // G

    // Texto das Letras (Branco)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255); // Branco

    const letras = ['B', 'I', 'N', 'G', 'O'];
    letras.forEach((letra, index) => {
        const x = cartelaX + (index * tamanhoCelula) + (tamanhoCelula / 2);
        const y = topoLetrasY + 11;
        doc.text(letra, x, y, { align: 'center' });
    });

    // 3. Desenho das Células de Números
    doc.setTextColor(50); // Cinza escuro para números
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");

    for (let r = 0; r < 5; r++) { // Linhas
        for (let c = 0; c < 5; c++) { // Colunas
            const celulaX = cartelaX + (c * tamanhoCelula);
            const celulaY = topoNumerosY + (r * tamanhoCelula);

            // Desenha o quadrado da borda
            doc.rect(celulaX, celulaY, tamanhoCelula, tamanhoCelula);

            // Conteúdo (Número ou Centro Livre)
            if (r === 2 && c === 2) {
                // CENTRO LIVRE
                if (imagemCentroBase64) {
                    // Se houver imagem base64, desenha a imagem
                    doc.addImage(imagemCentroBase64, 'PNG', celulaX + 2, celulaY + 2, tamanhoCelula - 4, tamanhoCelula - 4);
                } else {
                    // Se não, desenha o texto "FREE"
                    doc.setFontSize(10);
                    doc.setTextColor(...COR_AZUL);
                    doc.setFont("helvetica", "bold");
                    doc.text("FREE", celulaX + (tamanhoCelula/2), celulaY + 9, { align: 'center' });
                    doc.setFontSize(18); // Reseta tamanho
                    doc.setTextColor(50);
                    doc.setFont("helvetica", "normal");
                }
            } else {
                // NÚMEROS
                const letraChave = letras[c].toLowerCase();
                const numero = dados[letraChave][r];
                const textX = celulaX + (tamanhoCelula / 2);
                const textY = celulaY + 11;
                doc.text(String(numero), textX, textY, { align: 'center' });
            }
        }
    }
}

// Função auxiliar para carregar a logo (precisa estar na pasta imagens/logo.png)
function carregarLogoBase64() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function () {
            console.error("Não foi possível carregar a logo. Verifique se o arquivo imagens/logo.png existe.");
            resolve(null);
        };
        img.src = 'imagens/logo.png'; // Caminho da sua logo
    });
}

// --- FUNÇÕES DE LÓGICA DO JOGO DE SORTEIO E VALIDAÇÃO ---

const intervalosBingo = {
    'b': [1, 15], 'i': [16, 30], 'n': [31, 45], 'g': [46, 60], 'o': [61, 75]
};

// Prepara o tabuleiro virtual
function popularTabuleiroSorteio() {
    for (const letra in intervalosBingo) {
        const range = intervalosBingo[letra];
        const container = document.getElementById(`cells-${letra.toLowerCase()}`);
        container.innerHTML = ''; 

        for (let i = range[0]; i <= range[1]; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.id = `num-${i}`;
            cellDiv.textContent = i;
            container.appendChild(cellDiv);
        }
    }
}

// Inicia o jogo completo (Sorteio + Validação das Cartelas)
function iniciarJogoCompleto() {
    qtdCartelasJogando = parseInt(document.getElementById('qtd-jogando').value);
    
    if (!qtdCartelasJogando || qtdCartelasJogando <= 0) {
        alert("Por favor, digite a quantidade de cartelas em jogo.");
        return;
    }

    // 1. Prepara as cartelas virtuais para validação
    cartelasEmJogo = [];
    for (let i = 1; i <= qtdCartelasJogando; i++) {
        const dadosCartela = gerarNumerosCartelaFixa(i);
        // Transforma o objeto {b:[], i:[]} em uma lista plana de 24 números (pulando o centro)
        let numerosLista = [];
        for(let letra in dadosCartela) {
            dadosCartela[letra].forEach((num, index) => {
                if(letra === 'n' && index === 2) return; // Pula o centro livre
                numerosLista.push(num);
            });
        }
        cartelasEmJogo.push({ id: i, numeros: numerosLista });
    }

    // 2. Reinicia variáveis do sorteio
    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = [];
    document.getElementById('numero-sorteado-display').textContent = '--';
    
    // 3. Atualiza interface
    popularTabuleiroSorteio();
    jogoAtivo = true;
    
    document.getElementById('area-sorteio').classList.remove('escondida');
    const statusHtml = document.getElementById('status-bingo');
    statusHtml.textContent = `Jogo iniciado com ${qtdCartelasJogando} cartelas (#1 até #${qtdCartelasJogando})...`;
    statusHtml.classList.remove('alerta-bingo');
}

// Sorteia o próximo número
function sortearNumero() {
    if (!jogoAtivo || numerosDisponiveis.length === 0) {
        alert("Todos os números já foram sorteados!");
        return;
    }

    const indexSorteado = Math.floor(Math.random() * numerosDisponiveis.length);
    const numeroSorteado = numerosDisponiveis.splice(indexSorteado, 1)[0];
    numerosSorteados.push(numeroSorteado);

    // --- Atualização Visual do Sorteio ---
    document.getElementById('numero-sorteado-display').textContent = numeroSorteado;
    const cellElement = document.getElementById(`num-${numeroSorteado}`);
    if (cellElement) {
        cellElement.classList.add('drawn');
    }

    // --- VALIDAÇÃO AUTOMÁTICA DE BINGO ---
    const vencedor = verificarBingoNasCartelas();
    
    const statusHtml = document.getElementById('status-bingo');
    if (vencedor) {
        jogoAtivo = false; // Trava o sorteio
        statusHtml.textContent = `BINGO NA CARTELA Nº ${String(vencedor.id).padStart(3, '0')}! 🎉`;
        statusHtml.classList.add('alerta-bingo');
        alert(`🎉 BINGO! Cartela nº ${vencedor.id} completou!`);
    } else {
        statusHtml.textContent = `${numerosSorteados.length} pedras sorteadas. Monitorando ${qtdCartelasJogando} cartelas...`;
    }
}

// Verifica se alguma cartela completou Bingo (cartela cheia, 24 números)
function verificarBingoNasCartelas() {
    for (let cartela of cartelasEmJogo) {
        // Verifica se TODOS os números da cartela já foram sorteados
        const completou = cartela.numeros.every(num => numerosSorteados.includes(num));
        
        if (completou) {
            return cartela; // Retorna a cartela vencedora
        }
    }
    return null; // Ninguém ganhou ainda
}

function reiniciarJogo() {
    if (confirm("Deseja reiniciar o sorteio? As cartelas em jogo continuarão sendo monitoradas.")) {
        // Apenas reinicia o sorteio das pedras, mantém as cartelas
        numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
        numerosSorteados = [];
        document.getElementById('numero-sorteado-display').textContent = '--';
        popularTabuleiroSorteio();
        jogoAtivo = true;
        
        const statusHtml = document.getElementById('status-bingo');
        statusHtml.textContent = `Sorteio reiniciado. Monitorando ${qtdCartelasJogando} cartelas...`;
        statusHtml.classList.remove('alerta-bingo');
    }
}

// Prepara o tabuleiro virtual apenas para o visual, sem iniciar o jogo
popularTabuleiroSorteio();
