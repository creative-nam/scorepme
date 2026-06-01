import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScore } from '../context/ScoreContext'
import { calcularScore, uploadFicheiro, descarregarTemplate } from '../services/api'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts'

const camposFormulario = [
  { id: 'receitaMediaMensal',    label: 'Receita média mensal (MT)',    placeholder: 'ex: 85000' },
  { id: 'despesasMediasMensais', label: 'Despesas médias mensais (MT)', placeholder: 'ex: 62000' },
  { id: 'variacaoReceitaPct',    label: 'Variação de receita (%)',      placeholder: 'ex: 18'    },
  { id: 'mesesDeHistorico',      label: 'Meses de histórico',           placeholder: 'ex: 14'    },
  { id: 'dividaExistente',       label: 'Dívida existente (MT)',        placeholder: 'ex: 20000' },
]

const coresCategoria = {
  'Baixo Risco':          { fundo: 'bg-emerald-50', texto: 'text-emerald-700', borda: 'border-emerald-300' },
  'Risco Moderado-Baixo': { fundo: 'bg-blue-50',    texto: 'text-blue-700',    borda: 'border-blue-300'    },
  'Risco Moderado':       { fundo: 'bg-amber-50',   texto: 'text-amber-700',   borda: 'border-amber-300'   },
  'Alto Risco':           { fundo: 'bg-red-50',     texto: 'text-red-700',     borda: 'border-red-300'     },
}

const labelBreakdown = {
  margemLucro:         'Margem de Lucro',
  ratioDespesa:        'Rácio Despesa/Receita',
  consistenciaReceita: 'Consistência da Receita',
  longevidade:         'Longevidade',
  cargaDivida:         'Carga de Dívida',
}

function BarraScore({ label, valor }) {
  const valorArredondado = Math.round(valor)

  const cor = valorArredondado >= 70
    ? { barra: '#059669', fundo: 'bg-emerald-50', texto: 'text-emerald-700', track: '#d1fae5' }
    : valorArredondado >= 40
    ? { barra: '#d97706', fundo: 'bg-amber-50',   texto: 'text-amber-700',   track: '#fef3c7' }
    : { barra: '#dc2626', fundo: 'bg-red-50',     texto: 'text-red-700',     track: '#fee2e2' }

  const icone = valorArredondado >= 70 ? '✓' : valorArredondado >= 40 ? '!' : '✗'

  return (
    <div className={`rounded-lg px-3 py-2.5 mb-2 ${cor.fundo}`}>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${cor.texto}`}>{icone}</span>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <span className={`text-sm font-bold ${cor.texto}`}>{valorArredondado}/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: cor.track }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${valor}%`, background: cor.barra }}
        />
      </div>
    </div>
  )
}

function GaugeScore({ score, categoria }) {
  const cor = score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'

  const dados = [
    { name: 'fundo', valor: 100, fill: '#f3f4f6' },
    { name: 'score', valor: score, fill: cor },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Score global</h3>
      <div style={{ position: 'relative', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={dados}
            barSize={20}
          >
            <RadialBar dataKey="valor" cornerRadius={8} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Score no centro */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: cor, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>/100</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: cor, marginTop: 4 }}>
            {categoria}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex justify-between text-xs text-gray-400 px-2 mt-1">
        <span>0 — Alto Risco</span>
        <span>Baixo Risco — 100</span>
      </div>
    </div>
  )
}

function GraficoHistorico({ dadosMensais }) {
  if (!dadosMensais || dadosMensais.length === 0) return null

  // Agrupa por trimestre se tiver mais de 6 meses
  const dados = dadosMensais.length > 6
    ? dadosMensais.reduce((acc, item, i) => {
        const trimestre = Math.floor(i / 3)
        if (!acc[trimestre]) {
          acc[trimestre] = { mes: `T${trimestre + 1}`, receita: 0, despesas: 0, lucro: 0, count: 0 }
        }
        acc[trimestre].receita  += item.receita
        acc[trimestre].despesas += item.despesas
        acc[trimestre].lucro    += item.lucro
        acc[trimestre].count    += 1
        return acc
      }, []).map(t => ({
        mes:      t.mes,
        receita:  Math.round(t.receita  / t.count),
        despesas: Math.round(t.despesas / t.count),
        lucro:    Math.round(t.lucro    / t.count),
      }))
    : dadosMensais

  const formatarValor = (v) => `MT ${(v / 1000).toFixed(0)}k`

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-1">Evolução financeira</h3>
      <p className="text-xs text-gray-400 mb-4">
        {dadosMensais.length > 6 ? 'Médias trimestrais' : 'Dados mensais'}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dados} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis tickFormatter={formatarValor} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            formatter={(valor, nome) => [
              `MT ${Number(valor).toLocaleString('pt-PT')}`,
              nome.charAt(0).toUpperCase() + nome.slice(1),
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={nome => nome.charAt(0).toUpperCase() + nome.slice(1)}
          />
          <Bar dataKey="receita"  fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lucro"    fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Score() {
  const [modoEntrada, setModoEntrada] = useState('manual') // 'manual' | 'upload'
  const [formulario, setFormulario]   = useState({
    receitaMediaMensal:    '',
    despesasMediasMensais: '',
    variacaoReceitaPct:    '',
    mesesDeHistorico:      '',
    dividaExistente:       '',
  })
  const [ficheiro, setFicheiro]       = useState(null)
  const [resultado, setResultado]     = useState(null)
  const [dadosExtraidos, setDadosExtraidos] = useState(null)
  const [dadosMensais, setDadosMensais] = useState(null)
  const [erro, setErro]               = useState(null)
  const [aCarregar, setACarregar]     = useState(false)

  const { setResultadoScore, setDadosNegocio } = useScore()
  const navegar = useNavigate()

  function aoAlterar(e) {
    setFormulario({ ...formulario, [e.target.id]: e.target.value })
  }

  async function aoSubmeterManual(e) {
    e.preventDefault()
    setErro(null)
    setACarregar(true)
    try {
      const dados = Object.fromEntries(
        Object.entries(formulario).map(([k, v]) => [k, Number(v)])
      )
      const res = await calcularScore(dados)
      setResultado(res)
      setResultadoScore(res)
      setDadosNegocio(dados)
    } catch (err) {
      setErro(err.message)
    } finally {
      setACarregar(false)
    }
  }

  async function aoSubmeterUpload(e) {
    e.preventDefault()
    if (!ficheiro) return
    setErro(null)
    setACarregar(true)
    try {
      const res = await uploadFicheiro(ficheiro)
      setResultado(res.resultado)
      setDadosExtraidos(res.dados)
      setResultadoScore(res.resultado)
      setDadosNegocio(res.dados)
      setDadosMensais(res.dados.dadosMensais || null)
      // Preenche o formulário com os dados extraídos para o utilizador ver
      setFormulario({
        receitaMediaMensal:    String(res.dados.receitaMediaMensal),
        despesasMediasMensais: String(res.dados.despesasMediasMensais),
        variacaoReceitaPct:    String(res.dados.variacaoReceitaPct),
        mesesDeHistorico:      String(res.dados.mesesDeHistorico),
        dividaExistente:       String(res.dados.dividaExistente),
      })
    } catch (err) {
      setErro(err.message)
    } finally {
      setACarregar(false)
    }
  }

  const cores = resultado ? (coresCategoria[resultado.categoria] ?? coresCategoria['Alto Risco']) : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* Formulário */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Insere os teus dados</h2>
        <p className="text-sm text-gray-500 mb-4">Escolhe como queres fornecer os dados do teu negócio.</p>

        {/* Tabs de modo */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setModoEntrada('manual'); setErro(null); setResultado(null) }}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              modoEntrada === 'manual'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Inserir manualmente
          </button>
          <button
            onClick={() => { setModoEntrada('upload'); setErro(null); setResultado(null) }}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              modoEntrada === 'upload'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Upload de ficheiro
          </button>
        </div>

        {/* Modo manual */}
        {modoEntrada === 'manual' && (
          <form onSubmit={aoSubmeterManual} className="flex flex-col gap-4">
            {camposFormulario.map(({ id, label, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  id={id}
                  type="number"
                  placeholder={placeholder}
                  value={formulario[id]}
                  onChange={aoAlterar}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            ))}
            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}
            <button
              type="submit"
              disabled={aCarregar}
              className="bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {aCarregar ? 'A calcular...' : 'Calcular score'}
            </button>
          </form>
        )}

        {/* Modo upload */}
        {modoEntrada === 'upload' && (
          <form onSubmit={aoSubmeterUpload} className="flex flex-col gap-4">

            {/* Download template */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 font-medium mb-1">Primeiro passo</p>
              <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
                Descarrega o template, preenche com os dados mensais do teu negócio e faz upload aqui.
              </p>
              <button
                type="button"
                onClick={descarregarTemplate}
                className="w-full border border-emerald-400 text-emerald-700 text-sm py-2 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Descarregar template Excel
              </button>
            </div>

            {/* Área de upload */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-300 transition-colors"
              onClick={() => document.getElementById('input-ficheiro').click()}
            >
              <div className="text-3xl mb-2">📂</div>
              {ficheiro ? (
                <div>
                  <p className="text-sm font-medium text-emerald-700">{ficheiro.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Clica para trocar o ficheiro</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Clica para seleccionar o ficheiro</p>
                  <p className="text-xs text-gray-400 mt-1">Excel (.xlsx) ou CSV — máx. 5MB</p>
                </div>
              )}
              <input
                id="input-ficheiro"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => setFicheiro(e.target.files[0] || null)}
              />
            </div>

            {/* Dados extraídos */}
            {dadosExtraidos && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Dados extraídos do ficheiro:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Receita média',  valor: `MT ${dadosExtraidos.receitaMediaMensal.toLocaleString('pt-PT')}` },
                    { label: 'Despesas médias',valor: `MT ${dadosExtraidos.despesasMediasMensais.toLocaleString('pt-PT')}` },
                    { label: 'Variação',        valor: `${dadosExtraidos.variacaoReceitaPct}%` },
                    { label: 'Meses',           valor: dadosExtraidos.mesesDeHistorico },
                    { label: 'Dívida',          valor: `MT ${dadosExtraidos.dividaExistente.toLocaleString('pt-PT')}` },
                  ].map(({ label, valor }) => (
                    <div key={label}>
                      <span className="text-xs text-gray-400">{label}</span>
                      <div className="text-sm font-medium text-gray-700">{valor}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={aCarregar || !ficheiro}
              className="bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {aCarregar ? 'A processar ficheiro...' : 'Calcular score a partir do ficheiro'}
            </button>
          </form>
        )}
      </div>

      {/* Resultado */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Resultado</h2>
        <p className="text-sm text-gray-500 mb-6">O teu score de crédito aparece aqui após o cálculo.</p>

        {!resultado ? (
          <div className="border border-dashed border-gray-200 rounded-xl h-64 flex items-center justify-center text-gray-400 text-sm">
            Preenche o formulário para ver o resultado
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className={`rounded-xl border p-6 text-center ${cores.fundo} ${cores.borda}`}>
              <div className={`text-5xl font-bold ${cores.texto}`}>{resultado.score}</div>
              <div className={`text-sm mt-1 ${cores.texto}`}>/100</div>
              <div className={`text-base font-medium mt-2 ${cores.texto}`}>{resultado.categoria}</div>
            </div>
            {/* Gráfico de gauge */}
            <GaugeScore score={resultado.score} categoria={resultado.categoria} />
            {/* Gráfico histórico — só aparece após upload */}
            {dadosMensais && <GraficoHistorico dadosMensais={dadosMensais} />}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Detalhe por critério</h3>
              {Object.entries(resultado.breakdown).map(([chave, valor]) => (
                <BarraScore key={chave} label={labelBreakdown[chave] ?? chave} valor={valor} />
              ))}
            </div>
            <button
              onClick={() => navegar('/relatorio')}
              className="w-full border border-emerald-200 text-emerald-700 text-sm py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Ver relatório completo →
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default Score