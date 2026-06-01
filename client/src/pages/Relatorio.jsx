import { useState } from 'react'
import { useScore } from '../context/ScoreContext'
import { useNavigate } from 'react-router-dom'
import { descarregarRelatorio, obterRecomendacoes } from '../services/api'

const coresCategoria = {
  'Baixo Risco':          { texto: 'text-emerald-700', fundo: 'bg-emerald-50',  borda: 'border-emerald-300' },
  'Risco Moderado-Baixo': { texto: 'text-blue-700',    fundo: 'bg-blue-50',     borda: 'border-blue-300'    },
  'Risco Moderado':       { texto: 'text-amber-700',   fundo: 'bg-amber-50',    borda: 'border-amber-300'   },
  'Alto Risco':           { texto: 'text-red-700',     fundo: 'bg-red-50',      borda: 'border-red-300'     },
}

const labelBreakdown = {
  margemLucro:         'Margem de Lucro',
  ratioDespesa:        'Rácio Despesa/Receita',
  consistenciaReceita: 'Consistência da Receita',
  longevidade:         'Longevidade',
  cargaDivida:         'Carga de Dívida',
}

function calcularDicas(breakdown) {
  const dicas = []
  if (breakdown.ratioDespesa < 70)
    dicas.push('Reduzir despesas operacionais melhoraria significativamente o teu score.')
  if (breakdown.consistenciaReceita < 70)
    dicas.push('Trabalha para estabilizar a receita mensal — menos volatilidade aumenta a confiança dos credores.')
  if (breakdown.longevidade < 70)
    dicas.push('Continua a registar os dados financeiros mensalmente — o histórico cresce com o tempo.')
  if (breakdown.cargaDivida < 70)
    dicas.push('Reduzir a dívida existente antes de solicitar novo crédito melhora a tua elegibilidade.')
  if (breakdown.margemLucro < 70)
    dicas.push('Aumentar a margem de lucro, seja por aumento de preços ou redução de custos, tem impacto directo no score.')
  if (dicas.length === 0)
    dicas.push('O teu perfil financeiro está sólido. Mantém a consistência para preservar o score.')
  return dicas
}

function MetricaCard({ label, valor, detalhe, corDetalhe = 'text-emerald-600' }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-lg font-semibold text-gray-800">{valor}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {detalhe && <div className={`text-xs mt-1 font-medium ${corDetalhe}`}>{detalhe}</div>}
    </div>
  )
}

function Relatorio() {
  const { resultadoScore, dadosNegocio } = useScore()
  const navegar = useNavigate()

  const [scoreAlvo, setScoreAlvo]             = useState(80)
  const [recomendacoes, setRecomendacoes]     = useState(null)
  const [aCarregar, setACarregar]             = useState(false)

  async function aoObterRecomendacoes() {
    setACarregar(true)
    try {
      const res = await obterRecomendacoes(dadosNegocio, scoreAlvo)
      setRecomendacoes(res)
    } catch (err) {
      console.error(err)
    } finally {
      setACarregar(false)
    }
  }

  if (!resultadoScore || !dadosNegocio) {
    console.log('dadosNegocio:', dadosNegocio)
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">
          Ainda não calculaste o teu score. Preenche o formulário primeiro.
        </p>
        <button
          onClick={() => navegar('/score')}
          className="bg-emerald-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Calcular score
        </button>
      </div>
    )
  }

  const cores  = coresCategoria[resultadoScore.categoria] ?? coresCategoria['Alto Risco']
  const dicas  = calcularDicas(resultadoScore.breakdown)
  const margem = Math.round(
    ((dadosNegocio.receitaMediaMensal - dadosNegocio.despesasMediasMensais) /
      dadosNegocio.receitaMediaMensal) * 100
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Cabeçalho */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Relatório para apresentação bancária
            </span>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">Perfil Financeiro</h2>
            <p className="text-sm text-gray-500 mt-1">
            Gerado em {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            {dadosNegocio.mesesDeHistorico} meses de histórico
            </p>
        </div>
        <div className={`rounded-xl border px-6 py-4 text-center ${cores.fundo} ${cores.borda}`}>
            <div className={`text-3xl font-bold ${cores.texto}`}>{resultadoScore.score}</div>
            <div className={`text-xs mt-0.5 ${cores.texto}`}>Score PME</div>
            <div className={`text-xs font-medium mt-1 ${cores.texto}`}>{resultadoScore.categoria}</div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <MetricaCard
          label="Receita média mensal"
          valor={`MT ${Number(dadosNegocio.receitaMediaMensal).toLocaleString('pt-PT')}`}
          detalhe="Valor auto-reportado"
          corDetalhe="text-gray-400"
        />
        <MetricaCard
          label="Margem de lucro média"
          valor={`${margem}%`}
          detalhe={margem >= 20 ? '↑ Acima da média' : '↓ Abaixo da média'}
          corDetalhe={margem >= 20 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <MetricaCard
          label="Dívida existente"
          valor={`MT ${Number(dadosNegocio.dividaExistente).toLocaleString('pt-PT')}`}
          detalhe={dadosNegocio.dividaExistente === 0 ? 'Sem dívidas' : 'Dívida activa'}
          corDetalhe={dadosNegocio.dividaExistente === 0 ? 'text-emerald-600' : 'text-amber-600'}
        />
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Avaliação por critério</h3>
        {Object.entries(resultadoScore.breakdown).map(([chave, valor]) => (
          <div key={chave} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">{labelBreakdown[chave] ?? chave}</span>
              <span className="font-medium text-gray-700">{Math.round(valor)}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${valor}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Score-alvo e recomendações */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Quero atingir um score de...
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="range"
            min={resultadoScore.score + 1}
            max={100}
            value={scoreAlvo}
            onChange={e => { setScoreAlvo(Number(e.target.value)); setRecomendacoes(null) }}
            className="flex-1 accent-emerald-600"
          />
          <span className="text-emerald-700 font-bold text-lg w-10 text-right">
            {scoreAlvo}
          </span>
        </div>

        <button
          onClick={aoObterRecomendacoes}
          disabled={aCarregar}
          className="w-full bg-emerald-600 text-white text-sm py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {aCarregar ? 'A calcular...' : 'Ver o que preciso de mudar'}
        </button>

        {/* Resultados */}
        {recomendacoes && (
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Score actual</span>
              <span className="font-semibold text-gray-800">{recomendacoes.scoreActual}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">Score-alvo</span>
              <span className="font-semibold text-emerald-700">{recomendacoes.scoreAlvo}</span>
            </div>

            {recomendacoes.recomendacoes.length === 0 ? (
              <p className="text-sm text-emerald-600 text-center py-2">
                O teu perfil já está optimizado para este objectivo!
              </p>
            ) : (
              recomendacoes.recomendacoes.map((rec, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-4 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{rec.titulo}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +{rec.impacto} pts
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.descricao}</p>
                  <p className="text-xs text-emerald-700 font-medium mt-1">→ {rec.accao}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Acções */}
      <div className="flex gap-3">
        <button
        onClick={() => descarregarRelatorio(dadosNegocio)}
        className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Descarregar PDF
        </button>
        <button
          onClick={() => navegar('/score')}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Recalcular score
        </button>
      </div>

    </div>
  )
}

export default Relatorio