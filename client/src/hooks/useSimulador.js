import { useState, useMemo } from 'react'

const PESOS = {
  margemLucro:          0.20,
  ratioDespesa:         0.25,
  consistenciaReceita:  0.25,
  longevidade:          0.15,
  cargaDivida:          0.15,
}

function pontuarMargemLucro(receita, despesas) {
  if (receita <= 0) return 0
  const margem = (receita - despesas) / receita
  return Math.min(100, Math.max(0, margem * 100 * 2))
}

function pontuarRatioDespesa(receita, despesas) {
  if (receita <= 0) return 0
  const ratio = despesas / receita
  if (ratio >= 1) return 0
  return Math.min(100, Math.max(0, (1 - ratio) * 100 * 1.5))
}

function pontuarConsistenciaReceita(variacaoPct) {
  return Math.min(100, Math.max(0, 100 - variacaoPct * 1.5))
}

function pontuarLongevidade(meses) {
  return Math.min(100, (meses / 36) * 100)
}

function pontuarCargaDivida(receita, divida) {
  if (receita <= 0) return 0
  const ratio = divida / (receita * 6)
  return Math.min(100, Math.max(0, (1 - ratio) * 100))
}

function obterCategoria(score) {
  if (score >= 80) return 'Baixo Risco'
  if (score >= 60) return 'Risco Moderado-Baixo'
  if (score >= 40) return 'Risco Moderado'
  return 'Alto Risco'
}

const VALORES_INICIAIS = {
  receitaMediaMensal:    85000,
  despesasMediasMensais: 62000,
  variacaoReceitaPct:    18,
  mesesDeHistorico:      14,
  dividaExistente:       20000,
}

export function useSimulador() {
  const [parametros, setParametros] = useState(VALORES_INICIAIS)

  function actualizarParametro(chave, valor) {
    setParametros(prev => ({ ...prev, [chave]: Number(valor) }))
  }

  const resultado = useMemo(() => {
    const { receitaMediaMensal, despesasMediasMensais, variacaoReceitaPct, mesesDeHistorico, dividaExistente } = parametros

    const breakdown = {
      margemLucro:         pontuarMargemLucro(receitaMediaMensal, despesasMediasMensais),
      ratioDespesa:        pontuarRatioDespesa(receitaMediaMensal, despesasMediasMensais),
      consistenciaReceita: pontuarConsistenciaReceita(variacaoReceitaPct),
      longevidade:         pontuarLongevidade(mesesDeHistorico),
      cargaDivida:         pontuarCargaDivida(receitaMediaMensal, dividaExistente),
    }

    const score = Math.round(
      breakdown.margemLucro         * PESOS.margemLucro +
      breakdown.ratioDespesa        * PESOS.ratioDespesa +
      breakdown.consistenciaReceita * PESOS.consistenciaReceita +
      breakdown.longevidade         * PESOS.longevidade +
      breakdown.cargaDivida         * PESOS.cargaDivida
    )

    return { score, breakdown, categoria: obterCategoria(score) }
  }, [parametros])

  return { parametros, actualizarParametro, resultado }
}