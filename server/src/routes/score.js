const express  = require('express');
const multer   = require('multer');
const router   = express.Router();
const { calcularScore }        = require('../services/scoreEngine');
const { gerarRelatorioPDF }    = require('../services/pdfService');
const { gerarRecomendacoes }   = require('../services/recomendacoesService');
const { gerarTemplate, processarFicheiro } = require('../services/templateService');
const { schemaDadosNegocio }   = require('../validators/scoreValidator');

// Multer em memória — não guarda ficheiros no disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato não suportado. Usa Excel (.xlsx) ou CSV.'));
    }
  },
});

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
  const resultado     = calcularScore(validacao.data);
  const recomendacoes = gerarRecomendacoes(validacao.data, resultado, scoreAlvo ?? 80);
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

// Download do template
router.get('/template', (req, res) => {
  const buffer = gerarTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=scorepme-template.xlsx');
  res.send(buffer);
});

// Upload e processamento de ficheiro
router.post('/upload', upload.single('ficheiro'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum ficheiro enviado.' });
  }
  try {
    const dadosExtraidos = processarFicheiro(req.file.buffer, req.file.mimetype);
    const resultado      = calcularScore(dadosExtraidos);
    res.json({ dados: dadosExtraidos, resultado });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;