import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScoreProvider } from './context/ScoreContext'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import Score from './pages/Score'
import Simulador from './pages/Simulador'
import Relatorio from './pages/Relatorio'
import NaoEncontrado from './pages/NaoEncontrado'

function App() {
  return (
    <ScoreProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/"          element={<Inicio />}       />
              <Route path="/score"     element={<Score />}        />
              <Route path="/simulador" element={<Simulador />}    />
              <Route path="/relatorio" element={<Relatorio />}    />
              <Route path="*"          element={<NaoEncontrado />}/>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ScoreProvider>
  )
}

export default App