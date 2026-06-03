import { useState } from 'react'
import { useScore } from '../context/ScoreContext'
import { useNavigate } from 'react-router-dom'
import { descarregarRelatorio, obterRecomendacoes } from '../services/api'

const MEDIA_SECTOR = {
  margemLucro:         58,
  ratioDespesa:        55,
  consistenciaReceita: 62,
  longevidade:         65,
  cargaDivida:         60,
}

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
  longevidade:         'Longevidade do Negócio',
  cargaDivida:         'Carga de Dívida',
}

function Relatorio() {
  const { resultadoScore, dadosNegocio, nomeNegocio } = useScore()
  const navegar = useNavigate()
  const [scoreAlvo, setScoreAlvo]         = useState(80)
  const [recomendacoes, setRecomendacoes] = useState(null)
  const [aCarregar, setACarregar]         = useState(false)

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
  const margem = Math.round(
    ((dadosNegocio.receitaMediaMensal - dadosNegocio.despesasMediasMensais) /
      dadosNegocio.receitaMediaMensal) * 100
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* ── Cabeçalho — largura total ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Relatório para apresentação bancária
          </span>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            {nomeNegocio || 'Perfil Financeiro'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerado em {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{dadosNegocio.mesesDeHistorico} meses de histórico
          </p>
        </div>
        <div className={`rounded-xl border px-6 py-4 text-center ${cores.fundo} ${cores.borda}`}>
          <div className={`text-3xl font-bold ${cores.texto}`}>{resultadoScore.score}</div>
          <div className={`text-xs mt-0.5 ${cores.texto}`}>Score PME</div>
          <div className={`text-xs font-medium mt-1 ${cores.texto}`}>{resultadoScore.categoria}</div>
        </div>
      </div>

      {/* ── Duas colunas ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── Coluna esquerda — estado actual ── */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Métricas */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Métricas principais</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  label:   'Receita média mensal',
                  valor:   `MT ${Number(dadosNegocio.receitaMediaMensal).toLocaleString('pt-PT')}`,
                  detalhe: 'Valor auto-reportado',
                  corDet:  'text-gray-400',
                },
                {
                  label:   'Margem de lucro',
                  valor:   `${margem}%`,
                  detalhe: margem >= 20 ? '↑ Acima da média do sector' : '↓ Abaixo da média do sector',
                  corDet:  margem >= 20 ? 'text-emerald-600' : 'text-amber-600',
                },
                {
                  label:   'Dívida existente',
                  valor:   `MT ${Number(dadosNegocio.dividaExistente).toLocaleString('pt-PT')}`,
                  detalhe: dadosNegocio.dividaExistente === 0 ? 'Sem dívidas activas' : 'Dívida activa',
                  corDet:  dadosNegocio.dividaExistente === 0 ? 'text-emerald-600' : 'text-amber-600',
                },
              ].map(({ label, valor, detalhe, corDet }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">{valor}</div>
                    <div className={`text-xs ${corDet}`}>{detalhe}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Avaliação por critério</h3>
            <p className="text-xs text-gray-400 mb-4">vs. média do sector (comércio a retalho)</p>

            {Object.entries(resultadoScore.breakdown).map(([chave, valor]) => {
              const valorArredondado = Math.round(valor)
              const mediaSector      = MEDIA_SECTOR[chave] ?? 60
              const acimaDaMedia     = valorArredondado >= mediaSector
              const cor = valorArredondado >= 70
                ? { barra: '#059669', track: '#d1fae5' }
                : valorArredondado >= 40
                ? { barra: '#d97706', track: '#fef3c7' }
                : { barra: '#dc2626', track: '#fee2e2' }
              const icone = valorArredondado >= 70 ? '✓' : valorArredondado >= 40 ? '!' : '✗'

              return (
                <div key={chave} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{labelBreakdown[chave]}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${acimaDaMedia ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {acimaDaMedia ? '↑ acima' : '↓ abaixo'}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{valorArredondado}/100</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full overflow-visible mb-1" style={{ background: cor.track }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${valor}%`, background: cor.barra }} />
                    <div className="absolute top-[-4px] w-0.5 h-4 bg-gray-400 rounded-full" style={{ left: `${mediaSector}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Teu negócio: {valorArredondado}</span>
                    <span>Média: {mediaSector}</span>
                  </div>
                </div>
              )
            })}

            {/* Legenda */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">O teu negócio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                <span className="text-xs text-gray-400">Média do sector</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Coluna direita — melhorias ── */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Score-alvo */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🎯</span>
              <h3 className="text-sm font-semibold text-emerald-700">Score-alvo</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Define o score que queres atingir e recebe um plano de acção concreto.</p>

            <div className="bg-emerald-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Score actual</span>
                <span className="text-sm font-bold text-gray-800">{resultadoScore.score}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">Score-alvo</span>
                <span className="text-lg font-bold text-emerald-700">{scoreAlvo}</span>
              </div>
              <input
                type="range"
                min={resultadoScore.score + 1}
                max={100}
                value={scoreAlvo}
                onChange={e => { setScoreAlvo(Number(e.target.value)); setRecomendacoes(null) }}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{resultadoScore.score + 1}</span>
                <span>100</span>
              </div>
            </div>

            <button
              onClick={aoObterRecomendacoes}
              disabled={aCarregar}
              className="w-full bg-emerald-600 text-white text-sm py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
            >
              {aCarregar ? 'A calcular...' : 'Ver o que preciso de mudar →'}
            </button>

            {/* Recomendações */}
            {recomendacoes && (
              <div className="mt-4 flex flex-col gap-2">
                {recomendacoes.recomendacoes.length === 0 ? (
                  <p className="text-sm text-emerald-600 text-center py-2">
                    O teu perfil já está optimizado para este objectivo!
                  </p>
                ) : (
                  recomendacoes.recomendacoes.map((rec, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800">{rec.titulo}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
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

        </div>
      </div>

      {/* ── Botões — largura total ── */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => descarregarRelatorio({ ...dadosNegocio, nomeNegocio })}
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