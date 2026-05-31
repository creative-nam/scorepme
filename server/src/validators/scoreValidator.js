const { z } = require('zod');

const schemaDadosNegocio = z.object({
  receitaMediaMensal:    z.number({ required_error: 'Receita média mensal é obrigatória' })
                          .positive('A receita deve ser um valor positivo'),

  despesasMediasMensais: z.number({ required_error: 'Despesas médias mensais são obrigatórias' })
                          .nonnegative('As despesas não podem ser negativas'),

  variacaoReceitaPct:    z.number({ required_error: 'Variação de receita é obrigatória' })
                          .min(0, 'A variação não pode ser negativa')
                          .max(100, 'A variação não pode ultrapassar 100%'),

  mesesDeHistorico:      z.number({ required_error: 'Meses de histórico são obrigatórios' })
                          .int('O número de meses deve ser um número inteiro')
                          .positive('O número de meses deve ser positivo'),

  dividaExistente:       z.number({ required_error: 'Dívida existente é obrigatória' })
                          .nonnegative('A dívida não pode ser negativa'),
});

module.exports = { schemaDadosNegocio };