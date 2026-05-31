const BASE_URL = 'http://localhost:3000/api';

async function calcularScore(dados) {
  const resposta = await fetch(`${BASE_URL}/score/calcular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  const resultado = await resposta.json();
  if (!resposta.ok) throw new Error(resultado.erro || 'Erro ao calcular score');
  return resultado;
}

async function descarregarRelatorio(dados) {
  const resposta = await fetch(`${BASE_URL}/score/relatorio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) throw new Error('Erro ao gerar relatório');
  const blob = await resposta.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'relatorio-scorepme.pdf';
  link.click();
  URL.revokeObjectURL(url);
}

export { calcularScore, descarregarRelatorio };