import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Início'      },
  { to: '/score',     label: 'O meu score' },
  { to: '/simulador', label: 'Simulador'   },
  { to: '/relatorio', label: 'Relatório'   },
]

function useEDesktop() {
  const [eDesktop, setEDesktop] = useState(window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setEDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return eDesktop
}

function Navbar() {
  const navegar    = useNavigate()
  const eDesktop   = useEDesktop()
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">

      {/* Barra principal */}
      <div className="px-6 py-3 flex items-center justify-between">
        <span
          onClick={() => { navegar('/'); setMenuAberto(false) }}
          className="text-emerald-700 font-semibold text-lg cursor-pointer"
        >
          ScorePME
        </span>

        {/* Links — só em desktop */}
        {eDesktop && (
          <div className="flex gap-2">
            {links.map(({ to, label }) => (
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
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => navegar('/score')}
            className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Começar
          </button>

          {/* Hamburguer — só em mobile */}
          {!eDesktop && (
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex flex-col gap-1.5 p-1"
            >
              <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity ${menuAberto ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile expandido */}
      {!eDesktop && menuAberto && (
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-md text-sm transition-colors ${
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
      )}

    </nav>
  )
}

export default Navbar