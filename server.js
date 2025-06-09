const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const livros = { andamento: [], concluido: [] };

app.post('/adicionar', (req, res) => {
  const { nome, autor, status } = req.body;
  if (!nome || !autor || !status) return res.status(400).json({ erro: 'Dados incompletos' });
  livros[status].push({ nome, autor });
  return res.status(201).json({ mensagem: 'Livro adicionado!' });
});

app.get('/livros', (req, res) => {
  return res.json(livros);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));