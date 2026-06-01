const express = require('express');
const router  = express.Router();
const { calcularScore }        = require('../services/scoreEngine');
const { gerarRelatorioPDF }    = require('../services/pdfService');
const { gerarRecomendacoes }   = require('../services/recomendacoesService');
const { schemaDadosNegocio }   = require('../validators/scoreValidator');

router.post('/calcular', (req, res) => {
  const validacao = schemaDadosNegocio.safeParse(req.body);
  if (!validacao.success) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: validacao.error.issues.map(e => ({ campo: e.path.join('.'), mensagem: e.message })),
    });
  }
  const resultado = calcularScore(validacao.data);
  res.json(resultado);
});

router.post('/recomendacoes', (req, res) => {
  const { scoreAlvo, ...dadosNegocio } = req.body;
  const validacao = schemaDadosNegocio.safeParse(dadosNegocio);
  if (!validacao.success) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: validacao.error.issues.map(e => ({ campo: e.path.join('.'), mensagem: e.message })),
    });
  }
  const resultado       = calcularScore(validacao.data);
  const recomendacoes   = gerarRecomendacoes(validacao.data, resultado, scoreAlvo ?? 80);
  res.json({ scoreActual: resultado.score, scoreAlvo: scoreAlvo ?? 80, recomendacoes });
});

router.post('/relatorio', (req, res) => {
  const validacao = schemaDadosNegocio.safeParse(req.body);
  if (!validacao.success) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: validacao.error.issues.map(e => ({ campo: e.path.join('.'), mensagem: e.message })),
    });
  }
  const resultado = calcularScore(validacao.data);
  gerarRelatorioPDF(res, validacao.data, resultado);
});

module.exports = router;