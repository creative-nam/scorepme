// IMPORTANTE: a lógica deste ficheiro está replicada em client/src/hooks/useSimulador.js
// para permitir cálculo client-side no simulador.
// Qualquer alteração às fórmulas ou pesos deve ser reflectida em ambos os ficheiros.

// Pesos de cada critério no score final
const PESOS = {
  margemLucro:          0.20,
  ratioDespesa:         0.25,
  consistenciaReceita:  0.25,
  longevidade:          0.15,
  cargaDivida:          0.15,
};

// Funções de pontuação individuais (0 a 100 cada)
function pontuarMargemLucro(receita, despesas) {
  if (receita <= 0) return 0;
  const margem = (receita - despesas) / receita;
  return Math.min(100, Math.max(0, margem * 100 * 2));
}

function pontuarRatioDespesa(receita, despesas) {
  if (receita <= 0) return 0;
  const ratio = despesas / receita;
  if (ratio >= 1) return 0;
  return Math.min(100, Math.max(0, (1 - ratio) * 100 * 1.5));
}

function pontuarConsistenciaReceita(variacaoPct) {
  return Math.min(100, Math.max(0, 100 - variacaoPct * 1.5));
}

function pontuarLongevidade(meses) {
  return Math.min(100, (meses / 36) * 100);
}

function pontuarCargaDivida(receita, divida) {
  if (receita <= 0) return 0;
  const ratio = divida / (receita * 6);
  return Math.min(100, Math.max(0, (1 - ratio) * 100));
}

// Determina a categoria com base no score final
function obterCategoria(score) {
  if (score >= 80) return 'Baixo Risco';
  if (score >= 60) return 'Risco Moderado-Baixo';
  if (score >= 40) return 'Risco Moderado';
  return 'Alto Risco';
}

// Função principal exportada
function calcularScore(dados) {
  const {
    receitaMediaMensal,
    despesasMediasMensais,
    variacaoReceitaPct,
    mesesDeHistorico,
    dividaExistente,
  } = dados;

  const breakdown = {
    margemLucro:         pontuarMargemLucro(receitaMediaMensal, despesasMediasMensais),
    ratioDespesa:        pontuarRatioDespesa(receitaMediaMensal, despesasMediasMensais),
    consistenciaReceita: pontuarConsistenciaReceita(variacaoReceitaPct),
    longevidade:         pontuarLongevidade(mesesDeHistorico),
    cargaDivida:         pontuarCargaDivida(receitaMediaMensal, dividaExistente),
  };

  const score = Math.round(
    breakdown.margemLucro         * PESOS.margemLucro +
    breakdown.ratioDespesa        * PESOS.ratioDespesa +
    breakdown.consistenciaReceita * PESOS.consistenciaReceita +
    breakdown.longevidade         * PESOS.longevidade +
    breakdown.cargaDivida         * PESOS.cargaDivida
  );

  return {
    score,
    breakdown,
    categoria: obterCategoria(score),
  };
}

module.exports = { calcularScore };