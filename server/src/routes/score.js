const express = require('express');
const router = express.Router();
const { calcularScore } = require('../services/scoreEngine');
const { schemaDadosNegocio } = require('../validators/scoreValidator');

router.post('/calcular', (req, res) => {
  const validacao = schemaDadosNegocio.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: validacao.error.issues.map(e => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      })),
    });
  }

  const resultado = calcularScore(validacao.data);
  res.json(resultado);
});

module.exports = router;