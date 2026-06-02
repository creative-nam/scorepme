import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const estatisticas = [
  { numero: '4.2M',  descricao: 'PMEs sem acesso a crédito formal'          },
  { numero: '73%',   descricao: 'Negócios sem histórico financeiro formal'   },
  { numero: '3x',    descricao: 'Mais hipóteses com um score documentado'    },
]

const modulosEducacao = [
  {
    titulo:    'Fluxo de caixa',
    descricao: 'Aprende a controlar entradas e saídas para nunca ficares sem dinheiro no final do mês.',
    nivel:     'Iniciante',
    cor:       'bg-emerald-50 border-emerald-200',
    corNivel:  'bg-emerald-100 text-emerald-700',
    emoji:     '💰',
    conteudo: [
      'O fluxo de caixa é o registo de todo o dinheiro que entra e sai do teu negócio.',
      'Um negócio pode ser lucrativo no papel mas ter problemas sérios se o dinheiro não estiver disponível quando precisar.',
      'Dica prática: regista todas as entradas e saídas diariamente, mesmo que sejam pequenas.',
      'Mantém sempre uma reserva de pelo menos 2 meses de despesas fixas para emergências.',
    ],
  },
  {
    titulo:    'Margens de lucro',
    descricao: 'Percebe quanto o teu negócio realmente ganha depois de pagar todas as despesas.',
    nivel:     'Iniciante',
    cor:       'bg-blue-50 border-blue-200',
    corNivel:  'bg-blue-100 text-blue-700',
    emoji:     '📊',
    conteudo: [
      'A margem de lucro é a percentagem da receita que fica como lucro após todas as despesas.',
      'Fórmula: Margem = ((Receita - Despesas) / Receita) × 100',
      'Uma margem de 20-30% é considerada saudável para a maioria das PMEs em mercados emergentes.',
      'Se a tua margem está abaixo de 10%, é urgente rever os custos ou aumentar os preços.',
    ],
  },
  {
    titulo:    'Como os bancos avaliam risco',
    descricao: 'Descobre o que um gestor bancário procura antes de aprovar um empréstimo.',
    nivel:     'Intermédio',
    cor:       'bg-amber-50 border-amber-200',
    corNivel:  'bg-amber-100 text-amber-700',
    emoji:     '🏦',
    conteudo: [
      'Os bancos avaliam principalmente a capacidade de reembolso — consegues pagar a prestação mensalmente?',
      'O histórico financeiro é crucial: quanto mais longo e consistente, menor o risco percebido.',
      'A relação dívida/rendimento não deve ultrapassar 40-50% do rendimento mensal.',
      'Um relatório financeiro organizado aumenta significativamente as hipóteses de aprovação.',
    ],
  },
  {
    titulo:    'Formalização do negócio',
    descricao: 'Passos práticos para documentar as finanças e ganhar credibilidade junto de credores.',
    nivel:     'Intermédio',
    cor:       'bg-purple-50 border-purple-200',
    corNivel:  'bg-purple-100 text-purple-700',
    emoji:     '📋',
    conteudo: [
      'Separa as finanças pessoais das do negócio — abre uma conta bancária exclusiva para o negócio.',
      'Regista todas as transacções, mesmo as pequenas e as feitas em dinheiro.',
      'Guarda todos os recibos e facturas — são a prova do teu historial financeiro.',
      'Um registo consistente de 12+ meses já é suficiente para iniciar uma candidatura a microcrédito.',
    ],
  },
]

function CartaoEstatistica({ numero, descricao }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
      <div className="text-3xl font-bold text-emerald-700">{numero}</div>
      <div className="text-sm text-gray-500 mt-1">{descricao}</div>
    </div>
  )
}

function CartaoEducacao({ modulo, aoClicar }) {
  return (
    <div
      onClick={aoClicar}
      className={`rounded-xl border p-5 cursor-pointer hover:shadow-sm transition-shadow ${modulo.cor}`}
    >
      <div className="text-2xl mb-3">{modulo.emoji}</div>
      <div className="font-medium text-gray-800 mb-1">{modulo.titulo}</div>
      <div className="text-sm text-gray-500 mb-3 leading-relaxed">{modulo.descricao}</div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modulo.corNivel}`}>
        {modulo.nivel}
      </span>
    </div>
  )
}

function ModalEducacao({ modulo, aoFechar }) {
  if (!modulo) return null
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={aoFechar}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl mb-2">{modulo.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-800">{modulo.titulo}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${modulo.corNivel}`}>
              {modulo.nivel}
            </span>
          </div>
          <button
            onClick={aoFechar}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-3 mt-4">
          {modulo.conteudo.map((ponto, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
              {ponto}
            </li>
          ))}
        </ul>
        <button
          onClick={aoFechar}
          className="mt-6 w-full bg-emerald-600 text-white text-sm py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

function Inicio() {
  const navegar = useNavigate()
  const [moduloAberto, setModuloAberto] = useState(null)

  return (
    <div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-6 py-16 text-center">
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
          Inclusão financeira para PMEs
        </span>
        <h1 className="text-4xl font-bold text-gray-800 mt-4 mb-3 leading-tight">
          O teu negócio merece<br />
          <span className="text-emerald-600">acesso ao crédito</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Avalia a saúde financeira do teu negócio, obtém um score de crédito
          reconhecido por bancos e recebe dicas personalizadas para crescer.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navegar('/score')}
            className="bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Calcular o meu score
          </button>
          <button
            onClick={() => navegar('/simulador')}
            className="border border-gray-200 text-gray-600 text-sm px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Simular cenários
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {estatisticas.map((e, i) => (
          <CartaoEstatistica key={i} {...e} />
        ))}
      </div>

      {/* Como funciona */}
      <div className="max-w-4xl mx-auto px-6 py-10 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Como funciona</h2>
        <p className="text-sm text-gray-500 mb-8">Três passos para acederes ao crédito que o teu negócio merece.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[
            {
              numero: '01',
              titulo: 'Insere os teus dados',
              descricao: 'Preenche o formulário com os dados financeiros do teu negócio, ou faz upload de um ficheiro Excel com o histórico mensal.',
              emoji: '📋',
            },
            {
              numero: '02',
              titulo: 'Obtém o teu score',
              descricao: 'O nosso algoritmo analisa a saúde financeira do teu negócio e gera um score de crédito baseado em cinco critérios-chave.',
              emoji: '📊',
            },
            {
              numero: '03',
              titulo: 'Apresenta ao banco',
              descricao: 'Descarrega o relatório formatado, segue as recomendações personalizadas e apresenta o teu perfil financeiro com confiança.',
              emoji: '🏦',
            },
          ].map(({ numero, titulo, descricao, emoji }) => (
            <div
              key={numero}
              style={{ flex: '1 1 200px' }}
              className="bg-white border border-gray-100 rounded-xl p-6 relative"
            >
              <div className="text-3xl mb-4">{emoji}</div>
              <div className="text-xs font-bold text-emerald-600 mb-1">{numero}</div>
              <div className="text-sm font-semibold text-gray-800 mb-2">{titulo}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{descricao}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Educação financeira */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Educação financeira</h2>
        <p className="text-sm text-gray-500 mb-6">
          Clica num módulo para aprender mais sobre cada tema.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulosEducacao.map((modulo, i) => (
            <CartaoEducacao
              key={i}
              modulo={modulo}
              aoClicar={() => setModuloAberto(modulo)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <ModalEducacao
        modulo={moduloAberto}
        aoFechar={() => setModuloAberto(null)}
      />

    </div>
  )
}

export default Inicio