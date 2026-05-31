const { calcularScore } = require('./scoreEngine');

describe('ScoreEngine', () => {

  const negocioBase = {
    receitaMediaMensal:    85000,
    despesasMediasMensais: 62000,
    variacaoReceitaPct:    18,
    mesesDeHistorico:      14,
    dividaExistente:       20000,
  };

  // Teste 1 — estrutura do resultado
  test('deve devolver um objecto com score, breakdown e categoria', () => {
    const resultado = calcularScore(negocioBase);
    expect(resultado).toHaveProperty('score');
    expect(resultado).toHaveProperty('breakdown');
    expect(resultado).toHaveProperty('categoria');
  });

  // Teste 2 — score dentro do intervalo válido
  test('o score deve estar entre 0 e 100', () => {
    const resultado = calcularScore(negocioBase);
    expect(resultado.score).toBeGreaterThanOrEqual(0);
    expect(resultado.score).toBeLessThanOrEqual(100);
  });

  // Teste 3 — negócio saudável recebe score alto
  test('negócio saudável deve receber score acima de 70', () => {
    const resultado = calcularScore({
      receitaMediaMensal:    100000,
      despesasMediasMensais: 55000,
      variacaoReceitaPct:    8,
      mesesDeHistorico:      36,
      dividaExistente:       5000,
    });
    expect(resultado.score).toBeGreaterThan(70);
  });

  // Teste 4 — negócio de risco recebe score baixo
  test('negócio de alto risco deve receber score abaixo de 40', () => {
    const resultado = calcularScore({
      receitaMediaMensal:    30000,
      despesasMediasMensais: 28000,
      variacaoReceitaPct:    65,
      mesesDeHistorico:      2,
      dividaExistente:       80000,
    });
    expect(resultado.score).toBeLessThan(40);
  });

  // Teste 5 — categorias correctas
  test('deve categorizar correctamente o nível de risco', () => {
    const resultadoAlto = calcularScore({
      receitaMediaMensal:    30000,
      despesasMediasMensais: 28000,
      variacaoReceitaPct:    65,
      mesesDeHistorico:      2,
      dividaExistente:       80000,
    });
    expect(resultadoAlto.categoria).toBe('Alto Risco');

    const resultadoBaixo = calcularScore({
      receitaMediaMensal:    100000,
      despesasMediasMensais: 55000,
      variacaoReceitaPct:    8,
      mesesDeHistorico:      36,
      dividaExistente:       5000,
    });
    expect(resultadoBaixo.categoria).toBe('Baixo Risco');
  });

});