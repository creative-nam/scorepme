import { createContext, useContext, useState } from 'react'

const ScoreContext = createContext(null)

export function ScoreProvider({ children }) {
  const [resultadoScore, setResultadoScore] = useState(null)
  const [dadosNegocio, setDadosNegocio]     = useState(null)

  return (
    <ScoreContext.Provider value={{ resultadoScore, setResultadoScore, dadosNegocio, setDadosNegocio }}>
      {children}
    </ScoreContext.Provider>
  )
}

export function useScore() {
  return useContext(ScoreContext)
}