const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtActive = false;
let qtdCartelasJogando = 0;
let statusGanhadores = {}; 

// Estrutura para armazenar a alocação de nomes
let listaCorretores = [];

// --- 1. CARREGAMENTO DE IMAGENS ---
function carregarImagem(caminho) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            console.warn(`Tempo limite esgotado para: ${caminho}`);
            resolve(null);
        }, 5000);

        img.onload = function () {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = this.width; canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png')); 
        };
        img.onerror = () => { clearTimeout(timeout); resolve(null); };
        img.src = caminho;
    });
}

// --- 2. GERADORES DE CARTELA ---
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

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
        cartela[letra].sort((a, b) => a - b);
    }
    return cartela;
}

// --- 3. CONTROLE DA NOVA MODAL DE CORRETORES ---
function abrirModalDistribuicao() {
    document.getElementById('modal-distribuicao').classList.remove('escondida');
    renderizarTabelaCorretores();
}

function fecharModalDistribuicao() {
    document.getElementById('modal-distribuicao').classList.add('escondida');
}

function adicionarCorretorLista() {
    const nomeInput = document.getElementById('corretor-nome');
    const qtdInput = document.getElementById('corretor-qtd');
    
    const nome = nomeInput.value.trim();
    const qtd = parseInt(qtdInput.value);

    if (!nome) return alert("Por favor, insira o nome do corretor.");
    if (!qtd || qtd <= 0) return alert("Insira uma quantidade válida.");

    listaCorretores.push({ nome, qtd });
    
    nomeInput.value = '';
    qtdInput.value = '1';
    
    renderizarTabelaCorretores();
}

function removerCorretorLista(index) {
    listaCorretores.splice(index, 1);
    renderizarTabelaCorretores();
}

function renderizarTabelaCorretores() {
    const corpo = document.getElementById('lista-corretores-corpo');
    corpo.innerHTML = '';
    let contadorCartela = 1;

    listaCorretores.forEach((c, index) => {
        const inicio = contadorCartela;
        const fim = contadorCartela + c.qtd - 1;
        contadorCartela += c.qtd;

        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #eee";
        tr.innerHTML = `
            <td style="padding: 10px;">${c.nome}</td>
            <td style="padding: 10px;">${c.qtd}</td>
            <td style="padding: 10px;">#${String(inicio).padStart(3,'0')} até #${String(fim).padStart(3,'0')}</td>
            <td style="padding: 10px; text-align: right;">
                <button onclick="removerCorretorLista(${index})" style="padding: 5px 10px; background: #e74c3c !important; color: white !important; font-size:12px; border-radius:5px;">Excluir</button>
            </td>
        `;
        corpo.appendChild(tr);
    });

    document.getElementById('total-cartelas-distribuidas').textContent = `Total de cartelas mapeadas: ${contadorCartela - 1}`;
}

// --- 4. GERAÇÃO DE PDF (TRADICIONAL E NOMINATIVO) ---
async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade.");
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-bingo');
    status.textContent = "Carregando logos...";
    
    const logoTopo = await carregarImagem('logo.png');           
    const logoCentro = await carregarImagem('simbolo.png');       

    status.textContent = "Iniciando geração...";

    async function processarBloco(inicio) {
        const tamanhoBloco = 20; 
        const fim = Math.min(inicio + tamanhoBloco, qtd);
        for (let i = inicio; i <= fim; i++) {
            if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
            const dados = gerarNumerosCartelaFixa(i);
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoTopo, logoCentro, null);
        }
        status.textContent = `Gerando: ${fim} de ${qtd}...`;
        if (fim < qtd) { setTimeout(() => processarBloco(fim + 1), 10); } 
        else { doc.save(`bingo-simples-${qtd}-cartelas.pdf`); status.textContent = "PDF Simples Gerado!"; }
    }
    processarBloco(1);
}

// Executa a geração do PDF lendo a tabela nominal de corretores
async function gerarPDFNominativo() {
    if (listaCorretores.length === 0) return alert("Adicione pelo menos um corretor na lista.");
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-bingo');
    
    fecharModalDistribuicao();
    status.textContent = "Carregando logotipos...";
    
    const logoTopo = await carregarImagem('logo.png');           
    const logoCentro = await carregarImagem('simbolo.png');

    // Transforma o mapeamento flat dos corretores por ID
    let mapaNomes = [];
    let idAtual = 1;
    listaCorretores.forEach(c => {
        for(let j=0; j < c.qtd; j++) {
            mapaNomes[idAtual] = c.nome;
            idAtual++;
        }
    });

    const totalCartelas = idAtual - 1;
    status.textContent = "Iniciando geração nominal...";

    async function processarBlocoNominativo(inicio) {
        const tamanhoBloco = 20;
        const fim = Math.min(inicio + tamanhoBloco, totalCartelas);

        for (let i = inicio; i <= fim; i++) {
            if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
            const dados = gerarNumerosCartelaFixa(i);
            const nomeDono = mapaNomes[i] || null;
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoTopo, logoCentro, nomeDono);
        }

        status.textContent = `Gerando Nominal: ${fim} de ${totalCartelas}...`;

        if (fim < totalCartelas) {
            setTimeout(() => processarBlocoNominativo(fim + 1), 10);
        } else {
            doc.save(`bingo-nominativo-${totalCartelas}-cartelas.pdf`);
            status.textContent = "PDF Nominal gerado com sucesso!";
        }
    }

    processarBlocoNominativo(1);
}

function desenhoLinhaSuave(doc, x1, y1, x2, y2) {
    doc.setDrawColor(230); doc.setLineWidth(0.2);
    doc.line(x1, y1, x2, y2);
}

function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoTopo, logoCentro, nomeDono = null) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10)), y = margemY + (linPDF * (altura + 15));
    
    // 1. Renderiza a logo conjunta deslocada sutilmente para o topo do bloco
    if (logoTopo) {
        try { doc.addImage(logoTopo, 'PNG', x, y + 0.5, 55, 0); } catch(e){}
    }
    
    // 2. Afastamos o Nome do Corretor e o Número da Cartela para baixo (y + 11.5) 
    // evitando qualquer tipo de sobreposição com a imagem acima
    if (nomeDono) {
        doc.setFontSize(8); doc.setFont("Helvetica", "bold"); doc.setTextColor(0, 45, 83);
        doc.text(`Nome: ${nomeDono.toUpperCase()}`, x, y + 11.5);
        desenhoLinhaSuave(doc, x, y + 12.5, x + largura, y + 12.5);
    }
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 2, y + 11.5, { align: 'right' });
    
    // O grid principal do BINGO começa exatamente em y + 15, encaixando perfeitamente
    const gridY = y + 15, tam = 16, letras = ['B', 'I', 'N', 'G', 'O'];
    letras.forEach((l, i) => {
        doc.setFillColor(...((l === 'I' || l === 'G') ? COR_AMARELO : COR_AZUL));
        doc.roundedRect(x + (i * tam), gridY, tam, tam, 3, 3, 'F');
        doc.setTextColor((l === 'I' || l === 'G') ? 0 : 255); doc.setFontSize(20);
        doc.text(l, x + (i * tam) + 8, gridY + 11, { align: 'center' });
        for(let r=0; r<5; r++) {
            const cX = x + (i * tam), cY = gridY + tam + (r * tam);
            doc.setDrawColor(200); doc.roundedRect(cX, cY, tam, tam, 1.5, 1.5, 'S');
            if (i === 2 && r === 2) {
                if (logoCentro) try { doc.addImage(logoCentro, 'PNG', cX + 3, cY + 3, tam - 6, tam - 6); } catch(e){}
                else { doc.setFontSize(7); doc.text("FREE", cX + 8, cY + 9, { align: 'center' }); }
            } else {
                doc.setFontSize(16); doc.setTextColor(50);
                doc.text(String(dados[l.toLowerCase()][r]), cX + 8, cY + 11, { align: 'center' });
            }
        }
    });
}

// --- 5. CONTROLADORES DO JOGO ---
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
    jogoAtActive = true; document.getElementById('area-sorteio').classList.remove('escondida');
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
    const el = document.getElementById(`num-${num}`);
    if (el) el.classList.add('drawn');

    const novosVencedores = verificarBingo();
    let textoStatus = `Último número sorteado: <strong>${num}</strong>`;

    if (novosVencedores.length > 0) {
        novosVencedores.forEach(v => { 
            if (!statusGanhadores[v.id]) statusGanhadores[v.id] = []; 
            statusGanhadores[v.id].push(v.motivo); 
        });
        const idsTexto = novosVencedores.map(v => `nº ${v.id} (${v.motivo})`).join(', ');
        status.innerHTML = `${textoStatus} <br> <span style="color: var(--azul-escuro);">🎉 BINGO! Cartela(s) ${idsTexto}</span>`;
        abrirModalBingo(num, idsTexto);
    } else {
        status.innerHTML = `${textoStatus} (Total: ${numerosSorteados.length})`;
    }
}

function abrirModalBingo(numero, cartelas) {
    document.getElementById('modal-numero-vencedor').textContent = numero;
    document.getElementById('modal-cartelas-vencedoras').innerHTML = `Cartela(s): <br> <strong>${cartelas}</strong>`;
    document.getElementById('modal-bingo').classList.remove('escondida');
}

function fecharModalBingo() {
    document.getElementById('modal-bingo').classList.add('escondida');
}

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
            for (let c = 0; c < 5; c++) matriz[r][c] = (r === 2 && c === 2) ? true : numerosSorteados.includes(dados[letras[c]][r]);
        }
        if (querLinhaColuna && (!statusGanhadores[id] || !statusGanhadores[id].includes("fez LINHA/COLUNA"))) {
            let ganhou = false;
            for (let r = 0; r < 5; r++) if (matriz[r].every(v => v)) ganhou = true;
            for (let c = 0; c < 5; c++) if ([0,1,2,3,4].every(r => matriz[r][c])) ganhou = true;
            if (ganhou) vencedores.push({ id, motivo: "fez LINHA/COLUNA" });
        }
        if (querCheia) {
            let total = 0; matriz.forEach(l => l.forEach(v => { if(v) total++; }));
            if (total === 25) vencedores.push({ id, motivo: "FECHOU A CARTELA" });
        }
    }
    return vencedores;
}

function reiniciarJogo() { if (confirm("Deseja realmente reiniciar o sorteio atual?")) iniciarJogoCompleto(); }
