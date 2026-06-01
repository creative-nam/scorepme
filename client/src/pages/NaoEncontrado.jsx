import { useNavigate } from 'react-router-dom'

function NaoEncontrado() {
  const navegar = useNavigate()

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-4">404</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
      <p className="text-sm text-gray-500 mb-8">
        A página que procuras não existe ou foi movida.
      </p>
      <button
        onClick={() => navegar('/')}
        className="bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Voltar ao início
      </button>
    </div>
  )
}

export default NaoEncontrado