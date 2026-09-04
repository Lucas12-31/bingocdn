// --- cartelas.js (Gerador de Arquivos com Layout Estável e Fisher-Yates) ---

const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];
let listaCorretores = [];

function carregarImagem(caminho) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => { resolve(null); }, 5000);
        img.onload = function () {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = this.width; canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this, 0, 0);
            
            resolve({
                dataUrl: canvas.toDataURL('image/jpeg', 0.9), 
                wOriginal: this.width,
                hOriginal: this.height
            }); 
        };
        img.onerror = () => { clearTimeout(timeout); resolve(null); };
        img.src = caminho;
    });
}

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
        
        for (let r = cartela[letra].length - 1; r > 0; r--) {
            let j = Math.floor(seededRandom(seed++) * (r + 1));
            let temp = cartela[letra][r];
            cartela[letra][r] = cartela[letra][j];
            cartela[letra][j] = temp;
        }
    }
    return cartela;
}

function abrirModalDistribuicao() { document.getElementById('modal-distribuicao').classList.remove('escondida'); renderizarTabelaCorretores(); }
function fecharModalDistribuicao() { document.getElementById('modal-distribuicao').classList.add('escondida'); }

function adicionarCorretorLista() {
    const nomeInput = document.getElementById('corretor-nome');
    const qtdInput = document.getElementById('corretor-qtd');
    const nome = nomeInput.value.trim();
    const qtd = parseInt(qtdInput.value);
    if (!nome) return alert("Por favor, insira o nome.");
    if (!qtd || qtd <= 0) return alert("Insira uma quantidade válida.");
    listaCorretores.push({ nome, qtd });
    nomeInput.value = ''; qtdInput.value = '1';
    renderizarTabelaCorretores();
}

function removerCorretorLista(index) { listaCorretores.splice(index, 1); renderizarTabelaCorretores(); }

function renderizarTabelaCorretores() {
    const corpo = document.getElementById('lista-corretores-corpo'); corpo.innerHTML = '';
    let contadorCartela = 1;
    listaCorretores.forEach((c, index) => {
        const inicio = contadorCartela; const fim = contadorCartela + c.qtd - 1; contadorCartela += c.qtd;
        const tr = document.createElement('tr'); tr.style.borderBottom = "1px solid #eee";
        tr.innerHTML = `<td style="padding: 10px; font-weight:600;">${c.nome}</td><td style="padding: 10px;">${c.qtd}</td><td style="padding: 10px; font-family:monospace;">#${String(inicio).padStart(3,'0')} até #${String(fim).padStart(3,'0')}</td><td style="padding: 10px; text-align: right;"><button onclick="removerCorretorLista(${index})" style="padding: 5px 10px; background: #e74c3c !important; color: white !important; font-size:12px; border-radius:5px; border:none; cursor:pointer;">Excluir</button></td>`;
        corpo.appendChild(tr);
    });
    document.getElementById('total-cartelas-distribuidas').textContent = `Total de cartelas mapeadas: ${contadorCartela - 1}`;
}

async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade.");
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-geracao-pdf'); status.textContent = "Status: Carregando logos...";
    
    const logoTopo = await carregarImagem('klini.png'); 
    const logoCentro = await carregarImagem('simbolo.png');
    
    status.textContent = "Status: Iniciando geração...";
    async function processarBloco(inicio) {
        const tamanhoBloco = 20; const fim = Math.min(inicio + tamanhoBloco, qtd);
        for (let i = inicio; i <= fim; i++) {
            if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
            const dados = gerarNumerosCartelaFixa(i);
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoTopo, logoCentro, null);
        }
        status.textContent = `Status: Gerando simples ${fim} de ${qtd}...`;
        if (fim < qtd) { setTimeout(() => processarBloco(fim + 1), 10); } 
        else { doc.save(`bingo-simples-${qtd}-cartelas.pdf`); status.textContent = "Status: PDF Simples Concluído!"; }
    }
    processarBloco(1);
}

async function gerarPDFNominativo() {
    if (listaCorretores.length === 0) return alert("Adicione pelo menos um corretor.");
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-geracao-pdf');
    fecharModalDistribuicao(); status.textContent = "Status: Carregando logotipos...";
    
    const logoTopo = await carregarImagem('klini.png'); 
    const logoCentro = await carregarImagem('simbolo.png');
    
    let mapaNomes = []; let idAtual = 1;
    listaCorretores.forEach(c => { for(let j=0; j < c.qtd; j++) { mapaNomes[idAtual] = c.nome; idAtual++; } });
    const totalCartelas = idAtual - 1; status.textContent = "Status: Iniciando geração nominal...";
    async function processarBlocoNominativo(inicio) {
        const tamanhoBloco = 20; const fim = Math.min(inicio + tamanhoBloco, totalCartelas);
        for (let i = inicio; i <= fim; i++) {
            if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
            const dados = gerarNumerosCartelaFixa(i); const nomeDono = mapaNomes[i] || null;
            desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoTopo, logoCentro, nomeDono);
        }
        status.textContent = `Status: Gerando Nominal ${fim} de ${totalCartelas}...`;
        if (fim < totalCartelas) { setTimeout(() => processarBlocoNominativo(fim + 1), 10); } 
        else { doc.save(`bingo-nominativo-${totalCartelas}-cartelas.pdf`); status.textContent = "Status: PDF Nominal Concluído!"; }
    }
    processarBlocoNominativo(1);
}

function desenhoLinhaSuave(doc, x1, y1, x2, y2) { doc.setDrawColor(230); doc.setLineWidth(0.2); doc.line(x1, y1, x2, y2); }

function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoTopo, logoCentro, nomeDono = null) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10)), y = margemY + (linPDF * (altura + 15));
    
    const larguraDesejadaLogo = 50; 
    let altLogo = 8; 
    
    if (logoTopo && logoTopo.dataUrl) {
        altLogo = larguraDesejadaLogo * (logoTopo.hOriginal / logoTopo.wOriginal);
        try { 
            doc.addImage(logoTopo.dataUrl, 'JPEG', x, y + 2, larguraDesejadaLogo, altLogo); 
        } catch(e){ console.error("Erro ao renderizar logo:", e); } 
    }
    
    const topoInformacoesY = y + 4 + altLogo;
    
    if (nomeDono) {
        doc.setFontSize(8); doc.setFont("Helvetica", "bold"); doc.setTextColor(0, 45, 83);
        doc.text(`Corretor: ${nomeDono.toUpperCase()}`, x, topoInformacoesY);
        desenhoLinhaSuave(doc, x, topoInformacoesY + 1.2, x + largura, topoInformacoesY + 1.2);
    }
    
    doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 2, topoInformacoesY, { align: 'right' });
    
    const gridY = topoInformacoesY + 3.5, tam = 16, letras = ['B', 'I', 'N', 'G', 'O'];
    letras.forEach((l, i) => {
        doc.setFillColor(...((l === 'I' || l === 'G') ? COR_AMARELO : COR_AZUL));
        doc.roundedRect(x + (i * tam), gridY, tam, tam, 3, 3, 'F');
        doc.setTextColor((l === 'I' || l === 'G') ? 0 : 255); doc.setFontSize(20);
        doc.text(l, x + (i * tam) + 8, gridY + 11, { align: 'center' });
        for(let r=0; r<5; r++) {
            const cX = x + (i * tam), cY = gridY + tam + (r * tam);
            doc.setDrawColor(200); doc.roundedRect(cX, cY, tam, tam, 1.5, 1.5, 'S');
            if (i === 2 && r === 2) {
                if (logoCentro && logoCentro.dataUrl) {
                    try { doc.addImage(logoCentro.dataUrl, 'JPEG', cX + 3, cY + 3, tam - 6, tam - 6); } catch(e){}
                } else { doc.setFontSize(7); doc.text("FREE", cX + 8, cY + 9, { align: 'center' }); }
            } else {
                doc.setFontSize(16); doc.setTextColor(50); doc.text(String(dados[l.toLowerCase()][r]), cX + 8, cY + 11, { align: 'center' });
            }
        }
    });
}
