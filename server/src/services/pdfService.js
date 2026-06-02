const PDFDocument = require('pdfkit');

// ── Paleta ────────────────────────────────────────────────────────────────────
const COR = {
  teal:      '#0F6E56',
  tealMid:   '#1D9E75',
  tealLight: '#5DCAA5',
  tealBg:    '#E8F5F0',
  branco:    '#FFFFFF',
  cinza800:  '#444441',
  cinza600:  '#666663',
  cinza400:  '#888780',
  cinza100:  '#F1EFE8',
  cinza50:   '#F8F8F6',
  amber:     '#BA7517',
  amberBg:   '#FAEEDA',
  verde:     '#059669',
  verdeBg:   '#D1FAE5',
  vermelho:  '#DC2626',
  vermelhoBg:'#FEE2E2',
};

const MEDIA_SECTOR = {
  margemLucro:         58,
  ratioDespesa:        55,
  consistenciaReceita: 62,
  longevidade:         65,
  cargaDivida:         60,
};

const LABEL_BREAKDOWN = {
  margemLucro:         'Margem de Lucro',
  ratioDespesa:        'Rácio Despesa/Receita',
  consistenciaReceita: 'Consistência da Receita',
  longevidade:         'Longevidade do Negócio',
  cargaDivida:         'Carga de Dívida',
};

const PESO_BREAKDOWN = {
  margemLucro:         '20%',
  ratioDespesa:        '25%',
  consistenciaReceita: '25%',
  longevidade:         '15%',
  cargaDivida:         '15%',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function corDaBar(valor) {
  if (valor >= 70) return { barra: COR.verde,    fundo: COR.verdeBg    };
  if (valor >= 40) return { barra: COR.amber,    fundo: COR.amberBg    };
  return              { barra: COR.vermelho, fundo: COR.vermelhoBg };
}

function iconeDaBar(valor) {
  if (valor >= 70) return '✓';
  if (valor >= 40) return '!';
  return '✗';
}

function corCategoria(categoria) {
  if (categoria === 'Baixo Risco')          return COR.verde;
  if (categoria === 'Risco Moderado-Baixo') return COR.tealMid;
  if (categoria === 'Risco Moderado')       return COR.amber;
  return COR.vermelho;
}

function formatarMT(valor) {
  return `MT ${Number(valor).toLocaleString('pt-PT')}`;
}

// ── Gerador principal ─────────────────────────────────────────────────────────
function gerarRelatorioPDF(res, dadosNegocio, resultadoScore) {
  const doc = new PDFDocument({
    margin: 0,
    size: 'A4',
    info: { Title: 'ScorePME — Relatório Financeiro', Author: 'ScorePME' },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=relatorio-scorepme.pdf`);
  doc.pipe(res);

  const W   = 595;  // largura A4 em pontos
  const MAR = 40;   // margem lateral
  const CW  = W - MAR * 2; // content width

  const nomeNegocio = dadosNegocio.nomeNegocio || 'Perfil Financeiro';
  const dataHoje    = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  const margem      = dadosNegocio.receitaMediaMensal > 0
    ? Math.round(((dadosNegocio.receitaMediaMensal - dadosNegocio.despesasMediasMensais) / dadosNegocio.receitaMediaMensal) * 100)
    : 0;

  let y = 0;

  // ── CABEÇALHO ────────────────────────────────────────────────────────────────
  // Fundo verde
  doc.rect(0, 0, W, 130).fill(COR.teal);

  // Badge
  doc.roundedRect(MAR, 18, 180, 18, 4)
     .fill('rgba(255,255,255,0.15)');
  doc.font('Helvetica').fontSize(8).fill(COR.tealLight)
     .text('RELATÓRIO PARA APRESENTAÇÃO BANCÁRIA', MAR + 8, 23, { charSpace: 1 });

  // Nome do negócio
  doc.font('Helvetica-Bold').fontSize(22).fill(COR.branco)
     .text(nomeNegocio, MAR, 44, { width: CW - 120 });

  // Data e histórico
  doc.font('Helvetica').fontSize(9).fill(COR.tealLight)
     .text(`${dataHoje}  ·  ${dadosNegocio.mesesDeHistorico} meses de histórico financeiro`, MAR, 72);

  // Score box (canto direito do cabeçalho)
  doc.roundedRect(W - MAR - 90, 15, 90, 100, 8)
     .fill('rgba(255,255,255,0.12)');
  doc.font('Helvetica-Bold').fontSize(48).fill(COR.branco)
     .text(String(resultadoScore.score), W - MAR - 90, 28, { width: 90, align: 'center' });
  doc.font('Helvetica').fontSize(9).fill(COR.tealLight)
     .text('/100', W - MAR - 90, 78, { width: 90, align: 'center' });

  const corCat = corCategoria(resultadoScore.categoria);
  doc.roundedRect(W - MAR - 82, 92, 74, 16, 4).fill('rgba(255,255,255,0.18)');
  doc.font('Helvetica-Bold').fontSize(8).fill(COR.branco)
     .text(resultadoScore.categoria.toUpperCase(), W - MAR - 82, 96, { width: 74, align: 'center' });

  y = 148;

  // ── MÉTRICAS PRINCIPAIS ───────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(11).fill(COR.teal)
     .text('MÉTRICAS PRINCIPAIS', MAR, y);
  y += 18;

  const metricas = [
    { label: 'Receita Média Mensal', valor: formatarMT(dadosNegocio.receitaMediaMensal),    detalhe: 'Auto-reportado'                                     },
    { label: 'Margem de Lucro', valor: `${margem}%`, detalhe: margem >= 20 ? '^ Acima da média' : 'v Abaixo da média' },
{ label: 'Dívida Existente', valor: formatarMT(dadosNegocio.dividaExistente), detalhe: dadosNegocio.dividaExistente === 0 ? 'Sem dívidas' : 'Divida activa' },
  ];

  const colW = CW / 3;
  metricas.forEach(({ label, valor, detalhe }, i) => {
    const x = MAR + i * colW;

    // Card fundo
    doc.roundedRect(x + 2, y, colW - 6, 58, 6).fill(COR.cinza50);
    doc.roundedRect(x + 2, y, 4, 58, 2).fill(COR.tealMid);

    doc.font('Helvetica').fontSize(8).fill(COR.cinza400)
       .text(label.toUpperCase(), x + 12, y + 10, { width: colW - 18, charSpace: 0.5 });
    doc.font('Helvetica-Bold').fontSize(15).fill(COR.cinza800)
       .text(valor, x + 12, y + 23, { width: colW - 18 });

    const corDetalhe = detalhe.includes('^') ? COR.verde : detalhe.includes('↓') ? COR.amber : COR.cinza400;
    doc.font('Helvetica').fontSize(8).fill(corDetalhe)
       .text(detalhe, x + 12, y + 43, { width: colW - 18 });
  });

  y += 72;

  // Linha separadora
  doc.moveTo(MAR, y).lineTo(W - MAR, y).strokeColor(COR.cinza100).lineWidth(1).stroke();
  y += 16;

  // ── AVALIAÇÃO POR CRITÉRIO ────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(11).fill(COR.teal)
     .text('AVALIAÇÃO POR CRITÉRIO', MAR, y);
  doc.font('Helvetica').fontSize(8).fill(COR.cinza400)
     .text('Comparação com a média do sector (comércio a retalho)', MAR + 175, y + 2);
  y += 20;

  const BAR_W   = CW * 0.48;
  const BAR_H   = 8;
  const BAR_X   = MAR + CW * 0.40;

  // Cabeçalho da tabela
   doc.font('Helvetica').fontSize(7.5).fill(COR.cinza400)
     .text('CRITÉRIO', MAR, y)
     .text('PESO', MAR + CW * 0.26, y)
     .text('SCORE', BAR_X - 42, y, { width: 35, align: 'right' })
     .text('DESEMPENHO', BAR_X + 2, y)
     .text('MÉDIA', BAR_X + BAR_W + 6, y);
  y += 12;

  doc.moveTo(MAR, y).lineTo(W - MAR, y).strokeColor(COR.cinza100).lineWidth(0.5).stroke();
  y += 8;

  Object.entries(resultadoScore.breakdown).forEach(([chave, valor], i) => {
    const pontuacao  = Math.round(valor);
    const media      = MEDIA_SECTOR[chave] ?? 60;
    const { barra, fundo } = corDaBar(pontuacao);
    const icone      = iconeDaBar(pontuacao);
    const acima      = pontuacao >= media;
    const barFilled  = (pontuacao / 100) * BAR_W;
    const mediaX     = BAR_X + (media / 100) * BAR_W;

    // Fundo alternado
    if (i % 2 === 0) {
      doc.rect(MAR - 4, y - 4, CW + 8, 28).fill(COR.cinza50);
    }

    // Ícone semântico
    doc.font('Helvetica-Bold').fontSize(9).fill(barra)
       .text(icone, MAR, y + 4);

    // Label
    doc.font('Helvetica').fontSize(9).fill(COR.cinza800)
       .text(LABEL_BREAKDOWN[chave], MAR + 12, y + 4, { width: CW * 0.25 });

    // Peso
    doc.font('Helvetica').fontSize(9).fill(COR.cinza400)
       .text(PESO_BREAKDOWN[chave], MAR + CW * 0.26, y + 4, { width: 30, align: 'center' });

    // Pontuação
    doc.font('Helvetica-Bold').fontSize(11).fill(barra)
       .text(`${pontuacao}`, BAR_X - 38, y, { width: 30, align: 'right' });

    // Track da barra
    doc.roundedRect(BAR_X, y + 2, BAR_W, BAR_H, 4).fill(COR.cinza100);

    // Preenchimento da barra
    if (barFilled > 0) {
      doc.roundedRect(BAR_X, y + 2, barFilled, BAR_H, 4).fill(barra);
    }

    // Linha da média do sector
    doc.moveTo(mediaX, y - 1).lineTo(mediaX, y + BAR_H + 3)
       .strokeColor(COR.cinza400).lineWidth(1.5).dash(2, { space: 1 }).stroke();
    doc.undash();

    // Badge acima/abaixo
    const badgeCor = acima ? COR.verde : COR.amber;
    const badgeTxt = acima ? '^' : 'v';
    doc.font('Helvetica-Bold').fontSize(8).fill(badgeCor)
       .text(badgeTxt, BAR_X + BAR_W + 6, y + 2, { width: 12 });

    // Média label
    doc.font('Helvetica').fontSize(7.5).fill(COR.cinza400)
       .text(`${media}`, BAR_X + BAR_W + 18, y + 2, { width: 20 });

    y += 30;
  });

  y += 8;

  // Legenda
  doc.circle(MAR + 6, y + 4, 4).fill(COR.tealMid);
  doc.font('Helvetica').fontSize(7.5).fill(COR.cinza400)
     .text('Score do negócio', MAR + 13, y + 1);
  doc.moveTo(MAR + 100, y).lineTo(MAR + 100, y + 8)
     .strokeColor(COR.cinza400).lineWidth(1.5).dash(2, { space: 1 }).stroke();
  doc.undash();
  doc.font('Helvetica').fontSize(7.5).fill(COR.cinza400)
     .text('Média do sector', MAR + 106, y + 1);
  y += 20;

  // Linha separadora
  doc.moveTo(MAR, y).lineTo(W - MAR, y).strokeColor(COR.cinza100).lineWidth(1).stroke();
  y += 16;

  // ── RECOMENDAÇÕES ─────────────────────────────────────────────────────────────
  const { breakdown } = resultadoScore;
  const recomendacoes = [];

  if (breakdown.ratioDespesa < 70) {
    const reducaoPct   = Math.min(30, Math.round((90 - Math.round(breakdown.ratioDespesa)) / 3));
    const reducaoValor = Math.round(dadosNegocio.despesasMediasMensais * (reducaoPct / 100));
    recomendacoes.push(`Reduzir despesas em ${formatarMT(reducaoValor)} (${reducaoPct}%) pode melhorar significativamente o score.`);
  }
  if (breakdown.consistenciaReceita < 70) {
    const novaVariacao = Math.max(5, dadosNegocio.variacaoReceitaPct - 15);
    recomendacoes.push(`Estabilizar a variação de receita para ${novaVariacao}% aumenta a confiança dos credores.`);
  }
  if (breakdown.margemLucro < 70) {
    const aumento = Math.round(dadosNegocio.receitaMediaMensal * 0.10);
    recomendacoes.push(`Aumentar a receita em ${formatarMT(aumento)} (10%) mantendo as despesas actuais melhora a margem.`);
  }
  if (breakdown.cargaDivida < 70 && dadosNegocio.dividaExistente > 0) {
    const reducao = Math.round(dadosNegocio.dividaExistente * 0.30);
    recomendacoes.push(`Amortizar ${formatarMT(reducao)} da dívida existente melhora o rácio de elegibilidade.`);
  }
  if (breakdown.longevidade < 70) {
    recomendacoes.push(`Continuar a registar dados mensalmente — cada mês de histórico adiciona valor ao score.`);
  }
  if (recomendacoes.length === 0) {
    recomendacoes.push('Perfil financeiro sólido. Mantém a consistência para preservar e melhorar o score.');
  }

  // Fundo da secção
  doc.roundedRect(MAR, y, CW, recomendacoes.length * 24 + 36, 8).fill(COR.amberBg);
  doc.roundedRect(MAR, y, 5, recomendacoes.length * 24 + 36, 4).fill(COR.amber);

  doc.font('Helvetica-Bold').fontSize(11).fill(COR.amber)
     .text('RECOMENDAÇÕES DE MELHORIA', MAR + 14, y + 12);
  y += 32;

  recomendacoes.forEach(rec => {
    doc.font('Helvetica').fontSize(9).fill(COR.cinza800)
       .text(`->  ${rec}`, MAR + 14, y, { width: CW - 24 });
    y += 22;
  });

  y += 16;

  // ── RODAPÉ ────────────────────────────────────────────────────────────────────
  doc.rect(0, 800, W, 42).fill(COR.cinza50);
  doc.moveTo(0, 800).lineTo(W, 800).strokeColor(COR.cinza100).lineWidth(1).stroke();

  doc.font('Helvetica-Bold').fontSize(9).fill(COR.teal)
     .text('ScorePME', MAR, 812);
  doc.font('Helvetica').fontSize(8).fill(COR.cinza400)
     .text('Documento gerado automaticamente  ·  Finckathon 2026  ·  Para uso em candidatura a crédito', MAR + 58, 812);
  doc.font('Helvetica').fontSize(8).fill(COR.cinza400)
     .text('Página 1 de 1', W - MAR - 60, 812, { width: 60, align: 'right' });

  doc.end();
}

module.exports = { gerarRelatorioPDF };