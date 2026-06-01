const { calcularScore } = require('./scoreEngine');

const PESOS = {
  margemLucro:          0.20,
  ratioDespesa:         0.25,
  consistenciaReceita:  0.25,
  longevidade:          0.15,
  cargaDivida:          0.15,
};

// Calcula quanto falta para atingir o score-alvo em cada critério
function calcularGaps(breakdown, scoreActual, scoreAlvo) {
  const pontosNecessarios = Math.max(0, scoreAlvo - scoreActual);

  return Object.entries(breakdown).map(([chave, valorActual]) => {
    const peso         = PESOS[chave] ?? 0;
    const maxGanho     = (100 - valorActual) * peso;
    const contribuicao = Math.min(pontosNecessarios, maxGanho);
    const prioridade   = maxGanho > 0 ? contribuicao / maxGanho : 0;

    return {
      criterio:    chave,
      valorActual: Math.round(valorActual),
      maxGanho:    Math.round(maxGanho),
      prioridade:  Math.round(prioridade * 100),
    };
  }).sort((a, b) => b.maxGanho - a.maxGanho);
}

// Gera recomendações quantitativas para cada critério
function gerarRecomendacoes(dados, resultado, scoreAlvo) {
  const { receitaMediaMensal, despesasMediasMensais, variacaoReceitaPct, mesesDeHistorico, dividaExistente } = dados;
  const { score: scoreActual, breakdown } = resultado;

  const gaps = calcularGaps(breakdown, scoreActual, scoreAlvo);
  const recomendacoes = [];

  gaps.forEach(({ criterio, valorActual, maxGanho }) => {
    if (maxGanho <= 0) return;

    if (criterio === 'ratioDespesa' && valorActual < 90) {
      // Calcula redução de despesas necessária
      const reducaoPct    = Math.min(30, Math.round((90 - valorActual) / 3));
      const reducaoValor  = Math.round(despesasMediasMensais * (reducaoPct / 100));
      const novasDespesas = despesasMediasMensais - reducaoValor;
      const novoScore     = calcularScore({ ...dados, despesasMediasMensais: novasDespesas }).score;
      const ganho         = novoScore - scoreActual;

      if (ganho > 0) {
        recomendacoes.push({
          criterio,
          titulo:    'Reduzir despesas operacionais',
          descricao: `Reduzir as despesas em MT ${reducaoValor.toLocaleString('pt-PT')} (${reducaoPct}%) elevaria o teu score em aproximadamente +${ganho} pontos.`,
          impacto:   ganho,
          accao:     `Meta de despesas: MT ${novasDespesas.toLocaleString('pt-PT')}/mês`,
        });
      }
    }

    if (criterio === 'consistenciaReceita' && variacaoReceitaPct > 10) {
      const novaVariacao  = Math.max(5, variacaoReceitaPct - 15);
      const novoScore     = calcularScore({ ...dados, variacaoReceitaPct: novaVariacao }).score;
      const ganho         = novoScore - scoreActual;

      if (ganho > 0) {
        recomendacoes.push({
          criterio,
          titulo:    'Estabilizar a receita mensal',
          descricao: `Reduzir a variação de receita de ${variacaoReceitaPct}% para ${novaVariacao}% resultaria em +${ganho} pontos no score.`,
          impacto:   ganho,
          accao:     `Objectivo: variação mensal abaixo de ${novaVariacao}%`,
        });
      }
    }

    if (criterio === 'margemLucro' && valorActual < 80) {
      const aumentoReceita  = Math.round(receitaMediaMensal * 0.10);
      const novoScore       = calcularScore({ ...dados, receitaMediaMensal: receitaMediaMensal + aumentoReceita }).score;
      const ganho           = novoScore - scoreActual;

      if (ganho > 0) {
        recomendacoes.push({
          criterio,
          titulo:    'Aumentar a margem de lucro',
          descricao: `Aumentar a receita em MT ${aumentoReceita.toLocaleString('pt-PT')} (10%) mantendo as despesas actuais resultaria em +${ganho} pontos.`,
          impacto:   ganho,
          accao:     `Meta de receita: MT ${(receitaMediaMensal + aumentoReceita).toLocaleString('pt-PT')}/mês`,
        });
      }
    }

    if (criterio === 'cargaDivida' && dividaExistente > 0) {
      const reducaoDivida = Math.round(dividaExistente * 0.30);
      const novaDivida    = dividaExistente - reducaoDivida;
      const novoScore     = calcularScore({ ...dados, dividaExistente: novaDivida }).score;
      const ganho         = novoScore - scoreActual;

      if (ganho > 0) {
        recomendacoes.push({
          criterio,
          titulo:    'Reduzir a dívida existente',
          descricao: `Amortizar MT ${reducaoDivida.toLocaleString('pt-PT')} da dívida actual resultaria em +${ganho} pontos no score.`,
          impacto:   ganho,
          accao:     `Meta de dívida: MT ${novaDivida.toLocaleString('pt-PT')}`,
        });
      }
    }

    if (criterio === 'longevidade' && mesesDeHistorico < 36) {
      const mesesExtra  = Math.min(12, 36 - mesesDeHistorico);
      const novoScore   = calcularScore({ ...dados, mesesDeHistorico: mesesDeHistorico + mesesExtra }).score;
      const ganho       = novoScore - scoreActual;

      if (ganho > 0) {
        recomendacoes.push({
          criterio,
          titulo:    'Construir histórico financeiro',
          descricao: `Mais ${mesesExtra} meses de registos consistentes adicionariam +${ganho} pontos ao score.`,
          impacto:   ganho,
          accao:     `Continua a registar os dados mensalmente — o histórico cresce automaticamente`,
        });
      }
    }
  });

  return recomendacoes.sort((a, b) => b.impacto - a.impacto);
}

module.exports = { gerarRecomendacoes };