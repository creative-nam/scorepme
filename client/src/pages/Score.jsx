import { useState } from 'react'
import { calcularScore } from '../services/api'

const camposFormulario = [
  { id: 'receitaMediaMensal',    label: 'Receita média mensal (MT)',    placeholder: 'ex: 85000' },
  { id: 'despesasMediasMensais', label: 'Despesas médias mensais (MT)', placeholder: 'ex: 62000' },
  { id: 'variacaoReceitaPct',    label: 'Variação de receita (%)',      placeholder: 'ex: 18'    },
  { id: 'mesesDeHistorico',      label: 'Meses de histórico',           placeholder: 'ex: 14'    },
  { id: 'dividaExistente',       label: 'Dívida existente (MT)',        placeholder: 'ex: 20000' },
]

const coresCategoria = {
  'Baixo Risco':           { fundo: 'bg-emerald-50', texto: 'text-emerald-700', borda: 'border-emerald-300' },
  'Risco Moderado-Baixo':  { fundo: 'bg-blue-50',    texto: 'text-blue-700',    borda: 'border-blue-300'    },
  'Risco Moderado':        { fundo: 'bg-amber-50',   texto: 'text-amber-700',   borda: 'border-amber-300'   },
  'Alto Risco':            { fundo: 'bg-red-50',     texto: 'text-red-700',     borda: 'border-red-300'     },
}

const labelBreakdown = {
  margemLucro:         'Margem de Lucro',
  ratioDespesa:        'Rácio Despesa/Receita',
  consistenciaReceita: 'Consistência da Receita',
  longevidade:         'Longevidade',
  cargaDivida:         'Carga de Dívida',
}

function BarraScore({ label, valor }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{Math.round(valor)}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  )
}

function Score() {
  const [formulario, setFormulario] = useState({
    receitaMediaMensal:    '',
    despesasMediasMensais: '',
    variacaoReceitaPct:    '',
    mesesDeHistorico:      '',
    dividaExistente:       '',
  })
  const [resultado, setResultado]   = useState(null)
  const [erro, setErro]             = useState(null)
  const [aCarregar, setACarregar]   = useState(false)

  function aoAlterar(e) {
    setFormulario({ ...formulario, [e.target.id]: e.target.value })
  }

  async function aoSubmeter(e) {
    e.preventDefault()
    setErro(null)
    setACarregar(true)

    try {
      const dados = Object.fromEntries(
        Object.entries(formulario).map(([k, v]) => [k, Number(v)])
      )
      const res = await calcularScore(dados)
      setResultado(res)
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
        <p className="text-sm text-gray-500 mb-6">Preenche os campos com os dados financeiros do teu negócio.</p>

        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
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
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={aCarregar}
            className="bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {aCarregar ? 'A calcular...' : 'Calcular score'}
          </button>
        </form>
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

            {/* Score principal */}
            <div className={`rounded-xl border p-6 text-center ${cores.fundo} ${cores.borda}`}>
              <div className={`text-5xl font-bold ${cores.texto}`}>{resultado.score}</div>
              <div className={`text-sm mt-1 ${cores.texto}`}>/100</div>
              <div className={`text-base font-medium mt-2 ${cores.texto}`}>{resultado.categoria}</div>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Detalhe por critério</h3>
              {Object.entries(resultado.breakdown).map(([chave, valor]) => (
                <BarraScore key={chave} label={labelBreakdown[chave] ?? chave} valor={valor} />
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  )
}

export default Score