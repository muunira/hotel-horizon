const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: transforma a string de comodidades em array
function formatRoom(row) {
  return { ...row, comodidades: row.comodidades.split(',') };
}

// --- API ---

// Listar todos os tipos de quarto
app.get('/api/quartos', (req, res) => {
  const rows = db.prepare('SELECT * FROM room_types ORDER BY preco ASC').all();
  res.json(rows.map(formatRoom));
});

// Buscar um tipo de quarto pelo id
app.get('/api/quartos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM room_types WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ erro: 'Quarto não encontrado' });
  res.json(formatRoom(row));
});

// Criar uma reserva
app.post('/api/reservas', (req, res) => {
  const { nome, email, telefone, room_type_id, checkin, checkout, hospedes, observacoes } = req.body;

  // Validacoes basicas
  if (!nome || !email || !telefone || !room_type_id || !checkin || !checkout || !hospedes) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const quarto = db.prepare('SELECT * FROM room_types WHERE id = ?').get(Number(room_type_id));
  if (!quarto) return res.status(400).json({ erro: 'Tipo de quarto inválido.' });

  const inicio = new Date(checkin);
  const fim = new Date(checkout);
  if (isNaN(inicio) || isNaN(fim)) {
    return res.status(400).json({ erro: 'Datas inválidas.' });
  }
  if (fim <= inicio) {
    return res.status(400).json({ erro: 'A data de saída deve ser depois da entrada.' });
  }

  if (Number(hospedes) > quarto.capacidade) {
    return res.status(400).json({ erro: `Este quarto comporta no máximo ${quarto.capacidade} hóspedes.` });
  }

  const noites = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
  const total = noites * quarto.preco;

  const info = db.prepare(`
    INSERT INTO reservas (nome, email, telefone, room_type_id, checkin, checkout, hospedes, observacoes, total, criado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nome, email, telefone, Number(room_type_id), checkin, checkout,
    Number(hospedes), observacoes || '', total, new Date().toISOString()
  );

  res.status(201).json({
    id: info.lastInsertRowid,
    quarto: quarto.nome,
    noites,
    total,
    mensagem: 'Reserva realizada com sucesso!'
  });
});

// Listar reservas (consulta / painel)
app.get('/api/reservas', (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, t.nome AS quarto_nome, t.preco AS quarto_preco
    FROM reservas r
    JOIN room_types t ON t.id = r.room_type_id
    ORDER BY r.criado_em DESC
  `).all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Hotel Paraiso rodando em http://localhost:${PORT}`);
});
