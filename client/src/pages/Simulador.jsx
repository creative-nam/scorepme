import { useSimulador } from '../hooks/useSimulador'

const configSliders = [
  { chave: 'receitaMediaMensal',    label: 'Receita mensal (MT)',  min: 10000,  max: 300000, step: 1000,  formato: v => `MT ${v.toLocaleString('pt-PT')}` },
  { chave: 'despesasMediasMensais', label: 'Despesas mensais (MT)',min: 5000,   max: 280000, step: 1000,  formato: v => `MT ${v.toLocaleString('pt-PT')}` },
  { chave: 'variacaoReceitaPct',    label: 'Variação de receita', min: 0,      max: 100,    step: 1,     formato: v => `${v}%` },
  { chave: 'mesesDeHistorico',      label: 'Meses de histórico',  min: 1,      max: 60,     step: 1,     formato: v => `${v} meses` },
  { chave: 'dividaExistente',       label: 'Dívida existente (MT)',min: 0,      max: 200000, step: 1000,  formato: v => `MT ${v.toLocaleString('pt-PT')}` },
]

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

function BarraBreakdown({ label, valor }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{Math.round(valor)}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-200"
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  )
}

function Simulador() {
  const { parametros, actualizarParametro, resultado } = useSimulador()
  const cores = coresCategoria[resultado.categoria] ?? coresCategoria['Alto Risco']

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* Controlos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Simulador de score</h2>
        <p className="text-sm text-gray-500 mb-6">Ajusta os parâmetros e vê o impacto no score em tempo real.</p>

        <div className="flex flex-col gap-6">
          {configSliders.map(({ chave, label, min, max, step, formato }) => (
            <div key={chave}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                  {formato(parametros[chave])}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={parametros[chave]}
                onChange={e => actualizarParametro(chave, e.target.value)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formato(min)}</span>
                <span>{formato(max)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Resultado</h2>
        <p className="text-sm text-gray-500 mb-6">O score actualiza instantaneamente conforme ajustas os valores.</p>

        <div className="flex flex-col gap-4">

          {/* Score principal */}
          <div className={`rounded-xl border p-8 text-center ${cores.fundo} ${cores.borda}`}>
            <div className={`text-6xl font-bold ${cores.texto}`}>{resultado.score}</div>
            <div className={`text-sm mt-1 ${cores.texto}`}>/100</div>
            <div className={`text-base font-medium mt-2 ${cores.texto}`}>{resultado.categoria}</div>
          </div>

          {/* Breakdown */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Detalhe por critério</h3>
            {Object.entries(resultado.breakdown).map(([chave, valor]) => (
              <BarraBreakdown key={chave} label={labelBreakdown[chave] ?? chave} valor={valor} />
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}

export default Simulador