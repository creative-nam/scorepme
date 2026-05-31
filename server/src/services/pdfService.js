const PDFDocument = require('pdfkit');

const LABEL_BREAKDOWN = {
  margemLucro:         'Margem de Lucro',
  ratioDespesa:        'Rácio Despesa/Receita',
  consistenciaReceita: 'Consistência da Receita',
  longevidade:         'Longevidade',
  cargaDivida:         'Carga de Dívida',
};

function gerarRelatorioPDF(res, dadosNegocio, resultadoScore) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio-scorepme.pdf');
  doc.pipe(res);

  // ── Cabeçalho ──
  doc
    .fontSize(22).fillColor('#0F6E56').font('Helvetica-Bold')
    .text('ScorePME', 50, 50)
    .fontSize(10).fillColor('#888780').font('Helvetica')
    .text('Relatório para Apresentação Bancária', 50, 78)
    .text(
      `Gerado em ${new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}  ·  ${dadosNegocio.mesesDeHistorico} meses de histórico`,
      50, 92
    );

  // Linha separadora
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#E1F5EE').lineWidth(2).stroke();

  // ── Score principal ──
  doc
    .fontSize(48).fillColor('#0F6E56').font('Helvetica-Bold')
    .text(String(resultadoScore.score), 450, 130, { width: 100, align: 'center' })
    .fontSize(10).fillColor('#0F6E56').font('Helvetica')
    .text('/100', 450, 185, { width: 100, align: 'center' })
    .text(resultadoScore.categoria, 420, 200, { width: 130, align: 'center' });

  // ── Métricas principais ──
  doc.fontSize(13).fillColor('#0F6E56').font('Helvetica-Bold').text('Métricas Principais', 50, 135);

  const margem = Math.round(
    ((dadosNegocio.receitaMediaMensal - dadosNegocio.despesasMediasMensais) /
      dadosNegocio.receitaMediaMensal) * 100
  );

  const metricas = [
    { label: 'Receita média mensal', valor: `MT ${Number(dadosNegocio.receitaMediaMensal).toLocaleString('pt-PT')}` },
    { label: 'Margem de lucro',      valor: `${margem}%` },
    { label: 'Dívida existente',     valor: `MT ${Number(dadosNegocio.dividaExistente).toLocaleString('pt-PT')}` },
  ];

  let y = 158;
  metricas.forEach(({ label, valor }) => {
    doc
      .fontSize(9).fillColor('#888780').font('Helvetica').text(label, 50, y)
      .fontSize(11).fillColor('#444441').font('Helvetica-Bold').text(valor, 50, y + 12);
    y += 38;
  });

  // Linha separadora
  doc.moveTo(50, 280).lineTo(545, 280).strokeColor('#E1F5EE').lineWidth(1).stroke();

  // ── Avaliação por critério ──
  doc.fontSize(13).fillColor('#0F6E56').font('Helvetica-Bold').text('Avaliação por Critério', 50, 295);

  y = 320;
  Object.entries(resultadoScore.breakdown).forEach(([chave, valor]) => {
    const label     = LABEL_BREAKDOWN[chave] ?? chave;
    const pontuacao = Math.round(valor);
    const larguraBarra = 300;
    const larguraPreenchida = (pontuacao / 100) * larguraBarra;

    doc
      .fontSize(10).fillColor('#444441').font('Helvetica').text(label, 50, y)
      .fontSize(10).fillColor('#0F6E56').font('Helvetica-Bold').text(`${pontuacao}/100`, 490, y, { width: 55, align: 'right' });

    // Fundo da barra
    doc.roundedRect(50, y + 16, larguraBarra, 8, 4).fillColor('#F1EFE8').fill();
    // Preenchimento da barra
    if (larguraPreenchida > 0) {
      doc.roundedRect(50, y + 16, larguraPreenchida, 8, 4).fillColor('#1D9E75').fill();
    }

    y += 42;
  });

  // Linha separadora
  doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#E1F5EE').lineWidth(1).stroke();

  // ── Recomendações ──
  doc.fontSize(13).fillColor('#0F6E56').font('Helvetica-Bold').text('Recomendações de Melhoria', 50, y + 20);

  const recomendacoes = [];
  const { breakdown } = resultadoScore;
  if (breakdown.ratioDespesa        < 70) recomendacoes.push('Reduzir despesas operacionais melhoraria significativamente o score.');
  if (breakdown.consistenciaReceita < 70) recomendacoes.push('Estabilizar a receita mensal aumenta a confiança dos credores.');
  if (breakdown.longevidade         < 70) recomendacoes.push('Continuar a registar dados financeiros mensalmente — o histórico cresce com o tempo.');
  if (breakdown.cargaDivida         < 70) recomendacoes.push('Reduzir dívida existente antes de solicitar novo crédito melhora a elegibilidade.');
  if (breakdown.margemLucro         < 70) recomendacoes.push('Aumentar margem de lucro por redução de custos tem impacto directo no score.');
  if (recomendacoes.length === 0)          recomendacoes.push('Perfil financeiro sólido. Mantém a consistência para preservar o score.');

  y += 45;
  recomendacoes.forEach(rec => {
    doc
      .fontSize(10).fillColor('#BA7517').font('Helvetica')
      .text(`→  ${rec}`, 50, y, { width: 495 });
    y += 22;
  });

  // ── Rodapé ──
  doc
    .fontSize(8).fillColor('#888780').font('Helvetica')
    .text('ScorePME  ·  Documento gerado automaticamente  ·  Finckathon 2026', 50, 780, { align: 'center', width: 495 });

  doc.end();
}

module.exports = { gerarRelatorioPDF };