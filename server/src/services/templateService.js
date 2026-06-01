const XLSX = require('xlsx');

function gerarTemplate() {
  const wb = XLSX.utils.book_new();

  // Folha de instruções
  const instrucoes = [
    ['SCOREPME — Template de Dados Financeiros'],
    [''],
    ['INSTRUÇÕES:'],
    ['1. Preenche a folha "Dados" com os dados financeiros do teu negócio'],
    ['2. Cada linha representa um mês'],
    ['3. Guarda o ficheiro e faz upload na plataforma'],
    ['4. O sistema calcula automaticamente o teu score de crédito'],
    [''],
    ['CAMPOS OBRIGATÓRIOS:'],
    ['Mês/Ano         → Formato: MM/AAAA (ex: 01/2025)'],
    ['Receita         → Total de entradas nesse mês (em MT)'],
    ['Despesas        → Total de saídas nesse mês (em MT)'],
    ['Dívida actual   → Dívida total existente no final do mês (em MT)'],
  ];

  const wsInstrucoes = XLSX.utils.aoa_to_sheet(instrucoes);
  wsInstrucoes['!cols'] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstrucoes, 'Instruções');

  // Folha de dados com exemplo
  const dados = [
    ['Mês/Ano', 'Receita (MT)', 'Despesas (MT)', 'Dívida actual (MT)'],
    ['01/2025', 80000, 58000, 25000],
    ['02/2025', 85000, 61000, 24000],
    ['03/2025', 78000, 60000, 23000],
    ['04/2025', 90000, 63000, 22000],
    ['05/2025', 88000, 62000, 21000],
    ['06/2025', 92000, 64000, 20000],
  ];

  const wsDados = XLSX.utils.aoa_to_sheet(dados);
  wsDados['!cols'] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDados, 'Dados');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function processarFicheiro(buffer, mimetype) {
  const wb = XLSX.read(buffer, { type: 'buffer' });

  // Tenta ler a folha "Dados", se não existir usa a primeira
  const nomeFolha = wb.SheetNames.includes('Dados') ? 'Dados' : wb.SheetNames[0];
  const ws        = wb.Sheets[nomeFolha];
  const linhas    = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Remove cabeçalho e linhas vazias
  const dados = linhas
    .slice(1)
    .filter(linha => linha.length >= 3 && linha[1] && linha[2]);

  if (dados.length === 0) {
    throw new Error('O ficheiro não contém dados válidos. Verifica se seguiste o template.');
  }

  const receitas  = dados.map(l => Number(l[1]) || 0);
  const despesas  = dados.map(l => Number(l[2]) || 0);
  const dividas   = dados.map(l => Number(l[3]) || 0);

  // Calcula médias
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const receitaMediaMensal    = Math.round(avg(receitas));
  const despesasMediasMensais = Math.round(avg(despesas));
  const dividaExistente       = Math.round(dividas[dividas.length - 1] || 0);
  const mesesDeHistorico      = dados.length;

  // Calcula variação de receita (desvio padrão como % da média)
  const media      = avg(receitas);
  const variancia  = avg(receitas.map(r => Math.pow(r - media, 2)));
  const desvioPad  = Math.sqrt(variancia);
  const variacaoReceitaPct = media > 0 ? Math.round((desvioPad / media) * 100) : 0;

  return {
    receitaMediaMensal,
    despesasMediasMensais,
    variacaoReceitaPct,
    mesesDeHistorico,
    dividaExistente,
  };
}

module.exports = { gerarTemplate, processarFicheiro };