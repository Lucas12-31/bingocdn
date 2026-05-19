// --- cartelas.js (Focado estritamente na geração e mapeamento de PDFs) ---

const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];
let listaCorretores = [];

// --- CORREÇÃO DA LOGO: Carrega a imagem e também retorna suas dimensões originais ---
function carregarImagem(caminho) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => { resolve(null); }, 5000);
        img.onload = function () {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = this.width; canvas.height = this.height;
            canvas.getContext('2d').drawImage(this, 0, 0);
            
            // Retorna o DataURL juntamente com a largura e altura reais do arquivo
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                wOriginal: this.width,
                hOriginal: this.height
            }); 
        };
        img.onerror = () => { clearTimeout(timeout); resolve(null); };
        img.src = caminho;
    });
}

// --- O restante do seu código (seededRandom, gerarNumerosCartelaFixa, etc.) continua igual ---

// --- Processamento dos blocos ajustado para a nova estrutura de objeto ---
async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade.");
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    const status = document.getElementById('status-geracao-pdf'); status.textContent = "Status: Carregando logos...";
    
    const logoTopo = await carregarImagem('logo.png'); 
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
    
    const logoTopo = await carregarImagem('logo.png'); 
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

// --- FUNÇÃO DE DESENHO COM PROPORÇÃO CORRIGIDA AUTOMATICAMENTE ---
function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoTopo, logoCentro, nomeDono = null) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10)), y = margemY + (linPDF * (altura + 15));
    
    // Configura a largura ideal que você quer na folha (ex: 50mm)
    const larguraDesejadaLogo = 50; 
    let altLogo = 8; // Altura padrão fallback
    
    if (logoTopo) {
        // CÁLCULO DE PROPORÇÃO: Altura = Largura Desejada * (Altura Original / Largura Original)
        altLogo = larguraDesejadaLogo * (logoTopo.hOriginal / logoTopo.wOriginal);
        try { 
            // Posiciona centralizado e com a proporção nativa perfeita
            doc.addImage(logoTopo.dataUrl, 'PNG', x + (largura - larguraDesejadaLogo)/2, y + 2, larguraDesejadaLogo, altLogo); 
        } catch(e){} 
    }
    
    // Alinha os textos e linhas dinamicamente baseando-se no fim vertical da logo calculada
    const topoInformacoesY = y + 4 + altLogo;
    
    if (nomeDono) {
        doc.setFontSize(8); doc.setFont("Helvetica", "bold"); doc.setTextColor(0, 45, 83);
        doc.text(`Corretor: ${nomeDono.toUpperCase()}`, x, topoInformacoesY);
        desenhoLinhaSuave(doc, x, topoInformacoesY + 1.2, x + largura, topoInformacoesY + 1.2);
    }
    
    doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 2, topoInformacoesY, { align: 'right' });
    
    // O grid do BINGO inicia logo abaixo respeitando o espaço calculado
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
                if (logoCentro) try { doc.addImage(logoCentro.dataUrl, 'PNG', cX + 3, cY + 3, tam - 6, tam - 6); } catch(e){}
                else { doc.setFontSize(7); doc.text("FREE", cX + 8, cY + 9, { align: 'center' }); }
            } else {
                doc.setFontSize(16); doc.setTextColor(50); doc.text(String(dados[l.toLowerCase()][r]), cX + 8, cY + 11, { align: 'center' });
            }
        }
    });
}
