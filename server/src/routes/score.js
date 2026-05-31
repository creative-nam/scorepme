const express = require('express');
const router = express.Router();
const { calcularScore } = require('../services/scoreEngine');

router.post('/calcular', (req, res) => {
  const dados = req.body;
  const resultado = calcularScore(dados);
  res.json(resultado);
});

module.exports = router;