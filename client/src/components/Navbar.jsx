import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Início'      },
  { to: '/score',     label: 'O meu score' },
  { to: '/simulador', label: 'Simulador'   },
  { to: '/relatorio', label: 'Relatório'   },
]

function Navbar() {
  const navegar = useNavigate()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <span
        onClick={() => navegar('/')}
        className="text-emerald-700 font-semibold text-lg cursor-pointer"
      >
        ScorePME
      </span>
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
      <button
        onClick={() => navegar('/score')}
        className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
      >
        Começar
      </button>
    </nav>
  )
}

export default Navbar