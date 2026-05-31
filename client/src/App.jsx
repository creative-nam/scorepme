import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ScoreProvider } from './context/ScoreContext'
import Inicio from './pages/Inicio'
import Score from './pages/Score'
import Simulador from './pages/Simulador'
import Relatorio from './pages/Relatorio'

function App() {
  return (
    <ScoreProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">

          {/* Navbar */}
          <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <span className="text-emerald-700 font-semibold text-lg">ScorePME</span>
            <div className="flex gap-2">
              {[
                { to: '/',          label: 'Início'      },
                { to: '/score',     label: 'O meu score' },
                { to: '/simulador', label: 'Simulador'   },
                { to: '/relatorio', label: 'Relatório'   },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <button className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-md">
              Começar
            </button>
          </nav>

          {/* Conteúdo */}
          <main>
            <Routes>
              <Route path="/"          element={<Inicio />}    />
              <Route path="/score"     element={<Score />}     />
              <Route path="/simulador" element={<Simulador />} />
              <Route path="/relatorio" element={<Relatorio />} />
            </Routes>
          </main>

        </div>
      </BrowserRouter>
    </ScoreProvider>
  )
}

export default App