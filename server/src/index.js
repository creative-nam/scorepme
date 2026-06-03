const express = require('express');
const cors    = require('cors');
const scoreRoutes = require('./routes/score');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
}));
app.use(express.json());

app.use('/api/score', scoreRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ScorePME API a funcionar!', versao: '1.0.0' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});