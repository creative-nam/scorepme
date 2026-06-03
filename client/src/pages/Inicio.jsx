import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const estatisticas = [
  { numero: '89 000',  descricao: 'PMEs sem acesso a crédito formal',        cor: 'text-emerald-700' },
  { numero: '73%',   descricao: 'Negócios sem histórico financeiro formal', cor: 'text-amber-600'   },
  { numero: '3×',    descricao: 'Mais hipóteses com um score documentado',  cor: 'text-emerald-700' },
]

const passos = [
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
    descricao: 'Descarrega o relatório PDF formatado, segue as recomendações personalizadas e apresenta o teu perfil financeiro com confiança.',
    emoji: '🏦',
  },
]

const modulosEducacao = [
  {
    titulo:   'Fluxo de caixa',
    descricao:'Aprende a controlar entradas e saídas para nunca ficares sem dinheiro no final do mês.',
    nivel:    'Iniciante',
    emoji:    '💰',
    corNivel: 'bg-emerald-100 text-emerald-700',
    corBorda: 'border-emerald-200',
    corIcone: 'bg-emerald-50',
    conteudo: [
      'O fluxo de caixa é o registo de todo o dinheiro que entra e sai do teu negócio.',
      'Um negócio pode ser lucrativo no papel mas ter problemas sérios se o dinheiro não estiver disponível quando precisar.',
      'Dica prática: regista todas as entradas e saídas diariamente, mesmo que sejam pequenas.',
      'Mantém sempre uma reserva de pelo menos 2 meses de despesas fixas para emergências.',
    ],
  },
  {
    titulo:   'Margens de lucro',
    descricao:'Percebe quanto o teu negócio realmente ganha depois de pagar todas as despesas.',
    nivel:    'Iniciante',
    emoji:    '📊',
    corNivel: 'bg-blue-100 text-blue-700',
    corBorda: 'border-blue-200',
    corIcone: 'bg-blue-50',
    conteudo: [
      'A margem de lucro é a percentagem da receita que fica como lucro após todas as despesas.',
      'Fórmula: Margem = ((Receita - Despesas) / Receita) × 100',
      'Uma margem de 20-30% é considerada saudável para a maioria das PMEs em mercados emergentes.',
      'Se a tua margem está abaixo de 10%, é urgente rever os custos ou aumentar os preços.',
    ],
  },
  {
    titulo:   'Como os bancos avaliam risco',
    descricao:'Descobre o que um gestor bancário procura antes de aprovar um empréstimo.',
    nivel:    'Intermédio',
    emoji:    '🏦',
    corNivel: 'bg-amber-100 text-amber-700',
    corBorda: 'border-amber-200',
    corIcone: 'bg-amber-50',
    conteudo: [
      'Os bancos avaliam principalmente a capacidade de reembolso — consegues pagar a prestação mensalmente?',
      'O histórico financeiro é crucial: quanto mais longo e consistente, menor o risco percebido.',
      'A relação dívida/rendimento não deve ultrapassar 40-50% do rendimento mensal.',
      'Um relatório financeiro organizado aumenta significativamente as hipóteses de aprovação.',
    ],
  },
  {
    titulo:   'Formalização do negócio',
    descricao:'Passos práticos para documentar as finanças e ganhar credibilidade junto de credores.',
    nivel:    'Intermédio',
    emoji:    '📋',
    corNivel: 'bg-purple-100 text-purple-700',
    corBorda: 'border-purple-200',
    corIcone: 'bg-purple-50',
    conteudo: [
      'Separa as finanças pessoais das do negócio — abre uma conta bancária exclusiva para o negócio.',
      'Regista todas as transacções, mesmo as pequenas e as feitas em dinheiro.',
      'Guarda todos os recibos e facturas — são a prova do teu historial financeiro.',
      'Um registo consistente de 12+ meses já é suficiente para iniciar uma candidatura a microcrédito.',
    ],
  },
]

function ModalEducacao({ modulo, aoFechar }) {
  if (!modulo) return null
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={aoFechar}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-3 ${modulo.corIcone}`}>
              {modulo.emoji}
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{modulo.titulo}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${modulo.corNivel}`}>
              {modulo.nivel}
            </span>
          </div>
          <button
            onClick={aoFechar}
            className="text-gray-400 hover:text-gray-600 text-xl font-light mt-1"
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-3">
          {modulo.conteudo.map((ponto, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
              <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
              {ponto}
            </li>
          ))}
        </ul>
        <button
          onClick={aoFechar}
          className="mt-6 w-full bg-emerald-600 text-white text-sm py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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

      {/* ── Hero ── */}
      <div className="bg-white px-6 py-20 text-center" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <span className="inline-block text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full mb-5">
          Inclusão financeira para PMEs — Moçambique
        </span>
        <h1 className="text-4xl font-bold text-gray-800 mt-2 mb-4 leading-tight">
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
            className="bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
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

      {/* ── Estatísticas ── */}
      <div className="px-6 py-10" style={{ background: '#F0FAF5' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {estatisticas.map(({ numero, descricao }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl text-center px-8 py-6 shadow-sm border border-emerald-100"
              style={{ flex: '1 1 200px' }}
            >
              <div className="text-3xl font-bold text-emerald-700 mb-1">{numero}</div>
              <div className="text-sm text-gray-500">{descricao}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Como funciona ── */}
      <div className="bg-white px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
              Simples e rápido
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mt-3 mb-2">Como funciona</h2>
            <p className="text-sm text-gray-500">Três passos para acederes ao crédito que o teu negócio merece.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {passos.map(({ numero, titulo, descricao, emoji }) => (
              <div
                key={numero}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 relative"
                style={{ flex: '1 1 220px' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {numero}
                  </div>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-2">{titulo}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{descricao}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Educação financeira ── */}
      <div className="bg-gray-50 px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
              Gratuito e sem registo
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mt-3 mb-2">Educação financeira</h2>
            <p className="text-sm text-gray-500">Clica num módulo para aprender mais. Acessível a todos, sem necessidade de conta.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {modulosEducacao.map((modulo, i) => (
              <div
                key={i}
                onClick={() => setModuloAberto(modulo)}
                className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow ${modulo.corBorda}`}
                style={{ flex: '1 1 200px' }}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${modulo.corIcone}`}>
                  {modulo.emoji}
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{modulo.titulo}</div>
                <div className="text-xs text-gray-500 mb-3 leading-relaxed">{modulo.descricao}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modulo.corNivel}`}>
                  {modulo.nivel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA final ── */}
      <div className="bg-emerald-700 px-6 py-14 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Pronto para conhecer o teu score?
        </h2>
        <p className="text-emerald-200 text-sm mb-7 max-w-sm mx-auto">
          Leva menos de 2 minutos. Sem registo, sem custos.
        </p>
        <button
          onClick={() => navegar('/score')}
          className="bg-white text-emerald-700 text-sm px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
        >
          Calcular o meu score agora
        </button>
      </div>

      <ModalEducacao modulo={moduloAberto} aoFechar={() => setModuloAberto(null)} />

    </div>
  )
}

export default Inicio